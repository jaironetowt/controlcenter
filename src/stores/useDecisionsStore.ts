import { create } from 'zustand';
import { apiList, apiCreate, apiUpdate, apiDelete } from '@/lib/api';
import { useSpaceStore } from '@/stores/useSpaceStore';
import type { DbDecision } from '@/lib/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Decision {
  id: string;
  projectId: string;
  title: string;
  context: string;
  decision: string;
  alternatives: string;
  author: string;
  createdAt: number;
}

interface DecisionsStore {
  decisions: Decision[];
  loading: boolean;
  error: string | null;
  /** Hidrata o estado a partir de linhas já buscadas (sem rede). */
  hydrate: (rows: DbDecision[]) => void;
  fetchDecisions: () => Promise<void>;
  addDecision: (data: Omit<Decision, 'id' | 'createdAt'>) => Promise<void>;
  updateDecision: (id: string, updates: Partial<Omit<Decision, 'id' | 'createdAt'>>) => Promise<void>;
  deleteDecision: (id: string) => Promise<void>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fromDb(row: DbDecision): Decision {
  return {
    id:           row.id,
    projectId:    row.project_id,
    title:        row.title,
    context:      row.context,
    decision:     row.decision,
    alternatives: row.alternatives,
    author:       row.author,
    createdAt:    new Date(row.created_at).getTime(),
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useDecisionsStore = create<DecisionsStore>()((set, get) => ({
  decisions: [],
  loading:   false,
  error:     null,

  hydrate: (rows) => set({ decisions: rows.map(fromDb), loading: false, error: null }),

  fetchDecisions: async () => {
    set({ loading: true, error: null });
    try {
      const rows = await apiList<DbDecision>('decisions', useSpaceStore.getState().selectedSpace ?? undefined);
      set({ decisions: rows.map(fromDb), loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : String(e) });
    }
  },

  addDecision: async (input) => {
    const sp = useSpaceStore.getState();
    if (sp.selectedSpace && sp.me && sp.selectedSpace !== sp.me.sub) {
      set({ error: 'Read-only: espaco de outra pessoa' });
      return;
    }

    const id = crypto.randomUUID();
    const createdAt = Date.now();

    const newDecision: Decision = { ...input, id, createdAt };

    set((s) => ({ decisions: [newDecision, ...s.decisions] }));

    try {
      await apiCreate<DbDecision>('decisions', {
        id,
        project_id:   input.projectId,
        title:        input.title,
        context:      input.context,
        decision:     input.decision,
        alternatives: input.alternatives,
        author:       input.author,
        created_at:   new Date(createdAt).toISOString(),
      });
    } catch (e) {
      set((s) => ({
        decisions: s.decisions.filter((d) => d.id !== id),
        error: e instanceof Error ? e.message : String(e),
      }));
    }
  },

  updateDecision: async (id, updates) => {
    const sp = useSpaceStore.getState();
    if (sp.selectedSpace && sp.me && sp.selectedSpace !== sp.me.sub) {
      set({ error: 'Read-only: espaco de outra pessoa' });
      return;
    }

    set((s) => ({
      decisions: s.decisions.map((d) =>
        d.id === id ? { ...d, ...updates } : d,
      ),
    }));

    const dbUpdates: Partial<DbDecision> = {};
    if (updates.title        !== undefined) dbUpdates.title        = updates.title;
    if (updates.context      !== undefined) dbUpdates.context      = updates.context;
    if (updates.decision     !== undefined) dbUpdates.decision     = updates.decision;
    if (updates.alternatives !== undefined) dbUpdates.alternatives = updates.alternatives;
    if (updates.author       !== undefined) dbUpdates.author       = updates.author;
    if (updates.projectId    !== undefined) dbUpdates.project_id   = updates.projectId;

    try {
      await apiUpdate<DbDecision>('decisions', id, dbUpdates);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
      get().fetchDecisions();
    }
  },

  deleteDecision: async (id) => {
    const sp = useSpaceStore.getState();
    if (sp.selectedSpace && sp.me && sp.selectedSpace !== sp.me.sub) {
      set({ error: 'Read-only: espaco de outra pessoa' });
      return;
    }

    set((s) => ({ decisions: s.decisions.filter((d) => d.id !== id) }));

    try {
      await apiDelete('decisions', id);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
      get().fetchDecisions();
    }
  },
}));
