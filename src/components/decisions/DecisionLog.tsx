'use client';

import { useState, useEffect } from 'react';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { useDecisionsStore, type Decision } from '@/stores/useDecisionsStore';
import { useSpaceStore } from '@/stores/useSpaceStore';
import { DecisionModal } from './DecisionModal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DecisionLogProps {
  projectId: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─── Decision Card ────────────────────────────────────────────────────────────

interface DecisionCardProps {
  dec: Decision;
  onEdit: (dec: Decision) => void;
  onDelete: (id: string) => void;
}

function DecisionCard({ dec, onEdit, onDelete }: DecisionCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleDeleteClick() {
    if (confirmDelete) {
      onDelete(dec.id);
    } else {
      setConfirmDelete(true);
    }
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 relative">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-zinc-900 leading-snug">{dec.title}</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">{formatDate(dec.createdAt)}</p>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            aria-label="Edit decision"
            onClick={() => { setConfirmDelete(false); onEdit(dec); }}
            className="flex items-center justify-center w-7 h-7 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <IconPencil size={14} />
          </button>
          <button
            aria-label={confirmDelete ? 'Confirm delete' : 'Delete decision'}
            onClick={handleDeleteClick}
            onBlur={() => setConfirmDelete(false)}
            className={`flex items-center justify-center w-7 h-7 rounded-md transition-colors ${
              confirmDelete
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'text-zinc-400 hover:text-red-500 hover:bg-zinc-100'
            }`}
          >
            <IconTrash size={14} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="mt-3 flex flex-col gap-2">
        {dec.context && (
          <div>
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide">Context</span>
            <p className="text-[12px] text-zinc-600 mt-0.5 leading-relaxed">{dec.context}</p>
          </div>
        )}

        <div>
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide">Decision</span>
          <p className="text-[13px] text-zinc-800 font-medium mt-0.5 leading-relaxed">{dec.decision}</p>
        </div>

        {dec.alternatives && (
          <div>
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide">Alternatives considered</span>
            <p className="text-[12px] text-zinc-500 mt-0.5 leading-relaxed">{dec.alternatives}</p>
          </div>
        )}
      </div>

      {/* Author */}
      {dec.author && (
        <p className="text-[11px] text-zinc-400 mt-3">
          By {dec.author}
        </p>
      )}

      {/* Confirm delete hint */}
      {confirmDelete && (
        <p className="text-[11px] text-red-500 mt-2">Click the trash icon again to confirm deletion.</p>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DecisionLog({ projectId }: DecisionLogProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const rawDecisions = useDecisionsStore((s) => s.decisions);
  const deleteDecision = useDecisionsStore((s) => s.deleteDecision);
  const canEdit = useSpaceStore((s) => s.me != null && s.selectedSpace === s.me.sub);

  const decisions = mounted
    ? rawDecisions.filter((d) => d.projectId === projectId)
    : [];

  const [modalOpen, setModalOpen]     = useState(false);
  const [editing, setEditing]         = useState<Decision | undefined>(undefined);

  function openCreate() {
    setEditing(undefined);
    setModalOpen(true);
  }

  function openEdit(dec: Decision) {
    setEditing(dec);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(undefined);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-semibold text-zinc-900">Decision Log</h2>
        {canEdit && (
          <button
            onClick={openCreate}
            className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-[13px] font-medium hover:bg-blue-600 transition-colors"
          >
            Add Decision
          </button>
        )}
      </div>

      {/* List */}
      {decisions.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-[13px] text-zinc-400">
          No decisions recorded yet
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {decisions.map((dec) => (
            <DecisionCard
              key={dec.id}
              dec={dec}
              onEdit={openEdit}
              onDelete={deleteDecision}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <DecisionModal
        opened={modalOpen}
        onClose={closeModal}
        projectId={projectId}
        decision={editing}
      />
    </div>
  );
}
