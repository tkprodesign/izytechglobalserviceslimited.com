# IZY Technologies Global Services Limited

Official digital platform — React/Vite frontend + Node.js/Express backend + Neon PostgreSQL.

## How to run on Replit

Two workflows are configured:

| Workflow | Command | Port | Purpose |
|---|---|---|---|
| **Start application** | `cd frontend && npx vite` | 5000 | React frontend (webview) |
| **Backend API** | `cd backend && node server.js` | 3000 | Express REST API |

Both start automatically. The preview pane shows the frontend.

## Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS v4, Framer Motion, Radix UI
- **Backend**: Node.js, Express, PostgreSQL (`pg`), JWT auth
- **Database**: Neon PostgreSQL (connection via `DATABASE_URL` secret)

## Environment secrets

All secrets are stored in Replit's secret manager. Key ones:

- `DATABASE_URL` — Neon PostgreSQL connection string
- `SESSION_SECRET` — JWT signing secret
- `VITE_API_URL` — Backend URL used by the frontend at build time
- `RESEND_API_KEY` — Email delivery
- Various `*_EMAIL` / `*_EMAIL_PASSWORD` secrets for transactional email accounts

## Database

Initial schema lives in `backend/migrations/001_initial.sql` (tables: `contact_submissions`, `quote_requests`). Already applied to the Neon database.

## Production deployment

- **Frontend**: Cloudflare Pages
- **Backend**: Railway
- **Database**: Neon PostgreSQL

## Project structure

```
frontend/   React + Vite app
backend/    Express API server
docs/       Design system, guides, attributions
```

## User preferences

- Keep existing project structure — do not migrate or restructure without explicit request.
