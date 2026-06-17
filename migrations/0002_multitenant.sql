-- Control Center — Multi-tenant migration (forward-only).
-- 0001_init.sql has already been applied in the deployed DB; DO NOT edit it.
--
-- Model: each user = one "space" identified by their x-gizmos-sub (owner_sub).
-- Content tables gain an owner_sub column; space_shares lets an owner invite
-- viewers by email. Database is empty, so owner_sub is added as nullable.

-- ─── owner_sub on content tables ──────────────────────────────────────────────
ALTER TABLE projects     ADD COLUMN owner_sub TEXT;
ALTER TABLE risks        ADD COLUMN owner_sub TEXT;
ALTER TABLE action_items ADD COLUMN owner_sub TEXT;
ALTER TABLE decisions    ADD COLUMN owner_sub TEXT;
ALTER TABLE stakeholders ADD COLUMN owner_sub TEXT;

CREATE INDEX IF NOT EXISTS idx_projects_owner_sub     ON projects(owner_sub);
CREATE INDEX IF NOT EXISTS idx_risks_owner_sub        ON risks(owner_sub);
CREATE INDEX IF NOT EXISTS idx_action_items_owner_sub ON action_items(owner_sub);
CREATE INDEX IF NOT EXISTS idx_decisions_owner_sub    ON decisions(owner_sub);
CREATE INDEX IF NOT EXISTS idx_stakeholders_owner_sub ON stakeholders(owner_sub);

-- ─── Space shares (owner invites viewers by email) ────────────────────────────
CREATE TABLE IF NOT EXISTS space_shares (
  owner_sub    TEXT NOT NULL,
  owner_email  TEXT NOT NULL DEFAULT '',
  viewer_email TEXT NOT NULL,
  role         TEXT NOT NULL DEFAULT 'viewer',
  created_at   TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (owner_sub, viewer_email)
);

CREATE INDEX IF NOT EXISTS idx_space_shares_viewer_email ON space_shares(viewer_email);
