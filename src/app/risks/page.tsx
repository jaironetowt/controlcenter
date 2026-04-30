'use client';

import { useState, useEffect } from 'react';
import { useProjectsStore } from '@/stores/useProjectsStore';
import { useFeaturesStore, DEFAULT_FEATURES } from '@/stores/useFeaturesStore';
import { RiskLog } from '@/components/risks/RiskLog';
import { RiskMatrix } from '@/components/risks/RiskMatrix';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RisksPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const projects = useProjectsStore((s) => s.projects);
  const activeProject = mounted
    ? (projects.find((p) => !p.archived) ?? null)
    : null;

  const rawFeatures = useFeaturesStore((s) => s.features);
  const features = mounted ? rawFeatures : DEFAULT_FEATURES;

  if (!mounted || !activeProject) {
    return (
      <div className="flex-1 overflow-y-auto pl-10 pr-6 py-6">
        <div className="h-8 w-48 bg-zinc-200 rounded animate-pulse mb-6" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pl-10 pr-6 py-6">
      <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
        <RiskLog projectId={activeProject.id} />
        {features.riskMatrix && <RiskMatrix projectId={activeProject.id} />}
      </div>
    </div>
  );
}
