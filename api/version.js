const VERSION = '1.0.0';

module.exports = function handler(_req, res) {
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json({ version: VERSION });
};
