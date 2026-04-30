'use client';

import { useState, useEffect } from 'react';
import { Tooltip } from '@mantine/core';
import { useFeaturesStore } from '@/stores/useFeaturesStore';

export function InternalHealthBadge() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const rawEnabled = useFeaturesStore((s) => s.features.internalHealth);
  const enabled = mounted ? rawEnabled : true;

  if (!enabled) return null;

  return (
    <Tooltip label="Internal: On Track (calculated)" withArrow position="top" withinPortal>
      <div
        className="relative flex items-center justify-center flex-shrink-0"
        style={{ width: 22, height: 22, opacity: 0.85 }}
        aria-label="Internal: On Track (calculated)"
      >
        <span className="rounded-full block" style={{ width: 18, height: 18, backgroundColor: '#22C55E' }} />
        <span
          className="absolute inset-0 flex items-center justify-center font-bold text-white select-none"
          style={{ fontSize: 9, lineHeight: 1, paddingTop: 1 }}
          aria-hidden
        >
          I
        </span>
      </div>
    </Tooltip>
  );
}
