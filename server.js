require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Security and CORS middleware
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Anthropic Claude API configuration
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// Simple in-memory cache with TTL
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Validate required environment variables
if (!ANTHROPIC_API_KEY) {
  console.error('❌ Error: ANTHROPIC_API_KEY environment variable is required');
  console.error('Please create a .env file with your Anthropic API key');
  process.exit(1);
}

// Generate a seed based on path and current hour for controlled randomness
function generateSeed(path) {
  const hour = new Date().getHours();
  const day = new Date().getDate();
  return crypto.createHash('md5').update(`${path}-${day}-${hour}`).digest('hex').substring(0, 8);
}

// Specific website approaches that encourage creativity
const websiteTypes = [
  'cult-following product', 'underground movement', 'exclusive membership club', 'secret society',
  'boutique consultancy', 'specialized research lab', 'artisan workshop', 'niche community hub',
  'experimental platform', 'passion project', 'indie creator space', 'hyper-specific service',
  'micro-business empire', 'obsessive collector site', 'expertise showcase', 'unique methodology',
  'revolutionary concept', 'counterculture platform', 'specialized marketplace', 'authentic craft business'
];

const colorSchemes = [
  'monochrome with neon accent', 'warm earth tones', 'cool industrial blues', 'vintage sepia',
  'bold primary colors', 'pastel minimalism', 'dark mode elegance', 'retro 80s palette',
  'forest and nature greens', 'desert sunset oranges', 'deep ocean blues', 'cosmic purples'
];

const designStyles = [
  'ultra-minimalist', 'brutalist modern', 'hand-crafted organic', 'tech startup clean',
  'vintage newspaper', 'sci-fi terminal', 'artisan handmade', 'corporate professional',
  'underground zine', 'luxury boutique', 'academic research', 'maker workshop'
];

function getRandomElement(array, seed) {
  const index = parseInt(seed, 16) % array.length;
  return array[index];
}

// Enhanced prompt generation
function generatePrompt(path, seed) {
  const websiteType = getRandomElement(websiteTypes, seed);
  const colorScheme = getRandomElement(colorSchemes, seed.substring(0, 4));
  const designStyle = getRandomElement(designStyles, seed.substring(4, 8));
  
  return `Create a complete HTML page for "${path}". Be creative and specific - don't make generic websites!

🎯 CREATIVE INTERPRETATION:
- Transform "${path}" into something unexpected and specific
- If it's a common word, give it a unique twist (e.g., "coffee" → interdimensional coffee trading post)
- Create a distinct personality and purpose for this exact concept
- Avoid generic templates - make it feel like a real, established business

🎨 DESIGN: ${designStyle} style with ${colorScheme} colors
- Use bold, distinctive visual elements
- Create engaging micro-interactions
- Focus on one main feature/purpose
- Make it memorable and unique

⚡ CORE FUNCTIONALITY:
- ONE main interactive feature that works
- Simple, focused user interface  
- Clear value proposition
- Real-looking content (not Lorem ipsum)

🚫 STRICT RULES:
- NO IMAGES AT ALL (not even CSS background-images or data URIs)
- NO references to images, photos, or visual media
- NO <img> tags, background-image, or image-related CSS
- Use only: text, colors, CSS shapes, borders, gradients, emojis, Unicode symbols
- Maximum 1800 characters total
- Only return HTML - no explanations

💡 INSTEAD OF IMAGES USE:
- CSS shapes (border-radius, clip-path)
- Gradient backgrounds
- Unicode symbols (★ ◆ ▲ ● ☆ ◉ ◯)
- Emojis for visual interest
- Creative typography
- Box shadows and borders

Make it feel authentic and purposeful - like someone actually built this specific thing for "${path}". Seed: ${seed}`;
}

// Function to generate website content using Claude
async function generateWebsiteContent(path) {
  const seed = generateSeed(path);
  const cacheKey = `${path}-${seed}`;
  
  // Check cache first
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`Cache hit for: /${path}`);
      return cached.content;
    }
    cache.delete(cacheKey);
  }

  const prompt = generatePrompt(path, seed);

  try {
    console.log(`Generating ${getRandomElement(designStyles, seed)} website for: /${path}`);
    
    const response = await axios.post(ANTHROPIC_API_URL, {
      model: 'claude-3-haiku-20240307', // Back to Haiku for cost efficiency
      max_tokens: 2000,
      temperature: 0.8,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    }, {
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      }
    });

    const content = response.data.content[0].text;
    
    // Cache the result
    cache.set(cacheKey, {
      content,
      timestamp: Date.now()
    });

    return content;
  } catch (error) {
    console.error('Error generating content:', error.response?.data || error.message);
    return generateErrorPage(path, error.message);
  }
}

// Enhanced error page with better styling
function generateErrorPage(path, error) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Oops! - thiswebsiteisnot.online</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #ffffff;
            color: #000000; min-height: 100vh;
            display: flex; align-items: center; justify-content: center;
            overflow: hidden;
        }
        .container {
            text-align: center; max-width: 500px; z-index: 2;
            animation: fadeIn 0.8s ease-out;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } }
        .error-icon {
            font-size: 3rem; margin-bottom: 1rem;
            animation: bounce 2s infinite;
        }
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
        }
        h1 { font-size: 2.5rem; margin-bottom: 1rem; font-weight: 700; }
        p { font-size: 1.1rem; margin-bottom: 1.5rem; opacity: 0.7; line-height: 1.5; }
        .error-details {
            background: #f5f5f5; 
            padding: 20px; border-radius: 8px; margin: 20px 0;
            border: 1px solid #e0e0e0;
        }
        .btn {
            display: inline-block; color: white; text-decoration: none;
            background: #000000;
            padding: 12px 30px; border-radius: 4px; font-weight: 600;
            transition: all 0.3s;
        }
        .btn:hover {
            background: #333333;
        }
        .bg-shapes {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            z-index: 1; opacity: 0.05;
        }
        .shape { position: absolute; border-radius: 50%; animation: float 6s infinite ease-in-out; }
        .shape:nth-child(1) { width: 100px; height: 100px; top: 20%; left: 10%; background: #000; animation-delay: 0s; }
        .shape:nth-child(2) { width: 150px; height: 150px; top: 60%; right: 10%; background: #000; animation-delay: 2s; }
        .shape:nth-child(3) { width: 80px; height: 80px; bottom: 20%; left: 20%; background: #000; animation-delay: 4s; }
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
    </style>
</head>
<body>
    <div class="bg-shapes">
        <div class="shape"></div>
        <div class="shape"></div>
        <div class="shape"></div>
    </div>
    <div class="container">
        <div class="error-icon">Error</div>
        <h1>Generation Failed</h1>
        <p>Unable to generate content for <strong>"${path}"</strong></p>
        <div class="error-details">
            <p style="font-size: 0.9rem; opacity: 0.8;">The AI encountered an issue while creating your website.</p>
        </div>
        <p>Please try a different path.</p>
        <a href="/" class="btn">Back to Home</a>
    </div>
    <script>
        // Remove sparkle effect
        // Minimal interactivity only
    </script>
    <style>
        @keyframes fadeOut {
            to { opacity: 0; transform: translateY(-20px) scale(0.5); }
        }
    </style>
</body>
</html>`;
}

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

// Health check with more info
app.get('/health', (req, res) => {
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

// Catch-all route for dynamic page generation
app.get('*', async (req, res) => {
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
    const generatedHTML = await generateWebsiteContent(urlPath);
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minute browser cache
    res.send(generatedHTML);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).send(generateErrorPage(urlPath, 'Internal server error'));
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