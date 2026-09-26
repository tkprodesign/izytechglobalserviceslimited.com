# IZY Technologies Global Services Limited

Official digital platform — a Next.js app (admin & developer panels) plus an Express + PostgreSQL API bridge, deployed from one Node process. Cloudflare Pages retains a separate Vite build path.

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
| **Start application** | `npm run build && PORT=5000 npm start` | 5000 | Next.js site + Express API |

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
| `VITE_API_URL` | Production Render API base URL used by the Cloudflare Pages Vite build (`https://izytech-api.onrender.com`). The primary Next.js app uses its same-origin API bridge. |

### Email accounts (Resend Receiving + sending)
| Secret | Purpose |
|---|---|
| `INFO_EMAIL` | Info mailbox (`info@izytechglobalservices.com`) |
| `ADMIN_EMAIL` | Admin mailbox |
| `CAREERS_EMAIL` | Careers mailbox |
| `DEVELOPER_EMAIL` | Developer mailbox / developer-panel identity |
| `INVOICE_EMAIL` | Invoice mailbox |
| `SALES_EMAIL` | Sales mailbox |
| `SUPPORT_EMAIL` | Support mailbox |
| `NOREPLY_EMAIL` | No-reply send-only address |
| `INFO_EMAIL_PASSWORD` | Info mailbox credential |
| `ADMIN_EMAIL_PASSWORD` | Admin mailbox credential |
| `CAREERS_EMAIL_PASSWORD` | Careers mailbox credential |
| `DEVELOPER_EMAIL_PASSWORD` | Developer-panel login credential |
| `INVOICE_EMAIL_PASSWORD` | Invoice mailbox credential |
| `SALES_EMAIL_PASSWORD` | Sales mailbox credential |
| `SUPPORT_EMAIL_PASSWORD` | Support mailbox credential |
| `RESEND_API_KEY` | Resend API for receiving and delivery from all managed mailboxes |

The Email Manager reads inbound messages from Resend Receiving and sends through Resend over HTTPS. Resend provides one Inbox per managed address; it does not provide IMAP folders or persistent read/unread state. Receiving remains pending until the domain's root MX records are changed to the exact values shown in the Resend Receiving dashboard. The email account registry is defined in `server/routes/email.js`.

### Cloudflare Images
| Secret | Purpose |
|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account identifier |
| `CLOUDFLARE_API_TOKEN` | API token scoped to Cloudflare Images |
| `CLOUDFLARE_IMAGE_HASH` | Delivery hash for the Cloudflare Images domain |
| `CLOUDFLARE_API_NAME` | Cloudflare Images API name/configuration |

### Cloudflare R2 (uploads)
| Secret / variable | Purpose |
|---|---|
| `CLOUDFLARE_S3_API_ENDPOINT` | R2 S3-compatible API endpoint |
| `CLOUDFLARE_ACCESS_KEY_ID` | R2 access key ID |
| `CLOUDFLARE_SECRET_ACCESS_KEY` | R2 secret access key |
| `CLOUDFLARE_PUBLIC_BUCKET` | Public bucket for site/project images (`izy-public-images`) |
| `CLOUDFLARE_PRIVATE_BUCKET` | Private bucket for assessment attachments (`izy-private-assessments`) |
| `CLOUDFLARE_R2_PUBLIC_URL` | Public R2 delivery base URL |

### Infrastructure
| Secret | Purpose |
|---|---|
| `RENDER_API_KEY` | Render API key used for deployment administration from Replit |
| `RENDER_SERVICE_ID` | Render service identifier |
| `GITHUB_TOKEN` | GitHub token used to push approved changes to the canonical repository from Replit |

### Live chat (Smartsupp)
| Secret | Purpose |
|---|---|
| `SMARTSUPP_API` | Smartsupp REST API token (server-side only, never exposed to the browser). Verifies the account/agent state; agent profile photo and chat-box appearance are configured in the Smartsupp dashboard. |

The public chat widget is loaded in `app/layout.tsx` for Next.js and `index.html` for the Cloudflare Pages Vite build, with the site key, brand color `#F0A20E`, rating enabled, and cross-subdomain cookies (`.izytechglobalservices.com`). Visitor identification is bridged in `src/lib/smartsupp.ts` and called after form submissions so agents see the visitor's name, email, phone and form type.

## Database

Initial schema lives in `server/migrations/001_initial.sql` (tables: `contact_submissions`, `quote_requests`). Already applied to the Neon database.

## Invoice sections + draft workflow (ongoing/admin)

Invoices can be created from **structured sections** (title + rows) instead of flat line items. The admin editor in `src/app/admin/InvoicesPage.tsx` has two tabs — **Sections** and **Flat items** — and the backend flattens the sections into the same `line_items` column the PDF/email renderers consume.

- **Payload shape:** `{ title, description?, rows: [{ description, quantity, unit_price, amount }] }`.
- **`sectionsToPayload()`** maps client sections to that shape (`src/app/admin/InvoicesPage.tsx`).
- **`flattenToLineItems(sections)`** in `server/invoices_endpoint.js` flattens sections into line items; both `POST /api/admin/invoices` and `PUT /api/admin/invoices/:id` accept and save `sections`, and recompute `total` from them.
- **`POST /api/admin/invoices/:id/save-draft`** (same file) upserts the in-progress payload with `status='draft'`, recomputes `total` from persisted sections/line items, and returns `{ data, saved_as_draft: true }`.
- The client **auto-saves on every keystroke** (800 ms debounce) to `POST /api/admin/invoices/:id/save-draft` and **resumes a draft** on revisit via `loadDraft()` (see the "Draft resuming" banner and `saved_as_draft` flag). Reopening a `draft` invoice restores its sections + fields so a cancelled tab or accidental exit never loses work.
- The list table exposes a **Resume draft** control for `status='draft'` rows.

## Cloudflare Pages environment variable

Cloudflare Pages uses `npm run pages:build` and publishes `dist/`. Set
`VITE_API_URL` to the public Render API URL before deploying.

## Production deployment

- **Application**: Next.js deployment (site and API together)
- **Cloudflare Pages**: separate Vite static build for the configured Pages project
- **Database**: Neon PostgreSQL

## Project structure

```
app/        Next.js route shell
src/        React site, admin, and developer panels
server/     Express API library and database initialization
pages/api/  Next.js bridge for the Express API
public/     Static assets
dist/       Cloudflare Pages Vite build output
docs/       Design system, guides, attributions
```

## User preferences

- Keep existing project structure — do not migrate or restructure without explicit request.
