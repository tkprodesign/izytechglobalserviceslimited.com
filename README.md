# IZY Technologies Global Services Limited

Official website and digital platform for IZY Technologies Global Services Limited — Nigeria's premier energy solutions provider.

## Architecture — single full Next.js app

The root Next.js app serves the React site, the admin/developer panels, and the
Express API bridge from one process. The existing Cloudflare Pages deployment
keeps a separate Vite build (`pages:build`) for its static site path.

```
/                       Repo root
├── app/                Next.js route shell and root layout
├── pages/api/          Next.js API catch-all for the Express app
├── src/                React site, admin, and developer panels
├── public/              Static assets (images, videos, favicon)
├── server/              Express API library (all routes, DB, email, PDF)
├── server.js            Production entry: `node server.js` (0.0.0.0:$PORT)
├── next.config.js       Next.js configuration
├── vite.config.ts       Cloudflare Pages build configuration
├── package.json         dev/build/start scripts
```

- **Site**: the client-side React app in `src/`, mounted by `app/[[...path]]/page.tsx`.
- **API**: `pages/api/[[...path]].ts` delegates `/api/*` to `server/expressApp.js`.
- **Primary deployment**: Next.js pages and API ship together; the start command is `node server.js`.
- **Cloudflare Pages path**: `npm run pages:build` produces the existing Vite `dist/` output.

## Quick Start

```bash
npm install
npm run dev       # Next.js dev server on 0.0.0.0:$PORT (default 3000)
```

## Production

```bash
npm run build     # next build --webpack
npm start         # node server.js (serves pages + API on $PORT)

# Cloudflare Pages only:
npm run pages:build  # vite build → dist/
```

Docker: `docker build -t izy . && docker run -p 3000:3000 izy`

## Environment

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string (required) |
| `SESSION_SECRET` | JWT signing secret for admin/dev auth |
| `RESEND_API_KEY` | Email delivery (invoices, contact, notifications) |
| `VITE_API_URL` | Render API base URL baked into the Cloudflare Pages Vite build |

## Docs

- [Site Guide](docs/SITE_GUIDE.md) — every section, editable content tables
- [Design Guidelines](docs/DESIGN_GUIDELINES.md) — typography, colour system
- [Projects Feature](docs/PROJECTS_FEATURE.md) — DB-backed Projects implementation record
- [Changelog](CHANGELOG.md) — history of significant changes
