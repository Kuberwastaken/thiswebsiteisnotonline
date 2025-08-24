// Vercel API route for dynamic website generation

const { handleGenerate } = require('../lib/generate');

export default async function handler(req, res) {
  const { path } = req.query;
  const urlPath = Array.isArray(path) ? path.join('/') : path || '';
  
  // Skip common browser requests and admin routes
  if (urlPath.includes('.') || 
      urlPath === 'favicon.ico' || 
      urlPath.startsWith('admin/') ||
      urlPath === 'robots.txt' ||
      urlPath === 'sitemap.xml' ||
      urlPath === 'stats') {
    return res.status(404).send('Not found');
  }

  // Prevent overly long paths
  if (urlPath.length > 100) {
    return res.status(400).send('Path too long');
  }

  // Sanitize path (same logic as server.js)
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
}
