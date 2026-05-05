'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  IconAlertTriangle,
  IconNotes,
  IconChecklist,
  IconUsers,
  IconStack2,
  IconChevronRight,
} from '@tabler/icons-react';
import { ProjectHeader } from '@/components/layout/ProjectHeader';
import { useProjectsStore, Project } from '@/stores/useProjectsStore';
import { buildSlugMap, projectSlugPath } from '@/lib/slugify';
import { IconChartBar } from '@tabler/icons-react';
import { useRisksStore } from '@/stores/useRisksStore';
import { useDecisionsStore } from '@/stores/useDecisionsStore';
import { useActionItemsStore } from '@/stores/useActionItemsStore';
import { useStakeholdersStore } from '@/stores/useStakeholdersStore';
import { usePMToolStore } from '@/stores/usePMToolStore';
import type { PMProjectData } from '@/integrations/types';

// ─── Module card ──────────────────────────────────────────────────────────────

interface ModuleCardProps {
  icon: React.ReactNode;
  label: string;
  count: number | string;
  sub: string;
  href: string;
  color: string;
}

function ModuleCard({ icon, label, count, sub, href, color }: ModuleCardProps) {
  return (
    <Link
      href={href}
      className="group bg-white rounded-xl border border-zinc-200 p-5 hover:shadow-md transition-all flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: color + '18' }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
        <IconChevronRight
          size={16}
          className="text-zinc-300 group-hover:text-zinc-500 transition-colors"
        />
      </div>
      <div>
        <p className="text-[13px] text-zinc-500 font-medium">{label}</p>
        <p className="text-[28px] font-semibold text-zinc-900 leading-none mt-0.5">{count}</p>
        <p className="text-[12px] text-zinc-400 mt-1">{sub}</p>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const storeProjects     = useProjectsStore((s) => s.projects);
  const projectsLoading   = useProjectsStore((s) => s.loading);
  const storeRisks        = useRisksStore((s) => s.risks);
  const storeDecisions    = useDecisionsStore((s) => s.decisions);
  const storeItems        = useActionItemsStore((s) => s.items);
  const storeStakeholders = useStakeholdersStore((s) => s.stakeholders);
  const pmConfigs         = usePMToolStore((s) => s.configs);

  const slugMap = mounted ? buildSlugMap(storeProjects) : {};
  const matchedId = mounted ? (Object.entries(slugMap).find(([, s]) => s === id)?.[0] ?? id) : null;
  const project = mounted ? storeProjects.find((p) => p.id === matchedId) ?? null : null;

  if (mounted && !projectsLoading && !project) return notFound();

  const p: Project = project ?? { id, name: '…', color: '#3E77FC', client: '…', phase: '…', dateRange: '…', archived: false, createdAt: 0 };
  const projectId = p.id;
  const projectSlug = slugMap[p.id] ?? id;

  const openRisks    = mounted ? storeRisks.filter((r) => r.projectId === projectId && r.status === 'Open').length : 0;
  const totalRisks   = mounted ? storeRisks.filter((r) => r.projectId === projectId).length : 0;
  const decisions    = mounted ? storeDecisions.filter((d) => d.projectId === projectId).length : 0;
  const openActions  = mounted ? storeItems.filter((i) => i.projectId === projectId && i.status !== 'Done').length : 0;
  const totalActions = mounted ? storeItems.filter((i) => i.projectId === projectId).length : 0;
  const stakeholders = mounted ? storeStakeholders.filter((s) => s.projectId === projectId).length : 0;

  const jiraConfig     = pmConfigs[projectId] ?? null;
  const sprintCache    = mounted ? (() => {
    try {
      const raw = localStorage.getItem(`sprint-data-${projectId}`);
      if (!raw) return null;
      return JSON.parse(raw) as PMProjectData;
    } catch { return null; }
  })() : null;
  const doneStatuses   = new Set(['done', 'closed', 'resolved']);
  const spCommitted    = sprintCache?.issues.reduce((s, i) => s + (i.storyPoints ?? 0), 0) ?? 0;
  const spDone         = sprintCache?.issues.filter((i) => doneStatuses.has(i.status.toLowerCase())).reduce((s, i) => s + (i.storyPoints ?? 0), 0) ?? 0;
  const spPct          = spCommitted > 0 ? Math.round((spDone / spCommitted) * 100) : 0;

  const updateProject  = useProjectsStore((s) => s.updateProject);
  const timecardCount  = mounted ? (project?.timecardCount ?? 0) : 0;
  const timecardCountAt = project?.timecardCountAt ?? 0;

  useEffect(() => {
    if (!mounted || !project?.salesforceId) return;
    const stale = Date.now() - timecardCountAt > 3 * 60 * 60 * 1000;
    if (!stale) return;

    void fetch('/api/salesforce/timecards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ salesforceId: project.salesforceId }),
    })
      .then((r) => r.json())
      .then((data: { timecards?: unknown[] }) => {
        const count = data.timecards?.length ?? 0;
        updateProject(projectId, { timecardCount: count, timecardCountAt: Date.now() });
      })
      .catch(() => undefined);
  }, [mounted, id, project?.salesforceId, timecardCountAt, updateProject]);

  return (
    <>
      <ProjectHeader name={p.name} color={p.color} client={p.client} phase={p.phase} dateRange={p.dateRange} projectId={projectId} archived={p.archived} />

      {/* Module grid */}
      <div className="flex-1 overflow-y-auto px-10 py-8">
        <p className="text-[12px] font-medium text-zinc-400 uppercase tracking-wider mb-4">Modules</p>
        <div className="grid grid-cols-2 gap-4 max-w-2xl">
          <ModuleCard
            icon={<IconAlertTriangle size={18} />}
            label="Risks"
            count={openRisks}
            sub={`${totalRisks} total · ${openRisks} open`}
            href={projectSlugPath(projectSlug, '/risks')}
            color="#EF4444"
          />
          <ModuleCard
            icon={<IconNotes size={18} />}
            label="Decisions"
            count={decisions}
            sub="registered decisions"
            href={projectSlugPath(projectSlug, '/decisions')}
            color="#8B56FC"
          />
          <ModuleCard
            icon={<IconChecklist size={18} />}
            label="Action Items"
            count={openActions}
            sub={`${totalActions} total · ${openActions} open`}
            href={projectSlugPath(projectSlug, '/actions')}
            color="#3E77FC"
          />
          <ModuleCard
            icon={<IconUsers size={18} />}
            label="Stakeholders"
            count={stakeholders}
            sub="mapped stakeholders"
            href={projectSlugPath(projectSlug, '/stakeholders')}
            color="#F59E0B"
          />
          {jiraConfig && (
            <ModuleCard
              icon={<IconChartBar size={18} />}
              label="Metrics"
              count={sprintCache?.activeSprint && spCommitted > 0 ? `${spDone} / ${spCommitted}` : spDone}
              sub={sprintCache?.activeSprint && spCommitted > 0 ? `${spPct}% SP done` : 'Jira connected'}
              href={projectSlugPath(projectSlug, '/metrics')}
              color="#6366F1"
            />
          )}
          {p.salesforceId && (
            <ModuleCard
              icon={<IconStack2 size={18} />}
              label="Timecards"
              count={timecardCount}
              sub="missing timecards"
              href={projectSlugPath(projectSlug, '/timecards')}
              color="#06B6D4"
            />
          )}
        </div>
      </div>
    </>
  );
}
