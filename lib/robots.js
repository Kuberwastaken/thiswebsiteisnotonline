function generateRobotsTxt() {
  return `User-agent: *
Allow: /

# Major search engines - unrestricted access
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: Baiduspider
Allow: /

# Block SEO crawlers that might abuse the generation system
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /

# Sitemap
Sitemap: https://thiswebsiteisnot.online/sitemap.xml

# Crawl delay for general bots (search engines ignore this)
Crawl-delay: 2

# About this site
# ThisWebsiteIsNot.Online - AI-powered website generator
# Created by Kuber Mehta (@kuberwastaken)
# Each URL generates a unique website with community attribution
# Visit /stats to see generator contributions`;
}

function handleRobots(req, res) {
  res.setHeader('Content-Type', 'text/plain');
  res.send(generateRobotsTxt());
}

module.exports = { handleRobots, generateRobotsTxt };
