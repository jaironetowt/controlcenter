-- ─── 001_initial.sql ─────────────────────────────────────────────────────────
-- Control Center — schema inicial
-- Executar no Supabase SQL Editor ou via supabase db push
-- ──────────────────────────────────────────────────────────────────────────────

-- Enable pgcrypto for UUID generation (Supabase já habilita por padrão)
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Projects ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS projects (
  id            uuid PRIMARY KEY,
  name          text        NOT NULL,
  color         text        NOT NULL DEFAULT '#3E77FC',
  client        text        NOT NULL DEFAULT '',
  phase         text        NOT NULL DEFAULT '',
  date_range    text        NOT NULL DEFAULT '',
  archived      boolean     NOT NULL DEFAULT false,
  archived_at   timestamptz,
  salesforce_id      text,
  timecard_count     integer,
  timecard_count_at  timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read/write all projects (single-user phase)
CREATE POLICY "auth_all_projects" ON projects
  FOR ALL USING (auth.role() = 'authenticated');

-- ─── Risks ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS risks (
  id          uuid PRIMARY KEY,
  project_id  uuid        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title       text        NOT NULL,
  description text        NOT NULL DEFAULT '',
  probability text        NOT NULL CHECK (probability IN ('High', 'Medium', 'Low')),
  impact      text        NOT NULL CHECK (impact IN ('High', 'Medium', 'Low')),
  status      text        NOT NULL CHECK (status IN ('Open', 'Mitigated', 'Closed')) DEFAULT 'Open',
  owner       text        NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now(),
  closed_at   timestamptz
);

ALTER TABLE risks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_all_risks" ON risks
  FOR ALL USING (auth.role() = 'authenticated');

-- ─── Action Items ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS action_items (
  id          uuid PRIMARY KEY,
  project_id  uuid        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title       text        NOT NULL,
  owner       text        NOT NULL DEFAULT '',
  due_date    date        NOT NULL,
  priority    text        NOT NULL CHECK (priority IN ('High', 'Medium', 'Low')),
  status      text        NOT NULL CHECK (status IN ('To Do', 'In Progress', 'Done')) DEFAULT 'To Do',
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_all_action_items" ON action_items
  FOR ALL USING (auth.role() = 'authenticated');

-- ─── Decisions ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS decisions (
  id           uuid PRIMARY KEY,
  project_id   uuid        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title        text        NOT NULL,
  context      text        NOT NULL DEFAULT '',
  decision     text        NOT NULL DEFAULT '',
  alternatives text        NOT NULL DEFAULT '',
  author       text        NOT NULL DEFAULT '',
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_all_decisions" ON decisions
  FOR ALL USING (auth.role() = 'authenticated');

-- ─── Stakeholders ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS stakeholders (
  id          uuid PRIMARY KEY,
  project_id  uuid        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  role        text        NOT NULL DEFAULT '',
  company     text        NOT NULL DEFAULT '',
  influence   text        NOT NULL CHECK (influence IN ('High', 'Low')),
  interest    text        NOT NULL CHECK (interest IN ('High', 'Low')),
  notes       text        NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE stakeholders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_all_stakeholders" ON stakeholders
  FOR ALL USING (auth.role() = 'authenticated');

-- ─── User Settings (features) ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_settings (
  user_id  uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  features jsonb NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own settings
CREATE POLICY "own_settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

-- ─── Indexes ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_risks_project_id        ON risks(project_id);
CREATE INDEX IF NOT EXISTS idx_action_items_project_id ON action_items(project_id);
CREATE INDEX IF NOT EXISTS idx_decisions_project_id    ON decisions(project_id);
CREATE INDEX IF NOT EXISTS idx_stakeholders_project_id ON stakeholders(project_id);
