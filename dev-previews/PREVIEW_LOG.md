# Preview Activity Log

This is the readable repository snapshot for the Developer Page Previews workspace.

The live source of truth is the append-only PostgreSQL event history. Use the authenticated developer endpoint `GET /api/dev/previews/export.md` to retrieve the current log.

## 2026-11-19 — Workspace started

- Created the developer-only Page Previews catalogue.
- Created the About Us baseline clone at `/dev/previews/about-us`.
- The clone starts from the current production About Us page and contains no leadership section or other new content.
- Added server-verified developer access and preview-open activity logging.

Further changes must be recorded in the database event history and reflected in a fresh export.
