import { create } from 'zustand';
import { apiList, apiCreate, apiUpdate, apiDelete } from '@/lib/api';
import { useSpaceStore } from '@/stores/useSpaceStore';
import type { DbStakeholder } from '@/lib/types';

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
  /** Hidrata o estado a partir de linhas já buscadas (sem rede). */
  hydrate: (rows: DbStakeholder[]) => void;
  fetchStakeholders: () => Promise<void>;
  addStakeholder: (data: Omit<Stakeholder, 'id' | 'createdAt'>) => Promise<void>;
  updateStakeholder: (id: string, updates: Partial<Omit<Stakeholder, 'id' | 'createdAt'>>) => Promise<void>;
  deleteStakeholder: (id: string) => Promise<void>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fromDb(row: DbStakeholder): Stakeholder {
  return {
    id:        row.id,
    projectId: row.project_id,
    name:      row.name,
    role:      row.role,
    company:   row.company,
    influence: row.influence,
    interest:  row.interest,
    notes:     row.notes,
    createdAt: new Date(row.created_at).getTime(),
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useStakeholdersStore = create<StakeholdersStore>()((set, get) => ({
  stakeholders: [],
  loading:      false,
  error:        null,

  hydrate: (rows) => set({ stakeholders: rows.map(fromDb), loading: false, error: null }),

  fetchStakeholders: async () => {
    set({ loading: true, error: null });
    try {
      const space = useSpaceStore.getState().selectedSpace ?? undefined;
      const data = await apiList<DbStakeholder>('stakeholders', space);
      set({ stakeholders: data.map(fromDb), loading: false });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
    }
  },

  addStakeholder: async (input) => {
    const sp = useSpaceStore.getState();
    if (sp.selectedSpace && sp.me && sp.selectedSpace !== sp.me.sub) {
      set({ error: 'Read-only: espaco de outra pessoa' });
      return;
    }

    const id = crypto.randomUUID();
    const createdAt = Date.now();

    const newSh: Stakeholder = { ...input, id, createdAt };

    set((s) => ({ stakeholders: [...s.stakeholders, newSh] }));

    try {
      await apiCreate<DbStakeholder>('stakeholders', {
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
    } catch (e) {
      set((s) => ({ stakeholders: s.stakeholders.filter((sh) => sh.id !== id), error: (e as Error).message }));
    }
  },

  updateStakeholder: async (id, updates) => {
    const sp = useSpaceStore.getState();
    if (sp.selectedSpace && sp.me && sp.selectedSpace !== sp.me.sub) {
      set({ error: 'Read-only: espaco de outra pessoa' });
      return;
    }

    set((s) => ({
      stakeholders: s.stakeholders.map((sh) =>
        sh.id === id ? { ...sh, ...updates } : sh,
      ),
    }));

    const dbUpdates: Partial<DbStakeholder> = {};
    if (updates.name      !== undefined) dbUpdates.name       = updates.name;
    if (updates.role      !== undefined) dbUpdates.role       = updates.role;
    if (updates.company   !== undefined) dbUpdates.company    = updates.company;
    if (updates.influence !== undefined) dbUpdates.influence  = updates.influence;
    if (updates.interest  !== undefined) dbUpdates.interest   = updates.interest;
    if (updates.notes     !== undefined) dbUpdates.notes      = updates.notes;
    if (updates.projectId !== undefined) dbUpdates.project_id = updates.projectId;

    try {
      await apiUpdate<DbStakeholder>('stakeholders', id, dbUpdates);
    } catch (e) {
      set({ error: (e as Error).message });
      get().fetchStakeholders();
    }
  },

  deleteStakeholder: async (id) => {
    const sp = useSpaceStore.getState();
    if (sp.selectedSpace && sp.me && sp.selectedSpace !== sp.me.sub) {
      set({ error: 'Read-only: espaco de outra pessoa' });
      return;
    }

    set((s) => ({ stakeholders: s.stakeholders.filter((sh) => sh.id !== id) }));

    try {
      await apiDelete('stakeholders', id);
    } catch (e) {
      set({ error: (e as Error).message });
      get().fetchStakeholders();
    }
  },
}));
