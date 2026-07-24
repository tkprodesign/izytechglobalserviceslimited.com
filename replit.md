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

### Frontend config (also set as plain env var in `.replit`)
| Secret | Purpose |
|---|---|
| `VITE_API_URL` | Backend base URL used by the React frontend (`https://izytech-api.onrender.com`) |

### Email accounts (IMAP + SMTP via Spacemail)
| Secret | Purpose |
|---|---|
| `INFO_EMAIL` / `INFO_EMAIL_PASSWORD` | Info mailbox (`info@izytechglobalservices.com`) |
| `ADMIN_EMAIL` / `ADMIN_EMAIL_PASSWORD` | Admin mailbox |
| `CAREERS_EMAIL` / `CAREERS_EMAIL_PASSWORD` | Careers mailbox |
| `SALES_EMAIL` / `SALES_EMAIL_PASSWORD` | Sales mailbox |
| `SUPPORT_EMAIL` / `SUPPORT_EMAIL_PASSWORD` | Support mailbox |
| `NOREPLY_EMAIL` | No-reply send-only address |
| `RESEND_API_KEY` | Resend API for transactional email delivery |

### Cloudflare (product image uploads)
| Secret | Purpose |
|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account for Images |
| `CLOUDFLARE_API_TOKEN` | API token scoped to Cloudflare Images |
| `CLOUDFLARE_IMAGE_HASH` | Delivery hash for the Cloudflare Images domain |

### Infrastructure
| Secret | Purpose |
|---|---|
| `RENDER_API_KEY` | Render account API key (manage the production backend) |
| `RENDER_SERVICE_ID` | Render service ID: `srv-d9hd617avr4c73ebtj9g` |
| `GITHUB_TOKEN` | GitHub PAT with `repo` + `workflow` scopes — used to push to the repo from Replit |

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
