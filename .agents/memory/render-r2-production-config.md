---
name: Render R2 production configuration
description: Production Render needs its own R2 variables and an explicit redeploy after they change
---

The Render backend does not inherit Replit development secrets. The public upload flow requires the R2 endpoint, access key, secret key, public bucket, and public delivery URL to be configured on the Render service itself; changing those values requires a new Render deploy before the running service sees them.

**Why:** The local API worked after the R2 secrets were added to Replit, but the live admin page continued returning the server-side “R2 storage is not configured” error until Render was updated and redeployed.

**How to apply:** When R2 configuration changes, verify the Render service environment independently and trigger a deploy; do not infer production readiness from the Replit workflows alone.