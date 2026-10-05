# AGENT & DEVELOPER HANDOFF STATE

## Overview
This document records the current architecture, deployment targets, control-panel state, and continuity rules for any developer or coding agent working on the repository.

> **Mandatory agent protocol:** Read `AGENTS.md` before making changes. Every code/config/content/behavior change must update `CHANGELOG.md` in the same commit. Update this handoff whenever the repository's current operating state changes.

## 1. System Architecture

| Component | Technology | Hosting / Platform | Production URL |
| :--- | :--- | :--- | :--- |
| Frontend | React / Vite + Tailwind CSS | Cloudflare Pages (`izytech-website`) | `https://izytechglobalservices.com` |
| Backend API | Node.js / Express (`server/expressApp.js`) | Render (`srv-d9hd617avr4c73ebtj9g`) | `https://izytech-api.onrender.com` |
| Database | PostgreSQL via `DATABASE_URL` | External managed PostgreSQL (shown as Neon in the developer UI) | Private |
| Health Check | `/api/health` | Render API service | `https://izytech-api.onrender.com/api/health` |

## 2. Credentials and Environment

Deployment credentials and application secrets must stay outside the repository. Never commit local environment files or print secret values.

GitHub Actions repository secrets currently expected by deployment workflows:
- `RENDER_API_KEY`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `NEON_API_KEY` (pre-existing)

Render itself must have the application environment variables required by the backend, including `DATABASE_URL`, `SESSION_SECRET`, email credentials, and the other variables reported as boolean presence flags in the developer System Info page.

## 3. Current Admin / Developer Panel State

There is no V2 dashboard anymore. The approved V2 work was merged into the primary routes:
- Admin: `/admin/dashboard`
- Developer: `/dev/dashboard`

The temporary `/admin/dashboard-v2` and `/dev/dashboard-v2` routes and duplicate V2 components were removed.

Current panel improvements include:
- responsive primary Admin and Developer layouts
- Company Content navigation groups
- developer-to-admin context switching on the normal routes
- password show/hide on the shared login screen
- Admin "Needs attention" operational counts for new contacts, assessment actions, new store enquiries, unpaid invoices, and overdue invoices
- reusable authenticated request handling in `src/lib/adminApi.ts`
- consistent expired/unauthorized-session redirects on the touched developer views
- truthful database connectivity probing in `/api/dev/system`
- production `SESSION_SECRET` fail-closed validation
- login brute-force throttling
- self-service Admin/Developer password changes under Password & Security, requiring the current password plus a 6-digit confirmation code sent to izytechgsl@proton.me
- changed control-panel passwords are scrypt-hashed in PostgreSQL and invalidate previously issued sessions for that role
- mobile card views for the wide Site Analytics visitor tables
- regular Quote Requests separated from Site Assessment records
- two-tier Site Analytics: always-on cookieless public page-view counts (route + timestamp only), plus consent-gated enhanced device/referrer/session/presence analytics
- analytics dashboard conversion counts sourced from existing contact, quote, site-assessment, and store-enquiry records

### Invoice tax behavior
- New invoices and drafts default to zero tax; the invoice editor no longer exposes VAT controls.
- Existing invoices retain their stored tax rate, label, amount, and total when reopened or edited. Do not bulk-update historical invoice rows.
- Invoice PDFs and emails include a tax row only when the saved tax amount is greater than zero.

## 4. Important Recent Commits

- `1685401` - Add secure Admin/Developer password changes with domain-owner email confirmation.
- `1b84e5d` - Add privacy-safe cookieless basic traffic measurement with consent-gated enhanced analytics.
- `4bf2c3b` - Fix navbar selection shortcut syntax after store-selection discoverability work.
- `1e774b3` - Merge V2 dashboards into the primary Admin and Developer panels; remove V2 routes/components.
- `2cee62d` - Harden panel authentication, add reusable authenticated API helper, truthful DB health, and Admin operational metrics.
- `274a0a2` - Improve mobile Site Analytics, separate quotes from site assessments, and add Control Panel CI.
- `a2eac6f` - Repair the Render deployment workflow parser, verify the exact commit on Render, and require a healthy `/api/health` response before success.
- Earlier continuity commits remain in Git history, including invoice/statistics, panel chrome, email mobile fixes, database retry, Smartsupp isolation, and AltPower/contact follow-up work.

## 5. Regression and Deployment Checks

