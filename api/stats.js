import { supabase } from '../lib/supabase.js';

export default async function handler(req, res) {
  try {
    // Get popular websites
    const { data: popular } = await supabase
      .from('websites')
      .select('path, title, view_count, created_at')
      .order('view_count', { ascending: false })
      .limit(10);

    // Get recent websites
    const { data: recent } = await supabase
      .from('websites')
      .select('path, title, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    // Get total stats
    const { count: totalWebsites } = await supabase
      .from('websites')
      .select('*', { count: 'exact', head: true });

    const { data: totalViews } = await supabase
      .from('websites')
      .select('view_count');

    const totalViewCount = totalViews?.reduce((sum, site) => sum + (site.view_count || 0), 0) || 0;

    // Generate stats page
    const statsPage = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stats - ThisWebsiteIsNot.Online</title>
    <meta name="description" content="Statistics and analytics for AI-generated websites on ThisWebsiteIsNot.Online">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333; min-height: 100vh; padding: 2rem;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header {
            text-align: center; margin-bottom: 3rem; color: white;
        }
        .header h1 { font-size: 3rem; margin-bottom: 1rem; }
        .stats-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem; margin-bottom: 3rem;
        }
        .stat-card {
            background: rgba(255,255,255,0.95); padding: 2rem; border-radius: 12px;
            text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        .stat-number { font-size: 3rem; font-weight: bold; color: #667eea; }
        .stat-label { font-size: 1.1rem; opacity: 0.7; margin-top: 0.5rem; }
        .section {
            background: rgba(255,255,255,0.95); padding: 2rem; border-radius: 12px;
            margin-bottom: 2rem; box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        .section h2 { margin-bottom: 1.5rem; color: #333; }
        .website-item {
            display: flex; justify-content: space-between; align-items: center;
            padding: 1rem; border-bottom: 1px solid #eee;
        }
        .website-item:last-child { border-bottom: none; }
        .website-link {
            color: #667eea; text-decoration: none; font-weight: 600;
        }
        .website-link:hover { text-decoration: underline; }
        .website-meta { font-size: 0.9rem; opacity: 0.6; }
        .home-link {
            display: inline-block; background: white; color: #667eea;
            padding: 1rem 2rem; border-radius: 8px; text-decoration: none;
            font-weight: 600; margin-top: 2rem;
        }
        .home-link:hover { background: #f8f9fa; }
        .creator-info {
            text-align: center; margin-top: 3rem; color: white;
        }
        .creator-info a { color: white; text-decoration: none; }
        .creator-info a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Stats Dashboard</h1>
            <p>Analytics for ThisWebsiteIsNot.Online</p>
            <a href="/" class="home-link">← Back to Home</a>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${totalWebsites || 0}</div>
                <div class="stat-label">Total Websites Generated</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${totalViewCount.toLocaleString()}</div>
                <div class="stat-label">Total Page Views</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${popular?.length || 0}</div>
                <div class="stat-label">Popular Pages</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">∞</div>
                <div class="stat-label">Possibilities</div>
            </div>
        </div>

        <div class="section">
            <h2>🔥 Most Popular Websites</h2>
            ${popular?.map(site => `
                <div class="website-item">
                    <div>
                        <a href="/${site.path}" class="website-link">/${site.path}</a>
                        <div class="website-meta">${site.title}</div>
                    </div>
                    <div class="website-meta">${site.view_count} views</div>
                </div>
            `).join('') || '<p>No websites generated yet.</p>'}
        </div>

        <div class="section">
            <h2>🆕 Recently Generated</h2>
            ${recent?.map(site => `
                <div class="website-item">
                    <div>
                        <a href="/${site.path}" class="website-link">/${site.path}</a>
                        <div class="website-meta">${site.title}</div>
                    </div>
                    <div class="website-meta">${new Date(site.created_at).toLocaleDateString()}</div>
                </div>
            `).join('') || '<p>No websites generated yet.</p>'}
        </div>

        <div class="creator-info">
            <p>🤖 Created by <a href="https://kuber.studio" target="_blank"><strong>Kuber Mehta</strong></a></p>
            <p>Follow on <a href="https://x.com/kuberwastaken" target="_blank">@kuberwastaken</a></p>
        </div>
    </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minute cache
    res.send(statsPage);

  } catch (error) {
    console.error('Error generating stats page:', error);
    res.status(500).json({ error: 'Failed to generate stats' });
  }
}
