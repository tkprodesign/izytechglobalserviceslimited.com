# Projects Feature — Implementation Log

Full implementation record for the database-backed Projects feature.  
Requirements source: `FINAL PROJECTS FEATURE REQUIREMENTS` (uploaded July 2026).

---

## What Was Built

### 1. Database — `projects` table

Schema lives in `backend/migrations/003_projects.sql` and is also applied automatically at server startup in `backend/server.js` (idempotent `CREATE TABLE IF NOT EXISTS` + `CREATE INDEX IF NOT EXISTS`).

**Columns:**

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | |
| `title` | TEXT NOT NULL | |
| `slug` | TEXT NOT NULL UNIQUE | Auto-generated from title; enforced unique at DB level |
| `category` | TEXT NOT NULL | |
| `location` | TEXT | |
| `year` | TEXT | e.g. "2024" |
| `short_description` | TEXT | Shown on cards |
| `full_description` | TEXT | Shown on detail page |
| `result_metric` | TEXT | e.g. "78% bill reduction" |
| `services` | TEXT[] | Array of service strings |
| `images` | TEXT[] | Array of Cloudflare delivery URLs |
| `main_image_url` | TEXT | Always `images[0]`; denormalised for query speed |
| `featured` | BOOLEAN | If true, appears in homepage featured slot |
| `sort_order` | INTEGER | Lower = appears first |
| `published` | BOOLEAN | Only published projects appear publicly |
| `created_at` / `updated_at` | TIMESTAMPTZ | `updated_at` auto-updated via trigger |

Six seed projects were inserted with `ON CONFLICT DO NOTHING` so re-running the seed is safe.

---

### 2. Backend API — `backend/server.js`

#### Public routes (no auth required)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/projects` | List published projects. Optional `?category=X` query param for exact case-insensitive filtering. Returns `{ data, categories }`. |
| `GET` | `/api/projects/:slug` | Single published project by slug. Also returns up to 4 related projects (same category, excluding current). |

**Category filtering** uses `LOWER(category) = LOWER($1)` — exact match, not `LIKE`, so `Solar Energy` and `Solar + IT` are never conflated.

#### Admin/developer routes (`requireAuth` middleware — JWT)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/admin/projects` | All projects (published + drafts), sorted by `sort_order ASC`. |
| `POST` | `/api/admin/projects` | Create project. Validates title, category, slug; auto-generates slug if blank; enforces unique slug. |
| `PUT` | `/api/admin/projects/:id` | Update any field. Slug uniqueness is re-validated on change. |
| `DELETE` | `/api/admin/projects/:id` | Permanently delete. |
| `POST` | `/api/admin/projects/images/direct-upload` | Issues a Cloudflare Images direct-upload URL. **Server-side validates** `contentType` (must be `image/jpeg`, `image/png`, `image/webp`, `image/gif`, or `image/svg+xml`) and `fileSize` (must be ≤ 10 MB) before issuing the URL. Returns `{ uploadURL, url }`. |

---

### 3. Frontend — library

**`frontend/src/lib/api.ts`** — added:
- `Project` interface (all DB columns)
- `ProjectsResponse` type
- `api.projects(category?)` — fetches `/api/projects`
- `api.project(slug)` — fetches `/api/projects/:slug`

---

### 4. Public Pages

#### `frontend/src/app/pages/ProjectsPage.tsx`
Fully replaced the static portfolio list.

- Fetches projects and available categories from API on mount
- Category filters rendered dynamically from API response (not hardcoded)
- Active filter stored in URL query param (`?category=X`) — filtered URLs can be bookmarked/shared
- "All" option always present; clears the category param
- Card layout: image, title, category badge, location, year, short description, result metric
- Each card links to `/projects/:slug`
- Loading skeletons during fetch
- Error state with retry button
- Empty state message

#### `frontend/src/app/pages/ProjectDetailPage.tsx` *(new file)*
Renders a single project at `/projects/:slug`.

- Hero header with title and category
- Main project image (full-width)
- Full description body
- Additional images gallery (if present)
- Sticky sidebar: location, year, result metric, services list, "Request a Quote" CTA button
- **Related Projects** strip at the bottom — fetches same-category published projects (excluding current), shows up to 4 cards

#### `frontend/src/app/sections/Projects.tsx`
Homepage featured-projects section — replaced static hardcoded data:

- Fetches from API on mount
- Featured project = first `featured: true && published: true` project from DB
- Grid shows up to 5 other published projects
- Both featured card and grid cards link to `/projects/:slug`
- Loading skeletons

---

### 5. Admin / Developer Panel

#### `frontend/src/app/admin/ProjectsManagerPage.tsx` *(new file)*
Full admin Projects panel.

**List view:**
- Desktop: sortable table with thumbnail, title/slug/location, category badge, year, featured toggle, published toggle, action buttons
- Mobile: card layout with same controls
- Search by title or location (client-side filter)
- Filter by category (client-side filter)
- Result count shown when search/filter is active

**Ordering controls:**
- ▲ / ▼ buttons on every row (desktop and mobile)
- Buttons are hidden when search or category filter is active (reordering a filtered subset makes no sense)
- First row's ▲ and last row's ▼ are disabled
- Optimistic UI update — list reorders instantly; both affected rows are saved to the API in the background

**Quick toggles:**
- Click the star → toggle `featured`
- Click the toggle → toggle `published`
- Both are optimistic (instant visual feedback)

**Preview link:**
- External-link icon appears only on published projects
- Opens `/projects/:slug` in a new tab

**Delete flow:**
- If project is featured: warns it is on the homepage, offers to go back
- If project is published (not featured): warns it is live, suggests unpublishing first
- Otherwise: simple "cannot be undone" confirmation
- All three use `confirm()` dialogs

