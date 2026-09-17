---
name: Global script entrypoints
description: Where site-wide third-party scripts must be registered for this dual-deployment app
---

This project has two frontend delivery paths: the Next.js runtime uses `app/layout.tsx`, while the Cloudflare Pages build uses the root `index.html` Vite entrypoint. Site-wide scripts such as chat, analytics, or consent tools must be included in both paths when both deployments are active.

**Why:** A script added only to the Next layout can work in the local Next preview but disappear from the Cloudflare Pages build, while a script added only to `index.html` does the reverse.

**How to apply:** When adding or debugging a global browser script, verify both source entrypoints and inspect the served HTML for the target deployment.