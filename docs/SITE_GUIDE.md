# IZY Technologies Website — Site Guide

**Company:** IZY Technologies Global Services Limited  
**Tagline:** Power The Future. Future Ready Solutions. Today.  
**Stack:** React 18 · Vite 6 · TypeScript · Tailwind CSS 4 · Framer Motion  
**Package manager:** pnpm (always run from inside `Website for Izy Tech/`)

---

## File Structure

```
Website for Izy Tech/
├── src/
│   ├── main.tsx                  ← React entry point
│   ├── app/
│   │   ├── App.tsx               ← Root component; sets page order
│   │   ├── sections/             ← ONE FILE PER PAGE SECTION (edit content here)
│   │   │   ├── Navbar.tsx        ← Top navigation bar
│   │   │   ├── Hero.tsx          ← Full-screen landing section
│   │   │   ├── Marquee.tsx       ← Scrolling capability strip
│   │   │   ├── Services.tsx      ← Six service offerings
│   │   │   ├── Statement.tsx     ← Mission/brand statement
│   │   │   ├── About.tsx         ← Company story + why-choose-us
│   │   │   ├── Projects.tsx      ← Portfolio grid
│   │   │   ├── Testimonials.tsx  ← Client reviews carousel
│   │   │   ├── Contact.tsx       ← Enquiry form + contact info
│   │   │   └── Footer.tsx        ← Footer links + final CTA
│   │   └── components/           ← Reusable utility components
│   │       ├── CustomCursor.tsx  ← Gold ring cursor (desktop only)
│   │       ├── ScrollProgress.tsx← Gold progress bar at page top
│   │       └── ui/               ← shadcn/ui primitive library (don't edit)
│   ├── styles/
│   │   ├── fonts.css             ← Google Fonts import + CSS variables
│   │   ├── theme.css             ← CSS custom properties (colours, spacing)
│   │   ├── micro.css             ← Micro-interaction CSS (shimmer, cursor hide, etc.)
│   │   ├── index.css             ← Tailwind base import
│   │   ├── globals.css           ← Global resets
│   │   └── tailwind.css          ← Tailwind directives
│   └── imports/                  ← Brand asset files (logos, images)
│       ├── izy-technologies_icon_v1.png
│       ├── izy-technologies_logo-variation-horizontal_v1.png
│       ├── IZY-Technologies_Primary-Logo_v1.png
│       └── IZY_Brand_Identity_System.png
├── public/                       ← Static files served as-is
├── vite.config.ts                ← Dev server config (port 5000, host 0.0.0.0)
├── tailwind.config.ts            ← Tailwind setup
├── package.json
└── SITE_GUIDE.md                 ← This file
```

---

## Page Sections (top to bottom)

### 1 — Navbar · `sections/Navbar.tsx`

**Behaviour**
- Fixed to the top of the viewport at all times (does not scroll away).
- **Transparent** over the hero: white logo text, white links, gold CTA button.
- **Solid white** after scrolling 60 px: switches to horizontal logo image, dark links.
- Mobile: hamburger menu with full-screen drawer.

**Content to edit**
| Item | Location in file |
|---|---|
| Nav links (labels + anchors) | `navLinks` array at the top |
| Phone number | Both the desktop link and mobile drawer |
| CTA button label | `"Get a Free Quote"` strings |
| Scroll threshold | `window.scrollY > 60` in `useEffect` |

---

### 2 — Hero · `sections/Hero.tsx`

**What it shows**
- Full-screen background photo (solar installation at dusk, Unsplash).
- Headline: **"Power The Future. Today."** — words animate in one at a time on load.
- Subheadline paragraph.
- Two CTA buttons: **GET A FREE QUOTE** (gold, shimmer) · **OUR SERVICES** (outline).
- Stats bar anchored to the bottom: 500+ Projects · 12+ Years · 98% Satisfaction · 24/7 Support.
- Background image parallax-scrolls at 28% of page scroll rate.

**Content to edit**
| Item | Location |
|---|---|
| Background photo URL | `<img src="https://images.unsplash.com/...">` |
| Headline words | `words` array |
| Subheadline | `<motion.p>` paragraph text |
| Stats | `stats` array: `value`, `suffix`, `label` |
| CTA labels + links | `href="#contact"` / `href="#services"` |

---

### 3 — Marquee · `sections/Marquee.tsx`

**What it shows**
- Full-width dark strip (navy `#041627`) between the hero and services.
- Two rows of capability labels scrolling in opposite directions.
- Forward row: white/faint text. Reverse row: amber-tinted text.

**Content to edit**
| Item | Location |
|---|---|
| Capability labels | `items` array (duplicated for seamless loop) |
| Scroll speed | `animation: "marquee-fwd 30s"` / `"marquee-rev 22s"` |

---

### 4 — Services · `sections/Services.tsx`

