-- Control Center — D1/SQLite schema (migrated from Supabase/Postgres)
-- No RLS, no policies, no auth.users, no pgcrypto. Single-user / shared tables.

-- ─── Projects ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id                TEXT PRIMARY KEY,
  name              TEXT    NOT NULL,
  color             TEXT    NOT NULL DEFAULT '#3E77FC',
  client            TEXT    NOT NULL DEFAULT '',
  phase             TEXT    NOT NULL DEFAULT '',
  date_range        TEXT    NOT NULL DEFAULT '',
  archived          INTEGER NOT NULL DEFAULT 0,
  archived_at       TEXT,
  salesforce_id     TEXT,
  sf_name           TEXT,
  sf_date_range     TEXT,
  timecard_count    INTEGER,
  timecard_count_at TEXT,
  created_at        TEXT    NOT NULL
);

-- ─── Risks ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS risks (
  id          TEXT PRIMARY KEY,
  project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  probability TEXT NOT NULL,
  impact      TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'Open',
  owner       TEXT NOT NULL DEFAULT '',
  created_at  TEXT NOT NULL,
  closed_at   TEXT
);

-- ─── Action Items ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS action_items (
  id          TEXT PRIMARY KEY,
  project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  owner       TEXT NOT NULL DEFAULT '',
  due_date    TEXT,
  priority    TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'To Do',
  created_at  TEXT NOT NULL
);

-- ─── Decisions ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS decisions (
  id           TEXT PRIMARY KEY,
  project_id   TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  context      TEXT NOT NULL DEFAULT '',
  decision     TEXT NOT NULL DEFAULT '',
  alternatives TEXT NOT NULL DEFAULT '',
  author       TEXT NOT NULL DEFAULT '',
  created_at   TEXT NOT NULL
);

-- ─── Stakeholders ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stakeholders (
  id          TEXT PRIMARY KEY,
  project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT '',
  company     TEXT NOT NULL DEFAULT '',
  influence   TEXT NOT NULL,
  interest    TEXT NOT NULL,
  notes       TEXT NOT NULL DEFAULT '',
  created_at  TEXT NOT NULL
);

-- ─── User Settings (features) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_settings (
  user_id  TEXT PRIMARY KEY,
  features TEXT NOT NULL DEFAULT '{}'
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_risks_project_id        ON risks(project_id);
CREATE INDEX IF NOT EXISTS idx_action_items_project_id ON action_items(project_id);
CREATE INDEX IF NOT EXISTS idx_decisions_project_id    ON decisions(project_id);
CREATE INDEX IF NOT EXISTS idx_stakeholders_project_id ON stakeholders(project_id);
