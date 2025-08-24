const { supabase } = require('./supabase');

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
      .select('path, view_count, title, generator_x_handle')
      .order('view_count', { ascending: false })
      .limit(10);

    if (popularError) throw popularError;

    // Get recent websites
    const { data: recent, error: recentError } = await supabase
      .from('websites')
      .select('path, created_at, title, view_count, generator_x_handle')
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
            padding: 2rem 1rem;
            line-height: 1.5;
        }

        .container { 
            max-width: 800px; 
            margin: 0 auto; 
        }

        h1 { 
            font-size: clamp(2rem, 5vw, 3rem);
            font-weight: 900;
            margin-bottom: 2rem; 
            text-align: center;
            letter-spacing: -0.02em;
        }

        .stats-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 20px; 
            margin-bottom: 40px; 
        }

        .stat-card { 
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            padding: 20px; 
            text-align: center;
        }

        .stat-number { 
            font-size: 2rem; 
            font-weight: 700; 
            margin-bottom: 5px; 
        }

        .stat-label { 
            opacity: 0.7;
            font-weight: 500;
        }

        .section { 
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            padding: 20px; 
            margin-bottom: 20px; 
        }

        .section h2 { 
            margin-top: 0; 
            font-weight: 700;
            margin-bottom: 1rem;
        }

        .list-item { 
            padding: 10px 0; 
            border-bottom: 1px solid #e9ecef;
            display: flex; 
            justify-content: space-between;
            align-items: center;
        }

        .list-item:last-child { 
            border-bottom: none; 
        }

        .item-info {
            flex-grow: 1;
        }

        .item-meta {
            text-align: right;
            font-size: 0.85em;
        }

        .generator-info {
            font-size: 0.8em;
            color: #666;
            margin-top: 2px;
        }

        .generator-link {
            color: #1DA1F2;
            text-decoration: none;
        }

        .generator-link:hover {
            text-decoration: underline;
        }

        a { 
            color: #000000; 
            text-decoration: none; 
            font-weight: 500;
        }

        a:hover { 
            text-decoration: underline; 
        }

        .views { 
            opacity: 0.7; 
            font-size: 0.9em; 
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
            margin-top: 2rem;
        }

        .back-link:hover {
            background: #000000;
            color: #ffffff;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Site Statistics</h1>
        
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
            <h2>Most Popular</h2>
            ${stats.popularPaths.map(site => `
                <div class="list-item">
                    <div class="item-info">
                        <a href="/${site.path}">${site.title || site.path}</a>
                        ${site.generator_x_handle ? 
                            `<div class="generator-info">by <a href="https://x.com/${site.generator_x_handle}" class="generator-link" target="_blank">@${site.generator_x_handle}</a></div>` : 
                            `<div class="generator-info">by Anonymous</div>`
                        }
                    </div>
                    <div class="item-meta">
                        <span class="views">${site.view_count} views</span>
                    </div>
                </div>
            `).join('')}
        </div>
        ` : ''}
        
        ${stats.recentWebsites.length > 0 ? `
        <div class="section">
            <h2>Recently Generated</h2>
            ${stats.recentWebsites.map(site => `
                <div class="list-item">
                    <div class="item-info">
                        <a href="/${site.path}">${site.title || site.path}</a>
                        ${site.generator_x_handle ? 
                            `<div class="generator-info">by <a href="https://x.com/${site.generator_x_handle}" class="generator-link" target="_blank">@${site.generator_x_handle}</a></div>` : 
                            `<div class="generator-info">by Anonymous</div>`
                        }
                    </div>
                    <div class="item-meta">
                        <span class="views">${new Date(site.created_at).toLocaleDateString()}</span>
                        <div style="font-size: 0.75em; color: #999; margin-top: 2px;">${site.view_count} views</div>
                    </div>
                </div>
            `).join('')}
        </div>
        ` : ''}
        
        <div style="text-align: center;">
            <a href="/" class="back-link">← Back to Home</a>
        </div>
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
