'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  IconLayoutSidebarRightCollapse,
  IconLayoutSidebarRightExpand,
} from '@tabler/icons-react';
import { QuickNotes } from '@/components/gadgets/QuickNotes';
import { Upcoming } from '@/components/gadgets/Upcoming';
import { GadgetSlot } from '@/components/gadgets/GadgetSlot';

// ─── Zustand store ────────────────────────────────────────────────────────────
interface RightPanelStore {
  collapsed: boolean;
  toggle: () => void;
}

const useRightPanelStore = create<RightPanelStore>()(
  persist(
    (set) => ({
      collapsed: false,
      toggle: () => set((s) => ({ collapsed: !s.collapsed })),
    }),
    { name: 'cc-right-panel-collapsed' }
  )
);

// ─── Sub-components ───────────────────────────────────────────────────────────
function GadgetCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-4">
      {children}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function RightPanel() {
  const { collapsed, toggle } = useRightPanelStore();

  if (collapsed) {
    return (
      <aside
        className="h-full flex-shrink-0 bg-[#F4F4F5] border-l border-zinc-200 flex items-center justify-center transition-[width] duration-200 ease-in-out"
        style={{ width: 28 }}
      >
        <button
          onClick={toggle}
          className="text-zinc-500 hover:text-zinc-900 transition-colors"
          aria-label="Expand right panel"
        >
          <IconLayoutSidebarRightExpand size={16} />
        </button>
      </aside>
    );
  }

  return (
    <aside
      className="h-full flex-shrink-0 bg-[#F4F4F5] border-l border-zinc-200 overflow-y-auto transition-[width] duration-200 ease-in-out"
      style={{ width: 280 }}
    >
      {/* Toggle button at the top */}
      <div className="flex items-center justify-end px-3 pt-3 pb-1">
        <button
          onClick={toggle}
          className="text-zinc-500 hover:text-zinc-900 transition-colors"
          aria-label="Collapse right panel"
        >
          <IconLayoutSidebarRightCollapse size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-3 px-4 pb-4">
        <GadgetCard>
          <QuickNotes />
        </GadgetCard>

        <GadgetCard>
          <Upcoming />
        </GadgetCard>

        <GadgetSlot />
      </div>
    </aside>
  );
}
