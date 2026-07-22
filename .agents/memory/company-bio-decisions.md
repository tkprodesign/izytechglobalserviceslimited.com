---
name: Company Bio Implementation Decisions
description: Key decisions made when applying the owner's company biography to the site (July 2026)
---

## Founding date
Official founding: **March 8, 2018** — by Israel Ideozu. The site previously showed 2012 (incorrect). Timeline starts with a "pre-formation" entry in Late 2017 (informal groundwork).

**Why:** Owner confirmed 2018 is the true start. No predecessor company or activity before that needs crediting.

## All services are equally strong
Solar is the primary identity ("Illuminating the Future of Solar Energy") but ALL service lines (CCTV, Smart Home, Industrial Wiring, IT) are 100% strong — not secondary. Do not downrank other services.

**How to apply:** Hero and About copy leads with solar identity; services section treats all offerings as first-class.

## Full tagline (one line, not split)
`"Power the Future, Future-Ready Solutions, Today"` — this is ONE complete tagline. "Today" renders in brand gold (#F0A20E). Used in Hero as a two-line typographic layout with animation.

## Installation count
Use **1,000+** publicly (not a specific figure; sounds like more than 1,000, well under 5,000). Expressed as `1000+` in animated counters.

## Years stat
Founded 2018 → currently 8 years of excellence. Stat shows **8+**.

## Milestones and Founder — DB-driven
Both are stored in the database (tables: `milestones`, `founder_profile`) and editable via admin panel at `/admin/milestones` and `/admin/founder`. Public site reads from `/api/public/milestones` and `/api/public/founder`.

**Why:** Owner explicitly requested easy editing without needing a developer.

## Founder profile
- Name: Israel Ideozu
- Title: Founder & Chief Executive Officer
- Photo: Initially empty; owner will provide a photo URL or upload later
- Bio: Seeded from biography document

## Gmail address
`izytechservices@gmail.com` — kept active internally for legacy customers but NOT advertised on the site. Only domain emails are public-facing.

## SEO / noindex
Owner chose to keep `noindex` for now. When they are ready, only `/admin/*` and `/dev/*` routes should be excluded from Google.
