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
| POST | `/api/admin/projects/images/direct-upload` | Create a signed Cloudflare R2 upload URL |
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
| `CLOUDFLARE_S3_API_ENDPOINT` | Cloudflare R2 S3-compatible endpoint |
| `CLOUDFLARE_ACCESS_KEY_ID` | R2 access key ID |
| `CLOUDFLARE_SECRET_ACCESS_KEY` | R2 secret access key |
| `CLOUDFLARE_PUBLIC_BUCKET` | Public R2 bucket name, defaults to `izy-public-images` |
| `CLOUDFLARE_PRIVATE_BUCKET` | Private R2 bucket name, defaults to `izy-private-assessments` |
| `CLOUDFLARE_R2_PUBLIC_URL` | Public R2 delivery base URL |

Render automatically sets `PORT` — do not override it.

Public project and store images are uploaded directly from the admin browser to
Cloudflare R2 using short-lived signed PUT URLs issued by the API. Render only
handles the small URL-creation request and never stores the image bytes.

## Cloudflare Pages environment variable

In Cloudflare Pages → your project → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | Your Render public domain: `https://izytech-api.onrender.com` |

After adding it, trigger a new Pages deployment so Vite bakes it in at build time.
