'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IconChecklist, IconSettings, IconCircle, IconCircleHalf2, IconX } from '@tabler/icons-react';
import { useActionItemsStore, type ActionStatus } from '@/stores/useActionItemsStore';
import { useProjectsStore } from '@/stores/useProjectsStore';

const STORAGE_KEY = 'hd-urgent-days';
const DEFAULT_DAYS = 3;
const DAY_OPTIONS = [1, 2, 3, 5, 7, 14];

function getDueDateLabel(dueDate: string): { label: string; cls: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + 'T00:00:00');
  const diff = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diff < 0)  return { label: `${Math.abs(diff)}d overdue`, cls: 'text-red-500 font-semibold' };
  if (diff === 0) return { label: 'Today',    cls: 'text-orange-500 font-semibold' };
  if (diff === 1) return { label: 'Tomorrow', cls: 'text-orange-400 font-medium' };
  return { label: `${diff}d`,  cls: 'text-zinc-400' };
}

function StatusIcon({ status }: { status: ActionStatus }) {
  if (status === 'In Progress') return <IconCircleHalf2 size={13} className="text-blue-500 flex-shrink-0" />;
  return <IconCircle size={13} className="text-zinc-300 flex-shrink-0" />;
}

export function UrgentActions() {
  const [mounted, setMounted] = useState(false);
  const [days, setDays]       = useState(DEFAULT_DAYS);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setDays(Number(stored));
    setMounted(true);
  }, []);

  function updateDays(n: number) {
    setDays(n);
    localStorage.setItem(STORAGE_KEY, String(n));
  }

  const rawItems = useActionItemsStore((s) => s.items);
  const projects = useProjectsStore((s) => s.projects);
  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]));

  if (!mounted) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cutoff = new Date(today);
  cutoff.setDate(today.getDate() + days);

  const urgent = rawItems
    .filter((i) => {
      if (i.status === 'Done' || !i.dueDate) return false;
      const due = new Date(i.dueDate + 'T00:00:00');
      return due <= cutoff;
    })
    .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!));

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <IconChecklist size={15} className="text-orange-500" />
          <span className="text-[13px] font-semibold text-zinc-800">Urgent Actions</span>
        </div>
        <div className="flex items-center gap-1.5">
          {urgent.length > 0 && (
            <span className="text-[11px] font-medium text-red-600 px-2 py-0.5">
              {urgent.length}
            </span>
          )}
          <button
            onClick={() => setSettingsOpen((o) => !o)}
            className="p-1 rounded text-zinc-400 hover:text-orange-500 transition-colors"
            aria-label="Filter settings"
          >
            {settingsOpen ? <IconX size={13} /> : <IconSettings size={13} />}
          </button>
        </div>
      </div>

      {/* Inline settings */}
      {settingsOpen && (
        <div className="mb-3 p-2.5 bg-zinc-50 rounded-lg border border-zinc-200">
          <p className="text-[11px] text-zinc-500 mb-2">Due within</p>
          <div className="flex flex-wrap gap-1">
            {DAY_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => updateDays(n)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  days === n ? 'bg-orange-500 text-white' : 'bg-white border border-zinc-200 text-zinc-500 hover:border-orange-300'
                }`}
              >
                {n}d
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      {urgent.length === 0 ? (
        <p className="text-[12px] text-zinc-400">No urgent items</p>
      ) : (
        <div className="flex flex-col gap-2">
          {urgent.map((item) => {
            const proj = projectMap[item.projectId];
            const { label, cls } = getDueDateLabel(item.dueDate!);
            return (
              <Link
                key={item.id}
                href={`/projects/${item.projectId}/actions`}
                className="flex items-start gap-2 group"
              >
                <StatusIcon status={item.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-zinc-700 group-hover:text-zinc-900 truncate transition-colors leading-tight">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {proj && (
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: proj.color }} />
                    )}
                    <span className={`text-[11px] ${cls}`}>{label}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
