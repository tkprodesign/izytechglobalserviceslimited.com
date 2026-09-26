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
| POST | `/api/admin/invoices/:id/save-draft` | Persist an in-progress invoice as `status='draft'` so work survives a tab close, refresh, or accidental exit. The client auto-saves on every keystroke (800 ms debounce) and resumes it on revisit. Returns `{ data, saved_as_draft: true }`. |

## Production server

The primary runtime is Next.js. `server.js` starts the Next.js request handler
on `0.0.0.0:$PORT`; the Next catch-all page serves the React app and
`pages/api/[[...path]].ts` delegates `/api/*` to Express. Build command:
`next build --webpack`. Start command: `node server.js`.

Cloudflare Pages retains the separate `npm run pages:build` Vite build and
publishes `dist/`.

## Local development

```bash
npm install
npm run dev            # Vite dev server (0.0.0.0:$PORT, default 5000)

# The Express API is already mounted through the Next.js API bridge; it reads
# DATABASE_URL from your .env.
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

## Invoice sections + draft workflow

Invoices can be created from **structured sections** (title + rows) instead of flat line items. The admin editor has two tabs — **Sections** and **Flat items** — and the backend flattens them into the same `line_items` column the PDF/email renderers consume.

- **Schema:** the `invoices` table has a `sections` JSONB column (`DEFAULT '[]'`), backfilled at startup.
- **Payload shape:** `{ title, description?, rows: [{ description, quantity, unit_price, amount }] }`.
- **`sectionsToPayload()`** maps client sections to that shape.
- **`flattenToLineItems(sections)`** flattens the sections into line items; both `POST /api/admin/invoices` (create) and `PUT /api/admin/invoices/:id` (update) accept and save `sections`, and recompute `total` from them.
- **`POST /api/admin/invoices/:id/save-draft`** upserts the in-progress payload with `status='draft'`, recomputes `total` from persisted sections/line items, and returns `{ data, saved_as_draft: true }`.
- The client in `src/app/admin/InvoicesPage.tsx` uses `isSectionedForm()` and `sectionsToPayload()` and is **delambdas (debounced) auto-save** to that endpoint on every keystroke. `loadDraft(invoiceId)` restores a saved draft into the editor on revisit.

## Cloudflare Pages environment variable

In Cloudflare Pages → your project → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | Your Render public domain: `https://izytech-api.onrender.com` |

After adding it, trigger a new Pages deployment so Vite bakes it in at build time.

---

## Agent continuity notes

This repository uses a **Next.js app shell** (`app/` and `pages/api/`) around
the existing React client (`src/`) plus an **Express + PostgreSQL API**
(`server/`). Cloudflare Pages also uses the retained Vite build path. The root
`package.json` build command is `next build --webpack`, the start command is
`node server.js`, and `npm run pages:build` is reserved for Cloudflare Pages.

#### What an agent must know before changing the router/auth surface

- `InvoicesPage.tsx` (`src/app/admin/`) contains the sections editor and the **two-editor** UI: the `sections` tab (structured sections) and the `flat` tab (legacy line items). `SectionsEditor.tsx` owns the section/row add/remove controls.
- The backend flattens `sections` into the persistent `line_items` JSONB column via `flattenToLineItems()`; the `sections` JSONB column is also persisted. **Do not** make the REST API accept one format exclusively while the UI sends the other, or the PDF/email renderers and the editor will diverge.
- Drafts: `POST /api/admin/invoices/:id/save-draft` upserts an in-progress payload with `status='draft'`. The client debounced-autosaves on every keystroke and restores drafts with `loadDraft()` when the editor opens.
- **`invoices.status` CHECK must include `'draft'`.** The `CREATE TABLE` in `server/invoices_endpoint.js` only allows `unpaid|paid|overdue|cancelled`; adding `draft` to that check (and any existing production row) is required for the draft workflow to persist.
- New frontend work should keep these conventions: the primary Next app uses
  the same-origin `/api` bridge, the Cloudflare Pages build injects
  `import.meta.env.VITE_API_URL`, `@` resolves to `src/` in `vite.config.ts`,
  and the admin routes live under `src/app/admin/`. Prefer reusing
  `DashboardLayout`, `ProtectedRoute`, and the existing `lucide-react` button
  patterns.
- It is safe to delete now-stale files left over from the old Next.js build (for example `pages/api/[[...path]].ts` and any `next.config.js` that declared the `serverExternalPackages` express/pdfkit extras); confirm a file is unused before removing it so you do not break a build.
