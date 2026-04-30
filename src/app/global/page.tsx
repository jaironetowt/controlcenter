'use client';

import { useState, useEffect } from 'react';
import { useProjectsStore } from '@/stores/useProjectsStore';
import { ProjectCard } from '@/components/projects/ProjectCard';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GlobalPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const storeProjects = useProjectsStore((s) => s.projects);
  const projects = mounted ? storeProjects.filter((p) => !p.archived) : [];

  return (
    <div className="flex-1 overflow-y-auto pt-6 px-10">
      <h1 className="text-[20px] font-semibold text-zinc-900 mb-4">All Projects</h1>

      <div className="grid grid-cols-3 gap-4">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