`.github/workflows/control-panel-ci.yml` runs:
- `npm ci`
- `npm run pages:build`
- `node --check server/expressApp.js`
- AltPower tests
- contact follow-up tests
- invoice tests

`.github/workflows/notify-render.yml` handles backend-changing pushes. It finds an existing Render deploy for the exact commit or triggers that exact commit through the Render API, waits for a terminal deployment status, and then verifies `/api/health` returns `status=ok`.

Cloudflare Pages is connected to `main` and reports its build/deploy status back to GitHub.

### Last verified deployment state
- Control Panel CI: passed on `a2eac6f`.
- Cloudflare Pages: deployed `a2eac6f` successfully.
- Render: `a2eac6f` reached `live`; the workflow then confirmed `/api/health` returned `status=ok`.

## 6. Continuity Rules

Before editing:
1. Read `AGENTS.md`, this handoff, and the newest entries in `CHANGELOG.md`.
2. Pull or read the latest `origin/main`.
3. Do not recreate V2 dashboards.
4. Preserve the shared database, authentication, invoices, email manager, projects, store, assessments, analytics privacy boundaries, and public-site behaviour. Basic analytics must remain cookieless and identifier-free; enhanced analytics must remain consent-gated.
5. Make changes in logical batches.
6. Update `CHANGELOG.md` in the same commit as every code/config/content/behavior change. Update this handoff when current operating state changes.
7. Run relevant tests/builds.
8. Push completed work to `main`.
9. Do not continue past a failed Cloudflare or Render deployment; diagnose and repair it first.
10. Verify `https://izytech-api.onrender.com/api/health` after backend changes.
11. Never expose, log, or commit secret values.


## 7. Public Site Upgrade

Recent public-site work on `main`:
- `73b3810` — added production Open Graph/Twitter sharing metadata, a branded social-share card, route-aware SEO titles/descriptions, canonical handling, Organization/LocalBusiness structured data, `robots.txt`, `sitemap.xml`, and a web manifest.
- `afbbbc8` — added route-level code splitting, deferred Smartsupp loading, reduced-motion navigation handling, a company credential/trust strip, and a lower-friction project-enquiry-first conversion flow.
- `5457117` — optimized below-the-fold image loading, video posters/preload behavior, and public media/testimonial accessibility.
- `07c0cdf` — removed the unmaintained 98% satisfaction statistic from public UI, tightened project-detail media loading/accessibility, and refreshed the site guide.

Public-site rules:
- Keep the root Open Graph tags in `index.html`; social crawlers often do not execute the React app.
- Keep private routes `noindex` and excluded from the sitemap.
- New public routes should receive an entry in `SeoManager.tsx` and, where appropriate, `public/sitemap.xml`.
- Do not reintroduce the unsupported 98% satisfaction statistic unless there is a maintained source for it.
- Initial lead capture should remain low-friction; site assessment is a distinct next step for projects that require a field visit.


### Public-site deployment verification
The public-site upgrade batches above were each pushed to `main`, passed Control Panel CI, and deployed successfully through Cloudflare Pages. They did not change backend code, so a Render deployment was not required for these batches.


## 8. Store Selection Language

The public store is not an e-commerce checkout and must not use cart-style purchase wording or "Add to Enquiry".
The approved customer flow is:

**SELECT → REVIEW → REQUEST PRICING**

Visible terminology:
- Product CTA: `SELECT PRODUCT`
- Selected state: `SELECTED`
- Floating CTA: `REVIEW SELECTION`
- Review page: `Your Selection` / `Review Your Selection`
- Final action: `REQUEST PRICING & AVAILABILITY`

The public review route is `/store/request`. The older `/store/enquire` URL redirects to it for compatibility. The backend endpoint remains `/api/store/enquire` as an internal API contract.

Important: failed store request submissions must never display success or clear the user's selection.


### Selection discoverability
The store keeps the non-checkout terminology but makes the product-selection workflow obvious to ordinary visitors:
- product CTA: `ADD TO SELECTION`
- selected state: `IN YOUR SELECTION`
- a `YOUR SELECTION` counter is visible in the Store filter bar
- once products are selected, a global Navbar shortcut appears on desktop and mobile
- the Store keeps a prominent bottom `YOUR SELECTION · REVIEW NOW` action

Do not remove all of these entry points at once; the store has no conventional shopping-cart checkout, so the selection review must remain easy to find.
