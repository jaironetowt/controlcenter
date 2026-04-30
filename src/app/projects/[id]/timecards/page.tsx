'use client';

import { use, useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { ProjectHeader } from '@/components/layout/ProjectHeader';
import { TimecardList } from '@/components/timecards/TimecardList';
import { useProjectsStore } from '@/stores/useProjectsStore';

export default function ProjectTimecardsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const storeProjects = useProjectsStore((s) => s.projects);
  const project = mounted ? storeProjects.find((p) => p.id === id) : null;

  if (mounted && !project) return notFound();
  const p = project ?? { id, name: '…', color: '#3E77FC', client: '…', phase: '…', dateRange: '…', archived: false };

  return (
    <>
      <ProjectHeader name={p.name} color={p.color} client={p.client} phase={p.phase} dateRange={p.dateRange} projectId={id} archived={p.archived ?? false} />
      <div className="flex-1 overflow-y-auto pl-10 pr-6 py-6">
        <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
          {mounted && project?.salesforceId ? (
            <TimecardList projectId={id} salesforceId={project.salesforceId} />
          ) : mounted ? (
            <div className="flex items-center justify-center py-12 text-[13px] text-zinc-400">
              This project is not linked to Salesforce. Create a new project using "Import from Salesforce" to enable this module.
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