**Project editor (slide-over panel):**

| Field | Notes |
|---|---|
| Images | Upload from device (Cloudflare direct upload) or paste URL. First image = main/cover. Hover to reorder (left/right arrows) or remove. MAIN badge on first image. |
| Title | Required |
| Slug | Auto-generated from title; editable; `/projects/` prefix shown inline |
| Category | Dropdown (fixed list + any category from DB) |
| Year | Text input |
| Location | Text input |
| Short Description | 2-row textarea |
| Full Description | 5-row textarea |
| Project Result | Text input |
| Services Involved | Tag-style input — type and press Enter or click Add; remove with ×  |
| Sort Order | Number input; lower = appears first |
| Published toggle | |
| Featured toggle | |

- Save validates title and slug before submitting
- Success toast after save
- Error message inline if API returns an error

**Image upload — client-side guards:**
- Must be `image/*` MIME type
- Must be ≤ 10 MB
- Error shown inline; upload button disabled while in progress

**Image upload — server-side guards (on the direct-upload URL endpoint):**
- Client sends `{ contentType, fileSize }` in request body
- Server rejects non-image MIME types with a descriptive 400
- Server rejects files > 10 MB with a descriptive 400 (shows actual size in MB)
- Cloudflare independently rejects non-image files regardless

#### `frontend/src/app/admin/DashboardLayout.tsx`
- Added `FolderOpen` icon and **Projects** nav item → `/admin/projects`

#### `frontend/src/app/App.tsx`
- Added `import ProjectsManagerPage`
- Added `/admin/projects` protected route
- Added `/projects/:slug` public route

---

### 6. Image Storage

All project images are stored on **Cloudflare Images** — never on Railway.

Flow:
1. Admin clicks "Upload from device"
2. Frontend sends `{ contentType, fileSize }` to `POST /api/admin/projects/images/direct-upload`
3. Backend validates metadata, then requests a one-time upload URL from Cloudflare
4. Backend returns `{ uploadURL, url }` to the frontend
5. Frontend POSTs the file directly to Cloudflare's `uploadURL`
6. On success, the `url` (Cloudflare delivery URL) is appended to `form.images`
7. Only the URL string is stored in PostgreSQL — no file bytes touch Railway

---

### 7. Safety Features

| Requirement | Implementation |
|---|---|
| Confirm before delete | `confirm()` dialog — always shown |
| Warn when deleting featured project | Custom warning text in the confirm dialog |
| Prefer unpublish over delete | Second confirm variant for published (non-featured) projects |
| Blank title prevented | Frontend validation before submit; backend `NOT NULL` on `title` |
| Blank category prevented | Backend `NOT NULL` on `category` |
| Unique slugs | DB `UNIQUE` constraint + backend checks on create/update, returns 409 |
| Image type validation | Client-side MIME check + server-side `contentType` validation |
| Image size validation | Client-side 10 MB check + server-side `fileSize` validation |
| Success messages | Toast notification after save/delete |
| Error messages | Inline error in the editor form; inline error on upload |
| Keep existing data | All seeds use `ON CONFLICT DO NOTHING` |
| No destructive cleanup | No `DROP TABLE`, no `TRUNCATE`, no `DELETE` in migrations |

---

### 8. Responsive Design

- **Public Projects page**: single-column on mobile, 2-column on tablet, 3-column on desktop
- **Project detail page**: stacked layout on mobile; sidebar becomes sticky panel on desktop
- **Admin list**: table on sm+, card layout on mobile
- **Admin editor**: slide-over panel, scrollable, fits within mobile viewport
- **Admin nav**: uses shared `DashboardLayout` responsive drawer — no separate mobile nav needed

---

## Bugs Fixed After Initial Build

### 1. Admin list — no ordering controls
**Problem:** `sort_order` existed in the DB and editor form, but the list had no way to reorder without opening each project individually.  
**Fix:** Added ▲/▼ buttons on every row (desktop table and mobile cards). Buttons hide when search/filter is active. Optimistic state update + parallel API saves for both swapped rows.

### 2. Server-side image validation missing
**Problem:** File type and size were only validated in the browser; a caller who bypassed the UI could request an upload URL for any file.  
**Fix:** The `POST /api/admin/projects/images/direct-upload` endpoint now requires `contentType` and `fileSize` in the request body and returns `400` with a descriptive message if either fails. The frontend was updated to send those values.

### 3. Category filter used `LIKE` instead of exact match
**Problem:** `LOWER(category) LIKE LOWER('%Solar%')` matched both `Solar Energy` and `Solar + IT` when filtering by either, mixing categories that should be separate.  
**Fix:** Changed to `LOWER(category) = LOWER($1)` — exact match. The `$1` param no longer has `%` wildcards.

---

## Files Changed (complete list)

```
backend/
  server.js                          — projects table init, all project routes, image validation
  migrations/003_projects.sql        — standalone schema for reference / manual apply
  README.md                          — documented new endpoints and Cloudflare hash secret
  .env.example                       — updated key to CLOUDFLARE_IMAGE_HASH

frontend/src/
  lib/api.ts                         — Project interface + api.projects() / api.project()
  app/App.tsx                        — added /projects/:slug and /admin/projects routes
  app/sections/Projects.tsx          — replaced static data with API fetch
  app/sections/Hero.tsx              — increased top padding so content clears fixed navbar
  app/pages/ProjectsPage.tsx         — fully replaced with DB-backed version
  app/pages/ProjectDetailPage.tsx    — new file
  app/admin/DashboardLayout.tsx      — added Projects nav item
  app/admin/ProjectsManagerPage.tsx  — new file (full admin panel)

docs/
  PROJECTS_FEATURE.md                — this file
```
