const { supabase, extractTitle, extractDescription } = require('../lib/supabase.js');
const { generateWebsiteContent } = require('../lib/aiGeneration.js');
const { postProcessContent } = require('../lib/postProcessing.js');

module.exports = async function handler(req, res) {
  const path = req.query.path || '';
  
  // Skip common browser requests and admin routes
  if (path.includes('.') || 
      path === 'favicon.ico' || 
      path.startsWith('admin/') ||
      path === 'robots.txt' ||
      path === 'sitemap.xml') {
    return res.status(404).json({ error: 'Not found' });
  }

  // Prevent overly long paths
  if (path.length > 100) {
    return res.status(400).json({ error: 'Path too long' });
  }

  try {
    // Check if website already exists in database
    const { data: existing, error: fetchError } = await supabase
      .from('websites')
      .select('html, title, created_at, view_count')
      .eq('path', path)
      .single();
    
    if (existing && !fetchError) {
      // Increment view count
      await supabase
        .from('websites')
        .update({ 
          view_count: existing.view_count + 1,
          last_viewed: new Date().toISOString()
        })
        .eq('path', path);
      
      console.log(`Serving existing website: /${path} (${existing.view_count + 1} views)`);
      
      // Set cache headers
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour cache
      
      return res.send(existing.html);
    }
    
    // Generate new website
    console.log(`Generating new website for: /${path}`);
    const rawContent = await generateWebsiteContent(path);
    const generatedAt = new Date().toISOString();
    
    // Apply post-processing to clean and enhance content
    const processedContent = postProcessContent(rawContent, path, generatedAt);
    
    // Extract metadata
    const title = extractTitle(processedContent);
    const description = extractDescription(processedContent);
    
    // Save to database
    const { error: insertError } = await supabase
      .from('websites')
      .insert({
        path,
        html: processedContent,
        title,
        description,
        view_count: 1,
        created_at: generatedAt,
        last_viewed: generatedAt
      });
    
    if (insertError) {
      console.error('Database insert error:', insertError);
      // Still return the content even if DB save fails
    } else {
      console.log(`Saved new website to database: /${path}`);
    }
    
    // Set response headers
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour cache
    
    return res.send(processedContent);
    
  } catch (error) {
    console.error('Server error:', error);
    
    // Return a simple error page
    const errorPage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generation Failed - thiswebsiteisnot.online</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            color: #333;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
        }
        .container {
            text-align: center;
            max-width: 500px;
            padding: 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        h1 { color: #e74c3c; margin-bottom: 1rem; }
        .btn {
            display: inline-block;
            background: #3498db;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 4px;
            margin-top: 1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Generation Failed</h1>
        <p>Unable to generate content for <strong>"${path}"</strong></p>
        <p>Please try a different path or try again later.</p>
        <a href="/" class="btn">Back to Home</a>
    </div>
</body>
</html>`;
    
    res.status(500).send(errorPage);
  }
}
