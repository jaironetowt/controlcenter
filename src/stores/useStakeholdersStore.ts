import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export type InfluenceLevel = 'High' | 'Low';
export type InterestLevel  = 'High' | 'Low';

export interface Stakeholder {
  id: string;
  projectId: string;
  name: string;
  role: string;
  company: string;
  influence: InfluenceLevel;
  interest: InterestLevel;
  notes: string;
  createdAt: number;
}

interface StakeholdersStore {
  stakeholders: Stakeholder[];
  loading: boolean;
  error: string | null;
  fetchStakeholders: () => Promise<void>;
  addStakeholder: (data: Omit<Stakeholder, 'id' | 'createdAt'>) => Promise<void>;
  updateStakeholder: (id: string, updates: Partial<Omit<Stakeholder, 'id' | 'createdAt'>>) => Promise<void>;
  deleteStakeholder: (id: string) => Promise<void>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fromDb(row: Record<string, unknown>): Stakeholder {
  return {
    id:        row.id as string,
    projectId: row.project_id as string,
    name:      row.name as string,
    role:      row.role as string,
    company:   row.company as string,
    influence: row.influence as InfluenceLevel,
    interest:  row.interest as InterestLevel,
    notes:     row.notes as string,
    createdAt: new Date(row.created_at as string).getTime(),
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useStakeholdersStore = create<StakeholdersStore>()((set, get) => ({
  stakeholders: [],
  loading:      false,
  error:        null,

  fetchStakeholders: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('stakeholders')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      set({ loading: false, error: error.message });
      return;
    }
    set({ stakeholders: (data ?? []).map(fromDb), loading: false });
  },

  addStakeholder: async (input) => {
    const id = crypto.randomUUID();
    const createdAt = Date.now();

    const newSh: Stakeholder = { ...input, id, createdAt };

    set((s) => ({ stakeholders: [...s.stakeholders, newSh] }));

    const { error } = await supabase.from('stakeholders').insert({
      id,
      project_id: input.projectId,
      name:       input.name,
      role:       input.role,
      company:    input.company,
      influence:  input.influence,
      interest:   input.interest,
      notes:      input.notes,
      created_at: new Date(createdAt).toISOString(),
    });

    if (error) {
      set((s) => ({ stakeholders: s.stakeholders.filter((sh) => sh.id !== id), error: error.message }));
    }
  },

  updateStakeholder: async (id, updates) => {
    set((s) => ({
      stakeholders: s.stakeholders.map((sh) =>
        sh.id === id ? { ...sh, ...updates } : sh,
      ),
    }));

    const dbUpdates: Record<string, unknown> = {};
    if (updates.name      !== undefined) dbUpdates.name       = updates.name;
    if (updates.role      !== undefined) dbUpdates.role       = updates.role;
    if (updates.company   !== undefined) dbUpdates.company    = updates.company;
    if (updates.influence !== undefined) dbUpdates.influence  = updates.influence;
    if (updates.interest  !== undefined) dbUpdates.interest   = updates.interest;
    if (updates.notes     !== undefined) dbUpdates.notes      = updates.notes;
    if (updates.projectId !== undefined) dbUpdates.project_id = updates.projectId;

    const { error } = await supabase.from('stakeholders').update(dbUpdates).eq('id', id);

    if (error) {
      set({ error: error.message });
      get().fetchStakeholders();
    }
  },

  deleteStakeholder: async (id) => {
    set((s) => ({ stakeholders: s.stakeholders.filter((sh) => sh.id !== id) }));

    const { error } = await supabase.from('stakeholders').delete().eq('id', id);

    if (error) {
      set({ error: error.message });
      get().fetchStakeholders();
    }
  },
}));
