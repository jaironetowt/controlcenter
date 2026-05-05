'use client';

import { use, useState, useEffect, useCallback } from 'react';
import { notFound } from 'next/navigation';
import { Badge } from '@mantine/core';
import { IconRefresh, IconBrandJira, IconExternalLink } from '@tabler/icons-react';
import { ProjectHeader } from '@/components/layout/ProjectHeader';
import { useProjectsStore } from '@/stores/useProjectsStore';
import { usePMToolStore } from '@/stores/usePMToolStore';
import { buildSlugMap } from '@/lib/slugify';
import type { PMProjectData } from '@/integrations/types';

// ─── Cache keys ───────────────────────────────────────────────────────────────

const DATA_KEY = (id: string) => `sprint-data-${id}`;
const TS_KEY   = (id: string) => `sprint-ts-${id}`;
const THREE_HOURS = 3 * 60 * 60 * 1000;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function statusColor(status: string): string {
  const s = status.toLowerCase();
  if (s === 'done' || s === 'closed' || s === 'resolved') return 'green';
  if (s.includes('progress') || s.includes('review')) return 'blue';
  if (s.includes('block')) return 'red';
  return 'gray';
}

function priorityColor(priority: string | null): string {
  switch (priority) {
    case 'Highest': return 'red';
    case 'High':    return 'orange';
    case 'Medium':  return 'yellow';
    case 'Low':     return 'blue';
    case 'Lowest':  return 'gray';
    default:        return 'gray';
  }
}

// ─── Sprint Board ─────────────────────────────────────────────────────────────

interface SprintBoardProps {
  projectId: string;
  baseUrl: string;
  email: string;
  apiToken: string;
  projectKey: string;
}

