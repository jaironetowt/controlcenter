import { Sidebar } from '@/components/layout/Sidebar';
import { RightPanel } from '@/components/layout/RightPanel';
import { ProjectHeader } from '@/components/layout/ProjectHeader';

// ─── Hardcoded project data (phase 1) ─────────────────────────────────────────

const project = {
  id: 'mosaic',
  name: 'Mosaic',
  color: '#3E77FC',
  client: 'WillowTree Internal',
  phase: 'Development',
  dateRange: 'Jan – Jun 2026',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F4F5]">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <ProjectHeader
          name={project.name}
          color={project.color}
          client={project.client}
          phase={project.phase}
          dateRange={project.dateRange}
          projectId={project.id}
        />

        <div className="flex-1 overflow-y-auto pl-10 pr-6 py-6">
          {/* Future gadget grid goes here */}
        </div>
      </main>

      <RightPanel />
    </div>
  );
}
