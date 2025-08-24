const { supabase } = require('../lib/supabase.js');

module.exports = async function handler(req, res) {
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

    // Generate minimal monochrome stats page matching the index design
    const statsPage = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>stats</title>
    
    <!-- Favicons and App Icons -->
    <link rel="icon" href="/assets/favicon.ico" sizes="any">
    <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
    <link rel="icon" href="/assets/favicon-96x96.png" sizes="96x96" type="image/png">
    <link rel="manifest" href="/assets/site.webmanifest">
    
    <!-- SEO Meta Tags -->
    <meta name="description" content="Statistics for AI-generated websites on ThisWebsiteIsNot.Online">
    <meta name="keywords" content="website statistics, analytics, AI generated websites">
    <meta name="author" content="Kuber Mehta">
    <meta name="robots" content="index, follow">
    
    <!-- Umami Analytics -->
    <script defer src="https://cloud.umami.is/script.js" data-website-id="10096734-4b52-416d-9462-bba1d0c82206"></script>
    
    <meta name="theme-color" content="#000000">
    <link rel="canonical" href="https://thiswebsiteisnot.online/stats">
    
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
            overflow: auto;
            padding: 2rem 1rem;
        }

        .container {
            text-align: center;
            max-width: 800px;
            width: 100%;
        }

        .title {
            font-size: clamp(2rem, 8vw, 4rem);
            font-weight: 400;
            letter-spacing: -0.02em;
            margin-bottom: 1rem;
            line-height: 1.1;
        }

        .subtitle {
            font-size: 1.1rem;
            opacity: 0.7;
            margin-bottom: 3rem;
            font-weight: 400;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 2rem;
            margin: 3rem 0;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }

        .stat-item {
            padding: 1.5rem 1rem;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            transition: all 0.2s ease;
        }

        .stat-item:hover {
            border-color: #000000;
            transform: translateY(-2px);
        }

        .stat-number {
            font-size: 2rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            font-variant-numeric: tabular-nums;
        }

        .stat-label {
            font-size: 0.9rem;
            opacity: 0.6;
            font-weight: 400;
        }

        .section {
            margin: 3rem 0;
            text-align: left;
        }

        .section-title {
            font-size: 1.3rem;
            font-weight: 500;
            margin-bottom: 1.5rem;
            text-align: center;
            opacity: 0.8;
        }

        .website-list {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
        }

        .website-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 1.5rem;
            border-bottom: 1px solid #e0e0e0;
            transition: background-color 0.2s ease;
        }

        .website-item:last-child {
            border-bottom: none;
        }

        .website-item:hover {
            background-color: #f8f9fa;
        }

        .website-path {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.9rem;
            color: #000000;
            text-decoration: none;
            font-weight: 500;
        }

        .website-path:hover {
            text-decoration: underline;
        }

        .website-title {
            font-size: 0.8rem;
            opacity: 0.6;
            margin-top: 0.2rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 300px;
        }

        .website-meta {
            font-size: 0.8rem;
            opacity: 0.6;
            text-align: right;
            font-variant-numeric: tabular-nums;
        }

        .home-button {
            display: inline-block;
            margin-top: 3rem;
            padding: 0.8rem 1.5rem;
            border: 1px solid #000000;
            color: #000000;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            transition: all 0.2s ease;
            font-size: 0.9rem;
        }

        .home-button:hover {
            background-color: #000000;
            color: #ffffff;
        }

        .empty-state {
            padding: 2rem;
            opacity: 0.6;
            font-style: italic;
            text-align: center;
        }

        @media (max-width: 768px) {
            .website-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.5rem;
            }
            
            .website-meta {
                text-align: left;
            }
            
            .website-title {
                max-width: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="title">stats</h1>
        <p class="subtitle">analytics for generated websites</p>
        
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-number">${totalWebsites || 0}</div>
                <div class="stat-label">websites</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${totalViewCount.toLocaleString()}</div>
                <div class="stat-label">views</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">∞</div>
                <div class="stat-label">possibilities</div>
            </div>
        </div>

        ${popular?.length ? `
        <div class="section">
            <h2 class="section-title">popular</h2>
            <div class="website-list">
                ${popular.map(site => `
                    <div class="website-item">
                        <div>
                            <a href="/${site.path}" class="website-path">/${site.path}</a>
                            <div class="website-title">${site.title}</div>
                        </div>
                        <div class="website-meta">${site.view_count} views</div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        ${recent?.length ? `
        <div class="section">
            <h2 class="section-title">recent</h2>
            <div class="website-list">
                ${recent.map(site => `
                    <div class="website-item">
                        <div>
                            <a href="/${site.path}" class="website-path">/${site.path}</a>
                            <div class="website-title">${site.title}</div>
                        </div>
                        <div class="website-meta">${new Date(site.created_at).toLocaleDateString()}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        ${!popular?.length && !recent?.length ? `
        <div class="empty-state">
            no websites generated yet<br>
            <a href="/" style="color: inherit;">start creating</a>
        </div>
        ` : ''}

        <a href="/" class="home-button">← home</a>
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
