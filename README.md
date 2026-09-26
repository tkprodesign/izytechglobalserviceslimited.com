# IZY Technologies Global Services Limited

Official website and digital platform for IZY Technologies Global Services Limited — Nigeria's premier energy solutions provider.

## Architecture — Vite + React SPA + Express API

One Node/Express process serves both the frontend and the API. The frontend is a
**Vite + React 18** SPA (client-side routing via `react-router`), pre-built with
`vite build` into `dist/`. Express serves those static assets and all `/api/*`
routes from the same process — no separate backend service, no Next.js.

```
/                       Repo root
├── public/             Static assets (images, videos, favicon)
├── dist/               Vite production build (generated; served by Express)
├── server/             Express API library (all routes, DB, email, PDF)
├── server.js           Production entry: `node server.js` (0.0.0.0:$PORT)
├── vite.config.ts      Vite config; `@` resolves to `src/`
├── package.json        dev/build/start scripts
```

- **Site**: client-side React app (react-router), consumed from `src/`.
- **API**: Express routes under `server/expressApp.js`, mounted at `/api/*`.
- **One deployment**: frontend + API ship together; the start command is `node server.js`.

## Quick Start

```bash
npm install
npm run dev       # Vite dev server on 0.0.0.0:$PORT (default 5000)
```

## Production

```bash
npm run build     # vite build → dist/
npm start         # node server.js  (serves pages + API on $PORT)
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
