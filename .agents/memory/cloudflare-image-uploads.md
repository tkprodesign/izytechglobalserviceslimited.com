---
name: R2 image storage
description: Public media uploads bypass Railway through R2 while private assessment files use signed admin URLs
---

Product and project image bytes are sent directly from the browser to the public Cloudflare R2 bucket using short-lived signed PUT URLs. The API stores only the resulting public delivery URL in PostgreSQL.

**Why:** The owner wants product media off Railway to reduce Railway resource usage and credits.

**How to apply:** Keep R2 S3 credentials server-side and never proxy public image bytes through the backend. Site-assessment photos and payment receipts use the private R2 bucket; store only their object keys and mint short-lived signed GET URLs for authenticated admin responses. Existing legacy Cloudflare Images URLs remain readable.