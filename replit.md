# IZY Technologies Global Services Limited

Official digital platform — React/Vite frontend + Node.js/Express backend + Neon PostgreSQL.

---

> ## ⚠️ AGENT RULE — READ BEFORE ANY WORK ⚠️
>
> **The admin panel and dev panel share ALL features.**
> The Email Manager (`EmailPage.tsx`) is under `/dev/email` but is used by **both** admin and developer roles through `DashboardLayout.tsx`.
>
> **Any change requested for "admin" MUST also apply to "dev", and vice versa.**
>
> This applies to every feature in the control panel:
> - Email Manager (`frontend/src/app/admin/EmailPage.tsx`)
> - Dashboard, Contacts, Quotes, Social Media, Store Products, Store Enquiries
> - Sidebar navigation (`frontend/src/app/admin/DashboardLayout.tsx`)
>
> If the user says "update admin email", update the shared component — it automatically covers dev.
> Do NOT create separate admin and dev versions of any feature unless explicitly told to.

---

## How to run on Replit

Two workflows are configured:

| Workflow | Command | Port | Purpose |
|---|---|---|---|
| **Start application** | `cd frontend && pnpm run dev` | 5000 | React frontend (webview) |
| **Backend API** | `cd backend && node server.js` | 3000 | Express REST API |

Both start automatically. The preview pane shows the frontend.

Install dependencies before first run:
```
cd frontend && pnpm install
cd backend && npm install
```

## Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS v4, Framer Motion, Radix UI
- **Backend**: Node.js, Express, PostgreSQL (`pg`), JWT auth
- **Database**: Neon PostgreSQL (connection via `DATABASE_URL` secret)

## Environment secrets

All secrets are stored in Replit's secret manager. Key ones:

- `DATABASE_URL` — Neon PostgreSQL connection string
- `SESSION_SECRET` — JWT signing secret
- `VITE_API_URL` — Backend URL used by the frontend at build time
- `RESEND_API_KEY` — Email delivery (via Resend API)
- `INFO_EMAIL` / `INFO_EMAIL_PASSWORD` — Info mailbox
- `ADMIN_EMAIL` / `ADMIN_EMAIL_PASSWORD` — Admin mailbox
- `CAREERS_EMAIL` / `CAREERS_EMAIL_PASSWORD` — Careers mailbox
- `SALES_EMAIL` / `SALES_EMAIL_PASSWORD` — Sales mailbox
- `SUPPORT_EMAIL` / `SUPPORT_EMAIL_PASSWORD` — Support mailbox
- `NOREPLY_EMAIL` — No-reply send-only account

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
