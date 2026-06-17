'use client';

import { use, useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { IconChartBar } from '@tabler/icons-react';
import { ProjectHeader } from '@/components/layout/ProjectHeader';
import { useProjectsStore } from '@/stores/useProjectsStore';
import { buildSlugMap } from '@/lib/slugify';

// NOTE: Passive-portal model — the portal no longer talks to live Jira. Sprint /
// velocity metrics are collected and stored by Claude/cowork. The fetch-driven
// Sprint board and velocity chart (which called the now-deleted /api/pm/jira/*
// routes) were removed; the route is kept so sidebar links don't break.
// Re-implementation tracked in CC-60.

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectSprintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const storeProjects   = useProjectsStore((s) => s.projects);
  const projectsLoading = useProjectsStore((s) => s.loading);

  const slugMap   = mounted ? buildSlugMap(storeProjects) : {};
  const matchedId = mounted ? (Object.entries(slugMap).find(([, s]) => s === id)?.[0] ?? id) : null;
  const project   = mounted ? storeProjects.find((p) => p.id === matchedId) ?? null : null;

  if (mounted && !projectsLoading && !project) return notFound();
  const p         = project ?? { id, name: '…', color: '#3E77FC', client: '…', phase: '…', dateRange: '…', archived: false };
  const projectId = p.id;

  return (
    <>
      <ProjectHeader name={p.name} color={p.color} client={p.client} phase={p.phase} dateRange={p.dateRange} projectId={projectId} archived={p.archived ?? false} />

      <div className="flex-1 overflow-y-auto px-10 py-6">
        <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <IconChartBar size={32} className="text-zinc-300" />
            <div>
              <p className="text-[13px] text-zinc-600 font-medium">Indisponível nesta versão</p>
              <p className="text-[12px] text-zinc-400 mt-1 max-w-sm">
                As métricas de sprint são gerenciadas pelo Claude (portal passivo).
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
