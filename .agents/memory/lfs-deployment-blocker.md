---
name: LFS deployment blocker
description: Why unused Git LFS assets must stay out of the deployable repository
---

Unused media archives tracked through Git LFS can prevent both Render and Cloudflare Pages from cloning the repository when the GitHub LFS budget is exhausted.

**Why:** The deployment providers clone from GitHub and fail during checkout before build or runtime configuration is reached; application code and secrets cannot fix that failure.

**How to apply:** Keep production media under the existing public asset or object-storage flow, and do not re-add raw upload archives to the repository or `.gitattributes`.