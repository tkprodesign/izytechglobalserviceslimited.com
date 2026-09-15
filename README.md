# IZY Technologies Global Services Limited

Official website and digital platform for IZY Technologies Global Services Limited — Nigeria's premier energy solutions provider.

## Architecture — single full Next.js app

One Next.js project at the repo root contains **both the site and the API**:

```
/                       Next.js app root (next build → node server.js)
├── app/                App Router: layout + catch-all page serving the SPA
├── pages/api/          API catch-all bridging every /api/* request to Express
├── src/                The React app (site, admin & dev panels) — unchanged
├── public/             Static assets (images, videos, favicon)
├── server/             Express API library (all routes, DB, email, PDF)
├── server.js           Production entry: one process serves pages + API
├── next.config.js      Next.js configuration
└── Dockerfile          Container build for any Docker host
```

- **Site**: client-side React app (react-router) mounted by `app/[[...path]]/page.tsx` — every URL renders exactly as before.
- **API**: `pages/api/[[...path]].ts` hands every `/api/*` request to the Express app in `server/expressApp.js`. Real Node request/response objects, no translation layer.
- **One deployment**: pages and API ship together; no separate backend service.

## Quick Start

```bash
npm install
npm run dev        # http://localhost:3000 (API included)
```

## Production

```bash
npm run build      # next build
npm start          # node server.js  (serves pages + API on $PORT)
```

Docker: `docker build -t izy . && docker run -p 3000:3000 izy`

## Environment

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string (required) |
| `SESSION_SECRET` | JWT signing secret for admin/dev auth |
| `RESEND_API_KEY` | Email delivery (invoices, contact, notifications) |
| `NEXT_PUBLIC_VITE_API_URL` | Optional: absolute API base for the SPA; leave unset for same-origin `/api` |

## Docs

- [Site Guide](docs/SITE_GUIDE.md) — every section, editable content tables
- [Design Guidelines](docs/DESIGN_GUIDELINES.md) — typography, colour system
- [Projects Feature](docs/PROJECTS_FEATURE.md) — DB-backed Projects implementation record
- [Changelog](CHANGELOG.md) — history of significant changes
