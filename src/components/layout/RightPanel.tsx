'use client';

import { useState, useEffect } from 'react';
import { create } from 'zustand';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  IconLayoutSidebarRightCollapse,
  IconFlame,
  IconGripVertical,
} from '@tabler/icons-react';
import { QuickNotes } from '@/components/gadgets/QuickNotes';
import { Upcoming } from '@/components/gadgets/Upcoming';
import { GadgetSlot } from '@/components/gadgets/GadgetSlot';
import { TimecardWidget } from '@/components/gadgets/TimecardWidget';
import { UrgentActions } from '@/components/gadgets/UrgentActions';

// ─── Zustand store ────────────────────────────────────────────────────────────

interface RightPanelStore {
  collapsed: boolean;
  toggle: () => void;
}

export const useRightPanelStore = create<RightPanelStore>()((set) => ({
  collapsed: false,
  toggle: () => set((s) => ({ collapsed: !s.collapsed })),
}));

// ─── Gadget registry ──────────────────────────────────────────────────────────

const GADGETS: Record<string, React.ReactNode> = {
  'quick-notes':    <QuickNotes />,
  'upcoming':       <Upcoming />,
  'urgent-actions': <UrgentActions />,
  'timecards':      <TimecardWidget />,
};

const DEFAULT_ORDER = ['quick-notes', 'upcoming', 'urgent-actions', 'timecards'];
const ORDER_KEY = 'hd-gadget-order';

function loadOrder(): string[] {
  try {
    const stored = localStorage.getItem(ORDER_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as string[];
      // ensure all gadgets present (new ones get appended)
      const merged = [...parsed.filter((id) => id in GADGETS)];
      DEFAULT_ORDER.forEach((id) => { if (!merged.includes(id)) merged.push(id); });
      return merged;
    }
  } catch { /* ignore */ }
  return DEFAULT_ORDER;
}

// ─── Sortable card ────────────────────────────────────────────────────────────

function SortableGadgetCard({ id }: { id: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative bg-white rounded-xl border border-orange-300 p-4">
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 p-0.5 rounded text-zinc-300 opacity-0 group-hover:opacity-100 hover:text-zinc-500 transition-all cursor-grab active:cursor-grabbing touch-none"
        tabIndex={-1}
        aria-label="Drag to reorder"
      >
        <IconGripVertical size={14} />
      </button>
      {GADGETS[id]}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RightPanel() {
  const [mounted, setMounted]           = useState(false);
  const [flameHovered, setFlameHovered] = useState(false);
  const [order, setOrder]               = useState(DEFAULT_ORDER);

  useEffect(() => {
    setOrder(loadOrder());
    setMounted(true);
  }, []);

  const { collapsed, toggle } = useRightPanelStore();
  const isCollapsed   = mounted ? collapsed : false;
  const transitionCls = mounted ? 'transition-[width] duration-200 ease-in-out' : '';

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = order.indexOf(String(active.id));
    const newIndex = order.indexOf(String(over.id));
    const next = arrayMove(order, oldIndex, newIndex);
    setOrder(next);
    localStorage.setItem(ORDER_KEY, JSON.stringify(next));
  }

  return (
    <aside
      className={`h-full flex-shrink-0 overflow-hidden relative ${transitionCls} ${
        isCollapsed ? 'bg-transparent border-none' : 'bg-zinc-200 border-l border-zinc-300'
      }`}
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
        {/* Header */}
        <div className="flex items-center px-4 py-4 flex-shrink-0">
          <div>
            <h2 className="flex items-center gap-1.5 text-[20px] font-black text-orange-600 tracking-tight">
              <IconFlame size={20} className="text-orange-500" />
              Hot Desk
            </h2>
            <p className="text-[11px] text-zinc-500 mt-1">What needs your attention right now</p>
          </div>
        </div>

        {/* Sortable gadgets */}
        <div className="flex flex-col gap-3 px-4 py-4 overflow-y-auto">
          {mounted ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={order} strategy={verticalListSortingStrategy}>
                {order.map((id) => (
                  <SortableGadgetCard key={id} id={id} />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            DEFAULT_ORDER.map((id) => (
              <div key={id} className="bg-white rounded-xl border border-orange-300 p-4">
                {GADGETS[id]}
              </div>
            ))
          )}

          <GadgetSlot />
        </div>
      </div>
    </aside>
  );
}
