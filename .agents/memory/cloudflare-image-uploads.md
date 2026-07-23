---
name: Store image storage
description: Store product images should bypass Railway and upload directly to Cloudflare Images
---

Store product image bytes are sent from the admin browser directly to Cloudflare Images using a short-lived direct-upload URL created by the API. The API stores only the resulting delivery URL in PostgreSQL.

**Why:** The owner wants product media off Railway to reduce Railway resource usage and credits.

**How to apply:** Keep Cloudflare account ID, API token, and Images delivery hash in deployment secrets/environment variables; never add image bytes or local upload storage to the backend. The app accepts `CLOUDFLARE_IMAGE_HASH` as the current delivery-hash name and the older plural `CLOUDFLARE_IMAGES_HASH` as a fallback.