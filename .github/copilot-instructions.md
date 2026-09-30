# GitHub Copilot & Codex Instructions for IzyTech Global Services

## Mandatory repository memory

Before editing, read `AGENTS.md`, `AGENT_HANDOFF.md`, and the newest entries in `CHANGELOG.md`.

Every code, configuration, database, security, content, UI, API, or behavior change **must update `CHANGELOG.md` in the same commit**. Do this automatically without waiting for the user to ask. Update `AGENT_HANDOFF.md` whenever the current operating state or durable conventions change.

This repository contains the production web application for **IzyTech Global Services Limited** (`https://izytechglobalservices.com`).

## 1. Architecture & Deployment Stack

- **Frontend:** React / Vite + Tailwind CSS.
  - Cloudflare Pages project: `izytech-website`
  - Production: `https://izytechglobalservices.com`
- **Backend API:** Node.js / Express in `server/expressApp.js`.
  - Render service: `srv-d9hd617avr4c73ebtj9g`
  - API: `https://izytech-api.onrender.com`
  - Health: `https://izytech-api.onrender.com/api/health`
- **Database:** PostgreSQL through `DATABASE_URL`.
- **Credentials:** deployment credentials and application secrets are stored outside the repository and in approved platform secret stores. Never commit local environment files or print secret values.

## 2. Admin / Developer Control Panels

The V2 experiment has been completed and merged. Do not recreate or reference V2 routes.

Primary routes:
- `/admin/dashboard`
- `/dev/dashboard`

Developer-only routes must continue to use the developer role guard. Developers may access permitted Admin areas; Admin users must be redirected away from developer-only pages.

Keep the existing shared features and data model. Do not create duplicate Admin/Developer versions of contacts, quotes, assessments, email, invoices, projects, store data, or company content.

## 3. Current Control-Panel Conventions

- `src/lib/adminApi.ts` is the reusable authenticated request helper for new/touched panel API calls.
- Admin dashboard operational counts come from `/api/admin/stats`.
- `/api/dev/system` must report real database connectivity and must expose only boolean secret-presence information, never values.
- Site Analytics has two privacy tiers: cookieless basic page-view counts (normalized public route + timestamp only) and consent-based enhanced analytics. Never add persistent visitor IDs, raw IP storage, raw user-agent storage, or fingerprinting.
- Regular quote lists must exclude `request_type='site_assessment'`; assessments have their own workflow.
- Production must not start without `SESSION_SECRET`.
- Admin and developer passwords may be overridden through the in-app Password & Security flow. Overrides are scrypt-hashed in `auth_credentials`; confirmation codes are HMAC-hashed, expire after 10 minutes, and are sent only to `izytechgsl@proton.me`.
- Preserve login throttling, role checks, password-change resend limits, code attempt limits, and credential-version session invalidation.

## 4. Build, Test, Deploy

For meaningful changes:
1. Start from latest `main`.
2. Run the relevant build/tests.
3. Commit with a concise descriptive message and push to `origin/main`.
4. Confirm the Cloudflare Pages deployment succeeds.
5. For backend changes, confirm the Render workflow succeeds and `/api/health` returns `status=ok`.
6. Stop and repair failures before stacking unrelated changes.

Automated regression checks are in `.github/workflows/control-panel-ci.yml`.
Backend deployment verification is in `.github/workflows/notify-render.yml`.
