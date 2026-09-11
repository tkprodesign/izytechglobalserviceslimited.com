---
name: Backend dependency resolution
description: Backend workflows resolve packages from the workspace root when backend-local installs are incomplete
---

The backend workflow can resolve dependencies from the workspace root because Node walks up from `backend/` when resolving modules. Keep backend runtime dependencies represented in the root install context as well as the backend package manifest when the Replit workflow does not install the backend package separately.

**Why:** A restart after adding R2 secrets exposed that the backend-local `node_modules` did not contain the already-declared S3 SDK, while the workflow still depended on it.

**How to apply:** If a backend-only workflow reports a missing module despite its backend manifest declaring the package, check the workspace-root dependency install before changing application code.