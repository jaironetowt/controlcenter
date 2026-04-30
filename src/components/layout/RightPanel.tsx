'use client';

import { useState, useEffect } from 'react';
import { create } from 'zustand';
import {
  IconLayoutSidebarRightCollapse,
  IconLayoutSidebarRightExpand,
  IconFlame,
} from '@tabler/icons-react';
import { QuickNotes } from '@/components/gadgets/QuickNotes';
import { Upcoming } from '@/components/gadgets/Upcoming';
import { GadgetSlot } from '@/components/gadgets/GadgetSlot';
import { TimecardWidget } from '@/components/gadgets/TimecardWidget';

// ─── Zustand store ────────────────────────────────────────────────────────────
interface RightPanelStore {
  collapsed: boolean;
  toggle: () => void;
}

export const useRightPanelStore = create<RightPanelStore>()((set) => ({
  collapsed: false,
  toggle: () => set((s) => ({ collapsed: !s.collapsed })),
}));

// ─── Sub-components ───────────────────────────────────────────────────────────
function GadgetCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-orange-300 p-4">
      {children}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function RightPanel() {
  const [mounted, setMounted] = useState(false);
  const [flameHovered, setFlameHovered] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const { collapsed, toggle } = useRightPanelStore();

  // Before hydration, always render expanded (matches SSR default)
  const isCollapsed = mounted ? collapsed : false;

  // Only apply transition after mount to avoid flash
  const transitionClass = mounted ? 'transition-[width] duration-200 ease-in-out' : '';

  return (
    <aside
      className={`h-full flex-shrink-0 overflow-hidden relative ${transitionClass} ${isCollapsed ? 'bg-transparent border-none' : 'bg-zinc-200 border-l border-zinc-300'}`}
      style={{ width: isCollapsed ? 0 : 280 }}
    >
      {isCollapsed ? (
        <button
          onClick={toggle}
          onMouseEnter={() => setFlameHovered(true)}
          onMouseLeave={() => setFlameHovered(false)}
          className="fixed top-6 right-0 z-10 bg-orange-600 border border-r-0 border-orange-600 rounded-l-lg p-1.5 shadow-sm focus:outline-none"
          aria-label="Expand right panel"
        >
          <IconFlame size={18} className="text-white" />
        </button>
      ) : (
        <button
          onClick={toggle}
          className="absolute top-3 right-2 z-10 text-zinc-500 hover:text-zinc-900 transition-colors"
          aria-label="Collapse right panel"
        >
          <IconLayoutSidebarRightCollapse size={16} />
        </button>
      )}

      {isCollapsed && flameHovered && (
        <div className="fixed top-2 right-12 z-50 bg-orange-600 rounded-xl px-4 py-3 shadow-lg pointer-events-none">
          <h2 className="flex items-center gap-1.5 text-[18px] font-black text-white tracking-tight leading-none">
            <IconFlame size={18} className="text-orange-200" />
            Hot Desk
          </h2>
          <p className="text-[11px] text-orange-200 mt-1">What needs your attention right now</p>
        </div>
      )}

      <div className="flex flex-col min-w-[252px] h-full overflow-hidden">
        <div className="flex items-center px-4 py-4 flex-shrink-0">
          <div>
            <h2 className="flex items-center gap-1.5 text-[20px] font-black text-orange-600 tracking-tight">
              <IconFlame size={20} className="text-orange-500" />
              Hot Desk
            </h2>
            <p className="text-[11px] text-zinc-500 mt-1">What needs your attention right now</p>
          </div>
        </div>
<div className="flex flex-col gap-3 px-4 py-4 overflow-y-auto">
          <GadgetCard>
            <QuickNotes />
          </GadgetCard>

          <GadgetCard>
            <Upcoming />
          </GadgetCard>

          <GadgetCard>
            <TimecardWidget />
          </GadgetCard>

          <GadgetSlot />
        </div>
      </div>
    </aside>
  );
}
