import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

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

function fromDb(row: Record<string, unknown>): ActionItem {
  return {
    id:        row.id as string,
    projectId: row.project_id as string,
    title:     row.title as string,
    owner:     row.owner as string,
    dueDate:   row.due_date as string,
    priority:  row.priority as Priority,
    status:    row.status as ActionStatus,
    createdAt: new Date(row.created_at as string).getTime(),
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useActionItemsStore = create<ActionItemsStore>()((set, get) => ({
  items:   [],
  loading: false,
  error:   null,

  fetchItems: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('action_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      set({ loading: false, error: error.message });
      return;
    }
    set({ items: (data ?? []).map(fromDb), loading: false });
  },

  addItem: async (input) => {
    const id = crypto.randomUUID();
    const createdAt = Date.now();

    const newItem: ActionItem = { ...input, id, createdAt };

    // Optimistic: prepend (items são ordenados desc)
    set((s) => ({ items: [newItem, ...s.items] }));

    const { error } = await supabase.from('action_items').insert({
      id,
      project_id: input.projectId,
      title:      input.title,
      owner:      input.owner,
      due_date:   input.dueDate,
      priority:   input.priority,
      status:     input.status,
      created_at: new Date(createdAt).toISOString(),
    });

    if (error) {
      set((s) => ({ items: s.items.filter((i) => i.id !== id), error: error.message }));
    }
  },

  updateItem: async (id, updates) => {
    set((s) => ({
      items: s.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item,
      ),
    }));

    const dbUpdates: Record<string, unknown> = {};
    if (updates.title     !== undefined) dbUpdates.title      = updates.title;
    if (updates.owner     !== undefined) dbUpdates.owner      = updates.owner;
    if (updates.dueDate   !== undefined) dbUpdates.due_date   = updates.dueDate;
    if (updates.priority  !== undefined) dbUpdates.priority   = updates.priority;
    if (updates.status    !== undefined) dbUpdates.status     = updates.status;
    if (updates.projectId !== undefined) dbUpdates.project_id = updates.projectId;

    const { error } = await supabase.from('action_items').update(dbUpdates).eq('id', id);

    if (error) {
      set({ error: error.message });
      get().fetchItems();
    }
  },

  deleteItem: async (id) => {
    set((s) => ({ items: s.items.filter((item) => item.id !== id) }));

    const { error } = await supabase.from('action_items').delete().eq('id', id);

    if (error) {
      set({ error: error.message });
      get().fetchItems();
    }
  },
}));
