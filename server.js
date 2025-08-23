require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Security and CORS middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow inline styles and scripts for AI-generated content
}));
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Anthropic Claude API configuration
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// Validate required environment variables
if (!ANTHROPIC_API_KEY) {
  console.error('❌ Error: ANTHROPIC_API_KEY environment variable is required');
  console.error('Please create a .env file with your Anthropic API key');
  process.exit(1);
}

// Function to generate website content using Claude
async function generateWebsiteContent(path) {
  const prompt = `Generate a complete, wildly creative website for the path: "${path}". Be extremely imaginative and unexpected!

REQUIREMENTS:
- Complete HTML document with head and body
- Modern, visually striking CSS (inline styles only)
- NO IMAGES whatsoever - use CSS, emojis, and text creatively instead
- Include navigation with links to related pages (like /about, /contact, /${path}-gallery, /${path}-shop, etc.)
- Add interactive elements using CSS animations and JavaScript
- Make it feel like a real, established website that's been online for years
- Include realistic content, fake testimonials, contact info, etc.
- Be wildly creative - interpret "${path}" in unexpected ways!

CREATIVITY GUIDELINES:
- Think outside the box - make surprising connections
- Use vibrant colors, gradients, and modern design
- Add personality through quirky copy and unusual layouts
- Include fake company/organization details
- Add CSS animations and hover effects
- Create navigation that suggests a larger site ecosystem

OUTPUT: Return ONLY the complete HTML code. No explanations, no markdown, just raw HTML ready for the browser.`;

  try {
    const response = await axios.post(ANTHROPIC_API_URL, {
      model: 'claude-3-haiku-20240307',
      max_tokens: 4000,
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

    return response.data.content[0].text;
  } catch (error) {
    console.error('Error generating content:', error.response?.data || error.message);
    return generateErrorPage(path, error.message);
  }
}

// Generate a friendly error page
function generateErrorPage(path, error) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Oops! - thiswebsiteisnot.online</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            max-width: 600px;
        }
        h1 { font-size: 3rem; margin-bottom: 1rem; }
        p { font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9; }
        .error { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0; }
        a {
            color: white;
            text-decoration: none;
            background: rgba(255,255,255,0.2);
            padding: 12px 24px;
            border-radius: 25px;
            transition: all 0.3s;
        }
        a:hover { background: rgba(255,255,255,0.3); }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 AI Brain Overload!</h1>
        <p>The AI got a bit confused trying to generate "${path}"</p>
        <div class="error">
            <p><strong>Technical details:</strong> ${error}</p>
        </div>
        <p>But don't worry! Try a different URL - the AI loves new challenges!</p>
        <a href="/">← Back to Home</a>
    </div>
</body>
</html>`;
}

// Serve the main index page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', message: 'thiswebsiteisnot.online is running!' });
});

// Catch-all route for dynamic page generation
app.get('*', async (req, res) => {
  const urlPath = req.path.slice(1); // Remove leading slash
  
  // Avoid generating content for common browser requests
  if (urlPath.includes('.') || urlPath === 'favicon.ico') {
    return res.status(404).send('Not found');
  }

  console.log(`Generating page for: /${urlPath}`);
  
  try {
    const generatedHTML = await generateWebsiteContent(urlPath);
    res.setHeader('Content-Type', 'text/html');
    res.send(generatedHTML);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).send(generateErrorPage(urlPath, 'Internal server error'));
  }
});

app.listen(PORT, () => {
  console.log(`🚀 thiswebsiteisnot.online is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to start exploring infinite websites!`);
});
