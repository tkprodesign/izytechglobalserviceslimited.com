# Changelog

This is the mandatory change record for the IZY Technologies platform. Every code, configuration, deployment, database, security, content, UI, or behavior change must be documented here in the same commit. Newest entries go first.

Agents must read `AGENTS.md` and the newest entries here before starting work. Never record secret values.

---

## 2026-09-30 — Fixed changelog-enforcement CI syntax

**Agent / tool:** ChatGPT

### What changed
- Repaired the Control Panel CI workflow after the first changelog-guard insertion produced malformed YAML.
- Rewrote the workflow cleanly and kept the changelog guard before the normal frontend build, backend syntax check, and automated tests.
- The guard now treats Markdown-only commits as documentation-only and requires `CHANGELOG.md` whenever a commit changes any non-Markdown repository file.

### Verification
- This repair is verified by the Control Panel CI run for this commit.
- Cloudflare Pages deployment is also checked normally.

### Notes
- The previous commit `0a60758` successfully added the agent documentation files but its CI workflow file required this syntax repair.

---

## 2026-09-30 — Enforced agent change-history protocol

**Agent / tool:** ChatGPT

### What changed
- Added root `AGENTS.md` as the authoritative operating instruction file for coding agents and developers.
- Made `CHANGELOG.md` updates mandatory in the same commit as every code/config/behavior change.
- Added the same rule to Copilot/Codex and Replit repository instructions and linked it from the handoff/README.
- Added a CI guard that fails a commit containing non-documentation changes when `CHANGELOG.md` is not also changed.
- Defined when `AGENT_HANDOFF.md` must be updated so future agents can distinguish historical changes from current operating state.

### Verification
- Control Panel CI, Cloudflare Pages, and Render deployment checks are required for this commit according to the normal deployment workflow.

### Notes
- Documentation-only changes that do not affect project behavior are exempt from the changelog guard.
- Secrets must never be written into Markdown records.

---

## 2026-09-30 — Added secure Admin and Developer password changes

**Agent / tool:** ChatGPT

### What changed
- Added `Password & Security` pages for both Admin and Developer roles.
- Password changes require the current password plus a six-digit confirmation code sent to `izytechgsl@proton.me`.
- Added ten-minute code expiry, resend throttling, incorrect-code attempt limits, scrypt password hashing, and session invalidation after password changes.
- Added database-backed credential overrides while preserving environment credentials until the first in-app password change.

### Verification
- Control Panel CI passed.
- Cloudflare Pages deployed successfully.
- Render backend deployment and API health verification passed.

### Notes
- Commit: `1685401`.

---

## 2026-09-30 — Added privacy-safe cookieless basic traffic measurement

**Agent / tool:** ChatGPT

### What changed
- Added always-on basic public page-view measurement storing only normalized route and timestamp.
- Kept enhanced device, browser, referrer, session, and online-presence analytics behind explicit analytics consent.
- Excluded private Admin/Developer routes and tokenized assessment pages.
- Updated the Developer Site Analytics dashboard with all page views, consented analytics, and server-recorded conversion counts.
- Updated cookie UI/policy to describe the two analytics tiers accurately.

### Verification
- Control Panel CI passed.
- Cloudflare Pages deployed successfully.
- Render backend deployment and API health verification passed.

### Notes
- Commit: `1b84e5d`.

---

## 2026-09-03

### Changed — Updated testimonial identities and locations

- Updated the five database-backed testimonials to use the requested customer names.
- Updated their displayed location labels with a mix of `Port Harcourt` and `Nigeria`.
- Kept the existing testimonial copy, ratings, result metrics, and display ordering unchanged.
- Updated the public-page fallback data to match the same identities and locations.

---

## 2026-09-03

### Added — Testimonials management for admin and developer panels

- Added authenticated `GET/POST/PUT/DELETE /api/admin/testimonials` endpoints.
- Added a shared Testimonials manager at `/admin/testimonials`, available to both admin and developer roles.
- Added responsive testimonial cards with customer details, rating, result metric, display order, Edit, and Delete actions.
- Added an Add/Edit slide-over form for name, role, company, testimonial text, rating, avatar initials, metric, and display order.
- Added required-field and rating validation, automatic avatar initials when omitted, delete confirmation, success toasts, error messages, and authentication expiry handling.
- Added Testimonials to the shared control-panel navigation.

---

## 2026-09-03

### Changed — Replaced the installation reel video

