'use client';

import { IconStack2 } from '@tabler/icons-react';

// NOTE: Passive-portal model — the portal no longer talks to live Salesforce.
// Timecard data is collected and stored by Claude/cowork. The fetch-driven list
// (which called the now-deleted /api/salesforce/timecards route) was removed; the
// component is kept so the timecards route doesn't break. Tracked in CC-60.

interface TimecardListProps {
  projectId: string;
  salesforceId: string;
}

export function TimecardList(_props: TimecardListProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
      <IconStack2 size={32} className="text-zinc-300" />
      <div>
        <p className="text-[13px] text-zinc-600 font-medium">Indisponível nesta versão</p>
        <p className="text-[12px] text-zinc-400 mt-1 max-w-sm">
          Os timecards são gerenciados pelo Claude (portal passivo).
        </p>
      </div>
    </div>
  );
}
