const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

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
}); 