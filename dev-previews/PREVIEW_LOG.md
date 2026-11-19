# Preview Activity Log

This is the readable repository snapshot for the Developer Page Previews workspace.

The live source of truth is the append-only PostgreSQL event history. Use the authenticated developer endpoint `GET /api/dev/previews/export.md` to retrieve the current log.

## 2026-11-19 — Workspace started

- Created the developer-only Page Previews catalogue.
- Created the About Us baseline clone at `/dev/previews/about-us`.
- The clone starts from the current production About Us page and contains no leadership section or other new content.
- Added server-verified developer access and preview-open activity logging.

Further changes must be recorded in the database event history and reflected in a fresh export.


## 2026-11-19 — Leadership section added to About Us preview

- Added a responsive four-profile leadership layout to `/dev/previews/about-us`, positioned after Achievements and before Looking Ahead.
- Profiles: Israel Ideozu (Founder / Chief Executive Officer), Itekena Iyowuna (IT Manager), Da-iyiboba Dokubo (Chief Operating Officer), and Barisi Inayor (HR Manager).
- Portrait frames currently use initials placeholders because the approved portrait files were not found in the repository at the expected paths. Replace with approved images before final approval.
- This change is preview-only; production About Us remains unchanged.
