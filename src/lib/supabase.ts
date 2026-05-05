import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Database Types ───────────────────────────────────────────────────────────

export interface DbProject {
  id: string;
  name: string;
  color: string;
  client: string;
  phase: string;
  date_range: string;
  archived: boolean;
  archived_at: string | null;
  salesforce_id: string | null;
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
