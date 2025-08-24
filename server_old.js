require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Import our modules
const { handleGenerate } = require('./api/generate');
const { handleRobots } = require('./api/robots');
const { handleSitemap } = require('./api/sitemap');
const { handleStats, handleStatsPage } = require('./api/stats');

const app = express();
const PORT = process.env.PORT || 3000;

// Security and CORS middleware
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rate limiting middleware
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in headers
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
  skipSuccessfulRequests: false, // Count all requests, even successful ones
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many website generations from this IP. Please wait 5 minutes before creating more websites.',
      retryAfter: '5 minutes',
      tip: 'This limit helps us maintain quality service for everyone!',
      rateLimitInfo: {
        current: req.rateLimit.current,
        limit: req.rateLimit.limit,
        remaining: req.rateLimit.remaining,
        resetTime: new Date(Date.now() + req.rateLimit.resetTime)
      }
    });
  }
});

const assetLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50, // Allow more requests for static assets
  message: {
    error: 'Too many asset requests, please slow down.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiting to all requests
app.use(generalLimiter);

// Apply asset-specific rate limiting to static files
app.use('/assets', assetLimiter);

// Lenient rate limiter for utility endpoints
const utilityLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 20, // Allow 20 requests per 2 minutes for utility endpoints
  message: {
    error: 'Too many requests to utility endpoints.',
    retryAfter: '2 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Anthropic Claude API configuration
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

let supabase = null;
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  console.log('✅ Supabase client initialized');
} else {
  console.log('⚠️ Supabase not configured - using in-memory cache only');
}

// Simple in-memory cache with TTL
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Validate required environment variables
if (!ANTHROPIC_API_KEY) {
  console.error('❌ Error: ANTHROPIC_API_KEY environment variable is required');
  console.error('Please create a .env.local file with your Anthropic API key');
  process.exit(1);
}

// Helper functions for Supabase integration
function extractTitle(html) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : 'Generated Website';
}

function extractDescription(html) {
  // Try to extract from meta description first
  const metaDescMatch = html.match(/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i);
  if (metaDescMatch) return metaDescMatch[1].trim();
  
  // Fallback: extract first text content
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    const textContent = bodyMatch[1]
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return textContent.substring(0, 160) + (textContent.length > 160 ? '...' : '');
  }
  
  return 'A unique AI-generated website';
}

// Function to update footer with current stats
function updateFooterWithStats(html, generatedAt, viewCount) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Remove existing footer if present
  const footerRegex = /<!-- Creator Attribution -->[\s\S]*?<\/div>/;
  html = html.replace(footerRegex, '');

  // Add updated footer
  const footerHTML = `
    <!-- Creator Attribution -->
    <div style="
      position: fixed; 
      bottom: 10px; 
      right: 10px; 
      background: rgba(0,0,0,0.85); 
      color: white; 
      padding: 10px 14px; 
      border-radius: 8px; 
      font-size: 11px; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      z-index: 9999;
      text-decoration: none;
      box-shadow: 0 3px 15px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
      line-height: 1.3;
      min-width: 160px;
    " 
    onmouseover="this.style.background='rgba(0,0,0,0.95)'; this.style.transform='translateY(-2px)'"
    onmouseout="this.style.background='rgba(0,0,0,0.85)'; this.style.transform='translateY(0)'"
    onclick="window.open('https://kuber.studio', '_blank')">
      <div style="margin-bottom: 4px; font-weight: 600;">📅 Generated: ${formatDate(generatedAt)}</div>
      <div style="opacity: 0.8; font-size: 10px;">Visited: ${viewCount} time${viewCount !== 1 ? 's' : ''}</div>
    </div>`;

  // Insert before closing body tag
  if (html.includes('</body>')) {
    html = html.replace('</body>', footerHTML + '\n</body>');
  } else {
    html += footerHTML;
  }

  return html;
}

