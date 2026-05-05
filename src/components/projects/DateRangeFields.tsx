'use client';

import { useRef } from 'react';
import { Text } from '@mantine/core';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function monthToLabel(ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  if (!y || !m) return '';
  return `${MONTHS[m - 1]} ${y}`;
}

function labelToMonth(label: string): string {
  const parts = label.trim().split(' ');
  const mon  = parts[0];
  const year = parts[1];
  const m = MONTHS.indexOf(mon) + 1;
  if (m === 0 || !year) return '';
  return `${year}-${String(m).padStart(2, '0')}`;
}

export function parseDateRange(dateRange: string): { start: string; end: string } {
  const parts = dateRange.split('–').map((s) => s.trim());
  return {
    start: parts[0] ? labelToMonth(parts[0]) : '',
    end:   parts[1] ? labelToMonth(parts[1]) : '',
  };
}

export function buildDateRange(start: string, end: string): string {
  const parts: string[] = [];
  if (start) parts.push(monthToLabel(start));
  if (end)   parts.push(monthToLabel(end));
  return parts.join(' – ');
}

interface DateRangeFieldsProps {
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
}

function MonthPicker({ value, label, onChange }: { value: string; label: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);

  function openPicker() {
    try { ref.current?.showPicker(); } catch { ref.current?.focus(); }
  }

  return (
    <div className="flex-1">
      <Text size="xs" c="dimmed" mb={3}>{label}</Text>
      <div
        onClick={openPicker}
        className="relative w-full px-3 py-[7px] rounded-md border border-zinc-300 text-[13px] text-zinc-800 bg-white cursor-pointer hover:border-zinc-400 transition"
      >
        <span>{value ? monthToLabel(value) : <span className="text-zinc-400">— —</span>}</span>
        <input
          ref={ref}
          type="month"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          tabIndex={-1}
        />
      </div>
    </div>
  );
}

export function DateRangeFields({ start, end, onChange }: DateRangeFieldsProps) {
  return (
    <div>
      <Text size="xs" fw={500} mb={6}>Date range</Text>
      <div className="flex items-center gap-2">
        <MonthPicker label="Start" value={start} onChange={(s) => onChange(s, end)} />
        <span className="text-zinc-400 mt-4">–</span>
        <MonthPicker label="End"   value={end}   onChange={(e) => onChange(start, e)} />
      </div>
    </div>
  );
}
