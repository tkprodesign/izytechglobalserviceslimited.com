---
name: IZY Technologies Project Constitution
description: Governing charter for all development on the IZY Technologies website and platform
---

# IZY Technologies — Project Constitution

## Repository
- GitHub: `tkprodesign/izytechglobalserviceslimited.com` — canonical source of truth (as of 2026-07-17)
- The old repo `izytechgsl/izytech-website` is dead — account suspended, history discarded. Never reference it.
- Replit is the development assistant only; GitHub is authoritative.

## Deployment Stack
| Layer | Service |
|---|---|
| Frontend | Cloudflare Pages (direct GitHub integration — NO GitHub Actions) |
| Backend | Railway (`/backend` root directory) |
| Database | Neon PostgreSQL |
| Repo | GitHub (`tkprodesign/izytechglobalserviceslimited.com`) |
| Dev assistant | Replit Agent |

Custom domain: purchased, to be connected. Until then use Cloudflare Pages domain for production.

## Infrastructure Status (as of 2026-07-17)
- ✓ Repository recovered — fresh Git history at new repo
- ✓ Cloudflare Pages configured
- ✓ Railway project created
- ✓ Neon database created
- ⏳ Railway backend deployment — in progress (npm install fix pushed)
- ⏳ Backend ↔ Neon connection — pending
- ⏳ Frontend ↔ Backend API — pending
- ⏳ Custom domain — pending

## .github/workflows — STRICT RULE
**Never create, modify, or manage any files inside `.github/workflows/`.**
Cloudflare Pages deploys directly from GitHub — no GitHub Actions workflow is used or needed.
This rule has no exceptions unless the user explicitly requests it in writing.

## Development Rules
- Preserve architecture consistency — never duplicate components
- Never create multiple implementations of the same feature
- Prefer improving existing code over rewriting
- Avoid unnecessary dependencies
- Write production-quality code
- Keep project modular with clean folder structures
- Do not change repository structure without approval
- Do not create additional repositories
- Ask before making structural or infrastructure changes

## Git Rules
- `tkprodesign/izytechglobalserviceslimited.com` is the ONLY repo — never reference or recover old history
- Treat GitHub as canonical
- Never replace large portions of codebase unless instructed
- Never delete existing features without confirmation
- Prefer incremental commits
- Respect existing project structure

## Before Implementing
Always inspect existing: folders, components, utilities, services, hooks, configuration. Reuse before creating.

## Current Stack (website)
- React 18 + Vite 6 + TypeScript + Tailwind CSS 4 + Framer Motion
- pnpm package manager (frontend), npm (backend)
- Frontend source in `frontend/src/`
- Backend source in `backend/server.js` (Node.js + Express, plain JS ESM)
- Brand: Navy `#041627` + Amber `#F0A20E`

**Why:** User established this as the permanent long-term governance document. Updated 2026-07-17 after GitHub account suspension forced repo migration.
**How to apply:** Every session — check this before planning any work. All decisions must align with the architecture and rules above.
