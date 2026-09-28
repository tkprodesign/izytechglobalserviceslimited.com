# GitHub Copilot & Codex Instructions for IzyTech Global Services

This repository contains the full stack web application for **IzyTech Global Services Limited** (`https://izytechglobalservices.com`).

---

## 1. Architecture & Deployment Stack

- **Frontend:** Next.js (App Router) + React / Vite + Tailwind CSS.
  - Deployed on **Cloudflare Pages** (Project: `izytech-website`).
  - Production URL: `https://izytechglobalservices.com`
- **Backend API:** Node.js / Express (`server/expressApp.js`).
  - Deployed on **Render** (Service ID: `srv-d9hd617avr4c73ebtj9g`).
  - API Base URL: `https://izytech-api.onrender.com`
  - Health check endpoint: `https://izytech-api.onrender.com/api/health`
- **Database:** PostgreSQL on Render.
  - Startup connection retry logic is implemented in `server/expressApp.js` to handle cold starts gracefully.
- **Environment & Credentials:**
  - Local credentials file: `C:\Users\LENOVO\Downloads\izy.env.txt` (contains `RENDER_API_KEY`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`).

---

## 2. Recent Key Changes & Status (Synchronized on `main`)

- **Invoice Summary Cards (`src/app/admin/InvoicesPage.tsx` - commit `d8b65c8`):**
  - Restored the 4 statistics cards (`Total Invoices`, `Pending`, `Paid`, `Total Revenue`) for desktop and mobile above the invoice list (`xl:grid-cols-4`).
- **Site Branding & Favicon (`app/layout.tsx`, `index.html`, `src/app/admin/LoginPage.tsx` - commit `15469eb`):**
  - Configured `/favicon.png` across all entry points and updated the admin login header with the official brand logo.
- **Admin/Developer Panel Polish (`src/app/admin/DashboardLayout.tsx`, `DevDashboardLayout.tsx`, `src/styles/theme.css` - commit `6a58d56`):**
  - Unified theme chrome, responsive spacing, and navigation container styling.
- **Mobile Email Manager (`src/app/admin/EmailPage.tsx` - commit `c326cad`, `80a9d27`):**
  - Fixed sidebar scrolling and mobile overflow issues.
- **Database Resilience (`server/expressApp.js` - commit `6c9c8ca`):**
  - Implemented retry logic for transient database startup connections.
- **Smartsupp Live Chat:**
  - Dynamically hidden across admin and developer panels during navigation to prevent UI overlay conflicts.
- **Lead Capture & Follow-up Tracking:**
  - AltPower solar calculator inputs capture user leads into contacts.
  - Follow-up activity log and actions added to contact management.

---

## 3. Deployment & Verification Workflow

When making code changes:
1. Ensure the code compiles cleanly and lint checks pass.
2. Commit with concise, descriptive commit messages and push to `origin/main`.
3. Verify deployments:
   - Check Cloudflare Pages status for the frontend build.
   - Check Render API deployment status and ensure `https://izytech-api.onrender.com/api/health` returns `{"status":"ok"}`.
