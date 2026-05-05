import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Probability = 'High' | 'Medium' | 'Low';
export type Impact = 'High' | 'Medium' | 'Low';
export type RiskStatus = 'Open' | 'Mitigated' | 'Closed';

export interface Risk {
  id: string;
  projectId: string;
  title: string;
  description: string;
  probability: Probability;
  impact: Impact;
  status: RiskStatus;
  owner: string;
  createdAt: number;
  closedAt?: number;
}

interface RisksStore {
  risks: Risk[];
  loading: boolean;
  error: string | null;
  fetchRisks: () => Promise<void>;
  addRisk: (data: Omit<Risk, 'id' | 'closedAt'> & { createdAt?: number }) => Promise<void>;
  updateRisk: (id: string, updates: Partial<Omit<Risk, 'id' | 'createdAt'>>) => Promise<void>;
  deleteRisk: (id: string) => Promise<void>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fromDb(row: Record<string, unknown>): Risk {
  return {
    id:          row.id as string,
    projectId:   row.project_id as string,
    title:       row.title as string,
    description: row.description as string,
    probability: row.probability as Probability,
    impact:      row.impact as Impact,
    status:      row.status as RiskStatus,
    owner:       row.owner as string,
    createdAt:   new Date(row.created_at as string).getTime(),
    closedAt:    row.closed_at ? new Date(row.closed_at as string).getTime() : undefined,
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useRisksStore = create<RisksStore>()((set, get) => ({
  risks:   [],
  loading: false,
  error:   null,

  fetchRisks: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('risks')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      set({ loading: false, error: error.message });
      return;
    }
    set({ risks: (data ?? []).map(fromDb), loading: false });
  },

  addRisk: async (input) => {
    const id = crypto.randomUUID();
    const createdAt = input.createdAt ?? Date.now();

    const newRisk: Risk = {
      ...input,
      id,
      createdAt,
      closedAt: undefined,
    };

    set((s) => ({ risks: [...s.risks, newRisk] }));

    const { error } = await supabase.from('risks').insert({
      id,
      project_id:  input.projectId,
      title:       input.title,
      description: input.description,
      probability: input.probability,
      impact:      input.impact,
      status:      input.status,
      owner:       input.owner,
      created_at:  new Date(createdAt).toISOString(),
      closed_at:   null,
    });

    if (error) {
      set((s) => ({ risks: s.risks.filter((r) => r.id !== id), error: error.message }));
    }
  },

  updateRisk: async (id, updates) => {
    set((s) => ({
      risks: s.risks.map((r) => {
        if (r.id !== id) return r;
        const next = { ...r, ...updates };
        if (updates.status && updates.status !== 'Open' && r.status === 'Open') {
          next.closedAt = Date.now();
        }
        if (updates.status === 'Open') {
          next.closedAt = undefined;
        }
        return next;
      }),
    }));

    // Calcular closedAt para persistir
    const current = get().risks.find((r) => r.id === id);
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title       !== undefined) dbUpdates.title       = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.probability !== undefined) dbUpdates.probability = updates.probability;
    if (updates.impact      !== undefined) dbUpdates.impact      = updates.impact;
    if (updates.owner       !== undefined) dbUpdates.owner       = updates.owner;
    if (updates.status !== undefined) {
      dbUpdates.status = updates.status;
      if (updates.status !== 'Open' && current?.status === 'Open') {
        dbUpdates.closed_at = new Date().toISOString();
      } else if (updates.status === 'Open') {
        dbUpdates.closed_at = null;
      }
    }

    const { error } = await supabase.from('risks').update(dbUpdates).eq('id', id);

    if (error) {
      set({ error: error.message });
      get().fetchRisks();
    }
  },

  deleteRisk: async (id) => {
    set((s) => ({ risks: s.risks.filter((r) => r.id !== id) }));

    const { error } = await supabase.from('risks').delete().eq('id', id);

    if (error) {
      set({ error: error.message });
      get().fetchRisks();
    }
  },
}));
