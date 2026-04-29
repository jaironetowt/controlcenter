'use client';

import { useState, useEffect } from 'react';
import { create } from 'zustand';
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

const useRightPanelStore = create<RightPanelStore>()((set) => ({
  collapsed: false,
  toggle: () => set((s) => ({ collapsed: !s.collapsed })),
}));

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
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const { collapsed, toggle } = useRightPanelStore();

  // Before hydration, always render expanded (matches SSR default)
  const isCollapsed = mounted ? collapsed : false;

  // Only apply transition after mount to avoid flash
  const transitionClass = mounted ? 'transition-[width] duration-200 ease-in-out' : '';

  return (
    <aside
      className={`h-full flex-shrink-0 overflow-hidden bg-[#F4F4F5] border-l border-zinc-200 relative ${transitionClass}`}
      style={{ width: isCollapsed ? 28 : 280 }}
    >
      <button
        onClick={toggle}
        className="absolute top-3 right-2 text-zinc-500 hover:text-zinc-900 transition-colors z-10"
        aria-label={isCollapsed ? 'Expand right panel' : 'Collapse right panel'}
      >
        {isCollapsed
          ? <IconLayoutSidebarRightExpand size={16} />
          : <IconLayoutSidebarRightCollapse size={16} />
        }
      </button>

      <div className="flex flex-col gap-3 pl-8 pr-4 pb-4 pt-10 min-w-[252px] overflow-y-auto">
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
