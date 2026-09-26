// Load environment variables.
require('dotenv').config();

const { join } = require('path');
const express = require('express');

const app = require('./server/expressApp');
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Production layout: the Vite build is pre-bundled into dist/ at deploy time.
// Express just serves those static assets and still drives the API routes.
const distDir = join(__dirname, 'dist');
app.use(express.static(distDir));
app.get('*', (req, res, next) => {
  // Only intercept non-API routes so the routers below still get their URLs.
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(join(distDir, 'index.html'));
});

// Bind the Express app to the network first (it contains every /api/* router).
const server = app.listen(PORT, HOST, () => {
  console.log(`IZY Tech (Express: SPA + API) running on http://${HOST}:${PORT}`);
});

// Graceful shutdown.
process.on('SIGTERM', () => {
  console.log('SIGTERM received — shutting down');
  server.close(() => process.exit(0));
});