**What it shows**
- Six service rows in an editorial numbered list (`01`–`06`).
- Each row: number · icon · title · description · four feature bullets · "Get a Quote" link.
- Service `01` (Solar) is marked **POPULAR** with a gold badge.
- On hover: left gold border slides in, icon bounces, "Get a Quote" arrow extends.
- Bottom CTA: "FREE ASSESSMENT" button.

**Content to edit**
| Item | Location |
|---|---|
| All six services | `services` array: `num`, `icon`, `title`, `description`, `features`, `featured` |
| To mark a service popular | Set `featured: true` |
| Bottom CTA text | `"FREE ASSESSMENT"` near the bottom of the JSX |

---

### 5 — Statement · `sections/Statement.tsx`

**What it shows**
- Full-bleed dark section with a background photo (energy infrastructure, Unsplash).
- Parallax background scroll (±12% relative to page).
- Decorative large `"` quote mark and watermark `IZY` text.
- Left column: mission headline — **"We Don't Just Install Technology. We Change How Nigeria Powers Itself."**
- Right column: two paragraphs + two stats (500+ Projects · 36 States) + "Learn About Us" link.

**Content to edit**
| Item | Location |
|---|---|
| Mission headline | `<h2>` in the left column |
| Body paragraphs | Two `<p>` tags in right column |
| Stats | `{ v, l }` array inline in JSX |

---

### 6 — About · `sections/About.tsx`

**What it shows**
- **Story grid**: company logo mark + animated timeline of milestones (2012–2024) on the right; company description + CTA buttons on the left.
- **Counter bar**: four numbers count up when scrolled into view (500+, 12+, 36, 98%).
- **Why Choose IZY grid**: four cards — Certified & Licensed · End-to-End Service · Expert Team · Nationwide Reach.

**Content to edit**
| Item | Location |
|---|---|
| Company description paragraphs | Three `<p>` tags in the left column |
| Timeline events | `milestones` array: `year`, `event` |
| Counter values | Inline `{ to, suffix, label }` objects in the counter bar |
| Why-choose cards | `whyUs` array: `icon`, `title`, `description` |

---

### 7 — Projects · `sections/Projects.tsx`

**What it shows**
- One large **featured project** card (full-width split layout, dark background).
- Five remaining projects in a `3 × 2` card grid.
- Card hover: dark overlay with "View Details →" centred; image zooms to 110%.
- Featured card includes an **energy savings metric** badge (currently 78%).

**Content to edit**
| Item | Location |
|---|---|
| All projects (title, location, category, description, image, tag) | `projects` array at the top |
| Featured project | First item in array (has `featured: true`) |
| Metric badge value | `"78%"` in the featured card JSX |

---

### 8 — Testimonials · `sections/Testimonials.tsx`

**What it shows**
- Dark navy section.
- Left: large active testimonial card with star rating, gold metric badge, quote, author avatar.
- Right: four compact preview cards — click any to jump to that review.
- Auto-advances every **6 seconds** with an animated gold progress bar.
- Previous/next arrow buttons + `01 / 05` counter.

**Content to edit**
| Item | Location |
|---|---|
| All testimonials | `testimonials` array: `name`, `role`, `company`, `text`, `rating`, `avatar`, `metric` |
| Auto-advance interval | `setInterval(... 6000)` in `useEffect` |

---

### 9 — Contact · `sections/Contact.tsx`

**What it shows**
- Dark navy background (matches testimonials, unified bottom-of-page feel).
- Left column: three contact info cards (Phone · Email · Head Office) + Emergency CTA panel.
- Right column: quote request form — Name · Phone · Email · Service dropdown · Project details · Submit.
- On submit: checkmark success state with "Send another message" reset.

**Content to edit**
| Item | Location |
|---|---|
| Contact info (number, email, address) | `contactInfo` array at the top |
| Form service options | `<option>` tags inside the `<select>` |
| Emergency call-out copy | "Emergency Electrical?" card near the bottom of left column |

---

### 10 — Footer · `sections/Footer.tsx`

**What it shows**
- Full-width **CTA band** ("Ready to Power Your Future?") with large decorative `IZY` watermark.
- Four-column grid: Brand + socials · Services list · Quick links · Contact details.
- Bottom bar: copyright + tagline.

**Content to edit**
| Item | Location |
|---|---|
| CTA headline + sub-copy | In the CTA band div |
| Services column | `services` array |
| Quick links | `quickLinks` array |
| Social links | `socials` array (update `href` values) |
| Copyright name | Bottom bar `<p>` |

---

## Global Design System

### Colours
| Token | Value | Usage |
|---|---|---|
| Navy (primary) | `#041627` | Backgrounds, text, dark sections |
| Amber (accent) | `#F0A20E` | All CTAs, highlights, borders, progress bars |
| Amber gradient | `#F0A20E → #FFB830` | Button fills |
| Mid-navy | `#0d1b2e` | Body text, card text |
| Slate | `#64748b` | Secondary/descriptive text |

