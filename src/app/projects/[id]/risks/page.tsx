'use client';

import { use, useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { RightPanel } from '@/components/layout/RightPanel';
import { ProjectHeader } from '@/components/layout/ProjectHeader';
import { RiskLog } from '@/components/risks/RiskLog';
import { RiskMatrix } from '@/components/risks/RiskMatrix';
import { useProjectsStore } from '@/stores/useProjectsStore';
import { useFeaturesStore, DEFAULT_FEATURES } from '@/stores/useFeaturesStore';

export default function ProjectRisksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const storeProjects = useProjectsStore((s) => s.projects);
  const project = mounted ? storeProjects.find((p) => p.id === id && !p.archived) : null;

  const rawFeatures = useFeaturesStore((s) => s.features);
  const features = mounted ? rawFeatures : DEFAULT_FEATURES;

  if (mounted && !project) return notFound();
  const p = project ?? { id, name: '…', color: '#3E77FC', client: '…', phase: '…', dateRange: '…' };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F4F5]">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <ProjectHeader name={p.name} color={p.color} client={p.client} phase={p.phase} dateRange={p.dateRange} projectId={id} />
        <div className="flex-1 overflow-y-auto pl-10 pr-6 py-6">
          {mounted && (
            <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
              <RiskLog projectId={id} />
              {features.riskMatrix && <RiskMatrix projectId={id} />}
            </div>
          )}
        </div>
      </main>
      <RightPanel />
    </div>
  );
}
