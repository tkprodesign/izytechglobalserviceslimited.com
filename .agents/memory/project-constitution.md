---
name: IZY Technologies Project Constitution
description: Governing charter for all development on the IZY Technologies website and platform
---

# IZY Technologies — Project Constitution

## Repository
- GitHub: `izytechgsl/izytech-website` — canonical source of truth
- Replit is the development assistant only; GitHub is authoritative
- Anything outside this repo is obsolete unless explicitly imported

## Deployment Stack
| Layer | Service |
|---|---|
| Frontend | Cloudflare Pages (direct GitHub integration — NO GitHub Actions) |
| Backend | Railway |
| Database | Neon PostgreSQL |
| Repo | GitHub (`izytechgsl/izytech-website`) |
| Dev assistant | Replit Agent |

Custom domain: to be added later. Until then use Cloudflare Pages domain for production.

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
- Document important architectural decisions

## Git Rules
- Treat GitHub as canonical
- Never replace large portions of codebase unless instructed
- Never delete existing features without confirmation
- Prefer incremental commits
- Respect existing project structure

## Before Implementing
Always inspect existing: folders, components, utilities, services, hooks, configuration. Reuse before creating.

## Current Stack (website)
- React 18 + Vite 6 + TypeScript + Tailwind CSS 4 + Framer Motion
- pnpm package manager
- All source in `Website for Izy Tech/src/`
- Sections in `src/app/sections/` | Utilities in `src/app/components/` | Styles in `src/styles/`
- Brand: Navy `#041627` + Amber `#F0A20E`

**Why:** User established this as the permanent long-term governance document for the project.
**How to apply:** Every session — check this before planning any work. All decisions must align with the architecture and rules above.
