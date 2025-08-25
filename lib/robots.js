function generateRobotsTxt() {
  return `User-agent: *
Allow: /

# Sitemap
Sitemap: https://thiswebsiteisnot.online/sitemap.xml

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