- Replaced `frontend/public/site-videos/work-reel-1.mp4` with the newly supplied installation video.
- Kept the existing shared path, so every page and component using the installation reel now loads the replacement automatically.
- Preserved the existing card label, play/pause behavior, mute control, looping, and responsive presentation.

---

## 2026-09-03

### Fixed — Restored branding changes to their requested scope

- Restored the original `IZY TECHNOLOGIES / Global Services Limited` navbar and footer branding.
- Restored the original admin control-panel initials and unrelated About/Services/testimonial wording.
- Kept only the requested `Izy Tech Services` alias replacements where copy previously used standalone `IZY` or `IZY's`, including the finance hero and store-enquiry email subject.
- Removed the unrequested decorative watermark text from the footer and statement sections.
- Checked the current source against the pre-naming commit so biography/email changes from separate work were not overwritten.

---

## 2026-09-03 (agent)

### Fixed — Deployment builders misaligned with the actual frontend

- Switched `package.json` build/start scripts from the broken `next build --webpack`/Next.js pages+API surface to the real pipeline: `vite build` → `dist/`, then `node server.js` (Express serves the SPA + API). The `server.js` no longer requires Next.js.
- Removed the stale Next.js route shell (`app/[[...path]]/page.tsx`, `app/layout.tsx`) and the `pages/api/[[...path]].ts` bridge; no file under `src/`/`app/` imports the `next` module any more.
- Added a **Create with sections** button (patches `src/app/admin/InvoicesPage.tsx`) and wired `SectionsEditor.tsx` add/remove-section, add/remove-row, row-change, and tab controls through.
- Persisted in-progress invoices as server-side drafts by including `draft` in the `invoices.status` CHECK in `server/invoices_endpoint.js`; the editor debounced-autosaves to `POST /api/admin/invoices/:id/save-draft` (800 ms) and resumes with `loadDraft()` on revisit.
- Updated `server/README.md`, `README.md`, and `replit.md` to the actual Vite + Express architecture and the sections/draft workflow.

---

## 2026-07-24

### Added — Projects feature (full implementation)

Complete database-backed Projects feature replacing the static portfolio section.

**Public site:**
- New `/projects` page — responsive card grid, dynamic category filters via URL query params (`?category=X`), All Projects option, loading skeletons, error/retry, empty state
- New `/projects/:slug` detail pages — main image, additional images, full description, services, result metric, sticky sidebar with CTA, Related Projects strip (same category)
- Homepage `Projects` section now pulls from the database; featured project links to its detail page

**Admin / Developer panel:**
- New **Projects** section in the shared control panel (`/admin/projects`)
- List view: search by title or location, filter by category, published/featured status indicators
- ▲ / ▼ ordering controls on every row; hidden during search/filter; optimistic UI
- Quick-toggle published and featured status inline
- Preview link (external icon) for published projects
- Delete with confirmation; extra warning for featured projects; unpublish-first prompt for live projects
- Slide-over editor: all fields (title, editable slug, category, location, year, short/full description, result metric, services, sort order, published/featured toggles)
- Image management: Cloudflare direct upload from device, paste-URL fallback, reorder, remove, MAIN badge on first image

**Backend:**
- `projects` table with full schema; auto-applied at startup (idempotent)
- `GET /api/projects` — published projects with exact-match category filter
- `GET /api/projects/:slug` — single project + related projects
- `GET|POST|PUT|DELETE /api/admin/projects` — full CRUD (auth required)
- `POST /api/admin/projects/images/direct-upload` — Cloudflare direct-upload URL with server-side MIME type and file size validation

**See also:** `docs/PROJECTS_FEATURE.md` for the full implementation record.

### Fixed — Admin panel ordering controls missing
Up/down buttons added directly to the admin projects list so sort order can be changed without opening the editor.

### Fixed — Image upload had no server-side validation
`POST /api/admin/projects/images/direct-upload` now validates `contentType` and `fileSize` from the request body before issuing a Cloudflare upload URL. Returns `400` with a descriptive message on failure.

### Fixed — Category filter used partial `LIKE` match
`/api/projects?category=Solar` previously returned both `Solar Energy` and `Solar + IT` projects. Changed to exact case-insensitive equality (`LOWER(category) = LOWER($1)`).

### Fixed — Hero content too close to fixed navbar
Added top padding (`pt-44` mobile, `lg:pt-24` desktop) to the hero content block so it clears the 80px fixed navbar on all screen sizes.
