# IZY Technologies Global Services Limited

Official website and digital platform for IZY Technologies Global Services Limited — Nigeria's premier energy solutions provider.

## Repository Structure

```
/
├── frontend/     React + Vite website (TypeScript, Tailwind CSS, Framer Motion)
├── backend/      API server (Railway — to be scaffolded)
├── docs/         Site guide, design guidelines, attributions
└── .github/      CI/CD workflows
```

## Quick Start

> **Package manager:** This project uses [pnpm](https://pnpm.io). Install it once with `npm install -g pnpm` if you don't have it.

```bash
cd frontend
pnpm install
pnpm run dev       # starts dev server on http://localhost:5000
```

## Production Build

```bash
cd frontend
pnpm run build     # output → frontend/dist/
```

## Deployment Stack

| Layer    | Service          |
|----------|------------------|
| Frontend | Cloudflare Pages |
| Backend  | Railway          |
| Database | Neon PostgreSQL  |
| Repo     | GitHub — `izytechgsl/izytech-website` |

## Docs

- [Site Guide](docs/SITE_GUIDE.md) — every section, editable content tables, glossary
- [Design Guidelines](docs/DESIGN_GUIDELINES.md) — typography, colour system, component notes
- [Attributions](docs/ATTRIBUTIONS.md) — open-source licences and asset credits
- [Projects Feature](docs/PROJECTS_FEATURE.md) — full implementation record for the DB-backed Projects feature
- [Changelog](CHANGELOG.md) — history of significant changes
