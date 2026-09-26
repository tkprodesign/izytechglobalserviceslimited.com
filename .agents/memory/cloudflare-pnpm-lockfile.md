---
name: Cloudflare pnpm lockfile
description: Dependency lockfile requirement for the Cloudflare Pages deployment path
---

The Cloudflare Pages deployment installs dependencies with `pnpm install` in frozen-lockfile mode. Any dependency range change in `package.json` must be regenerated into `pnpm-lock.yaml`; updating only `package-lock.json` does not unblock deployment.

**Why:** Cloudflare stops before running the build when the pnpm importer specifiers differ from `package.json`.

**How to apply:** After dependency changes, run a lockfile-only pnpm refresh and verify with a frozen install before pushing. Do not leave a stale `bun.lock` beside the pnpm lockfile: Cloudflare may select Bun and fail before the configured Pages build runs. Keep the Next.js build as the primary application check.