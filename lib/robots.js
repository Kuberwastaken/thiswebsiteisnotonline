function generateRobotsTxt() {
  return `User-agent: *
Allow: /

# Popular search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

# Block common crawlers that might abuse the generation system
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: MJ12bot
Disallow: /

# Sitemap
Sitemap: https://thiswebsiteisnot.online/sitemap.xml

# Crawl delay to prevent abuse
Crawl-delay: 1`;
}

function handleRobots(req, res) {
  res.setHeader('Content-Type', 'text/plain');
  res.send(generateRobotsTxt());
}

module.exports = { handleRobots, generateRobotsTxt };
