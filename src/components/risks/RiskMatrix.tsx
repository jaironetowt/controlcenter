'use client';

import { useState, useEffect } from 'react';
import { useRisksStore, type Probability, type Impact } from '@/stores/useRisksStore';

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

// ─── Props ────────────────────────────────────────────────────────────────────

interface RiskMatrixProps {
  projectId: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RiskMatrix({ projectId }: RiskMatrixProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const rawRisks = useRisksStore((s) => s.risks);
  const allRisks = mounted ? rawRisks : [];

  // Only Open risks appear in the matrix
  const openRisks = allRisks.filter(
    (r) => r.projectId === projectId && r.status === 'Open',
  );

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
                    {cellRisks.map((r) => (
                      <span
                        key={r.id}
                        className="text-[11px] bg-white border border-zinc-200 rounded px-1.5 py-0.5 text-zinc-700 leading-tight"
                        title={r.title}
                      >
                        {r.title}
                      </span>
                    ))}
                  </div>
                );
              }),
            )}
          </div>

          {/* X-axis labels (Impact: Low / Medium / High) */}
          <div className="grid mt-1" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {IMPACTS.map((imp) => (
              <div key={imp} className="text-center text-[11px] text-zinc-400 font-medium">
                {imp}
              </div>
            ))}
          </div>

          {/* X-axis title */}
          <div className="text-center mt-0.5">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide select-none">
              Impact
            </span>
          </div>
        </div>

        {/* Y-axis row labels (High / Medium / Low) aligned to each row */}
        <div className="flex flex-col">
          {PROBABILITIES.map((prob) => (
            <div
              key={prob}
              className="flex-1 flex items-center justify-start pl-1"
              style={{ minHeight: 80 }}
            >
              <span className="text-[11px] text-zinc-400 font-medium whitespace-nowrap">
                {prob}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
