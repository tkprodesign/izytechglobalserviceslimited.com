---
name: Replit config replacement
description: The workspace-specific procedure for safely updating the protected .replit configuration file
---

The `.replit` file is protected from direct edits. Update a complete TOML copy in a workspace temporary file and pass it through Replit’s schema-validated replacement callback.

**Why:** Direct patching is rejected by the workspace, while validated replacement preserves the configuration contract and removes the temporary file.

**How to apply:** When `.replit` needs changes, preserve the existing workflows and ports, write the full intended TOML to a temporary workspace file, validate/replace it, then verify the workflows.