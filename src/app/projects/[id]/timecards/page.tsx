'use client';

import { use, useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { ProjectHeader } from '@/components/layout/ProjectHeader';
import { TimecardList } from '@/components/timecards/TimecardList';
import { useProjectsStore } from '@/stores/useProjectsStore';
import { slugify } from '@/lib/slugify';

export default function ProjectTimecardsPage({ params }: { params: Promise<{ id: string }> }) {
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
      <ProjectHeader name={p.name} color={p.color} client={p.client} phase={p.phase} dateRange={p.dateRange} projectId={projectId} archived={p.archived ?? false} />
      <div className="flex-1 overflow-y-auto px-10 py-6">
        <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
          {mounted && project?.salesforceId ? (
            <TimecardList projectId={projectId} salesforceId={project.salesforceId} />
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