// Function to get specific styling instructions for each theme
function getThemeInstructions(theme) {
  const themeMap = {
    'old-school-90s-internet': 'Use basic HTML styling with Times New Roman font, simple borders, basic colors (blue links, black text), table-based layouts, and minimal CSS - make it look like a 1995 website',
    'dark-noir-detective': 'Use dark backgrounds (#1a1a1a, #2d2d2d), white/gray text, high contrast, minimal colors, sharp edges, and film noir atmosphere with shadows',
    'bright-clean-minimal': 'Use lots of white space, simple sans-serif fonts, minimal colors (black, white, one accent), clean lines, and modern minimalist design',
    'retro-neon-80s': 'Use bright neon colors (pink, cyan, purple), dark backgrounds, glowing effects, retro fonts, and 80s synthwave aesthetics',
    'newspaper-print-classic': 'Use serif fonts, column layouts, black and white with minimal color, traditional typography, and classic newspaper design',
    'terminal-green-hacker': 'Use monospace fonts, green text on black background, ASCII art, command-line aesthetics, and hacker terminal styling',
    'warm-wooden-cabin': 'Use warm browns, oranges, cream colors, natural textures (via CSS), cozy feeling, and rustic design elements',
    'cold-steel-industrial': 'Use grays, blues, metallic colors, sharp geometric shapes, industrial feeling, and modern factory aesthetics',
    'art-deco-golden': 'Use gold, black, cream colors, geometric patterns, elegant fonts, and 1920s Art Deco styling',
    'brutalist-concrete': 'Use raw, unfinished styling, gray colors, harsh edges, bold typography, and concrete brutalist architecture inspiration',
    'pastel-soft-dreamy': 'Use soft pastel colors (pink, lavender, mint), gentle gradients, rounded corners, and dreamy, soft aesthetics',
    'bold-high-contrast': 'Use stark black and white with one bold accent color, high contrast, bold typography, and striking visual impact',
    'vintage-typewriter': 'Use monospace fonts, cream/beige backgrounds, black text, paper-like styling, and old typewriter aesthetics',
    'modern-glass-clean': 'Use translucent effects, subtle shadows, clean lines, glass-morphism styling, and modern transparent design',
    'forest-natural-green': 'Use various shades of green, brown, earth tones, natural feeling, and organic forest-inspired design',
    'sunset-orange-warm': 'Use warm oranges, reds, yellows, gradient sunsets, warm feeling, and golden hour color palettes',
    'ocean-deep-blue': 'Use various blues, teals, navy, wave-like patterns, ocean depth feeling, and aquatic design elements',
    'desert-sandy-earth': 'Use sandy beiges, browns, earth tones, warm desert colors, and natural desert landscape inspiration',
    'library-quiet-brown': 'Use warm browns, cream, burgundy, classic book colors, quiet scholarly feeling, and traditional library aesthetics',
    'festival-rainbow-bright': 'Use bright, vibrant rainbow colors, celebration feeling, energetic design, and festive party aesthetics',
    'cyberpunk-neon-grid': 'Use neon colors, dark backgrounds, grid patterns, futuristic styling, and cyberpunk movie aesthetics',
    'steampunk-brass': 'Use brass, copper, brown colors, vintage industrial styling, gears and mechanical elements (via CSS), Victorian era inspiration',
    'space-dark-stars': 'Use deep space colors (dark blue, purple, black), star-like elements, cosmic feeling, and space exploration themes',
    'garden-floral-soft': 'Use soft greens, pinks, florals colors, gentle natural styling, garden-inspired design, and blooming flower aesthetics'
  };
  
  return themeMap[theme] || 'Use creative styling that matches the website concept';
}







// REMOVED: All duplicate functions now properly organized in lib/ and api/ directories


