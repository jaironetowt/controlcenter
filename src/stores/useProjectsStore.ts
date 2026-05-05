import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  color: string;
  client: string;
  phase: string;
  dateRange: string;
  archived: boolean;
  archivedAt?: number;
  createdAt: number;
  salesforceId?: string;
  sfName?: string;
  sfDateRange?: string;
  timecardCount?: number;
  timecardCountAt?: number;
}

interface ProjectsStore {
  projects: Project[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  addProject: (data: Omit<Project, 'id' | 'archived' | 'createdAt'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>) => Promise<void>;
  archiveProject: (id: string) => Promise<void>;
  restoreProject: (id: string) => Promise<void>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Converte snake_case do banco para camelCase do frontend */
function fromDb(row: Record<string, unknown>): Project {
  return {
    id:               row.id as string,
    name:             row.name as string,
    color:            row.color as string,
    client:           row.client as string,
    phase:            row.phase as string,
    dateRange:        row.date_range as string,
    archived:         row.archived as boolean,
    archivedAt:       row.archived_at ? new Date(row.archived_at as string).getTime() : undefined,
    createdAt:        new Date(row.created_at as string).getTime(),
    salesforceId:     (row.salesforce_id as string | null) ?? undefined,
    sfName:           (row.sf_name as string | null) ?? undefined,
    sfDateRange:      (row.sf_date_range as string | null) ?? undefined,
    timecardCount:    (row.timecard_count as number | null) ?? undefined,
    timecardCountAt:  row.timecard_count_at ? new Date(row.timecard_count_at as string).getTime() : undefined,
  };
}

/** Converte camelCase do frontend para snake_case do banco */
function toDb(p: Partial<Project> & { id: string }) {
  const row: Record<string, unknown> = { id: p.id };
  if (p.name            !== undefined) row.name              = p.name;
  if (p.color           !== undefined) row.color             = p.color;
  if (p.client          !== undefined) row.client            = p.client;
  if (p.phase           !== undefined) row.phase             = p.phase;
  if (p.dateRange       !== undefined) row.date_range        = p.dateRange;
  if (p.archived        !== undefined) row.archived          = p.archived;
  if (p.archivedAt      !== undefined) row.archived_at       = p.archivedAt ? new Date(p.archivedAt).toISOString() : null;
  if (p.salesforceId    !== undefined) row.salesforce_id     = p.salesforceId ?? null;
  if (p.sfName          !== undefined) row.sf_name           = p.sfName ?? null;
  if (p.sfDateRange     !== undefined) row.sf_date_range     = p.sfDateRange ?? null;
  if (p.timecardCount   !== undefined) row.timecard_count    = p.timecardCount ?? null;
  if (p.timecardCountAt !== undefined) row.timecard_count_at = p.timecardCountAt ? new Date(p.timecardCountAt).toISOString() : null;
  return row;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useProjectsStore = create<ProjectsStore>()((set, get) => ({
  projects: [],
  loading:  false,
  error:    null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      set({ loading: false, error: error.message });
      return;
    }
    set({
      projects: (data ?? []).map(fromDb),
      loading:  false,
    });
  },

  addProject: async (input) => {
    const id = crypto.randomUUID();
    const createdAt = Date.now();

    const newProject: Project = {
      ...input,
      id,
      archived:  false,
      createdAt,
    };

    // Optimistic update
    set((s) => ({ projects: [...s.projects, newProject] }));

    const baseRow: Record<string, unknown> = {
      id,
      name:          input.name,
      color:         input.color,
      client:        input.client,
      phase:         input.phase,
      date_range:    input.dateRange,
      archived:      false,
      salesforce_id: input.salesforceId ?? null,
      created_at:    new Date(createdAt).toISOString(),
    };
    if (input.sfName      !== undefined) baseRow.sf_name       = input.sfName;
    if (input.sfDateRange !== undefined) baseRow.sf_date_range = input.sfDateRange;

    let { error } = await supabase.from('projects').insert(baseRow);

    // 42703 = column does not exist — migration pending, retry without SF columns
    if (error?.code === '42703') {
      const { sf_name: _n, sf_date_range: _d, ...fallback } = baseRow;
      void (_n); void (_d);
      ({ error } = await supabase.from('projects').insert(fallback));
    }

    if (error) {
      set((s) => ({ projects: s.projects.filter((p) => p.id !== id), error: error!.message }));
    }
  },

  updateProject: async (id, updates) => {
    // Optimistic update
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p,
      ),
    }));

    const row = toDb({ id, ...updates });
    let { error } = await supabase.from('projects').update(row).eq('id', id);

    // 42703 = column does not exist — retry without SF columns
    if (error?.code === '42703') {
      const { sf_name: _n, sf_date_range: _d, ...fallback } = row;
      void (_n); void (_d);
      ({ error } = await supabase.from('projects').update(fallback).eq('id', id));
    }

    if (error) {
      set({ error: error.message });
      get().fetchProjects();
    }
  },

  archiveProject: async (id) => {
    const archivedAt = Date.now();

    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === id ? { ...p, archived: true, archivedAt } : p,
      ),
    }));

    const { error } = await supabase
      .from('projects')
      .update({ archived: true, archived_at: new Date(archivedAt).toISOString() })
      .eq('id', id);

    if (error) {
      set({ error: error.message });
      get().fetchProjects();
    }
  },

  restoreProject: async (id) => {
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === id ? { ...p, archived: false, archivedAt: undefined } : p,
      ),
    }));

    const { error } = await supabase
      .from('projects')
      .update({ archived: false, archived_at: null })
      .eq('id', id);

    if (error) {
      set({ error: error.message });
      get().fetchProjects();
    }
  },
}));
