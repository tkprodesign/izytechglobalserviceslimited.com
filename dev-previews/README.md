# Developer Page Previews

This workspace is served only through the developer panel. It is not a separate subdomain or deployment.

## Routes
- Catalogue: `/dev/previews`
- About Us baseline clone: `/dev/previews/about-us`

## Access
The frontend route checks the developer role, and preview pages also call the developer-only API before rendering. The API uses the existing server-side `requireDev` middleware. Admin-only and unauthenticated sessions are denied.

## Logging
The PostgreSQL table `dev_preview_events` is the source of truth. The API provides:
- `GET /api/dev/previews/events` — recent activity
- `POST /api/dev/previews/events` — append an event
- `GET /api/dev/previews/export.jsonl` — full JSONL export
- `GET /api/dev/previews/export.md` — readable Markdown export

The files in this folder are repository documentation/snapshots, not the live database. Export from the API when a current log is needed.

Read `LOGGING_POLICY.md` before adding, changing, renaming, deleting, restoring, or publishing preview pages.
