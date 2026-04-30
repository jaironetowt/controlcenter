'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { IconBolt } from '@tabler/icons-react';
import { QuickActions } from './QuickActions';
import { useRightPanelStore } from '@/components/layout/RightPanel';

const PANEL_WIDTH = 280;
const FAB_MARGIN  = 24;

export function QuickActionsFAB() {
  const [open, setOpen]         = useState(false);
  const [mounted, setMounted]   = useState(false);
  const [hovered, setHovered]   = useState(false);
  const containerRef            = useRef<HTMLDivElement>(null);
  const panelCollapsed          = useRightPanelStore((s) => s.collapsed);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (!containerRef.current) return;
      const rect   = containerRef.current.getBoundingClientRect();
      const shadow = 36;
      const outside =
        e.clientX < rect.left   - shadow ||
        e.clientX > rect.right  + shadow ||
        e.clientY < rect.top    - shadow ||
        e.clientY > rect.bottom + shadow;
      if (outside) setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  if (!mounted) return null;

  const rightOffset = (panelCollapsed ? 0 : PANEL_WIDTH) + FAB_MARGIN;

  return createPortal(
    <>
      <div
        ref={containerRef}
        className="fixed bottom-6 z-50 flex flex-col items-end gap-3 transition-[right] duration-200 ease-in-out"
        style={{ right: rightOffset }}
      >
        {/* Floating panel */}
        {open && (
          <div className="bg-white rounded-2xl border border-orange-200 shadow-2xl p-4 w-[280px] min-h-[320px]">
            <QuickActions />
          </div>
        )}

        {/* FAB button */}
        <div className="relative flex-shrink-0">
          {!open && (
            <>
              <span
                className="absolute inset-0 rounded-full bg-orange-400 animate-ping"
                style={{ animationDuration: '2s', opacity: 0.25 }}
              />
              <span
                className="absolute inset-0 rounded-full bg-orange-300 animate-ping"
                style={{ animationDuration: '2s', animationDelay: '0.6s', opacity: 0.12 }}
              />
            </>
          )}
          {hovered && !open && (
            <div className="absolute bottom-0 right-14 pointer-events-none bg-orange-600 rounded-xl px-4 py-3 shadow-lg whitespace-nowrap">
              <h2 className="flex items-center gap-1.5 text-[16px] font-black text-white tracking-tight leading-none">
                <IconBolt size={16} className="text-orange-200" />
                Quick Actions
              </h2>
              <p className="text-[11px] text-orange-200 mt-1">Capture riscos, action items e alertas</p>
            </div>
          )}
          <button
            onClick={() => setOpen((o) => !o)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={`relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-200 focus:outline-none ${
              open
                ? 'bg-zinc-800 text-white shadow-zinc-400/40'
                : 'bg-orange-500 text-white shadow-orange-400/50 hover:bg-orange-600 hover:scale-105'
            }`}
            aria-label="Quick Actions"
          >
            <IconBolt size={22} className={open ? 'rotate-12' : ''} />
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}
