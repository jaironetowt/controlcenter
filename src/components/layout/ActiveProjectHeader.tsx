'use client';

import { useState, useEffect } from 'react';
import { ProjectHeader } from '@/components/layout/ProjectHeader';
import { useProjectsStore } from '@/stores/useProjectsStore';

// Fallback shown on first server render (before hydration)
const FALLBACK = {
  id: 'mosaic',
  name: 'Mosaic',
  color: '#3E77FC',
  client: 'WillowTree Internal',
  phase: 'Development',
  dateRange: 'Jan – Jun 2026',
};

export function ActiveProjectHeader() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const projects = useProjectsStore((s) => s.projects);
  const active = mounted
    ? (projects.find((p) => !p.archived) ?? FALLBACK)
    : FALLBACK;

  return (
    <ProjectHeader
      name={active.name}
      color={active.color}
      client={active.client}
      phase={active.phase}
      dateRange={active.dateRange}
      projectId={active.id}
    />
  );
}
