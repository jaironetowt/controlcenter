'use client';

import { useState, useEffect } from 'react';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { useRisksStore, type Risk, type Probability, type Impact, type RiskStatus } from '@/stores/useRisksStore';
import { useSpaceStore } from '@/stores/useSpaceStore';
import { RiskModal } from './RiskModal';

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function buildNumMap(risks: Risk[]): Map<string, number> {
  const sorted = [...risks].sort((a, b) => a.createdAt - b.createdAt);
  const map = new Map<string, number>();
  sorted.forEach((r, i) => map.set(r.id, i + 1));
  return map;
}

function probabilityBadgeClass(p: Probability): string {
  switch (p) {
    case 'High':   return 'bg-red-100 text-red-700';
    case 'Medium': return 'bg-yellow-100 text-yellow-700';
    case 'Low':    return 'bg-green-100 text-green-700';
  }
}

function impactBadgeClass(i: Impact): string {
  switch (i) {
    case 'High':   return 'bg-red-100 text-red-700';
    case 'Medium': return 'bg-yellow-100 text-yellow-700';
    case 'Low':    return 'bg-green-100 text-green-700';
  }
}

function statusCellClass(s: RiskStatus): string {
  switch (s) {
    case 'Open':      return 'text-red-600 font-semibold';
    case 'Mitigated': return 'text-yellow-600 font-semibold';
    case 'Closed':    return 'text-zinc-400 font-semibold';
  }
}

export function formatDate(ts?: number): string {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${className}`}>
      {label}
    </span>
  );
}

// ─── Row ─────────────────────────────────────────────────────────────────────

function RiskRow({ risk, num, onEdit, onDelete }: { risk: Risk; num: number; onEdit: (r: Risk) => void; onDelete: (id: string) => void }) {
  return (
    <tr className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
      <td className="py-2.5 pr-3">
        <span className="text-[11px] font-mono text-zinc-400">#{num}</span>
      </td>
      <td className="py-2.5 pr-4">
        <span className={`text-[12px] ${statusCellClass(risk.status)}`}>{risk.status}</span>
      </td>
      <td className="py-2.5 pr-4">
        <span className="text-[13px] text-zinc-800">{risk.title}</span>
        {risk.description && (
          <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{risk.description}</p>
        )}
      </td>
      <td className="py-2.5 pr-4">
        <Badge label={risk.probability} className={probabilityBadgeClass(risk.probability)} />
      </td>
      <td className="py-2.5 pr-4">
        <Badge label={risk.impact} className={impactBadgeClass(risk.impact)} />
      </td>
      <td className="py-2.5 pr-4">
        <span className="text-[13px] text-zinc-600">{risk.owner || '—'}</span>
      </td>
      <td className="py-2.5 pr-4">
        <span className="text-[12px] text-zinc-500">{formatDate(risk.createdAt)}</span>
      </td>
      <td className="py-2.5 pr-4">
        <span className="text-[12px] text-zinc-500">{formatDate(risk.closedAt)}</span>
      </td>
      <td className="py-2.5">
        <div className="flex items-center justify-end gap-1">
          <button aria-label={`Edit ${risk.title}`} onClick={() => onEdit(risk)} className="p-1 text-zinc-400 hover:text-zinc-700 transition-colors rounded">
            <IconPencil size={14} />
          </button>
          <button aria-label={`Delete ${risk.title}`} onClick={() => onDelete(risk.id)} className="p-1 text-zinc-400 hover:text-red-600 transition-colors rounded">
            <IconTrash size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Shared table shell ───────────────────────────────────────────────────────

export function RiskTable({ risks, numMap, onEdit, onDelete }: {
  risks: Risk[];
  numMap: Map<string, number>;
  onEdit: (r: Risk) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse table-fixed">
        <colgroup>
          <col style={{ width: '4%' }} />
          <col style={{ width: '8%' }} />
          <col style={{ width: '22%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '14%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '8%' }} />
        </colgroup>
        <thead>
          <tr className="border-b border-zinc-200">
            <th className="text-left text-[11px] font-medium text-zinc-400 uppercase tracking-wide pb-2 pr-3">#</th>
            <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wide pb-2 pr-4">Status</th>
            <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wide pb-2 pr-4">Title</th>
            <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wide pb-2 pr-4">Probability</th>
            <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wide pb-2 pr-4">Impact</th>
            <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wide pb-2 pr-4">Owner</th>
            <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wide pb-2 pr-4">Opened</th>
            <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wide pb-2 pr-4">Closed</th>
            <th className="text-right text-[11px] font-medium text-zinc-500 uppercase tracking-wide pb-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {risks.map((risk) => (
            <RiskRow key={risk.id} risk={risk} num={numMap.get(risk.id) ?? 0} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── RiskLog ──────────────────────────────────────────────────────────────────

interface RiskLogProps {
  projectId: string;
}

export function RiskLog({ projectId }: RiskLogProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const allRisks   = useRisksStore((s) => s.risks);
  const projectRisks = mounted ? allRisks.filter((r) => r.projectId === projectId) : [];
  const openRisks    = projectRisks.filter((r) => r.status === 'Open');
  const numMap       = buildNumMap(projectRisks);
  const deleteRisk   = useRisksStore((s) => s.deleteRisk);
  const canEdit      = useSpaceStore((s) => s.me != null && s.selectedSpace === s.me.sub);

  const [modalOpen, setModalOpen]     = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | undefined>(undefined);

  function openCreateModal() { setEditingRisk(undefined); setModalOpen(true); }
  function openEditModal(risk: Risk) { setEditingRisk(risk); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditingRisk(undefined); }

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[14px] font-semibold text-zinc-800">Risk Log</span>
        {canEdit && (
          <button onClick={openCreateModal} className="px-3 py-1 text-[12px] font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
            Add Risk
          </button>
        )}
      </div>

      {openRisks.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-[13px] text-zinc-400">No open risks</div>
      ) : (
        <RiskTable risks={openRisks} numMap={numMap} onEdit={openEditModal} onDelete={deleteRisk} />
      )}

      <RiskModal opened={modalOpen} onClose={closeModal} projectId={projectId} risk={editingRisk} />
    </>
  );
}
