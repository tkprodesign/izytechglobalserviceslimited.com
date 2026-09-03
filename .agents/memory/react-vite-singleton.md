---
name: React singleton in Vite
description: Public Radix components need React and React DOM deduplicated in Vite to avoid invalid hook calls during HMR.
---

When adding Radix-based UI to the public Vite bundle, keep React and React DOM configured as Vite dedupe dependencies.

**Why:** Loading the first Radix dialog from a public component exposed an invalid hook call during development hot updates when the bundler resolved more than one React instance.

**How to apply:** Preserve the React/React DOM dedupe configuration in the frontend Vite resolve settings and verify fresh browser logs after adding Radix components.