// Vercel API route for stats

const { handleStats, handleStatsPage } = require('../lib/stats');

export default async function handler(req, res) {
  // Check if this is for the JSON API or the HTML page
  const acceptsJson = req.headers.accept && req.headers.accept.includes('application/json');
  
  if (acceptsJson || req.url === '/api/stats') {
    return await handleStats(req, res);
  } else {
    return await handleStatsPage(req, res);
  }
}