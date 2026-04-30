'use client';

import { useState, useEffect } from 'react';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { useRisksStore, type Risk, type Probability, type Impact, type RiskStatus } from '@/stores/useRisksStore';
import { RiskModal } from './RiskModal';

// ─── Badge helpers ────────────────────────────────────────────────────────────

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

function statusBadgeClass(s: RiskStatus): string {
  switch (s) {
    case 'Open':      return 'bg-red-100 text-red-700';
    case 'Mitigated': return 'bg-yellow-100 text-yellow-700';
    case 'Closed':    return 'bg-zinc-100 text-zinc-500';
  }
}

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${className}`}>
      {label}
    </span>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface RiskLogProps {
  projectId: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RiskLog({ projectId }: RiskLogProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const allRisks   = useRisksStore((s) => s.risks);
  const risks      = mounted ? allRisks.filter((r) => r.projectId === projectId) : [];
  const deleteRisk = useRisksStore((s) => s.deleteRisk);

  const [modalOpen, setModalOpen]   = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | undefined>(undefined);

  function openCreateModal() {
    setEditingRisk(undefined);
    setModalOpen(true);
  }

  function openEditModal(risk: Risk) {
    setEditingRisk(risk);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingRisk(undefined);
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[14px] font-semibold text-zinc-800">Risk Log</span>
        <button
          onClick={openCreateModal}
          className="px-3 py-1 text-[12px] font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          Add Risk
        </button>
      </div>

      {/* Table */}
      {risks.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-[13px] text-zinc-400">
          No risks logged yet
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wide pb-2 pr-4 w-[35%]">Title</th>
                <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wide pb-2 pr-4">Probability</th>
                <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wide pb-2 pr-4">Impact</th>
                <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wide pb-2 pr-4">Status</th>
                <th className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wide pb-2 pr-4">Owner</th>
                <th className="text-right text-[11px] font-medium text-zinc-500 uppercase tracking-wide pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {risks.map((risk) => (
                <tr key={risk.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
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
                    <Badge label={risk.status} className={statusBadgeClass(risk.status)} />
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className="text-[13px] text-zinc-600">{risk.owner || '—'}</span>
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        aria-label={`Edit ${risk.title}`}
                        onClick={() => openEditModal(risk)}
                        className="p-1 text-zinc-400 hover:text-zinc-700 transition-colors rounded"
                      >
                        <IconPencil size={14} />
                      </button>
                      <button
                        aria-label={`Delete ${risk.title}`}
                        onClick={() => deleteRisk(risk.id)}
                        className="p-1 text-zinc-400 hover:text-red-600 transition-colors rounded"
                      >
                        <IconTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <RiskModal
        opened={modalOpen}
        onClose={closeModal}
        projectId={projectId}
        risk={editingRisk}
      />
    </>
  );
}
