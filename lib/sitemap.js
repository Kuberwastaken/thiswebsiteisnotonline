const { supabase } = require('./supabase');

async function generateSitemap() {
  const baseUrl = 'https://thiswebsiteisnot.online';
  let urls = [
    {
      url: baseUrl,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'daily',
      priority: '1.0'
    }
  ];

  // If Supabase is available, get popular generated URLs
  if (supabase) {
    try {
      const { data: websites, error } = await supabase
        .from('websites')
        .select('path, created_at, view_count, generator_x_handle, title')
        .order('view_count', { ascending: false })
        .limit(1000);

      if (websites && !error) {
        websites.forEach(site => {
          urls.push({
            url: `${baseUrl}/${site.path}`,
            lastmod: new Date(site.created_at).toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: Math.max(0.3, Math.min(0.9, site.view_count / 100))
          });
        });
      }
    } catch (error) {
      console.error('Error fetching websites for sitemap:', error);
    }
  }

  // Generate XML with enhanced metadata
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- ThisWebsiteIsNot.Online Sitemap -->
  <!-- AI-powered website generator by Kuber Mehta (@kuberwastaken) -->
  <!-- Community-driven content with generator attribution -->
  
${urls.map(url => `  <url>
    <loc>${url.url}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return xml;
}

async function handleSitemap(req, res) {
  try {
    const sitemap = await generateSitemap();
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.setHeader('X-Robots-Tag', 'noindex'); // Don't index the sitemap itself
    res.send(sitemap);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
}

module.exports = { handleSitemap, generateSitemap };