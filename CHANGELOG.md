# Changelog

All notable changes to the IZY Technologies platform are recorded here.  
Format: newest first. Dates are UTC.

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
