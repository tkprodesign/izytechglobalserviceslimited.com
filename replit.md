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

All secrets are stored in Replit's secret manager and are automatically available to every agent session — no re-entry needed. Plain env vars (non-sensitive) live in the `[userenv]` block of `.replit`.

### Database & auth
| Secret | Purpose |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `SESSION_SECRET` | JWT signing secret for admin auth |

### Frontend config
| Secret | Purpose |
|---|---|
| `VITE_API_URL` | Production Railway API base URL used by the Cloudflare Pages build (`https://izytech-website-production.up.railway.app`). Local Replit development uses the Vite `/api` proxy instead. |

### Email accounts (IMAP via Spacemail, sending via Resend)
| Secret | Purpose |
|---|---|
| `INFO_EMAIL` / `INFO_EMAIL_PASSWORD` | Info mailbox (`info@izytechglobalservices.com`) |
| `ADMIN_EMAIL` / `ADMIN_EMAIL_PASSWORD` | Admin mailbox |
| `SALES_EMAIL` / `SALES_EMAIL_PASSWORD` | Sales mailbox |
| `SUPPORT_EMAIL` / `SUPPORT_EMAIL_PASSWORD` | Support mailbox |
| `NOREPLY_EMAIL` | No-reply send-only address |
| `RESEND_API_KEY` | Resend API for email delivery from all managed mailboxes |

The Email Manager reads inboxes from Spacemail over IMAP. Railway blocks outbound SMTP, so all sending goes through Resend over HTTPS. The email account registry is defined in `backend/routes/email.js`.

### Cloudflare (product image uploads)
| Secret | Purpose |
|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account for Images |
| `CLOUDFLARE_API_TOKEN` | API token scoped to Cloudflare Images |
| `CLOUDFLARE_IMAGE_HASH` | Delivery hash for the Cloudflare Images domain |

### Infrastructure
| Secret | Purpose |
|---|---|
| `RAILWAY_TOKEN` | Railway project token used for deployment administration from Replit |
| `GITHUB_TOKEN` | GitHub token used to push approved changes to the canonical repository from Replit |

## Database

Initial schema lives in `backend/migrations/001_initial.sql` (tables: `contact_submissions`, `quote_requests`). Already applied to the Neon database.

## Production deployment

- **Frontend**: Cloudflare Pages (built from GitHub)
- **Backend**: Railway (`backend/` root directory, Dockerfile builder)
- **Database**: Neon PostgreSQL

## Project structure

```
frontend/   React + Vite app
backend/    Express API server
docs/       Design system, guides, attributions
```

## User preferences

- Keep existing project structure — do not migrate or restructure without explicit request.
