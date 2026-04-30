import Link from 'next/link';
import { type Project } from '@/stores/useProjectsStore';
import { ExternalHealthBadge } from '@/components/ui/ExternalHealthBadge';
import { InternalHealthBadge } from '@/components/ui/InternalHealthBadge';

// ─── Component ────────────────────────────────────────────────────────────────

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="block bg-white rounded-xl border border-zinc-200 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
    >
      {/* Color bar — left side */}
      <span
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ backgroundColor: project.color }}
        aria-hidden
      />

      <div className="pl-4 pr-4 py-4">
        {/* Health badges — top-right */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <ExternalHealthBadge projectId={project.id} />
          <InternalHealthBadge />
        </div>

        {/* Project name */}
        <p className="text-[15px] font-semibold text-zinc-900 pr-10 truncate mt-1">
          {project.name}
        </p>

        {/* Metadata */}
        <div className="mt-2 flex flex-col gap-0.5">
          <span className="text-[12px] text-zinc-500">{project.client}</span>
          <span className="text-[12px] text-zinc-500">{project.phase}</span>
          <span className="text-[12px] text-zinc-500">{project.dateRange}</span>
        </div>
      </div>
    </Link>
  );
}
