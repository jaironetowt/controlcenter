import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  addStakeholder: (data: Omit<Stakeholder, 'id' | 'createdAt'>) => void;
  updateStakeholder: (id: string, updates: Partial<Omit<Stakeholder, 'id' | 'createdAt'>>) => void;
  deleteStakeholder: (id: string) => void;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED: Stakeholder[] = [
  {
    id: 'sh-seed-1',
    projectId: 'mosaic',
    name: 'Amanda Rivera',
    role: 'VP of Engineering',
    company: 'WillowTree',
    influence: 'High',
    interest: 'High',
    notes: 'Primary decision-maker for architecture choices. Weekly sync required.',
    createdAt: 1,
  },
  {
    id: 'sh-seed-2',
    projectId: 'mosaic',
    name: 'Carlos Mendes',
    role: 'Product Owner',
    company: 'WillowTree',
    influence: 'High',
    interest: 'Low',
    notes: 'Approves roadmap and budget. Prefers monthly executive summaries.',
    createdAt: 2,
  },
  {
    id: 'sh-seed-3',
    projectId: 'mosaic',
    name: 'Sara Kim',
    role: 'Lead Designer',
    company: 'Poatek',
    influence: 'Low',
    interest: 'High',
    notes: 'Drives the design system. Needs early visibility on scope changes.',
    createdAt: 3,
  },
];

// ─── Store ────────────────────────────────────────────────────────────────────

export const useStakeholdersStore = create<StakeholdersStore>()(
  persist(
    (set) => ({
      stakeholders: SEED,

      addStakeholder: (data) =>
        set((s) => ({
          stakeholders: [
            ...s.stakeholders,
            {
              ...data,
              id: crypto.randomUUID(),
              createdAt: Date.now(),
            },
          ],
        })),

      updateStakeholder: (id, updates) =>
        set((s) => ({
          stakeholders: s.stakeholders.map((sh) =>
            sh.id === id ? { ...sh, ...updates } : sh,
          ),
        })),

      deleteStakeholder: (id) =>
        set((s) => ({
          stakeholders: s.stakeholders.filter((sh) => sh.id !== id),
        })),
    }),
    {
      name: 'cc-stakeholders',
      // Merge persisted state but keep SEED as fallback when storage is empty
      merge: (persisted, current) => {
        const p = persisted as Partial<StakeholdersStore>;
        if (!p.stakeholders || p.stakeholders.length === 0) return current;
        return { ...current, ...p };
      },
    },
  ),
);