// Enhanced homepage
app.get('/', (req, res) => {
  const homePage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>thiswebsiteisnot.online</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #ffffff;
            color: #000000; min-height: 100vh;
        }
        .hero { text-align: center; padding: 100px 20px; max-width: 800px; margin: 0 auto; }
        h1 { font-size: 3rem; font-weight: 800; margin-bottom: 20px; }
        .subtitle { font-size: 1.2rem; margin-bottom: 40px; opacity: 0.7; }
        .url-demo {
            background: #f8f8f8;
            padding: 30px; border-radius: 8px; margin: 40px 0;
            border: 1px solid #e0e0e0;
        }
        .url-input {
            width: 100%; padding: 15px; border: 1px solid #ddd; border-radius: 4px;
            font-size: 1rem; margin-bottom: 15px;
            font-family: inherit;
        }
        .url-input:focus { outline: none; border-color: #000; }
        .examples { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 30px; }
        .example {
            background: #000000; color: white; padding: 15px; border-radius: 4px;
            text-decoration: none; transition: all 0.2s;
        }
        .example:hover { background: #333333; }
        .example strong { display: block; margin-bottom: 5px; }
        .example small { opacity: 0.7; }
        .stats {
            display: flex; justify-content: center; gap: 60px; margin: 50px 0;
            flex-wrap: wrap;
        }
        .stat { text-align: center; }
        .stat-number { font-size: 2rem; font-weight: 800; display: block; }
        .stat-label { opacity: 0.6; margin-top: 5px; font-size: 0.9rem; }
    </style>
</head>
<body>
    <div class="hero">
        <h1>thiswebsiteisnot.online</h1>
        <p class="subtitle">Every URL generates a unique website.</p>
        
        <div class="url-demo">
            <input type="text" class="url-input" placeholder="Enter any path..." 
                   onkeypress="if(event.key==='Enter' && this.value.trim()) window.location.href='/' + this.value.trim()">
            <p>thiswebsiteisnot.online/<strong>your-idea-here</strong></p>
        </div>

        <div class="stats">
            <div class="stat">
                <span class="stat-number">∞</span>
                <div class="stat-label">Possibilities</div>
            </div>
            <div class="stat">
                <span class="stat-number" id="count">1,247</span>
                <div class="stat-label">Generated</div>
            </div>
        </div>

        <div class="examples">
            <a href="/coffee-shop" class="example">
                <strong>coffee-shop</strong>
                <small>Local business site</small>
            </a>
            <a href="/time-tracker" class="example">
                <strong>time-tracker</strong>
                <small>Productivity tool</small>
            </a>
            <a href="/plant-care" class="example">
                <strong>plant-care</strong>
                <small>Gardening guide</small>
            </a>
            <a href="/memory-palace" class="example">
                <strong>memory-palace</strong>
                <small>Learning technique</small>
            </a>
        </div>
    </div>

    <script>
        let count = 1247;
        setInterval(() => {
            count += Math.floor(Math.random() * 2) + 1;
            document.getElementById('count').textContent = count.toLocaleString();
        }, 8000);
        
        document.querySelector('.url-input').focus();
    </script>
</body>
</html>`;

  res.send(homePage);
});

// Dynamic robots.txt
app.get('/robots.txt', utilityLimiter, async (req, res) => {
  let robotsContent = `User-agent: *
Allow: /

# Allow crawling of generated pages
`;

  // Add sample generated pages if Supabase is available
  if (supabase) {
    try {
      const { data: websites } = await supabase
        .from('websites')
        .select('path')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (websites && websites.length > 0) {
        websites.forEach(site => {
          robotsContent += `Allow: /${site.path}\n`;
        });
      }
    } catch (error) {
      console.error('Error fetching websites for robots.txt:', error);
    }
  }

  robotsContent += `
# Block admin and utility endpoints
Disallow: /admin/
Disallow: /_next/
Disallow: /health

# Sitemap
Sitemap: https://thiswebsiteisnot.online/sitemap.xml

# Professional website directory
`;

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(robotsContent);
});

// Dynamic sitemap.xml route
app.get('/sitemap.xml', utilityLimiter, async (req, res) => {
  try {
    // Get all websites from database with metadata
    let websites = [];
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('websites')
          .select('path, created_at, last_viewed, view_count')
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          websites = data;
        }
      } catch (error) {
        console.error('Error fetching websites for sitemap:', error);
      }
    }
    
    const baseUrl = 'https://thiswebsiteisnot.online';
    const currentDate = new Date().toISOString();
    
    // Generate sitemap XML
    let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;

    // Add all generated websites
    if (websites && websites.length > 0) {
      websites.forEach(site => {
        // Calculate priority based on view count (higher views = higher priority)
        const priority = Math.min(0.9, 0.3 + (site.view_count / 100));
        
        // Determine change frequency based on view activity
        let changefreq = 'monthly';
        if (site.view_count > 10) changefreq = 'weekly';
        if (site.view_count > 50) changefreq = 'daily';
        
        sitemapContent += `  <url>
    <loc>${baseUrl}/${site.path}</loc>
    <lastmod>${site.last_viewed || site.created_at}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>
`;
      });
    }

    sitemapContent += `</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(sitemapContent);
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Fallback minimal sitemap
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://thiswebsiteisnot.online/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    
    res.setHeader('Content-Type', 'application/xml');
    res.send(fallbackSitemap);
  }
});

// Health check with more info
app.get('/health', utilityLimiter, (req, res) => {
  res.json({ 
    status: 'healthy', 
    message: 'thiswebsiteisnot.online is running!',
    cache_size: cache.size,
    uptime: process.uptime()
  });
});

// Admin endpoint to clear cache
app.get('/admin/clear-cache', (req, res) => {
  cache.clear();
  res.json({ message: 'Cache cleared', cache_size: cache.size });
});

// API Routes
app.get('/robots.txt', handleRobots);
app.get('/sitemap.xml', handleSitemap);
app.get('/api/stats', handleStats);
app.get('/stats', handleStatsPage);

// Catch-all route for dynamic page generation
// Apply strict rate limiting to website generation
app.get('*', strictLimiter, async (req, res) => {
  const urlPath = req.path.slice(1);
  
  // Skip common browser requests and admin routes
  if (urlPath.includes('.') || 
      urlPath === 'favicon.ico' || 
      urlPath.startsWith('admin/') ||
      urlPath === 'robots.txt') {
    return res.status(404).send('Not found');
  }

  // Prevent overly long paths
  if (urlPath.length > 100) {
    return res.status(400).send('Path too long');
  }

  try {
    await handleGenerate(req, res, urlPath);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).send('Internal server error');
  }
});

// Cleanup cache periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
}, CACHE_TTL);

app.listen(PORT, () => {
  console.log(`thiswebsiteisnot.online running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT}`);
});