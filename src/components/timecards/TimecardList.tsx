'use client';

import { useState, useEffect, useCallback } from 'react';
import { IconRefresh } from '@tabler/icons-react';
import { useProjectsStore } from '@/stores/useProjectsStore';

interface Timecard {
  resourceName: string;
  assignment: string;
  startDate: string | null;
  endDate: string | null;
  actualHours: number | null;
  estimatedHours: number | null;
}

interface TimecardListProps {
  projectId: string;
  salesforceId: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
}

const DATA_KEY = (id: string) => `tc-data-${id}`;
const TS_KEY   = (id: string) => `tc-ts-${id}`;
const THREE_HOURS = 3 * 60 * 60 * 1000;

export function TimecardList({ projectId, salesforceId }: TimecardListProps) {
  const updateProject = useProjectsStore((s) => s.updateProject);
  const [timecards, setTimecards] = useState<Timecard[]>([]);
  const [loading, setLoading]     = useState(() =>
    typeof window === 'undefined' ? false : !localStorage.getItem(TS_KEY(projectId))
  );
  const [error, setError]         = useState('');
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchTimecards = useCallback(async (force = false) => {
    const ts = Number(localStorage.getItem(TS_KEY(projectId)) ?? 0);
    if (!force && Date.now() - ts < THREE_HOURS) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/salesforce/timecards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salesforceId }),
      });
      const data = await res.json() as { timecards?: Timecard[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Failed to fetch timecards');
      const list = data.timecards ?? [];
      setTimecards(list);
      setLastFetched(new Date());
      localStorage.setItem(DATA_KEY(projectId), JSON.stringify(list));
      localStorage.setItem(TS_KEY(projectId), String(Date.now()));
      updateProject(projectId, { timecardCount: list.length, timecardCountAt: Date.now() });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [salesforceId, projectId, updateProject]);

  useEffect(() => {
    // Load from cache immediately
    const cached = localStorage.getItem(DATA_KEY(projectId));
    const ts     = Number(localStorage.getItem(TS_KEY(projectId)) ?? 0);
    if (cached) {
      setTimecards(JSON.parse(cached) as Timecard[]);
      setLastFetched(new Date(ts));
    }
    // Fetch only if stale
    void fetchTimecards();
  }, [projectId, fetchTimecards]);

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-[14px] font-semibold text-zinc-800">Missing Timecards</span>
          {timecards.length > 0 && (
            <span className="ml-2 text-[12px] text-zinc-400">{timecards.length} item{timecards.length !== 1 ? 's' : ''}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {lastFetched && (
            <span className="text-[11px] text-zinc-400">
              Updated {lastFetched.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={() => void fetchTimecards(true)}
            disabled={loading}
            className="p-1 text-zinc-400 hover:text-zinc-700 transition-colors rounded disabled:opacity-40"
            aria-label="Refresh"
          >
            <IconRefresh size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="text-[12px] text-red-500 py-3">{error}</div>
      )}

      {!error && timecards.length === 0 && (
        <div className="flex items-center justify-center py-12 text-[13px] text-zinc-400">
          {loading ? 'Loading…' : 'No missing timecards'}
        </div>
      )}

      {timecards.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wide pb-2 pr-4">Resource</th>
                <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wide pb-2 pr-4">Assignment</th>
                <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wide pb-2 pr-4">Start Date</th>
                <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wide pb-2 pr-4">End Date</th>
                <th className="text-right text-[11px] font-medium text-zinc-500 uppercase tracking-wide pb-2 pr-4">Est. Hours</th>
                <th className="text-right text-[11px] font-medium text-zinc-500 uppercase tracking-wide pb-2">Actual Hours</th>
              </tr>
            </thead>
            <tbody>
              {timecards.map((tc, i) => (
                <tr key={i} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                  <td className="py-2.5 pr-4">
                    <span className="text-[13px] text-zinc-800">{tc.resourceName}</span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className="text-[13px] text-zinc-500">{tc.assignment}</span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className="text-[13px] text-zinc-600">{tc.startDate ? formatDate(tc.startDate) : '—'}</span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className="text-[13px] text-zinc-600">{tc.endDate ? formatDate(tc.endDate) : '—'}</span>
                  </td>
                  <td className="py-2.5 pr-4 text-right">
                    <span className="text-[13px] text-zinc-600">{tc.estimatedHours?.toFixed(2) ?? '—'}</span>
                  </td>
                  <td className="py-2.5 text-right">
                    <span className="text-[13px] text-red-500 font-medium">{tc.actualHours?.toFixed(2) ?? '0.00'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
