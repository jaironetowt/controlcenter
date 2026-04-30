'use client';

import { ExternalHealthBadge } from '@/components/ui/ExternalHealthBadge';
import { InternalHealthBadge } from '@/components/ui/InternalHealthBadge';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProjectHeaderProps {
  name: string;
  color: string;
  client: string;
  phase: string;
  dateRange: string;
  projectId: string;
  archived?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProjectHeader({
  name,
  color,
  client,
  phase,
  dateRange,
  projectId,
  archived,
}: ProjectHeaderProps) {
  return (
    <header className="flex items-center gap-4 pl-10 pr-14 py-4 border-b border-zinc-200 bg-white flex-shrink-0">
      <span
        className="w-1 h-8 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
        aria-hidden
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[20px] font-semibold text-zinc-900 truncate">{name}</p>
          {archived && (
            <span className="flex-shrink-0 text-[11px] font-medium text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">
              Archived
            </span>
          )}
        </div>
        <p className="text-[12px] text-zinc-500 mt-0.5">
          {client} · {phase} · {dateRange}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[9px] font-medium text-zinc-400 uppercase tracking-wider mr-0.5">Status</span>
        <ExternalHealthBadge projectId={projectId} />
        <InternalHealthBadge />
      </div>
    </header>
  );
}
