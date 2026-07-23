---
name: Schema rollout safety
description: Durable rules for adding tables and seed data to the imported Neon-backed app
---

Use additive schema changes for new features. Keep the backend startup initializer safe to run repeatedly, and make fixed seed inserts conflict-safe because overlapping deploys can initialize the same empty table concurrently. Keep a companion SQL migration for the externally managed Neon database.

**Why:** The app deploys the backend separately from the frontend and can have more than one backend process during rollout; a count-then-insert seed routine can race and abort startup.

**How to apply:** For future feature tables, use `CREATE TABLE IF NOT EXISTS`, idempotent indexes, and `INSERT ... ON CONFLICT DO NOTHING` for bootstrap data. Never remove existing records as part of a feature migration.