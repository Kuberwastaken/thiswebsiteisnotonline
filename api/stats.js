const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase if credentials are available
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
}

async function getStats() {
  if (!supabase) {
    return {
      error: 'Database not configured',
      stats: {
        totalWebsites: 0,
        totalViews: 0,
        popularPaths: [],
        recentWebsites: []
      }
    };
  }

  try {
    // Get total websites and views
    const { data: totals, error: totalsError } = await supabase
      .from('websites')
      .select('view_count');

    if (totalsError) throw totalsError;

    const totalWebsites = totals.length;
    const totalViews = totals.reduce((sum, site) => sum + (site.view_count || 0), 0);

    // Get popular paths
    const { data: popular, error: popularError } = await supabase
      .from('websites')
      .select('path, view_count, title')
      .order('view_count', { ascending: false })
      .limit(10);

    if (popularError) throw popularError;

    // Get recent websites
    const { data: recent, error: recentError } = await supabase
      .from('websites')
      .select('path, created_at, title, view_count')
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentError) throw recentError;

    return {
      stats: {
        totalWebsites,
        totalViews,
        popularPaths: popular || [],
        recentWebsites: recent || []
      }
    };
  } catch (error) {
    console.error('Stats error:', error);
    return {
      error: error.message,
      stats: {
        totalWebsites: 0,
        totalViews: 0,
        popularPaths: [],
        recentWebsites: []
      }
    };
  }
}

async function handleStats(req, res) {
  try {
    const result = await getStats();
    res.json(result);
  } catch (error) {
    console.error('Stats API error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}

function generateStatsPage(stats) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stats - thiswebsiteisnot.online</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { font-size: 3rem; margin-bottom: 2rem; text-align: center; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .stat-card { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; text-align: center; }
        .stat-number { font-size: 2rem; font-weight: bold; margin-bottom: 5px; }
        .stat-label { opacity: 0.8; }
        .section { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px; }
        .section h2 { margin-top: 0; }
        .list-item { padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: between; }
        .list-item:last-child { border-bottom: none; }
        a { color: white; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .views { opacity: 0.7; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Site Statistics</h1>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${stats.totalWebsites.toLocaleString()}</div>
                <div class="stat-label">Websites Generated</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.totalViews.toLocaleString()}</div>
                <div class="stat-label">Total Views</div>
            </div>
        </div>
        
        ${stats.popularPaths.length > 0 ? `
        <div class="section">
            <h2>🔥 Most Popular</h2>
            ${stats.popularPaths.map(site => `
                <div class="list-item">
                    <a href="/${site.path}">${site.title || site.path}</a>
                    <span class="views">${site.view_count} views</span>
                </div>
            `).join('')}
        </div>
        ` : ''}
        
        ${stats.recentWebsites.length > 0 ? `
        <div class="section">
            <h2>🆕 Recently Generated</h2>
            ${stats.recentWebsites.map(site => `
                <div class="list-item">
                    <a href="/${site.path}">${site.title || site.path}</a>
                    <span class="views">${new Date(site.created_at).toLocaleDateString()}</span>
                </div>
            `).join('')}
        </div>
        ` : ''}
        
        <p style="text-align: center; margin-top: 40px;">
            <a href="/" style="background: rgba(255,255,255,0.2); padding: 12px 24px; border-radius: 25px;">← Back to Home</a>
        </p>
    </div>
</body>
</html>`;
}

async function handleStatsPage(req, res) {
  try {
    const result = await getStats();
    const html = generateStatsPage(result.stats);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Stats page error:', error);
    res.status(500).send('Error loading stats');
  }
}

module.exports = { handleStats, handleStatsPage, getStats };