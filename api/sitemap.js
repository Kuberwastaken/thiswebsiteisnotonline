const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase if credentials are available
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
}

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
        .select('path, created_at, view_count')
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

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
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
    res.setHeader('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
}

module.exports = { handleSitemap, generateSitemap };