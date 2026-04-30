import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Priority = 'High' | 'Medium' | 'Low';
export type ActionStatus = 'To Do' | 'In Progress' | 'Done';

export interface ActionItem {
  id: string;
  projectId: string;
  title: string;
  owner: string;
  dueDate: string; // ISO date string "YYYY-MM-DD"
  priority: Priority;
  status: ActionStatus;
  createdAt: number;
}

interface ActionItemsStore {
  items: ActionItem[];
  addItem: (data: Omit<ActionItem, 'id' | 'createdAt'>) => void;
  updateItem: (id: string, updates: Partial<Omit<ActionItem, 'id' | 'createdAt'>>) => void;
  deleteItem: (id: string) => void;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED: ActionItem[] = [
  {
    id: 'ai-001',
    projectId: 'mosaic',
    title: 'Finalize API contract with backend team',
    owner: 'Jairo Neto',
    dueDate: '2026-05-05',
    priority: 'High',
    status: 'In Progress',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
  },
  {
    id: 'ai-002',
    projectId: 'mosaic',
    title: 'Review and merge Design System tokens PR',
    owner: 'Jairo Neto',
    dueDate: '2026-04-30',
    priority: 'Medium',
    status: 'To Do',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: 'ai-003',
    projectId: 'mosaic',
    title: 'Send sprint retrospective summary to stakeholders',
    owner: 'Jairo Neto',
    dueDate: '2026-04-25',
    priority: 'Low',
    status: 'Done',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
  },
];

// ─── Store ────────────────────────────────────────────────────────────────────

export const useActionItemsStore = create<ActionItemsStore>()(
  persist(
    (set) => ({
      items: SEED,

      addItem: (data) =>
        set((s) => ({
          items: [
            {
              ...data,
              id: crypto.randomUUID(),
              createdAt: Date.now(),
            },
            ...s.items,
          ],
        })),

      updateItem: (id, updates) =>
        set((s) => ({
          items: s.items.map((item) =>
            item.id === id ? { ...item, ...updates } : item,
          ),
        })),

      deleteItem: (id) =>
        set((s) => ({
          items: s.items.filter((item) => item.id !== id),
        })),
    }),
    {
      name: 'cc-action-items',
      merge: (persisted, current) => {
        const p = persisted as Partial<ActionItemsStore>;
        if (!p.items || p.items.length === 0) return current;
        return { ...current, ...p };
      },
    },
  ),
);
