// Vercel API route for sitemap.xml

const { handleSitemap } = require('../lib/sitemap');

export default async function handler(req, res) {
  return await handleSitemap(req, res);
}
