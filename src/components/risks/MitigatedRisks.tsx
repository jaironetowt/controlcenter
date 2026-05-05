'use client';

import { useState, useEffect } from 'react';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { useRisksStore, type Risk } from '@/stores/useRisksStore';
import { RiskTable, buildNumMap } from './RiskLog';
import { RiskModal } from './RiskModal';

interface MitigatedRisksProps {
  projectId: string;
}

export function MitigatedRisks({ projectId }: MitigatedRisksProps) {
  const [mounted, setMounted]         = useState(false);
  const [open, setOpen]               = useState(false);
  const [modalOpen, setModalOpen]     = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | undefined>(undefined);

  useEffect(() => { setMounted(true); }, []);

  const allRisks       = useRisksStore((s) => s.risks);
  const projectRisks   = mounted ? allRisks.filter((r) => r.projectId === projectId) : [];
  const mitigatedRisks = projectRisks.filter((r) => r.status === 'Mitigated');
  const numMap         = buildNumMap(projectRisks);
  const deleteRisk     = useRisksStore((s) => s.deleteRisk);

  function openEditModal(risk: Risk) { setEditingRisk(risk); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditingRisk(undefined); }

  if (!mounted || mitigatedRisks.length === 0) return null;

  return (
    <>
      <div className="mt-6 border border-zinc-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-zinc-50 hover:bg-zinc-100 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-zinc-600">Mitigated Risks</span>
            <span className="text-[11px] bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full px-2 py-0.5 font-medium">
              {mitigatedRisks.length}
            </span>
          </div>
          {open
            ? <IconChevronDown size={15} className="text-zinc-400" />
            : <IconChevronRight size={15} className="text-zinc-400" />
          }
        </button>

        {open && (
          <div className="p-4 border-t border-zinc-200">
            <RiskTable risks={mitigatedRisks} numMap={numMap} onEdit={openEditModal} onDelete={deleteRisk} />
          </div>
        )}
      </div>

      <RiskModal opened={modalOpen} onClose={closeModal} projectId={projectId} risk={editingRisk} />
    </>
  );
}
