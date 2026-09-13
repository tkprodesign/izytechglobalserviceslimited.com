// Load environment variables from the repo-root .env file (Freebuff workspace).
// Replit injected secrets automatically; here we read them from the file instead.
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
// Also honour a backend-local .env if one exists.
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

// The full Express app (routes, middleware, DB pool, table init) lives in expressApp.js.
// This file is the production entry point: it imports the app and starts listening.
const app = require('./expressApp');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`IZY Tech API running on port ${PORT}`);
});
