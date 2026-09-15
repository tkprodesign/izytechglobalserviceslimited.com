-- Projects feature schema.
-- The backend also creates this table safely at startup for existing deployments.

CREATE TABLE IF NOT EXISTS projects (
  id                SERIAL PRIMARY KEY,
  title             TEXT        NOT NULL,
  slug              TEXT        NOT NULL UNIQUE,
  category          TEXT        NOT NULL,
  location          TEXT        NOT NULL DEFAULT '',
  year              TEXT        NOT NULL DEFAULT '',
  short_description TEXT        NOT NULL DEFAULT '',
  full_description  TEXT        NOT NULL DEFAULT '',
  result_metric     TEXT        NOT NULL DEFAULT '',
  services          TEXT[]      NOT NULL DEFAULT '{}',
  images            TEXT[]      NOT NULL DEFAULT '{}',
  main_image_url    TEXT        NOT NULL DEFAULT '',
  featured          BOOLEAN     NOT NULL DEFAULT FALSE,
  sort_order        SMALLINT    NOT NULL DEFAULT 0,
  published         BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS projects_category_idx ON projects (category);
CREATE INDEX IF NOT EXISTS projects_published_order_idx ON projects (published, sort_order, id);