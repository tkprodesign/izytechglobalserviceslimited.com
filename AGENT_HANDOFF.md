# AGENT & DEVELOPER HANDOFF STATE

## Overview
This document records the exact state of the project, architecture, deployment targets, and recent fixes for any AI agent (Codex, Copilot, Antigravity, Claude) or developer picking up work in this repository.

---

## 1. System Architecture

| Component | Technology | Hosting / Platform | Production URL |
| :--- | :--- | :--- | :--- |
| **Frontend** | Next.js (App Router), React, Tailwind CSS | Cloudflare Pages (`izytech-website`) | `https://izytechglobalservices.com` |
| **Backend** | Node.js, Express (`server/expressApp.js`) | Render (`srv-d9hd617avr4c73ebtj9g`) | `https://izytech-api.onrender.com` |
| **Database** | PostgreSQL | Render Managed Postgres | Connected via internal connection string |
| **Health Check** | `/api/health` | Render API | `https://izytech-api.onrender.com/api/health` |

---

## 2. Environment Variables & Keys

- Primary local credentials file: `C:\Users\LENOVO\Downloads\izy.env.txt`
  - `RENDER_API_KEY`: For querying Render deploys and service health.
  - `CLOUDFLARE_API_TOKEN` & `CLOUDFLARE_ACCOUNT_ID`: For querying Cloudflare Pages deployments.

---

## 3. Work Completed Today (All Pushed & Live on `main`)

1. **`d8b65c8` - Restore invoice summary statistics on desktop (`src/app/admin/InvoicesPage.tsx`)**:
   - Fixed missing Total Invoices, Pending, Paid, and Total Revenue stat cards by moving them out of `md:hidden` into a responsive desktop/mobile grid above the invoice list.
   - Deployed live on Cloudflare Pages and Render (`dep-dat6icoae00c73bp6ee0`).
2. **`15469eb` - Apply site icon across app entry points (`app/layout.tsx`, `index.html`, `src/app/admin/LoginPage.tsx`)**:
   - Standardized `/favicon.png` across Next.js and Vite app entry points and added official brand image to the admin login page.
3. **`6a58d56` - Polish admin and developer panel chrome**:
   - Styled admin layout headers, navigation bars, and theme variables in `src/styles/theme.css`.
4. **`c326cad` & `80a9d27` - Mobile email manager**:
   - Fixed mailbox layout, scroll containers, and overflow bugs on small viewports.
5. **`6c9c8ca` - Transient database startup retry logic (`server/expressApp.js`)**:
   - Added automatic exponential retry loops on server launch to prevent downtime during cold starts.
6. **`9e5ef8d` & `d9fa5d1` - Smartsupp chat isolation**:
   - Smartsupp live chat widget is automatically hidden when navigating admin or developer dashboards.
7. **`4265e5e` to `8ae1e04` - AltPower lead capture and contact activity**:
   - AltPower solar calculator submissions are automatically persisted as leads in the contacts table.
   - Contact follow-up actions and activity logs are tracked.

---

## 4. Current State
- **Branch:** `main`
- **Working Tree:** Clean, synchronized with `origin/main`.
- **API Health:** Verified `ok` (`https://izytech-api.onrender.com/api/health`).
- **Frontend Status:** Verified live and matching latest commit.

---

## 5. Continuity Instructions for Next Agent / Codex

- To check deployment status:
  - Query Render: `GET https://api.render.com/v1/services/srv-d9hd617avr4c73ebtj9g/deploys?limit=1`
  - Query Cloudflare: `GET https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/pages/projects/izytech-website/deployments?per_page=1`
- Always verify API health (`/api/health`) after backend changes.
