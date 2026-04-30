'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  IconAlertTriangle,
  IconNotes,
  IconChecklist,
  IconUsers,
  IconChevronRight,
} from '@tabler/icons-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { RightPanel } from '@/components/layout/RightPanel';
import { ExternalHealthBadge } from '@/components/ui/ExternalHealthBadge';
import { InternalHealthBadge } from '@/components/ui/InternalHealthBadge';
import { useProjectsStore } from '@/stores/useProjectsStore';
import { useRisksStore } from '@/stores/useRisksStore';
import { useDecisionsStore } from '@/stores/useDecisionsStore';
import { useActionItemsStore } from '@/stores/useActionItemsStore';
import { useStakeholdersStore } from '@/stores/useStakeholdersStore';

// ─── Module card ──────────────────────────────────────────────────────────────

interface ModuleCardProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  sub: string;
  href: string;
  color: string;
}

function ModuleCard({ icon, label, count, sub, href, color }: ModuleCardProps) {
  return (
    <Link
      href={href}
      className="group bg-white rounded-xl border border-zinc-200 p-5 hover:shadow-md transition-all flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: color + '18' }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
        <IconChevronRight
          size={16}
          className="text-zinc-300 group-hover:text-zinc-500 transition-colors"
        />
      </div>
      <div>
        <p className="text-[13px] text-zinc-500 font-medium">{label}</p>
        <p className="text-[28px] font-semibold text-zinc-900 leading-none mt-0.5">{count}</p>
        <p className="text-[12px] text-zinc-400 mt-1">{sub}</p>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const storeProjects     = useProjectsStore((s) => s.projects);
  const storeRisks        = useRisksStore((s) => s.risks);
  const storeDecisions    = useDecisionsStore((s) => s.decisions);
  const storeItems        = useActionItemsStore((s) => s.items);
  const storeStakeholders = useStakeholdersStore((s) => s.stakeholders);

  const project = mounted ? storeProjects.find((p) => p.id === id && !p.archived) : null;

  // After hydration, if project not found, 404
  if (mounted && !project) return notFound();

  // Use seed fallback while not yet hydrated so SSR doesn't crash
  const p = project ?? { id, name: '…', color: '#3E77FC', client: '…', phase: '…', dateRange: '…' };

  const openRisks    = mounted ? storeRisks.filter((r) => r.projectId === id && r.status === 'Open').length : 0;
  const totalRisks   = mounted ? storeRisks.filter((r) => r.projectId === id).length : 0;
  const decisions    = mounted ? storeDecisions.filter((d) => d.projectId === id).length : 0;
  const openActions  = mounted ? storeItems.filter((i) => i.projectId === id && i.status !== 'Done').length : 0;
  const totalActions = mounted ? storeItems.filter((i) => i.projectId === id).length : 0;
  const stakeholders = mounted ? storeStakeholders.filter((s) => s.projectId === id).length : 0;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F4F5]">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Project hero header */}
        <div className="bg-white border-b border-zinc-200 px-10 py-6 flex-shrink-0">
          <div className="flex items-start gap-4">
            {/* Color bar */}
            <span
              className="w-1.5 h-14 rounded-full flex-shrink-0 mt-0.5"
              style={{ backgroundColor: p.color }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[24px] font-bold text-zinc-900 leading-tight truncate">{p.name}</p>
              <p className="text-[13px] text-zinc-500 mt-1">
                {p.client} · {p.phase} · {p.dateRange}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 mt-1">
              <ExternalHealthBadge projectId={id} />
              <InternalHealthBadge />
            </div>
          </div>
        </div>

        {/* Module grid */}
        <div className="flex-1 overflow-y-auto px-10 py-8">
          <p className="text-[12px] font-medium text-zinc-400 uppercase tracking-wider mb-4">Modules</p>
          <div className="grid grid-cols-2 gap-4 max-w-2xl">
            <ModuleCard
              icon={<IconAlertTriangle size={18} />}
              label="Risks"
              count={openRisks}
              sub={`${totalRisks} total · ${openRisks} open`}
              href="/risks"
              color="#EF4444"
            />
            <ModuleCard
              icon={<IconNotes size={18} />}
              label="Decisions"
              count={decisions}
              sub="registered decisions"
              href="/decisions"
              color="#8B56FC"
            />
            <ModuleCard
              icon={<IconChecklist size={18} />}
              label="Action Items"
              count={openActions}
              sub={`${totalActions} total · ${openActions} open`}
              href="/actions"
              color="#3E77FC"
            />
            <ModuleCard
              icon={<IconUsers size={18} />}
              label="Stakeholders"
              count={stakeholders}
              sub="mapped stakeholders"
              href="/stakeholders"
              color="#F59E0B"
            />
          </div>
        </div>
      </main>

      <RightPanel />
    </div>
  );
}
