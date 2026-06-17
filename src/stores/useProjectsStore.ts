import { create } from 'zustand';
import { apiList, apiCreate, apiUpdate, apiDelete } from '@/lib/api';
import type { DbProject } from '@/lib/types';

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
    // archived trafega como 0/1 (integer) ou boolean
    archived:         Boolean(row.archived),
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
  if (p.archived        !== undefined) row.archived          = p.archived ? 1 : 0;
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
    try {
      const rows = await apiList<DbProject>('projects');
      set({
        projects: rows.map((r) => fromDb(r as unknown as Record<string, unknown>)),
        loading:  false,
      });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : String(e) });
    }
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

    const row: Record<string, unknown> = {
      id,
      name:          input.name,
      color:         input.color,
      client:        input.client,
      phase:         input.phase,
      date_range:    input.dateRange,
      archived:      0,
      salesforce_id: input.salesforceId ?? null,
      created_at:    new Date(createdAt).toISOString(),
    };
    if (input.sfName      !== undefined) row.sf_name       = input.sfName;
    if (input.sfDateRange !== undefined) row.sf_date_range = input.sfDateRange;

    try {
      await apiCreate<DbProject>('projects', row as unknown as DbProject);
    } catch (e) {
      set((s) => ({
        projects: s.projects.filter((p) => p.id !== id),
        error: e instanceof Error ? e.message : String(e),
      }));
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

    try {
      await apiUpdate<DbProject>('projects', id, row as unknown as Partial<DbProject>);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
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

    try {
      await apiUpdate<DbProject>('projects', id, {
        archived: 1,
        archived_at: new Date(archivedAt).toISOString(),
      } as unknown as Partial<DbProject>);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
      get().fetchProjects();
    }
  },

  restoreProject: async (id) => {
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === id ? { ...p, archived: false, archivedAt: undefined } : p,
      ),
    }));

    try {
      await apiUpdate<DbProject>('projects', id, {
        archived: 0,
        archived_at: null,
      } as unknown as Partial<DbProject>);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
      get().fetchProjects();
    }
  },
}));
