# Backend

Express + TypeScript API for IZY Technologies platform, deployed on Railway.

## Stack

- Runtime: Node.js ≥ 20
- Framework: Express 4
- Database: Neon PostgreSQL (via `pg`)
- Hosting: Railway

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness check |
| GET | `/health/db` | Database connectivity check |
| POST | `/api/contact` | Submit a contact form |
| POST | `/api/quote` | Submit a quote request |

## Local development

```bash
cd backend
cp .env.example .env   # fill in your DATABASE_URL
npm install
npm run dev            # starts tsx watch on port 3000
```

## Database setup (Neon)

Run `migrations/001_initial.sql` once in the Neon SQL Editor to create the required tables.

## Railway environment variables

Set these in your Railway service → Variables tab:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon connection string (Neon → Connect → copy the pooled URL) |
| `ALLOWED_ORIGINS` | Comma-separated Cloudflare Pages URLs, e.g. `https://izytech.pages.dev,https://izytechgsl.com` |
| `NODE_ENV` | `production` |

Railway automatically sets `PORT` — do not override it.

## Cloudflare Pages environment variable

In Cloudflare Pages → your project → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | Your Railway public domain, e.g. `https://izytech-website.up.railway.app` |

After adding it, trigger a new Pages deployment so Vite bakes it in at build time.
