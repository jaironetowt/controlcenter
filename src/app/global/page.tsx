'use client';

import { useState, useEffect } from 'react';
import { IconChevronDown, IconChevronRight, IconArchive } from '@tabler/icons-react';
import { useProjectsStore } from '@/stores/useProjectsStore';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ViewState } from '@/components/ui/ViewState';
import { buildSlugMap } from '@/lib/slugify';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GlobalPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [archivedOpen, setArchivedOpen] = useState(false);

  const storeProjects = useProjectsStore((s) => s.projects);
  const loading       = useProjectsStore((s) => s.loading);
  const error         = useProjectsStore((s) => s.error);

  const active   = mounted ? storeProjects.filter((p) => !p.archived) : [];
  const archived = mounted ? storeProjects.filter((p) => p.archived)  : [];
  const slugMap  = mounted ? buildSlugMap(storeProjects) : {};

  return (
    <div className="flex-1 overflow-y-auto pt-6 px-10 pb-10">
      <h1 className="text-[20px] font-semibold text-zinc-900 mb-4">All Projects</h1>

      {/* Active projects */}
      <ViewState
        loading={!mounted || loading}
        error={error}
        isEmpty={active.length === 0}
        emptyMessage="Nenhum projeto ainda"
        className="py-16"
      >
        <div className="grid grid-cols-3 gap-4">
          {active.map((project) => (
            <ProjectCard key={project.id} project={project} slug={slugMap[project.id] ?? project.id} />
          ))}
        </div>
      </ViewState>

      {/* Archived section */}
      {mounted && archived.length > 0 && (
        <div className="mt-10">
          <button
            onClick={() => setArchivedOpen((o) => !o)}
            className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-400 hover:text-zinc-600 transition-colors mb-3"
          >
            {archivedOpen ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
            <IconArchive size={14} />
            Archived ({archived.length})
          </button>

          {archivedOpen && (
            <div className="grid grid-cols-3 gap-4">
              {archived.map((project) => (
                <div key={project.id} className="opacity-50 hover:opacity-80 transition-opacity">
                  <ProjectCard project={project} slug={slugMap[project.id] ?? project.id} />
                  {project.archivedAt && (
                    <p className="mt-1 px-1 text-[11px] text-zinc-400">
                      Archived {new Date(project.archivedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
