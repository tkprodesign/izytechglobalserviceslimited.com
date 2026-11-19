# Preview Logging Policy

This policy applies to every page and asset managed in the Developer Page Previews workspace.

## Source of truth
- PostgreSQL `dev_preview_events` is the authoritative event history.
- Events are append-only. No API operation may edit or delete an existing event.
- `PREVIEW_LOG.md` is the readable log export.
- `preview-events.jsonl` is the structured log export.
- Repository copies are snapshots; the API exports are the current records.

## Required events
Record successful operations using the event endpoint:
- `page_created`, `page_updated`
- `page_renamed`, `url_changed`, `category_changed`, `status_changed`
- `page_deleted`, `page_restored`
- `page_published`, `page_unpublished`
- `asset_added`, `asset_replaced`, `asset_removed`
- `preview_opened`
- `operation_failed` when an operation fails after it has begun

Every event must include a stable page ID, event type, actor, and server-generated timestamp. Include old/new values and relevant asset details when applicable.

## Enforcement
1. Preview viewing routes are public by explicit project decision. This does not grant access to the Developer Dashboard or any management operation.
2. Preview-management routes and the event API must use server-side developer authentication.
2. Log an event only after the corresponding operation succeeds. For failures, log the failure separately without claiming the operation succeeded.
3. Never delete event history when a page is deleted. Page deletion must be represented by a `page_deleted` event; restoration uses `page_restored`.
4. Keep page IDs stable across title and URL changes.
5. Never publish or unpublish a page without recording the production URL and timestamp.
6. Do not write secrets, access tokens, passwords, or private credentials into event details.
7. Use the server timestamp as the official time. Display in Africa/Lagos where a local display is needed.
8. Before considering a new page-management operation complete, verify that its event was stored and appears in the event history.

## Public preview viewing
The preview catalogue and preview pages can be opened without signing in. Public page views are not guaranteed to appear in the authenticated event history. When a developer is signed in, preview-open events continue to be recorded.

## Event API
All endpoints are mounted at `/api/dev/previews` and protected by the existing server-side developer-role middleware. Only the approved event types are accepted. Events are inserted as new database rows; there is no update or delete endpoint.
