module.exports = (req, res) => {
  // Inline the current package version to avoid relying on package.json at runtime
  // (package.json is excluded from Vercel deployments via .vercelignore).
  const version = '1.0.0';

  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify({ version }));
};
