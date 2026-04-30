'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { RightPanel } from '@/components/layout/RightPanel';
import { ActiveProjectHeader } from '@/components/layout/ActiveProjectHeader';
import { StakeholderList } from '@/components/stakeholders/StakeholderList';
import { InfluenceGrid } from '@/components/stakeholders/InfluenceGrid';
import { useProjectsStore } from '@/stores/useProjectsStore';
import { useFeaturesStore, DEFAULT_FEATURES } from '@/stores/useFeaturesStore';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StakeholdersPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const projects = useProjectsStore((s) => s.projects);
  const activeProject = mounted
    ? (projects.find((p) => !p.archived) ?? null)
    : null;

  // Fall back to 'mosaic' until hydrated so the page doesn't flash empty
  const projectId = activeProject?.id ?? 'mosaic';

  const rawFeatures = useFeaturesStore((s) => s.features);
  const features = mounted ? rawFeatures : DEFAULT_FEATURES;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F4F5]">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <ActiveProjectHeader />

        <div className="flex-1 overflow-y-auto pl-10 pr-6 py-6">
          {mounted && (
            <>
              <StakeholderList projectId={projectId} />
              {features.stakeholderGrid && <InfluenceGrid projectId={projectId} />}
            </>
          )}
        </div>
      </main>

      <RightPanel />
    </div>
  );
}
