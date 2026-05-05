'use client';

import { use, useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { ProjectHeader } from '@/components/layout/ProjectHeader';
import { StakeholderList } from '@/components/stakeholders/StakeholderList';
import { InfluenceGrid } from '@/components/stakeholders/InfluenceGrid';
import { useProjectsStore } from '@/stores/useProjectsStore';
import { buildSlugMap } from '@/lib/slugify';
import { useFeaturesStore, DEFAULT_FEATURES } from '@/stores/useFeaturesStore';

export default function ProjectStakeholdersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const storeProjects   = useProjectsStore((s) => s.projects);
  const projectsLoading = useProjectsStore((s) => s.loading);
  const slugMap = mounted ? buildSlugMap(storeProjects) : {};
  const matchedId = mounted ? (Object.entries(slugMap).find(([, s]) => s === id)?.[0] ?? id) : null;
  const project = mounted ? storeProjects.find((p) => p.id === matchedId) ?? null : null;

  const rawFeatures = useFeaturesStore((s) => s.features);
  const features = mounted ? rawFeatures : DEFAULT_FEATURES;

  if (mounted && !projectsLoading && !project) return notFound();
  const p = project ?? { id, name: '…', color: '#3E77FC', client: '…', phase: '…', dateRange: '…', archived: false };
  const projectId = p.id;

  return (
    <>
      <ProjectHeader name={p.name} color={p.color} client={p.client} phase={p.phase} dateRange={p.dateRange} projectId={projectId} archived={p.archived} />
      <div className="flex-1 overflow-y-auto px-10 py-6">
        {mounted && (
          <>
            <StakeholderList projectId={projectId} />
            {features.stakeholderGrid && <InfluenceGrid projectId={projectId} />}
          </>
        )}
      </div>
    </>
  );
}
