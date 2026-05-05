'use client';

import { use, useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { ProjectHeader } from '@/components/layout/ProjectHeader';
import { ActionItemList } from '@/components/actions/ActionItemList';
import { useProjectsStore } from '@/stores/useProjectsStore';
import { slugify } from '@/lib/slugify';

export default function ProjectActionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const storeProjects = useProjectsStore((s) => s.projects);
  const project = mounted ? storeProjects.find((p) => slugify(p.name) === id || p.id === id) : null;

  if (mounted && !project) return notFound();
  const p = project ?? { id, name: '…', color: '#3E77FC', client: '…', phase: '…', dateRange: '…', archived: false };
  const projectId = p.id;

  return (
    <>
      <ProjectHeader name={p.name} color={p.color} client={p.client} phase={p.phase} dateRange={p.dateRange} projectId={projectId} archived={p.archived} />
      <div className="flex-1 overflow-y-auto px-10 py-6">
        {mounted && <ActionItemList projectId={projectId} />}
      </div>
    </>
  );
}
