import { create } from 'zustand';
import { apiList, apiCreate, apiUpdate, apiDelete } from '@/lib/api';
import { useSpaceStore } from '@/stores/useSpaceStore';
import type { DbActionItem } from '@/lib/types';

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
  loading: boolean;
  error: string | null;
  fetchItems: () => Promise<void>;
  addItem: (data: Omit<ActionItem, 'id' | 'createdAt'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<Omit<ActionItem, 'id' | 'createdAt'>>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fromDb(row: DbActionItem): ActionItem {
  return {
    id:        row.id,
    projectId: row.project_id,
    title:     row.title,
    owner:     row.owner,
    dueDate:   row.due_date,
    priority:  row.priority,
    status:    row.status,
    createdAt: new Date(row.created_at).getTime(),
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useActionItemsStore = create<ActionItemsStore>()((set, get) => ({
  items:   [],
  loading: false,
  error:   null,

  fetchItems: async () => {
    set({ loading: true, error: null });
    try {
      const space = useSpaceStore.getState().selectedSpace ?? undefined;
      const rows = await apiList<DbActionItem>('action_items', space);
      // ordenados desc por created_at (a API não garante ordem para este recurso)
      const items = rows
        .map(fromDb)
        .sort((a, b) => b.createdAt - a.createdAt);
      set({ items, loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : String(e) });
    }
  },

  addItem: async (input) => {
    const sp = useSpaceStore.getState();
    if (sp.selectedSpace && sp.me && sp.selectedSpace !== sp.me.sub) {
      set({ error: 'Read-only: espaço de outra pessoa' });
      return;
    }

    const id = crypto.randomUUID();
    const createdAt = Date.now();

    const newItem: ActionItem = { ...input, id, createdAt };

    // Optimistic: prepend (items são ordenados desc)
    set((s) => ({ items: [newItem, ...s.items] }));

    try {
      await apiCreate<DbActionItem>('action_items', {
        id,
        project_id: input.projectId,
        title:      input.title,
        owner:      input.owner,
        due_date:   input.dueDate,
        priority:   input.priority,
        status:     input.status,
        created_at: new Date(createdAt).toISOString(),
      });
    } catch (e) {
      set((s) => ({
        items: s.items.filter((i) => i.id !== id),
        error: e instanceof Error ? e.message : String(e),
      }));
    }
  },

  updateItem: async (id, updates) => {
    const sp = useSpaceStore.getState();
    if (sp.selectedSpace && sp.me && sp.selectedSpace !== sp.me.sub) {
      set({ error: 'Read-only: espaço de outra pessoa' });
      return;
    }

    set((s) => ({
      items: s.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item,
      ),
    }));

    const dbUpdates: Partial<DbActionItem> = {};
    if (updates.title     !== undefined) dbUpdates.title      = updates.title;
    if (updates.owner     !== undefined) dbUpdates.owner      = updates.owner;
    if (updates.dueDate   !== undefined) dbUpdates.due_date   = updates.dueDate;
    if (updates.priority  !== undefined) dbUpdates.priority   = updates.priority;
    if (updates.status    !== undefined) dbUpdates.status     = updates.status;
    if (updates.projectId !== undefined) dbUpdates.project_id = updates.projectId;

    try {
      await apiUpdate<DbActionItem>('action_items', id, dbUpdates);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
      get().fetchItems();
    }
  },

  deleteItem: async (id) => {
    const sp = useSpaceStore.getState();
    if (sp.selectedSpace && sp.me && sp.selectedSpace !== sp.me.sub) {
      set({ error: 'Read-only: espaço de outra pessoa' });
      return;
    }

    set((s) => ({ items: s.items.filter((item) => item.id !== id) }));

    try {
      await apiDelete('action_items', id);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
      get().fetchItems();
    }
  },
}));
