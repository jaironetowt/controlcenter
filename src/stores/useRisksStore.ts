import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
}

interface RisksStore {
  risks: Risk[];
  addRisk: (data: Omit<Risk, 'id' | 'createdAt'>) => void;
  updateRisk: (id: string, updates: Partial<Omit<Risk, 'id' | 'createdAt'>>) => void;
  deleteRisk: (id: string) => void;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED: Risk[] = [
  {
    id: 'risk-seed-1',
    projectId: 'mosaic',
    title: 'Third-party API rate limits',
    description: 'External data provider may throttle API calls during peak usage, affecting real-time sync.',
    probability: 'High',
    impact: 'High',
    status: 'Open',
    owner: 'Jairo Neto',
    createdAt: 1,
  },
  {
    id: 'risk-seed-2',
    projectId: 'mosaic',
    title: 'Key engineer availability',
    description: 'Lead backend engineer has a planned leave in May that may delay sprint delivery.',
    probability: 'Medium',
    impact: 'High',
    status: 'Mitigated',
    owner: 'Jairo Neto',
    createdAt: 2,
  },
  {
    id: 'risk-seed-3',
    projectId: 'mosaic',
    title: 'Design system inconsistencies',
    description: 'Component library updates may introduce visual regressions across pages.',
    probability: 'Low',
    impact: 'Medium',
    status: 'Open',
    owner: 'Jairo Neto',
    createdAt: 3,
  },
];

// ─── Store ────────────────────────────────────────────────────────────────────

export const useRisksStore = create<RisksStore>()(
  persist(
    (set) => ({
      risks: SEED,

      addRisk: (data) =>
        set((s) => ({
          risks: [
            ...s.risks,
            {
              ...data,
              id: crypto.randomUUID(),
              createdAt: Date.now(),
            },
          ],
        })),

      updateRisk: (id, updates) =>
        set((s) => ({
          risks: s.risks.map((r) =>
            r.id === id ? { ...r, ...updates } : r,
          ),
        })),

      deleteRisk: (id) =>
        set((s) => ({
          risks: s.risks.filter((r) => r.id !== id),
        })),
    }),
    {
      name: 'cc-risks',
      // Merge persisted state but keep SEED as fallback when storage is empty
      merge: (persisted, current) => {
        const p = persisted as Partial<RisksStore>;
        if (!p.risks || p.risks.length === 0) return current;
        return { ...current, ...p };
      },
    },
  ),
);
