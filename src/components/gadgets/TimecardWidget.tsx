'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IconClock } from '@tabler/icons-react';
import { useProjectsStore } from '@/stores/useProjectsStore';
import { buildSlugMap, projectSlugPath } from '@/lib/slugify';

const MOCK_KEY = 'tc-data-mosaic';
const MOCK_DATA = JSON.stringify([
  { resourceName: 'John Smith', assignment: 'Mosaic - John Smith', startDate: '2026-04-20', endDate: '2026-04-26', actualHours: 0, estimatedHours: 40 },
  { resourceName: 'Ana Lima',   assignment: 'Mosaic - Ana Lima',   startDate: '2026-04-27', endDate: '2026-04-30', actualHours: 0, estimatedHours: 24 },
]);

interface ProjectCount {
  projectId: string;
  projectName: string;
  count: number;
}

export function TimecardWidget() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Seed mock data for Mosaic if not already cached
    if (!localStorage.getItem(MOCK_KEY)) {
      localStorage.setItem(MOCK_KEY, MOCK_DATA);
    }
    setMounted(true);
  }, []);

  const projects = useProjectsStore((s) => s.projects);
  const slugMap = buildSlugMap(projects);

  if (!mounted) return null;

  // Include any project that has cached data (regardless of salesforceId in store)
  const rows: ProjectCount[] = projects
    .filter((p) => !p.archived)
    .map((p) => {
      const cached = localStorage.getItem(`tc-data-${p.id}`);
      const count  = cached ? (JSON.parse(cached) as unknown[]).length : 0;
      return { projectId: p.id, projectName: p.name, count };
    })
    .filter((r) => r.count > 0);

  const total = rows.reduce((sum, r) => sum + r.count, 0);

  const weekEnd = (() => {
    const d = new Date();
    d.setDate(d.getDate() + (6 - d.getDay() + 7) % 7);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  })();

  return (
    <>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-1">
            <IconClock size={15} className="text-orange-500" />
            <span className="text-[13px] font-semibold text-zinc-800">Missing Timecards</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5 ml-4">Week ending {weekEnd}</p>
        </div>
        {total > 0 && (
          <span className="text-[11px] font-medium bg-red-100 text-red-600 rounded-full px-2 py-0.5">
            {total}
          </span>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="text-[12px] text-zinc-400">No missing timecards</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {rows.map((r) => (
            <Link
              key={r.projectId}
              href={projectSlugPath(slugMap[r.projectId] ?? r.projectId, '/timecards')}
              className="flex items-center justify-between group"
            >
              <span className="text-[12px] text-zinc-600 group-hover:text-zinc-900 truncate transition-colors">
                {r.projectName}
              </span>
              <span className="text-[11px] font-medium text-red-600 shrink-0 px-2 py-0.5">
                {r.count}
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
