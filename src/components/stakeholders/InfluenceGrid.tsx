'use client';

import { useState, useEffect } from 'react';
import { useStakeholdersStore, type Stakeholder } from '@/stores/useStakeholdersStore';

// ─── Quadrant config ──────────────────────────────────────────────────────────

interface Quadrant {
  label: string;
  sub: string;
  influence: Stakeholder['influence'];
  interest: Stakeholder['interest'];
  bg: string;
  border: string;
  borderActive: string;
  textColor: string;
}

const QUADRANTS: Quadrant[] = [
  {
    label: 'Manage Closely',
    sub: 'High influence · High interest',
    influence: 'High',
    interest: 'High',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    borderActive: 'border-blue-400',
    textColor: 'text-blue-800',
  },
  {
    label: 'Keep Satisfied',
    sub: 'High influence · Low interest',
    influence: 'High',
    interest: 'Low',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    borderActive: 'border-purple-400',
    textColor: 'text-purple-800',
  },
  {
    label: 'Keep Informed',
    sub: 'Low influence · High interest',
    influence: 'Low',
    interest: 'High',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    borderActive: 'border-yellow-400',
    textColor: 'text-yellow-800',
  },
  {
    label: 'Monitor',
    sub: 'Low influence · Low interest',
    influence: 'Low',
    interest: 'Low',
    bg: 'bg-zinc-50',
    border: 'border-zinc-200',
    borderActive: 'border-zinc-400',
    textColor: 'text-zinc-600',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface InfluenceGridProps {
  projectId: string;
}

export function InfluenceGrid({ projectId }: InfluenceGridProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const rawStakeholders   = useStakeholdersStore((s) => s.stakeholders);
  const updateStakeholder = useStakeholdersStore((s) => s.updateStakeholder);

  const stakeholders = mounted ? rawStakeholders : [];
  const filtered     = stakeholders.filter((sh) => sh.projectId === projectId);

  const [draggingId, setDraggingId]     = useState<string | null>(null);
  const [overQuadrant, setOverQuadrant] = useState<string | null>(null);

  function handleDragStart(e: React.DragEvent, id: string) {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  }

  function handleDragEnd() {
    setDraggingId(null);
    setOverQuadrant(null);
  }

  function handleDragOver(e: React.DragEvent, quadrantLabel: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverQuadrant(quadrantLabel);
  }

  function handleDragLeave() {
    setOverQuadrant(null);
  }

  function handleDrop(e: React.DragEvent, q: Quadrant) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;
    const sh = filtered.find((s) => s.id === id);
    if (!sh || (sh.influence === q.influence && sh.interest === q.interest)) return;
    void updateStakeholder(id, { influence: q.influence, interest: q.interest });
    setDraggingId(null);
    setOverQuadrant(null);
  }

  return (
    <section className="mt-8">
      <h2 className="text-[16px] font-semibold text-zinc-900 mb-4">
        Influence × Interest Grid
      </h2>

      {/* Axis wrapper */}
      <div className="flex gap-3">
        {/* Y-axis label */}
        <div className="flex items-center justify-center" style={{ writingMode: 'vertical-rl' }}>
          <span
            className="text-[11px] font-medium text-zinc-400 tracking-wide select-none"
            style={{ transform: 'rotate(180deg)' }}
          >
            Influence ↑
          </span>
        </div>

        {/* Grid + X-axis */}
        <div className="flex-1">
          {/* 2×2 grid */}
          <div className="grid grid-cols-2 gap-3">
            {QUADRANTS.map((q) => {
              const inQuadrant = filtered.filter(
                (sh) => sh.influence === q.influence && sh.interest === q.interest,
              );
              const isActive = overQuadrant === q.label;

              return (
                <div
                  key={q.label}
                  className={`rounded-xl border-2 p-4 min-h-[120px] flex flex-col gap-3 transition-colors ${q.bg} ${isActive ? q.borderActive : q.border}`}
                  onDragOver={(e) => handleDragOver(e, q.label)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, q)}
                >
                  {/* Quadrant header */}
                  <div>
                    <p className={`text-[13px] font-semibold ${q.textColor}`}>{q.label}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{q.sub}</p>
                  </div>

                  {/* Stakeholder pills */}
                  {inQuadrant.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {inQuadrant.map((sh) => (
                        <span
                          key={sh.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, sh.id)}
                          onDragEnd={handleDragEnd}
                          className={`text-[12px] bg-white border border-zinc-200 rounded-full px-2 py-0.5 text-zinc-700 shadow-sm cursor-grab active:cursor-grabbing select-none transition-opacity ${draggingId === sh.id ? 'opacity-40' : 'opacity-100'}`}
                        >
                          {sh.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-[12px] italic transition-colors ${isActive ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      {isActive ? 'Drop here' : 'No stakeholders'}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* X-axis label */}
          <div className="flex justify-end mt-2">
            <span className="text-[11px] font-medium text-zinc-400 tracking-wide select-none">
              Interest →
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
