---
name: Next and Express API bridge
description: The deployment combines a Next client shell with the existing Express API service
---

The production entrypoint must mount the exported Express app before passing unmatched requests to Next's request handler.

**Why:** The React app uses same-origin `/api/*` requests. If the custom server starts Next alone, API calls receive the Next page fallback instead of JSON responses, and protected admin screens appear empty after login.

**How to apply:** Keep `server/expressApp.js` as the API owner and make `server.js` listen with Express first, then delegate non-API requests to Next. Verify an unauthenticated protected endpoint returns JSON `401` after any entrypoint change.