# Backend

Express + TypeScript API for IZY Technologies platform, deployed on Render.

## Stack

- Runtime: Node.js ≥ 20
- Framework: Express 4
- Database: Neon PostgreSQL (via `pg`)
- Hosting: Render

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness check |
| GET | `/health/db` | Database connectivity check |
| POST | `/api/contact` | Submit a contact form |
| POST | `/api/quote` | Submit a quote request |
| GET | `/api/projects` | List published projects, optionally filtered by category |
| GET | `/api/projects/:slug` | Get one published project |
| GET/POST/PUT/DELETE | `/api/admin/projects` | Manage projects (authenticated admin/developer) |
| POST | `/api/admin/projects/images/direct-upload` | Create a Cloudflare Images direct-upload URL |
| GET/POST/PUT/DELETE | `/api/admin/testimonials` | Manage testimonials (authenticated admin/developer) |

## Local development

```bash
cd backend
cp .env.example .env   # fill in your DATABASE_URL
npm install
npm run dev            # starts tsx watch on port 3000
```

## Database setup (Neon)

Run `migrations/001_initial.sql`, `migrations/002_testimonials.sql`, and `migrations/003_projects.sql` once in the Neon SQL Editor to create the required tables. Existing production data is not removed by these migrations.

## Render environment variables

Set these in your Render service → Environment tab:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon connection string (Neon → Connect → copy the pooled URL) |
| `ALLOWED_ORIGINS` | Comma-separated Cloudflare Pages URLs, e.g. `https://izytech.pages.dev,https://izytechgsl.com` |
| `NODE_ENV` | `production` |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |
| `CLOUDFLARE_API_TOKEN` | API token allowed to create Cloudflare Images direct uploads |
| `CLOUDFLARE_IMAGE_HASH` | Cloudflare Images delivery hash |

Render automatically sets `PORT` — do not override it.

Store product images are uploaded directly from the admin browser to Cloudflare
Images using a short-lived URL issued by the API. Render only handles the
small URL-creation request and never stores the image bytes.

## Cloudflare Pages environment variable

In Cloudflare Pages → your project → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | Your Render public domain: `https://izytech-api.onrender.com` |

After adding it, trigger a new Pages deployment so Vite bakes it in at build time.
