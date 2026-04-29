'use client';

import { Tooltip } from '@mantine/core';

// ─── Component ────────────────────────────────────────────────────────────────

// Phase 1: always green, read-only, no click interaction.
// Future phases will derive status from Risk Log and Action Items data.

export function InternalHealthBadge() {
  return (
    <Tooltip
      label="Internal: On Track (calculated)"
      withArrow
      position="top"
      withinPortal
    >
      <div
        className="relative flex items-center justify-center flex-shrink-0"
        style={{ width: 18, height: 18, opacity: 0.8 }}
        aria-label="Internal: On Track (calculated)"
      >
        {/* Circle */}
        <span
          className="rounded-full block"
          style={{ width: 14, height: 14, backgroundColor: '#22C55E' }}
        />
        {/* Label */}
        <span
          className="absolute inset-0 flex items-center justify-center font-bold text-white select-none"
          style={{ fontSize: 8, lineHeight: 1, paddingTop: 1 }}
          aria-hidden
        >
          I
        </span>
      </div>
    </Tooltip>
  );
}
