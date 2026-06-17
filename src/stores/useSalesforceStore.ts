import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SalesforceCredentials {
  instanceUrl: string; // e.g. https://willowtree.lightning.force.com
  username: string;
  password: string;
  securityToken: string;
}

interface SalesforceStore {
  credentials: SalesforceCredentials | null;
  setCredentials: (creds: SalesforceCredentials) => void;
  clearCredentials: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useSalesforceStore = create<SalesforceStore>()(
  persist(
    (set) => ({
      credentials: null,
      setCredentials: (creds) => set({ credentials: creds }),
      clearCredentials: () => set({ credentials: null }),
    }),
    { name: 'cc-salesforce', version: 1 },
  ),
);
