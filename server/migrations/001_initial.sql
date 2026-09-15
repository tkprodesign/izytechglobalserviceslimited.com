-- Run this against your Neon database once to create the required tables.
-- In Neon: open your project → SQL Editor → paste and run.

CREATE TABLE IF NOT EXISTS contact_submissions (
  id         SERIAL PRIMARY KEY,
  name       TEXT        NOT NULL,
  email      TEXT        NOT NULL,
  subject    TEXT,
  message    TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quote_requests (
  id         SERIAL PRIMARY KEY,
  name       TEXT        NOT NULL,
  email      TEXT        NOT NULL,
  company    TEXT,
  service    TEXT        NOT NULL,
  details    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Site-assessment fields are also initialized idempotently by backend/server.js
-- so existing databases receive the workflow without a destructive migration.
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS request_type TEXT NOT NULL DEFAULT 'quote';
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS public_token TEXT;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS address_line_1 TEXT;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS address_line_2 TEXT;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS landmark TEXT;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS property_type TEXT;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS project_stage TEXT;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS preferred_visit_date DATE;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS preferred_visit_time TEXT;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new';
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS assessment_fee NUMERIC(12,2);
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'not_requested';
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS payment_instructions TEXT;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS payment_reference TEXT;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS payment_notes TEXT;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS payment_requested_at TIMESTAMPTZ;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMPTZ;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS site_notes TEXT;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS quote_requests_public_token_idx
  ON quote_requests (public_token)
  WHERE public_token IS NOT NULL;
