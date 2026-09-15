---
name: Cloudflare Pages build root
description: Deployment constraints for the static Cloudflare Pages frontend after the repository moved to a root app
---

Cloudflare Pages is configured as a static frontend deployment, while Render serves the full Next.js/Express application. Pages must use the repository root, run the dedicated static Vite build, and publish `dist`.

**Why:** The historical Pages project retained `frontend` as its root directory after that directory was removed. Cloudflare also runs `npm ci`, so adding build tooling without regenerating `package-lock.json` causes the deployment to fail before the build starts.

**How to apply:** Keep the Pages project root empty/root, build command `npm run pages:build`, destination `dist`, and commit package-lock changes whenever Pages build dependencies change. Keep `VITE_API_URL` pointed at the Render API.