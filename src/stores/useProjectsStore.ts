import { create } from 'zustand';
import { persist } from 'zustand/middleware';

function generateProjectId(name: string, existing: string[]): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  if (slug && !existing.includes(slug)) return slug;
  const suffix = Math.random().toString(36).slice(2, 6);
  return slug ? `${slug}-${suffix}` : suffix;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  color: string;
  client: string;
  phase: string;
  dateRange: string;
  archived: boolean;
  archivedAt?: number;
  createdAt: number;
  salesforceId?: string;
  timecardCount?: number;
  timecardCountAt?: number;
}

interface ProjectsStore {
  projects: Project[];
  addProject: (data: Omit<Project, 'id' | 'archived' | 'createdAt'>) => void;
  updateProject: (id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>) => void;
  archiveProject: (id: string) => void;
  restoreProject: (id: string) => void;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED: Project[] = [
  { id: 'mosaic',   name: 'Mosaic',       color: '#3E77FC', client: 'WillowTree Internal', phase: 'Development', dateRange: 'Jan – Jun 2026', archived: false, createdAt: 0, salesforceId: 'mock-mosaic' },
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
              id: generateProjectId(data.name, s.projects.map((p) => p.id)),
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
            p.id === id ? { ...p, archived: true, archivedAt: Date.now() } : p,
          ),
        })),

      restoreProject: (id) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, archived: false } : p,
          ),
        })),
    }),
    {
      name: 'cc-projects',
      merge: (persisted, current) => {
        const p = persisted as Partial<ProjectsStore>;
        if (!p.projects || p.projects.length === 0) return current;
        // Apply SEED fields as defaults for existing projects (persisted values win)
        const mergedProjects = p.projects.map((pp) => {
          const seed = current.projects.find((cp) => cp.id === pp.id);
          return seed ? { ...seed, ...pp } : pp;
        });
        return { ...current, ...p, projects: mergedProjects };
      },
    },
  ),
);
