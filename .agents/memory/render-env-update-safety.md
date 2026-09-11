---
name: Render environment update safety
description: Avoid replacing Render environment variables from incomplete or paginated reads
---

Do not bulk-replace the Render service environment from an unverified environment-variable response. Update individual keys or build the replacement from a complete, explicitly checked inventory, because unrelated production entries can be dropped.

**Why:** A bulk R2 environment update succeeded but removed unrelated admin, careers, and CORS entries from the service until they were restored individually.

**How to apply:** After any Render environment change, compare the full key inventory with the required production configuration and verify login plus the affected production flow before finishing.