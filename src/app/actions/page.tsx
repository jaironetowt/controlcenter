'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { RightPanel } from '@/components/layout/RightPanel';
import { ActiveProjectHeader } from '@/components/layout/ActiveProjectHeader';
import { ActionItemList } from '@/components/actions/ActionItemList';
import { useProjectsStore } from '@/stores/useProjectsStore';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ActionsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const projects = useProjectsStore((s) => s.projects);
  const activeProject = mounted
    ? (projects.find((p) => !p.archived) ?? null)
    : null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F4F5]">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <ActiveProjectHeader />

        <div className="flex-1 overflow-y-auto pl-10 pr-6 py-6">
          {mounted && activeProject ? (
            <ActionItemList projectId={activeProject.id} />
          ) : (
            <div className="flex items-center justify-center py-16 text-[13px] text-zinc-400">
              {mounted ? 'No active project selected.' : ''}
            </div>
          )}
        </div>
      </main>

      <RightPanel />
    </div>
  );
}
