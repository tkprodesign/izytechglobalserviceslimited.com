-- Testimonials table — run once against your Neon database.
-- In Neon: open your project → SQL Editor → paste and run.

CREATE TABLE IF NOT EXISTS testimonials (
  id         SERIAL PRIMARY KEY,
  name       TEXT        NOT NULL,
  role       TEXT        NOT NULL,
  company    TEXT        NOT NULL,
  text       TEXT        NOT NULL,
  rating     SMALLINT    NOT NULL DEFAULT 5,
  avatar     TEXT        NOT NULL,
  metric     TEXT        NOT NULL,
  sort_order SMALLINT    NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed initial testimonials (skip if already seeded)
INSERT INTO testimonials (name, role, company, text, rating, avatar, metric, sort_order)
SELECT * FROM (VALUES
  ('Emeka Okonkwo',  'Factory Manager',       'PrecisionPack Industries, Aba',      'IZY Technologies transformed our factory''s electrical system. The industrial wiring and CCTV installation was completed on time and within budget. Our energy costs dropped by 60% after they added the solar component. Absolutely world-class service.',   5, 'EO', '60% energy cost reduction',       1),
  ('Dr. Amara Nwosu','Hospital Administrator','Grace Medical Centre, Abuja',         'The electrical overhaul they carried out for our hospital was exceptional. Every detail was thought through — backup systems, UPS integration, clean installation. We''ve had zero power issues since the upgrade. Highly recommend.',                    5, 'AN', 'Zero downtime since upgrade',      2),
  ('Chidi Adeyemi',  'Property Developer',    'Lekki Luxury Estates',               'We contracted IZY Technologies for smart home automation across 20 luxury units. The results exceeded client expectations — from lighting scenes to integrated security, everything just works. Our buyers love it.',                                      5, 'CA', '20 luxury units automated',        3),
  ('Mrs. Funke Bello','School Principal',     'Sunshine Academy, Port Harcourt',    'The solar installation has been a game changer for our school. We used to lose 4-5 hours daily to NEPA issues. Now we run all day on solar. The team was professional, fast and very tidy in their work.',                                             5, 'FB', 'Full-day solar independence',       4),
  ('Tunde Afolabi',  'CEO',                   'Meridian Hotels, Victoria Island',   'Our hotel security was a headache before IZY took over. After their complete CCTV and access control overhaul, we can monitor the entire property from one screen, on our phones, anywhere. Outstanding work.',                                            5, 'TA', 'Full property remote access',      5)
) AS v(name, role, company, text, rating, avatar, metric, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM testimonials LIMIT 1);
