const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Add simple version endpoint to confirm live commit and build time
app.get('/version', (req, res) => {
  res.json({
    commit: process.env.RENDER_GIT_COMMIT || process.env.COMMIT || 'unknown',
    builtAt: process.env.RENDER_GIT_COMMIT_TIMESTAMP || new Date().toISOString()
  });
});

// Caching strategy: cache-bust SPA shell, cache assets aggressively
app.use((req, res, next) => {
  if (req.path.startsWith('/assets/')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-store');
  }
  next();
});

// Debug route to check file structure
app.get('/debug-files', (req, res) => {
  const distPath = path.join(__dirname, 'dist');
  const files = fs.readdirSync(distPath);
  res.json({
    distPath,
    files,
    proposalExists: fs.existsSync(path.join(distPath, 'proposal-static.html')),
    cssExists: fs.existsSync(path.join(distPath, 'proposal-design.css'))
  });
});

// Explicitly serve the proposal static files before other static files
app.get('/proposal-static.html', (req, res) => {
  const filePath = path.join(__dirname, 'dist', 'proposal-static.html');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    // Also check in the public folder during development
    const publicPath = path.join(__dirname, 'public', 'proposal-static.html');
    if (fs.existsSync(publicPath)) {
      res.sendFile(publicPath);
    } else {
      res.status(404).send(`Proposal page not found. Checked: ${filePath} and ${publicPath}`);
    }
  }
});

app.get('/proposal-design.css', (req, res) => {
  const filePath = path.join(__dirname, 'dist', 'proposal-design.css');
  if (fs.existsSync(filePath)) {
    res.type('text/css');
    res.sendFile(filePath);
  } else {
    // Also check in the public folder during development
    const publicPath = path.join(__dirname, 'public', 'proposal-design.css');
    if (fs.existsSync(publicPath)) {
      res.type('text/css');
      res.sendFile(publicPath);
    } else {
      res.status(404).send(`CSS file not found. Checked: ${filePath} and ${publicPath}`);
    }
  }
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Check if a static file exists before falling back to React app
app.get('*', (req, res) => {
  const filePath = path.join(__dirname, 'dist', req.path);
  
  // Check if the requested file exists
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    res.sendFile(filePath);
  } else {
    // Fall back to React app for all other routes
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
  console.log(`Serving static files from: ${path.join(__dirname, 'dist')}`);
}); 