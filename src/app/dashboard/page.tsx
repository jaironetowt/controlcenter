'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { RightPanel } from '@/components/layout/RightPanel';
import { ActiveProjectHeader } from '@/components/layout/ActiveProjectHeader';
import { useProjectsStore } from '@/stores/useProjectsStore';
import { useRisksStore } from '@/stores/useRisksStore';
import { useDecisionsStore } from '@/stores/useDecisionsStore';
import { useActionItemsStore } from '@/stores/useActionItemsStore';
import { useStakeholdersStore } from '@/stores/useStakeholdersStore';

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5">
      <p className="text-[12px] text-zinc-500 font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className="text-[28px] font-semibold text-zinc-900 leading-none">{value}</p>
      {sub && <p className="text-[12px] text-zinc-400 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const storeProjects = useProjectsStore((s) => s.projects);
  const storeRisks = useRisksStore((s) => s.risks);
  const storeDecisions = useDecisionsStore((s) => s.decisions);
  const storeItems = useActionItemsStore((s) => s.items);
  const storeStakeholders = useStakeholdersStore((s) => s.stakeholders);

  const activeProject = mounted
    ? (storeProjects.find((p) => !p.archived) ?? null)
    : null;

  const pid = activeProject?.id ?? '';

  const openRisks      = mounted ? storeRisks.filter((r) => r.projectId === pid && r.status === 'Open').length : 0;
  const decisions      = mounted ? storeDecisions.filter((d) => d.projectId === pid).length : 0;
  const openActions    = mounted ? storeItems.filter((i) => i.projectId === pid && i.status !== 'Done').length : 0;
  const totalActions   = mounted ? storeItems.filter((i) => i.projectId === pid).length : 0;
  const stakeholders   = mounted ? storeStakeholders.filter((s) => s.projectId === pid).length : 0;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F4F5]">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <ActiveProjectHeader />

        <div className="flex-1 overflow-y-auto pl-10 pr-6 py-8">
          <h1 className="text-[20px] font-semibold text-zinc-900 mb-6">Overview</h1>

          <div className="grid grid-cols-4 gap-4">
            <StatCard label="Open Risks"    value={openRisks}  />
            <StatCard label="Decisions"     value={decisions}  />
            <StatCard
              label="Action Items"
              value={openActions}
              sub={`${totalActions} total`}
            />
            <StatCard label="Stakeholders"  value={stakeholders} />
          </div>
        </div>
      </main>

      <RightPanel />
    </div>
  );
}
