'use client';

import { useState } from 'react';
import { Tooltip, Popover } from '@mantine/core';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────────

export type HealthStatus = 'green' | 'yellow' | 'red';

interface ProjectHealthStore {
  statuses: Record<string, HealthStatus>;
  setStatus: (projectId: string, status: HealthStatus) => void;
}

// ─── Color map ────────────────────────────────────────────────────────────────

const COLOR_MAP: Record<HealthStatus, string> = {
  green:  '#22C55E',
  yellow: '#EAB308',
  red:    '#EF4444',
};

const TOOLTIP_MAP: Record<HealthStatus, string> = {
  green:  'External: On Track',
  yellow: 'External: At Risk',
  red:    'External: Off Track',
};

const STATUS_OPTIONS: HealthStatus[] = ['green', 'yellow', 'red'];

// ─── Zustand store ────────────────────────────────────────────────────────────

export const useProjectHealthStore = create<ProjectHealthStore>()(
  persist(
    (set) => ({
      statuses: {},
      setStatus: (projectId, status) =>
        set((s) => ({ statuses: { ...s.statuses, [projectId]: status } })),
    }),
    { name: 'cc-project-health' },
  ),
);

// ─── Component ────────────────────────────────────────────────────────────────

interface ExternalHealthBadgeProps {
  projectId: string;
}

export function ExternalHealthBadge({ projectId }: ExternalHealthBadgeProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const statuses = useProjectHealthStore((s) => s.statuses);
  const setStatus = useProjectHealthStore((s) => s.setStatus);

  const status: HealthStatus = statuses[projectId] ?? 'green';
  const color = COLOR_MAP[status];
  const tooltipLabel = TOOLTIP_MAP[status];

  function handleSelect(next: HealthStatus) {
    setStatus(projectId, next);
    setPopoverOpen(false);
  }

  return (
    <Popover
      opened={popoverOpen}
      onClose={() => setPopoverOpen(false)}
      position="bottom-end"
      withArrow
      shadow="md"
      withinPortal
    >
      <Popover.Target>
        <Tooltip label={tooltipLabel} withArrow position="top" withinPortal>
          {/* Wrapper div required — Popover.Target needs a single child */}
          <div
            role="button"
            tabIndex={0}
            aria-label={tooltipLabel}
            onClick={() => setPopoverOpen((o) => !o)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setPopoverOpen((o) => !o);
              }
            }}
            className="relative flex items-center justify-center cursor-pointer flex-shrink-0"
            style={{ width: 18, height: 18 }}
          >
            {/* Circle */}
            <span
              className="rounded-full block"
              style={{ width: 14, height: 14, backgroundColor: color }}
            />
            {/* Label */}
            <span
              className="absolute inset-0 flex items-center justify-center font-bold text-white select-none"
              style={{ fontSize: 8, lineHeight: 1, paddingTop: 1 }}
              aria-hidden
            >
              E
            </span>
          </div>
        </Tooltip>
      </Popover.Target>

      <Popover.Dropdown>
        <div className="flex flex-col gap-2 p-1">
          <p className="text-[11px] font-medium text-zinc-500 px-1 mb-0.5">External health</p>
          <div className="flex items-center gap-2">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option}
                aria-label={TOOLTIP_MAP[option]}
                onClick={() => handleSelect(option)}
                className="rounded-full border-2 transition-all hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                style={{
                  width: 20,
                  height: 20,
                  backgroundColor: COLOR_MAP[option],
                  borderColor: status === option ? 'rgba(0,0,0,0.35)' : 'transparent',
                }}
              />
            ))}
          </div>
        </div>
      </Popover.Dropdown>
    </Popover>
  );
}
