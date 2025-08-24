const { supabase } = require('../lib/supabase.js');

module.exports = async function handler(req, res) {
  try {
    // Get all websites from database with metadata
    const { data: websites, error } = await supabase
      .from('websites')
      .select('path, created_at, last_viewed, view_count')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching websites for sitemap:', error);
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
  
  <!-- Stats page -->
  <url>
    <loc>${baseUrl}/stats</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
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
}
