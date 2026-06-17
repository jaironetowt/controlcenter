'use client';

import { useState, useEffect } from 'react';
import { IconEye } from '@tabler/icons-react';
import { useSpaceStore } from '@/stores/useSpaceStore';

// ─── ReadOnlyBanner ─────────────────────────────────────────────────────────────
// Discreet strip shown at the top of the main content area whenever the user is
// viewing someone else's workspace (selectedSpace !== me.sub). Hidden otherwise.

export function ReadOnlyBanner() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const me            = useSpaceStore((s) => s.me);
  const spaces        = useSpaceStore((s) => s.spaces);
  const selectedSpace = useSpaceStore((s) => s.selectedSpace);

  if (!mounted || !me || selectedSpace == null) return null;

  const isOwnSpace = selectedSpace === me.sub;
  if (isOwnSpace) return null;

  const owner = spaces.find((s) => s.ownerSub === selectedSpace);
  const ownerEmail = owner?.ownerEmail ?? 'outro usuario';

  return (
    <div className="flex-shrink-0 flex items-center gap-2 px-4 py-1.5 bg-amber-50 border-b border-amber-200 text-[12px] text-amber-800">
      <IconEye size={14} className="flex-shrink-0" />
      <span>
        Visualizando o workspace de{' '}
        <span className="font-medium">{ownerEmail}</span>
        {' '}&mdash; somente leitura
      </span>
    </div>
  );
}
