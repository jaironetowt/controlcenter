// ─── Database row types (snake_case, as served by /api/*) ──────────────────────
// These mirror the D1/SQLite table columns exactly. Rows travel over the API
// in snake_case; the stores' fromDb/toDb helpers map them to/from app models.

export interface DbProject {
  id: string;
  name: string;
  color: string;
  client: string;
  phase: string;
  date_range: string;
  // SQLite has no boolean; archived travels as 0/1 (integer) over the wire.
  archived: boolean | number;
  archived_at: string | null;
  salesforce_id: string | null;
  sf_name: string | null;
  sf_date_range: string | null;
  timecard_count: number | null;
  timecard_count_at: string | null;
  created_at: string;
}

export interface DbRisk {
  id: string;
  project_id: string;
  title: string;
  description: string;
  probability: 'High' | 'Medium' | 'Low';
  impact: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Mitigated' | 'Closed';
  owner: string;
  created_at: string;
  closed_at: string | null;
}

export interface DbActionItem {
  id: string;
  project_id: string;
  title: string;
  owner: string;
  due_date: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Done';
  created_at: string;
}

export interface DbDecision {
  id: string;
  project_id: string;
  title: string;
  context: string;
  decision: string;
  alternatives: string;
  author: string;
  created_at: string;
}

export interface DbStakeholder {
  id: string;
  project_id: string;
  name: string;
  role: string;
  company: string;
  influence: 'High' | 'Low';
  interest: 'High' | 'Low';
  notes: string;
  created_at: string;
}

export interface DbUserSettings {
  user_id: string;
  features: Record<string, boolean>;
}
