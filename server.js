require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Import our modular handlers from lib directory
const { handleGenerate } = require('./lib/generate');
const { handleRobots } = require('./lib/robots');
const { handleSitemap } = require('./lib/sitemap');
const { handleStats, handleStatsPage } = require('./lib/stats');
const { startCacheCleanup, getCacheStats, clearCache } = require('./lib/database');

// Security and CORS middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow inline styles and scripts for AI-generated content
}));
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Limit each IP to 5 website generations per 5 minutes
  message: {
    error: 'Too many website generations from this IP. Please wait 5 minutes before creating more websites.',
    retryAfter: '5 minutes',
    tip: 'This limit helps us maintain quality service for everyone!'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const utilityLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // Allow more requests for utility endpoints
  message: {
    error: 'Too many utility requests, please slow down.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiting to all routes
app.use(generalLimiter);

// API Routes with appropriate rate limiting
app.get('/robots.txt', utilityLimiter, handleRobots);
app.get('/sitemap.xml', utilityLimiter, handleSitemap);
app.get('/api/stats', utilityLimiter, handleStats);
app.get('/stats', utilityLimiter, handleStatsPage);

// Update generator endpoint
app.post('/api/update-generator', utilityLimiter, async (req, res) => {
  console.log('🔔 Update generator API called:', { method: req.method, body: req.body });
  
  const { path, xHandle } = req.body;
  console.log('📝 Received data:', { path, xHandle });

  if (!path) {
    console.log('❌ No path provided');
    return res.status(400).json({ error: 'Path is required' });
  }

  // Validate X handle
  let cleanHandle = null;
  if (xHandle) {
    const sanitized = xHandle.replace(/^@/, '').toLowerCase().trim();
    console.log('🧹 Sanitized handle:', sanitized);
    if (/^[a-z0-9_]{1,15}$/i.test(sanitized)) {
      cleanHandle = sanitized;
      console.log('✅ Valid handle:', cleanHandle);
    } else {
      console.log('❌ Invalid handle format:', sanitized);
      return res.status(400).json({ error: 'Invalid X handle' });
    }
  } else {
    console.log('ℹ️ No xHandle provided, will set to null');
  }

  // Import supabase here to avoid issues
  const { supabase } = require('./lib/supabase');
  
  if (!supabase) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  try {
    console.log(`🔄 Updating generator for /${path} to: ${cleanHandle || 'null'}`);
    
    // Update the generator info in the database
    const { data, error } = await supabase
      .from('websites')
      .update({ generator_x_handle: cleanHandle })
      .eq('path', path)
      .select();

    if (error) {
      console.error('💥 Database update error:', error);
      return res.status(500).json({ error: 'Failed to update generator info', details: error });
    }

    console.log(`✅ Updated generator for /${path}: @${cleanHandle || 'Anonymous'}`, data);
    
    // Clear cache for this path since generator info changed
    const { clearCacheEntry } = require('./lib/database');
    const cacheKey = `website_${path}`;
    clearCacheEntry(cacheKey);
    
    res.json({ 
      success: true, 
      generator: cleanHandle || 'Anonymous',
      message: `Generator updated to @${cleanHandle || 'Anonymous'}`,
      updatedRows: data?.length || 0
    });
  } catch (error) {
    console.error('Update generator error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Serve the main index page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/health', utilityLimiter, (req, res) => {
  res.json({ 
    status: 'healthy', 
    message: 'thiswebsiteisnot.online is running!',
    timestamp: new Date().toISOString()
  });
});

// Admin endpoints for cache management
app.get('/admin/cache-stats', utilityLimiter, (req, res) => {
  const stats = getCacheStats();
  res.json({ 
    message: 'Cache statistics',
    ...stats,
    timestamp: new Date().toISOString()
  });
});

app.get('/admin/clear-cache', utilityLimiter, (req, res) => {
  const result = clearCache();
  res.json({ 
    message: 'Cache cleared successfully',
    ...result,
    timestamp: new Date().toISOString()
  });
});

// Catch-all route for dynamic page generation
app.get('*', strictLimiter, async (req, res) => {
  const urlPath = req.path.slice(1);
  
  // Skip common browser requests and admin routes
  if (urlPath.includes('.') || 
      urlPath === 'favicon.ico' || 
      urlPath.startsWith('admin/') ||
      urlPath === 'robots.txt' ||
      urlPath === 'sitemap.xml') {
    return res.status(404).send('Not found');
  }

  // Prevent overly long paths
  if (urlPath.length > 100) {
    return res.status(400).send('Path too long');
  }

  // Sanitize path
  const cleanPath = urlPath.toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!cleanPath) {
    return res.status(400).send('Invalid path');
  }

  try {
    // Validate and sanitize X handle
    let generatorXHandle = null;
    if (req.query.x) {
      const cleanHandle = req.query.x.replace(/^@/, '').toLowerCase().trim();
      if (/^[a-z0-9_]{1,15}$/i.test(cleanHandle)) {
        generatorXHandle = cleanHandle;
      }
    }
    
    // Extract advanced options from query parameters
    const advancedOptions = {};
    if (req.query.style && req.query.style.trim()) {
      advancedOptions.style = req.query.style.trim().slice(0, 200); // Limit length
    }
    if (req.query.content && req.query.content.trim()) {
      advancedOptions.content = req.query.content.trim().slice(0, 200); // Limit length
    }
    if (req.query.topic && req.query.topic.trim()) {
      advancedOptions.topic = req.query.topic.trim().slice(0, 200); // Limit length
    }
    
    await handleGenerate(req, res, cleanPath, generatorXHandle, advancedOptions);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).send('Internal server error');
  }
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 thiswebsiteisnot.online is running on port ${PORT}`);
  console.log(`📍 Visit http://localhost:${PORT} to start exploring infinite websites!`);
  
  // Start cache cleanup
  startCacheCleanup();
  console.log(`🧹 Cache cleanup scheduled`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully');
  process.exit(0);
});