function SprintBoard({ projectId, baseUrl, email, apiToken, projectKey }: SprintBoardProps) {
  const [data, setData]               = useState<PMProjectData | null>(null);
  const [loading, setLoading]         = useState(() =>
    typeof window === 'undefined' ? false : !localStorage.getItem(TS_KEY(projectId))
  );
  const [error, setError]             = useState('');
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchData = useCallback(async (force = false) => {
    const ts = Number(localStorage.getItem(TS_KEY(projectId)) ?? 0);
    if (!force && Date.now() - ts < THREE_HOURS) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/pm/jira/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseUrl, email, apiToken, projectKey }),
      });
      const json = await res.json() as PMProjectData & { error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Failed to fetch');
      setData(json);
      setLastFetched(new Date());
      localStorage.setItem(DATA_KEY(projectId), JSON.stringify(json));
      localStorage.setItem(TS_KEY(projectId), String(Date.now()));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [projectId, baseUrl, email, apiToken, projectKey]);

  useEffect(() => {
    const cached = localStorage.getItem(DATA_KEY(projectId));
    const ts     = Number(localStorage.getItem(TS_KEY(projectId)) ?? 0);
    if (cached) {
      setData(JSON.parse(cached) as PMProjectData);
      setLastFetched(new Date(ts));
    }
    void fetchData();
  }, [projectId, fetchData]);

  // ── KPI breakdown ──────────────────────────────────────────────────────────

  const issues = data?.issues ?? [];
  const doneStatuses = new Set(['done', 'closed', 'resolved']);
  const blockedStatuses = new Set(['block for development', 'block for testing', 'blocked']);

  const total     = issues.length;
  const done      = issues.filter((i) => doneStatuses.has(i.status.toLowerCase())).length;
  const blocked   = issues.filter((i) => blockedStatuses.has(i.status.toLowerCase())).length;
  const toDo      = issues.filter((i) => ['to do', 'assigned to development'].includes(i.status.toLowerCase())).length;
  const inProgress = total - done - blocked - toDo;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div>
          {data?.activeSprint ? (
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-semibold text-zinc-800">{data.activeSprint.name}</span>
                <Badge size="xs" color="blue" variant="light">Active</Badge>
              </div>
              <span className="text-[12px] text-zinc-400">
                {formatDate(data.activeSprint.startDate)} – {formatDate(data.activeSprint.endDate)}
              </span>
            </div>
          ) : (
            <span className="text-[14px] font-semibold text-zinc-800">
              {loading ? 'Loading…' : 'No active sprint'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {lastFetched && (
            <span className="text-[11px] text-zinc-400">
              Updated {lastFetched.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={() => void fetchData(true)}
            disabled={loading}
            className="p-1 text-zinc-400 hover:text-zinc-700 transition-colors rounded disabled:opacity-40"
            aria-label="Refresh"
          >
            <IconRefresh size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* KPI pills */}
      {total > 0 && (
        <div className="flex gap-3 mb-5">
          {[
            { label: 'Total',       value: total,      color: 'bg-zinc-100 text-zinc-700' },
            { label: 'Done',        value: done,       color: 'bg-green-50 text-green-700' },
            { label: 'In Progress', value: inProgress, color: 'bg-blue-50 text-blue-700'  },
            { label: 'To Do',       value: toDo,       color: 'bg-zinc-50 text-zinc-500'  },
            { label: 'Blocked',     value: blocked,    color: 'bg-red-50 text-red-600'    },
          ].map(({ label, value, color }) => (
            <div key={label} className={`flex flex-col items-center px-4 py-2 rounded-lg ${color}`}>
              <span className="text-[18px] font-bold leading-tight">{value}</span>
              <span className="text-[11px] font-medium">{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && <div className="text-[12px] text-red-500 py-3">{error}</div>}

      {/* Empty state */}
      {!error && total === 0 && (
        <div className="flex items-center justify-center py-12 text-[13px] text-zinc-400">
          {loading ? 'Loading…' : 'No issues found in the active sprint'}
        </div>
      )}

      {/* Issues table */}
      {total > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wide pb-2 pr-4 w-24">Key</th>
                <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wide pb-2 pr-4">Title</th>
                <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wide pb-2 pr-4 w-24">Type</th>
                <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wide pb-2 pr-4 w-32">Status</th>
                <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wide pb-2 pr-4 w-28">Priority</th>
                <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wide pb-2 w-36">Assignee</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr key={issue.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                  <td className="py-2.5 pr-4">
                    <a
                      href={issue.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-0.5 text-[12px] font-medium text-blue-600 hover:underline whitespace-nowrap"
                    >
                      {issue.key}
                      <IconExternalLink size={10} />
                    </a>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className="text-[13px] text-zinc-800">{issue.title}</span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className="text-[12px] text-zinc-500">{issue.type}</span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <Badge size="xs" color={statusColor(issue.status)} variant="light">
                      {issue.status}
                    </Badge>
                  </td>
                  <td className="py-2.5 pr-4">
                    {issue.priority ? (
                      <Badge size="xs" color={priorityColor(issue.priority)} variant="dot">
                        {issue.priority}
                      </Badge>
                    ) : (
                      <span className="text-[12px] text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="py-2.5">
                    <span className="text-[12px] text-zinc-500">{issue.assignee ?? '—'}</span>
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectSprintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const storeProjects   = useProjectsStore((s) => s.projects);
  const projectsLoading = useProjectsStore((s) => s.loading);
  const pmConfigs       = usePMToolStore((s) => s.configs);

  const slugMap   = mounted ? buildSlugMap(storeProjects) : {};
  const matchedId = mounted ? (Object.entries(slugMap).find(([, s]) => s === id)?.[0] ?? id) : null;
  const project   = mounted ? storeProjects.find((p) => p.id === matchedId) ?? null : null;

  if (mounted && !projectsLoading && !project) return notFound();
  const p         = project ?? { id, name: '…', color: '#3E77FC', client: '…', phase: '…', dateRange: '…', archived: false };
  const projectId = p.id;
  const jiraConfig = mounted ? (pmConfigs[projectId] ?? null) : null;

  return (
    <>
      <ProjectHeader name={p.name} color={p.color} client={p.client} phase={p.phase} dateRange={p.dateRange} projectId={projectId} archived={p.archived ?? false} />

      <div className="flex-1 overflow-y-auto px-10 py-6">
        <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
          {mounted && jiraConfig ? (
            <SprintBoard
              projectId={projectId}
              baseUrl={jiraConfig.baseUrl}
              email={jiraConfig.email}
              apiToken={jiraConfig.apiToken}
              projectKey={jiraConfig.projectKey}
            />
          ) : mounted ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <IconBrandJira size={32} className="text-zinc-300" />
              <div>
                <p className="text-[13px] text-zinc-500 font-medium">Jira not connected</p>
                <p className="text-[12px] text-zinc-400 mt-1">
                  Go to <strong>Settings → Integrations</strong> to connect your Jira project.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
