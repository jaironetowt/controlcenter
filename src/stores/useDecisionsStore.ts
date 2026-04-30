import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  addDecision: (data: Omit<Decision, 'id' | 'createdAt'>) => void;
  updateDecision: (id: string, updates: Partial<Omit<Decision, 'id' | 'createdAt'>>) => void;
  deleteDecision: (id: string) => void;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED: Decision[] = [
  {
    id: 'dec-001',
    projectId: 'mosaic',
    title: 'Use Zustand for client-side state management',
    context:
      'The app requires shared state across multiple pages with localStorage persistence. Redux was considered but deemed too heavyweight for the scope.',
    decision:
      'Adopt Zustand with the persist middleware for all client-side stores. Each feature domain gets its own store file.',
    alternatives:
      'Redux Toolkit (rejected — too much boilerplate), React Context (rejected — no built-in persistence).',
    author: 'Jairo Neto',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
  },
  {
    id: 'dec-002',
    projectId: 'mosaic',
    title: 'Adopt Next.js App Router over Pages Router',
    context:
      'New project setup required a routing strategy. App Router offers RSC support and co-located layouts, which align with the planned module structure.',
    decision:
      'Use Next.js App Router. All pages are under src/app/ with client components marked explicitly via "use client".',
    alternatives:
      'Pages Router (rejected — older pattern, no RSC), Remix (rejected — team familiarity with Next.js).',
    author: 'Jairo Neto',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
  },
  {
    id: 'dec-003',
    projectId: 'mosaic',
    title: 'Mantine as the component library',
    context:
      'A UI library was needed for modals, inputs, and other interactive components. The design system uses Tailwind for layout and spacing, but form components benefit from an accessible library.',
    decision:
      'Use Mantine v7 for modal and form primitives. Tailwind handles all layout, color, and spacing outside of Mantine components.',
    alternatives:
      'Radix UI (more setup required), shadcn/ui (considered, but Mantine has better out-of-the-box form UX).',
    author: 'Jairo Neto',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
];

// ─── Store ────────────────────────────────────────────────────────────────────

export const useDecisionsStore = create<DecisionsStore>()(
  persist(
    (set) => ({
      decisions: SEED,

      addDecision: (data) =>
        set((s) => ({
          decisions: [
            {
              ...data,
              id: crypto.randomUUID(),
              createdAt: Date.now(),
            },
            ...s.decisions,
          ],
        })),

      updateDecision: (id, updates) =>
        set((s) => ({
          decisions: s.decisions.map((d) =>
            d.id === id ? { ...d, ...updates } : d,
          ),
        })),

      deleteDecision: (id) =>
        set((s) => ({
          decisions: s.decisions.filter((d) => d.id !== id),
        })),
    }),
    {
      name: 'cc-decisions',
      merge: (persisted, current) => {
        const p = persisted as Partial<DecisionsStore>;
        if (!p.decisions || p.decisions.length === 0) return current;
        return { ...current, ...p };
      },
    },
  ),
);
