const { generateWebsiteContent } = require('./aiGeneration');
const { postProcessContent } = require('./postProcessing');

async function handleGenerate(req, res, path) {
  try {
    console.log(`🤖 Generating new website for: /${path}`);
    
    // Generate the raw content
    const rawContent = await generateWebsiteContent(path);
    
    // Post-process the content to add SEO and clean up
    const processedContent = postProcessContent(rawContent, path, new Date().toISOString());
    
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minute cache
    res.send(processedContent);
    
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).send(generateErrorPage(path, error.message));
  }
}

function generateErrorPage(path, error) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error - thiswebsiteisnot.online</title>
    <style>
        @import url('https://rsms.me/inter/inter.css');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #ffffff;
            color: #000000;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem 1rem;
            line-height: 1.5;
        }

        .container {
            text-align: center;
            max-width: 500px;
            width: 100%;
        }

        h1 {
            font-size: clamp(2rem, 5vw, 3rem);
            font-weight: 900;
            margin-bottom: 1.5rem;
            letter-spacing: -0.02em;
        }

        .subtitle {
            font-size: clamp(1rem, 3vw, 1.2rem);
            margin-bottom: 2rem;
            opacity: 0.7;
            font-weight: 400;
        }

        .error-details {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            padding: 1.5rem;
            margin: 2rem 0;
            font-size: 0.9rem;
            font-family: 'SF Mono', Monaco, monospace;
            text-align: left;
            overflow-wrap: break-word;
        }

        .message {
            font-size: 1rem;
            margin-bottom: 2rem;
            opacity: 0.8;
        }

        .back-link {
            display: inline-block;
            color: #000000;
            text-decoration: none;
            border: 2px solid #000000;
            padding: 12px 24px;
            font-weight: 600;
            transition: all 0.3s ease;
            background: transparent;
        }

        .back-link:hover {
            background: #000000;
            color: #ffffff;
        }

        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Generation Failed</h1>
        <p class="subtitle">Unable to create website for "${path}"</p>
        
        <div class="error-details">
            ${error}
        </div>
        
        <p class="message">Please try a different path or check back later.</p>
        
        <a href="/" class="back-link">← Back to Home</a>
    </div>
</body>
</html>`;
}

module.exports = { handleGenerate };
