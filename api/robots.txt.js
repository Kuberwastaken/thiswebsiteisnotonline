// Vercel API route for robots.txt

const { handleRobots } = require('../lib/robots');

export default function handler(req, res) {
  return handleRobots(req, res);
}
