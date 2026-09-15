---
name: Next.js Replit compatibility
description: Replit package and preview constraints for this app's custom Next.js webpack setup
---

The app must run Next with explicit webpack mode (`next dev --webpack` and `next build --webpack`). Replit's package firewall blocks the imported older Next.js patch, so use an allowed current release rather than trying to reinstall that pinned version.

**Why:** Next 16 defaults to Turbopack and fails when this app's existing webpack DefinePlugin configuration is present. The older imported Next version cannot be restored because the package firewall rejects it for a critical vulnerability.

**How to apply:** Keep the custom webpack configuration and explicit `--webpack` flags in the npm scripts. Run the single root app on Replit's webview port 5000; do not recreate the obsolete frontend/backend split workflows.