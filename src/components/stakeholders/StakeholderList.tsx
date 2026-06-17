'use client';

import { useState, useEffect } from 'react';
import { IconPencil, IconTrash, IconUserPlus } from '@tabler/icons-react';
import { useStakeholdersStore, type Stakeholder } from '@/stores/useStakeholdersStore';
import { useSpaceStore } from '@/stores/useSpaceStore';
import { ViewState } from '@/components/ui/ViewState';
import { StakeholderModal } from './StakeholderModal';

// ─── Badge helpers ────────────────────────────────────────────────────────────

function InfluenceBadge({ level }: { level: Stakeholder['influence'] }) {
  const cls =
    level === 'High'
      ? 'bg-purple-100 text-purple-700 border-purple-200'
      : 'bg-zinc-100 text-zinc-500 border-zinc-200';
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      Influence: {level}
    </span>
  );
}

function InterestBadge({ level }: { level: Stakeholder['interest'] }) {
  const cls =
    level === 'High'
      ? 'bg-blue-100 text-blue-700 border-blue-200'
      : 'bg-zinc-100 text-zinc-500 border-zinc-200';
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      Interest: {level}
    </span>
  );
}

// ─── Stakeholder card ─────────────────────────────────────────────────────────

interface CardProps {
  stakeholder: Stakeholder;
  onEdit: () => void;
  onDelete: () => void;
}

function StakeholderCard({ stakeholder, onEdit, onDelete }: CardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col gap-2 relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Action icons — top-right, visible on hover */}
      <div
        className={`absolute top-3 right-3 flex items-center gap-1 transition-opacity duration-100 ${
          hovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          aria-label={`Edit ${stakeholder.name}`}
          onClick={onEdit}
          className="flex items-center justify-center w-6 h-6 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
        >
          <IconPencil size={14} />
        </button>
        <button
          aria-label={`Delete ${stakeholder.name}`}
          onClick={onDelete}
          className="flex items-center justify-center w-6 h-6 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <IconTrash size={14} />
        </button>
      </div>

      {/* Identity */}
      <div className="pr-12">
        <p className="text-[14px] font-semibold text-zinc-900 truncate">{stakeholder.name}</p>
        <p className="text-[12px] text-zinc-500 truncate">
          {[stakeholder.role, stakeholder.company].filter(Boolean).join(' · ')}
        </p>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        <InfluenceBadge level={stakeholder.influence} />
        <InterestBadge  level={stakeholder.interest}  />
      </div>

      {/* Notes */}
      {stakeholder.notes && (
        <p className="text-[12px] text-zinc-600 line-clamp-2 leading-relaxed">
          {stakeholder.notes}
        </p>
      )}
    </div>
  );
}

// ─── StakeholderList ──────────────────────────────────────────────────────────

interface StakeholderListProps {
  projectId: string;
}

export function StakeholderList({ projectId }: StakeholderListProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const rawStakeholders = useStakeholdersStore((s) => s.stakeholders);
  const loading = useStakeholdersStore((s) => s.loading);
  const error = useStakeholdersStore((s) => s.error);
  const deleteStakeholder = useStakeholdersStore((s) => s.deleteStakeholder);
  const canEdit = useSpaceStore((s) => s.me != null && s.selectedSpace === s.me.sub);

  const filtered = mounted
    ? rawStakeholders.filter((sh) => sh.projectId === projectId)
    : [];

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState<Stakeholder | undefined>(undefined);

  function openCreate() {
    setEditing(undefined);
    setModalOpen(true);
  }

  function openEdit(sh: Stakeholder) {
    setEditing(sh);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(undefined);
  }

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[16px] font-semibold text-zinc-900">Stakeholders</h2>
        {canEdit && (
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            <IconUserPlus size={14} />
            Add Stakeholder
          </button>
        )}
      </div>

      {/* Card grid */}
      <ViewState
        loading={!mounted || loading}
        error={error}
        isEmpty={filtered.length === 0}
        emptyMessage="Nenhum stakeholder ainda. Adicione o primeiro acima."
      >
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((sh) => (
            <StakeholderCard
              key={sh.id}
              stakeholder={sh}
              onEdit={() => openEdit(sh)}
              onDelete={() => deleteStakeholder(sh.id)}
            />
          ))}
        </div>
      </ViewState>

      {/* Modal */}
      <StakeholderModal
        opened={modalOpen}
        onClose={closeModal}
        projectId={projectId}
        stakeholder={editing}
      />
    </section>
  );
}
