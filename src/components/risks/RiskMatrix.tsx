'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRisksStore, type Risk, type Probability, type Impact } from '@/stores/useRisksStore';
import { buildNumMap, formatDate } from './RiskLog';

// ─── Matrix configuration ─────────────────────────────────────────────────────

const PROBABILITIES: Probability[] = ['High', 'Medium', 'Low'];
const IMPACTS: Impact[]             = ['Low', 'Medium', 'High'];

function cellBgClass(probability: Probability, impact: Impact): string {
  if (probability === 'High'   && impact === 'High')   return 'bg-red-100';
  if (probability === 'High'   && impact === 'Medium')  return 'bg-orange-100';
  if (probability === 'Medium' && impact === 'High')    return 'bg-orange-100';
  if (probability === 'Medium' && impact === 'Medium')  return 'bg-yellow-100';
  return 'bg-green-50';
}

function probabilityColor(p: Probability): string {
  switch (p) {
    case 'High':   return 'bg-red-100 text-red-700';
    case 'Medium': return 'bg-yellow-100 text-yellow-700';
    case 'Low':    return 'bg-green-100 text-green-700';
  }
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

interface TooltipState {
  risk: Risk;
  num: number;
  x: number;
  y: number;
}

function RiskTooltip({ risk, num, x, y }: TooltipState) {
  const W = 240;
  const left = x + 12 + W > window.innerWidth ? x - W - 12 : x + 12;
  const top  = y + 12;

  return createPortal(
    <div
      style={{ position: 'fixed', left, top, width: W, zIndex: 9999, pointerEvents: 'none' }}
      className="bg-white border border-zinc-200 rounded-xl shadow-xl p-3 flex flex-col gap-2"
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-mono text-zinc-400">#{num}</span>
        <span className="text-[13px] font-semibold text-zinc-800 leading-snug">{risk.title}</span>
      </div>

      {risk.description && (
        <p className="text-[11px] text-zinc-500 leading-snug">{risk.description}</p>
      )}

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-400 w-[64px]">Probability</span>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${probabilityColor(risk.probability)}`}>
            {risk.probability}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-400 w-[64px]">Impact</span>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${probabilityColor(risk.impact)}`}>
            {risk.impact}
          </span>
        </div>
      </div>

      {risk.owner && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-400 w-[64px]">Owner</span>
          <span className="text-[11px] text-zinc-600">{risk.owner}</span>
        </div>
      )}

      <p className="text-[10px] text-zinc-300 border-t border-zinc-100 pt-1.5">Opened {formatDate(risk.createdAt)}</p>
    </div>,
    document.body,
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface RiskMatrixProps {
  projectId: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RiskMatrix({ projectId }: RiskMatrixProps) {
  const [mounted, setMounted]       = useState(false);
  const [tooltip, setTooltip]       = useState<TooltipState | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const rawRisks     = useRisksStore((s) => s.risks);
  const allRisks     = mounted ? rawRisks : [];
  const projectRisks = allRisks.filter((r) => r.projectId === projectId);
  const openRisks    = projectRisks.filter((r) => r.status === 'Open');
  const numMap       = buildNumMap(projectRisks);

  return (
    <div className="mt-8">
      <span className="text-[14px] font-semibold text-zinc-800 block mb-4">Risk Matrix</span>

      <div className="flex gap-3">
        {/* Y-axis label */}
        <div className="flex items-center justify-center" style={{ writingMode: 'vertical-rl' }}>
          <span
            className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide select-none"
            style={{ transform: 'rotate(180deg)' }}
          >
            Probability
          </span>
        </div>

        <div className="flex-1">
          {/* Grid */}
          <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)' }}>
            {PROBABILITIES.map((prob) =>
              IMPACTS.map((imp) => {
                const cellRisks = openRisks.filter(
                  (r) => r.probability === prob && r.impact === imp,
                );

                return (
                  <div
                    key={`${prob}-${imp}`}
                    className={`${cellBgClass(prob, imp)} border border-white min-h-[80px] p-2 flex flex-col gap-1`}
                  >
                    {cellRisks.map((r) => {
                      const num = numMap.get(r.id) ?? 0;
                      return (
                        <span
                          key={r.id}
                          onMouseEnter={(e) => setTooltip({ risk: r, num, x: e.clientX, y: e.clientY })}
                          onMouseMove={(e)  => setTooltip((t) => t ? { ...t, x: e.clientX, y: e.clientY } : null)}
                          onMouseLeave={()  => setTooltip(null)}
                          className="bg-white border border-zinc-200 rounded px-1.5 py-1 text-zinc-700 leading-tight cursor-default select-none hover:border-zinc-400 hover:shadow-sm transition-all flex flex-col gap-0.5"
                        >
                          <span className="text-[9px] font-mono text-zinc-400">#{num}</span>
                          <span className="text-[11px] text-zinc-700">{r.title}</span>
                        </span>
                      );
                    })}
                  </div>
                );
              }),
            )}
          </div>

          {/* X-axis labels */}
          <div className="grid mt-1" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {IMPACTS.map((imp) => (
              <div key={imp} className="text-center text-[11px] text-zinc-400 font-medium">{imp}</div>
            ))}
          </div>

          {/* X-axis title */}
          <div className="text-center mt-0.5">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide select-none">Impact</span>
          </div>
        </div>

        {/* Y-axis row labels */}
        <div className="flex flex-col">
          {PROBABILITIES.map((prob) => (
            <div key={prob} className="flex-1 flex items-center justify-start pl-1" style={{ minHeight: 80 }}>
              <span className="text-[11px] text-zinc-400 font-medium whitespace-nowrap">{prob}</span>
            </div>
          ))}
        </div>
      </div>

      {tooltip && mounted && <RiskTooltip {...tooltip} />}
    </div>
  );
}
