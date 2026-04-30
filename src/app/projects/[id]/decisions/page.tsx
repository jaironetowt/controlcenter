'use client';

import { use, useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { ProjectHeader } from '@/components/layout/ProjectHeader';
import { DecisionLog } from '@/components/decisions/DecisionLog';
import { useProjectsStore } from '@/stores/useProjectsStore';

export default function ProjectDecisionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const storeProjects = useProjectsStore((s) => s.projects);
  const project = mounted ? storeProjects.find((p) => p.id === id) : null;

  if (mounted && !project) return notFound();
  const p = project ?? { id, name: '…', color: '#3E77FC', client: '…', phase: '…', dateRange: '…', archived: false };

  return (
    <>
      <ProjectHeader name={p.name} color={p.color} client={p.client} phase={p.phase} dateRange={p.dateRange} projectId={id} archived={p.archived} />
      <div className="flex-1 overflow-y-auto pl-10 pr-6 py-6">
        {mounted && <DecisionLog projectId={id} />}
      </div>
    </>
  );
}
