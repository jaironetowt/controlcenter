import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PMToolConfig } from '@/integrations/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PMToolStore {
  // keyed by projectId
  configs: Record<string, PMToolConfig>;
  setConfig: (projectId: string, config: PMToolConfig) => void;
  removeConfig: (projectId: string) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const usePMToolStore = create<PMToolStore>()(
  persist(
    (set) => ({
      configs: {},

      setConfig: (projectId, config) =>
        set((s) => ({
          configs: { ...s.configs, [projectId]: config },
        })),

      removeConfig: (projectId) =>
        set((s) => {
          const next = { ...s.configs };
          delete next[projectId];
          return { configs: next };
        }),
    }),
    {
      name: 'cc-pm-tool',
    },
  ),
);
