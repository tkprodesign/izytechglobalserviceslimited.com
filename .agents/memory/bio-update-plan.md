---
name: Biography Update Plan
description: Official biography corrections and content alignment needed — wrong email domain, wrong founding year "2012", and AboutPage.tsx full rewrite
---

## Status
Planned — not yet implemented. New agent should execute this.

## Official Biography Source
`attached_assets/Pasted-Biography-of-Izy-Tech-Global-Services-Limited-Topic-Bio_1784767830017.txt`

Key facts confirmed:
- Founded: March 8, 2018 by Israel Ideozu
- HQ: Port Harcourt, Rivers State
- Email: info@izytechglobalservices.com (NOT info@izytechnologies.com)
- Phone: 0810 126 2814
- Instagram: izytechservices
- Facebook: Izy Technologies Global Services Limited

## Fixes Required

### 1. Wrong email domain (HIGH — live error)
- `frontend/src/app/sections/Footer.tsx` line 183: `info@izytechnologies.com` → `info@izytechglobalservices.com`
- `frontend/src/app/pages/ContactPage.tsx` lines 18–20: same wrong domain → `info@izytechglobalservices.com`

### 2. Wrong founding year "since 2012" (HIGH — live error)
- `frontend/src/app/sections/Footer.tsx` line 119: "since 2012" → "since 2018"
- `frontend/src/app/pages/AboutPage.tsx` line 92: "since 2012" → "since 2018"
- `frontend/src/app/pages/AboutPage.tsx` line 16: milestone year "2012" → "2018"

### 3. AboutPage.tsx full rewrite (MEDIUM)
The standalone `/about` route is fully hardcoded with old content.
Rewrite using official bio structure:
1. Overview — "Since its inception in 2018, Izy-Tech Global Services Limited has emerged as a leader..."
2. Mission — "Our mission is to empower communities through accessible and reliable solar energy solutions..."
3. Our Journey — "Starting as a small team of solar enthusiasts..."
4. Achievements — 4 cards: Extensive Client Base, Sustainability Leadership, Industry Recognition, Community Engagement
5. Looking Ahead — "As we look to the future..."

Match homepage About.tsx visual style: dark bg, gold (#F0A20E) accents, Framer Motion animations.

## After Edits
cd frontend && pnpm run build
git add frontend/dist/ frontend/src/
git commit -m "Apply official biography: fix email domain, founding year, rewrite AboutPage"
Push to GitHub → Cloudflare Pages auto-deploys.

## Do NOT Touch
- `frontend/src/app/sections/About.tsx` (homepage section — already updated, DB-driven)
- `frontend/src/app/sections/Hero.tsx`
- Backend / database
