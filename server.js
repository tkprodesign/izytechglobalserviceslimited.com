// Load environment variables (repo-root .env in dev workspaces).
require('dotenv').config();

// The full Next.js app (pages + API) as a request handler. All Express API
// routes live inside it under /api/* — there is no separate backend process.
const nextApp = require('next')({ dev: false, dir: __dirname });

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

nextApp.prepare().then(() => {
  const handle = nextApp.getRequestHandler();

  const { createServer } = require('http');
  createServer((req, res) => {
    handle(req, res);
  }).listen(PORT, HOST, () => {
    console.log(`IZY Tech (Next.js: site + API) running on http://${HOST}:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to start Next.js server:', err);
  process.exit(1);
});
