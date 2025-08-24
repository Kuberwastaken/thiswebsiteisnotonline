require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Import our modular API handlers
const { handleGenerate } = require('./api/generate');
const { handleRobots } = require('./api/robots');
const { handleSitemap } = require('./api/sitemap');
const { handleStats, handleStatsPage } = require('./api/stats');

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

// Admin endpoint for cache management (if needed)
app.get('/admin/clear-cache', (req, res) => {
  // This would clear any caches if we had them at the server level
  res.json({ message: 'Server-level cache cleared (if any)' });
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
    await handleGenerate(req, res, cleanPath);
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