### Typography (CSS variables in `styles/fonts.css`)
| Variable | Role |
|---|---|
| `--font-display` | Headlines, numbers, bold labels |
| `--font-body` | Paragraph / descriptive text |
| `--font-ui` | Buttons, tags, nav links, small labels |

### Micro-interactions (all in `styles/micro.css`)
| Class / feature | What it does |
|---|---|
| `.btn-shimmer` | Light sweep across a button on hover |
| `.service-row::before` | Gold left border slides from top to bottom on hover |
| `cursor: none` (desktop) | Hides system cursor — replaced by `CustomCursor` |
| `::selection` | Amber highlight when selecting text |
| `html { scroll-behavior: smooth }` | Smooth anchor scrolling |

### Motion library
All animations use **Framer Motion** (`motion/react` package).  
- `initial` / `animate` — entrance animations on load  
- `whileInView` / `viewport: { once: true }` — scroll-triggered reveals  
- `whileHover` — hover micro-interactions  
- `useScroll` + `useTransform` — parallax effects (Hero, Statement)

---

## Running & Building

```bash
# Start dev server (port 5000)
cd "Website for Izy Tech"
npm run dev

# Production build
pnpm run build
# Output goes to: Website for Izy Tech/dist/
```

---

## Glossary / Index

| Term / Phrase | Where to find it |
|---|---|
| **Accent colour** | `#F0A20E` — every amber element |
| **Auto-advance** | Testimonials `useEffect` → `setInterval` |
| **Background photo (hero)** | `Hero.tsx` → `<img src="https://images.unsplash…">` |
| **Brand logo (icon)** | `src/imports/izy-technologies_icon_v1.png` |
| **Brand logo (horizontal)** | `src/imports/izy-technologies_logo-variation-horizontal_v1.png` |
| **Button shimmer** | `.btn-shimmer` class in `micro.css` |
| **CTA button labels** | Each section file, search for `GET A FREE QUOTE` |
| **Company tagline** | `"Power The Future. Future Ready Solutions. Today."` |
| **Contact email** | `info@izytechnologies.com` — `Contact.tsx` + `Footer.tsx` |
| **Contact phone** | `+234 800 000 0000` — `Navbar.tsx`, `Contact.tsx`, `Footer.tsx` |
| **Counter animation** | `About.tsx` → `Counter` component at the top of the file |
| **Custom cursor** | `components/CustomCursor.tsx` |
| **Dark nav (scrolled)** | `Navbar.tsx` → `scrolled` state, threshold 60 px |
| **Emergency line** | `Contact.tsx` → "Emergency Electrical?" card |
| **Featured project** | `Projects.tsx` → first item in `projects` array (`featured: true`) |
| **Featured service** | `Services.tsx` → item with `featured: true` (shows POPULAR badge) |
| **Font variables** | `styles/fonts.css` → `--font-display`, `--font-body`, `--font-ui` |
| **Footer CTA** | `Footer.tsx` → "Ready to Power Your Future?" band |
| **Global entry point** | `src/main.tsx` |
| **Head Office location** | `Contact.tsx` → `contactInfo` array, `MapPin` entry |
| **Hero headline** | `Hero.tsx` → `words` array + `"Today."` span |
| **Hero stats** | `Hero.tsx` → `stats` array |
| **Marquee speed** | `Marquee.tsx` → `30s` / `22s` animation durations |
| **Mission statement** | `Statement.tsx` → `<h2>` in left column |
| **Mobile menu** | `Navbar.tsx` → `mobileOpen` state + drawer JSX |
| **Nav links** | `Navbar.tsx` → `navLinks` array |
| **Navy background** | `#041627` — Testimonials, Contact, Footer, Marquee |
| **Page order** | `App.tsx` → component order in `<main>` |
| **Parallax (hero)** | `Hero.tsx` → `useScroll` + `useTransform` + `bgY` |
| **Parallax (statement)** | `Statement.tsx` → `useScroll` + `useTransform` + `bgY` |
| **Portfolio projects** | `Projects.tsx` → `projects` array |
| **POPULAR badge** | `Services.tsx` → `featured: true` on a service |
| **Progress bar (scroll)** | `components/ScrollProgress.tsx` |
| **Section anchors** | `#home` `#services` `#about` `#projects` `#testimonials` `#contact` |
| **Services list** | `Services.tsx` → `services` array (6 items) |
| **Social media links** | `Footer.tsx` → `socials` array |
| **Stats (about counters)** | `About.tsx` → inline array in the counter bar |
| **Tagline (hero)** | `Hero.tsx` → `<motion.p>` subheadline |
| **Testimonials** | `Testimonials.tsx` → `testimonials` array (5 items) |
| **Timeline (company history)** | `About.tsx` → `milestones` array |
| **Transparent nav** | `Navbar.tsx` → `isTransparent` condition |
| **Why Choose IZY cards** | `About.tsx` → `whyUs` array |
