import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  color: string;
  client: string;
  phase: string;
  dateRange: string;
  archived: boolean;
  createdAt: number;
}

interface ProjectsStore {
  projects: Project[];
  addProject: (data: Omit<Project, 'id' | 'archived' | 'createdAt'>) => void;
  updateProject: (id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>) => void;
  archiveProject: (id: string) => void;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED: Project[] = [
  { id: 'mosaic',   name: 'Mosaic',       color: '#3E77FC', client: 'WillowTree Internal', phase: 'Development', dateRange: 'Jan – Jun 2026', archived: false, createdAt: 0 },
  { id: 'whr',      name: 'WHR Redesign', color: '#8B56FC', client: 'WillowTree Internal', phase: 'Design',      dateRange: 'Mar – Jul 2026', archived: false, createdAt: 1 },
  { id: 'client-x', name: 'Client X',    color: '#F59E0B', client: 'Poatek',              phase: 'Discovery',   dateRange: 'Apr – May 2026', archived: false, createdAt: 2 },
];

// ─── Store ────────────────────────────────────────────────────────────────────

export const useProjectsStore = create<ProjectsStore>()(
  persist(
    (set) => ({
      projects: SEED,

      addProject: (data) =>
        set((s) => ({
          projects: [
            ...s.projects,
            {
              ...data,
              id: crypto.randomUUID(),
              archived: false,
              createdAt: Date.now(),
            },
          ],
        })),

      updateProject: (id, updates) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, ...updates } : p,
          ),
        })),

      archiveProject: (id) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, archived: true } : p,
          ),
        })),
    }),
    {
      name: 'cc-projects',
      // Merge persisted state but keep SEED as fallback when storage is empty
      merge: (persisted, current) => {
        const p = persisted as Partial<ProjectsStore>;
        if (!p.projects || p.projects.length === 0) return current;
        return { ...current, ...p };
      },
    },
  ),
);
