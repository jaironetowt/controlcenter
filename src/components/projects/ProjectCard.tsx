import { type Project } from '@/stores/useProjectsStore';
import { ExternalHealthBadge } from '@/components/ui/ExternalHealthBadge';
import { InternalHealthBadge } from '@/components/ui/InternalHealthBadge';

// ─── Component ────────────────────────────────────────────────────────────────

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-4 hover:shadow-sm transition-shadow cursor-pointer relative">
      {/* Health badges — absolute top-right */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        <ExternalHealthBadge projectId={project.id} />
        <InternalHealthBadge />
      </div>

      {/* Color dot + project name */}
      <div className="flex items-center gap-2 mt-1">
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: project.color }}
        />
        <span className="text-[15px] font-semibold text-zinc-900 pr-10 truncate">
          {project.name}
        </span>
      </div>

      {/* Metadata */}
      <div className="mt-2 flex flex-col gap-0.5">
        <span className="text-[12px] text-zinc-500">{project.client}</span>
        <span className="text-[12px] text-zinc-500">{project.phase}</span>
        <span className="text-[12px] text-zinc-500">{project.dateRange}</span>
      </div>
    </div>
  );
}
