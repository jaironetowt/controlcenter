import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

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
  fetchDecisions: () => Promise<void>;
  addDecision: (data: Omit<Decision, 'id' | 'createdAt'>) => Promise<void>;
  updateDecision: (id: string, updates: Partial<Omit<Decision, 'id' | 'createdAt'>>) => Promise<void>;
  deleteDecision: (id: string) => Promise<void>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fromDb(row: Record<string, unknown>): Decision {
  return {
    id:           row.id as string,
    projectId:    row.project_id as string,
    title:        row.title as string,
    context:      row.context as string,
    decision:     row.decision as string,
    alternatives: row.alternatives as string,
    author:       row.author as string,
    createdAt:    new Date(row.created_at as string).getTime(),
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useDecisionsStore = create<DecisionsStore>()((set, get) => ({
  decisions: [],
  loading:   false,
  error:     null,

  fetchDecisions: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('decisions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      set({ loading: false, error: error.message });
      return;
    }
    set({ decisions: (data ?? []).map(fromDb), loading: false });
  },

  addDecision: async (input) => {
    const id = crypto.randomUUID();
    const createdAt = Date.now();

    const newDecision: Decision = { ...input, id, createdAt };

    set((s) => ({ decisions: [newDecision, ...s.decisions] }));

    const { error } = await supabase.from('decisions').insert({
      id,
      project_id:   input.projectId,
      title:        input.title,
      context:      input.context,
      decision:     input.decision,
      alternatives: input.alternatives,
      author:       input.author,
      created_at:   new Date(createdAt).toISOString(),
    });

    if (error) {
      set((s) => ({ decisions: s.decisions.filter((d) => d.id !== id), error: error.message }));
    }
  },

  updateDecision: async (id, updates) => {
    set((s) => ({
      decisions: s.decisions.map((d) =>
        d.id === id ? { ...d, ...updates } : d,
      ),
    }));

    const dbUpdates: Record<string, unknown> = {};
    if (updates.title        !== undefined) dbUpdates.title        = updates.title;
    if (updates.context      !== undefined) dbUpdates.context      = updates.context;
    if (updates.decision     !== undefined) dbUpdates.decision     = updates.decision;
    if (updates.alternatives !== undefined) dbUpdates.alternatives = updates.alternatives;
    if (updates.author       !== undefined) dbUpdates.author       = updates.author;
    if (updates.projectId    !== undefined) dbUpdates.project_id   = updates.projectId;

    const { error } = await supabase.from('decisions').update(dbUpdates).eq('id', id);

    if (error) {
      set({ error: error.message });
      get().fetchDecisions();
    }
  },

  deleteDecision: async (id) => {
    set((s) => ({ decisions: s.decisions.filter((d) => d.id !== id) }));

    const { error } = await supabase.from('decisions').delete().eq('id', id);

    if (error) {
      set({ error: error.message });
      get().fetchDecisions();
    }
  },
}));
