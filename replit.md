# IZY Technologies Global Services Limited

Official digital platform — a Next.js app serving the React site, Express API, and admin panel from one process.

**Brand naming:** The full legal name is **Izy Technologies Global Services Limited**. The preferred short alias is **Izy Tech Services**. Avoid using “IZY” as a standalone company reference in customer-facing copy.

---

> ## ⚠️ AGENT RULE — READ BEFORE ANY WORK ⚠️
>
> **The admin panel and dev panel share business/content management features.**
> Technical tools are developer-only. The Email Manager is available to authenticated admins at `/admin/email` and to developers at `/dev/email`.
>
> Changes to shared business/content features apply to both roles. Changes to technical tools must remain developer-only unless explicitly requested otherwise.
>
> Shared control-panel features include:
> - Dashboard, Contacts, Quotes, Social Media, Store Products, Store Enquiries
> - Sidebar navigation (`src/app/admin/DashboardLayout.tsx`)
>
> The developer sidebar also includes system status, system info, services content, and Email Manager. Admins must be redirected away from developer-only routes and receive a `403` from developer-only API endpoints.
> Do NOT create separate admin and dev versions of shared features unless explicitly told to.

---

## How to run on Replit

The application runs as one workflow:

| Workflow | Command | Port | Purpose |
|---|---|---|---|
| **Start application** | `PORT=5000 npm run dev` | 5000 | Next.js site, admin panel, and API |

It starts automatically. The preview pane shows the site and admin panel, while `/api/*` is handled by the same server.

Install dependencies before first run:
```
npm ci
```

## Stack

- **App**: Next.js, React 18, TypeScript, Tailwind CSS v4, Framer Motion, Radix UI
- **API**: Node.js, Express, PostgreSQL (`pg`), JWT auth
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
| `VITE_API_URL` | Production Render API base URL used by the Cloudflare Pages build (`https://izytech-api.onrender.com`). Local Replit development uses the Vite `/api` proxy instead. |

### Email accounts (Resend Receiving + sending)
| Secret | Purpose |
|---|---|
| `INFO_EMAIL` | Info mailbox (`info@izytechglobalservices.com`) |
| `ADMIN_EMAIL` | Admin mailbox |
| `SALES_EMAIL` | Sales mailbox |
| `SUPPORT_EMAIL` | Support mailbox |
| `NOREPLY_EMAIL` | No-reply send-only address |
| `RESEND_API_KEY` | Resend API for receiving and delivery from all managed mailboxes |

The Email Manager reads inbound messages from Resend Receiving and sends through Resend over HTTPS. Resend provides one Inbox per managed address; it does not provide IMAP folders or persistent read/unread state. Receiving remains pending until the domain's root MX records are changed to the exact values shown in the Resend Receiving dashboard. The email account registry is defined in `server/routes/email.js`.

### Cloudflare (product image uploads)
| Secret | Purpose |
|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account for Images |
| `CLOUDFLARE_API_TOKEN` | API token scoped to Cloudflare Images |
| `CLOUDFLARE_IMAGE_HASH` | Delivery hash for the Cloudflare Images domain |

### Infrastructure
| Secret | Purpose |
|---|---|
| `RENDER_API_KEY` | Render API key used for deployment administration from Replit |
| `GITHUB_TOKEN` | GitHub token used to push approved changes to the canonical repository from Replit |

## Database

Initial schema lives in `server/migrations/001_initial.sql` (tables: `contact_submissions`, `quote_requests`). Already applied to the Neon database.

## Production deployment

- **Application**: Next.js deployment (site and API together)
- **Database**: Neon PostgreSQL

## Project structure

```
app/        Next.js route shell
src/        React site, admin, and developer panels
server/     Express API library and database initialization
pages/api/  Next.js bridge for the Express API
docs/       Design system, guides, attributions
```

## User preferences

- Keep existing project structure — do not migrate or restructure without explicit request.
