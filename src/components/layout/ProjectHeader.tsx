'use client';

import { ExternalHealthBadge } from '@/components/ui/ExternalHealthBadge';
import { InternalHealthBadge } from '@/components/ui/InternalHealthBadge';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProjectHeaderProps {
  name: string;
  /** Project accent color for the left bar (any valid CSS color string) */
  color: string;
  client: string;
  phase: string;
  dateRange: string;
  projectId: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProjectHeader({
  name,
  color,
  client,
  phase,
  dateRange,
  projectId,
}: ProjectHeaderProps) {
  return (
    <header className="flex items-center gap-4 px-10 py-4 border-b border-zinc-200 bg-white flex-shrink-0">
      {/* Left accent bar */}
      <span
        className="w-1 h-8 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
        aria-hidden
      />

      {/* Project identity */}
      <div className="flex-1 min-w-0">
        <p className="text-xl font-bold text-zinc-900 truncate">{name}</p>
        <p className="text-[13px] text-zinc-500 mt-0.5">
          {client} · {phase} · {dateRange}
        </p>
      </div>

      {/* Health badges */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <ExternalHealthBadge projectId={projectId} />
        <InternalHealthBadge />
      </div>
    </header>
  );
}
