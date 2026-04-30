'use client';

import { useState, useEffect, useRef } from 'react';
import {
  IconBolt, IconAlertTriangle, IconChecklist, IconBell,
  IconArrowRight, IconChevronDown,
} from '@tabler/icons-react';

import { useProjectsStore } from '@/stores/useProjectsStore';
import { useRisksStore, type Probability, type Impact } from '@/stores/useRisksStore';
import { useActionItemsStore, type Priority } from '@/stores/useActionItemsStore';
import { PriorityIcon } from '@/components/ui/PriorityIcon';

type FormType = 'risk' | 'action' | 'reminder';

const OWNER_KEY = 'hd-qa-owner';
const LEVELS: ('High' | 'Medium' | 'Low')[] = ['High', 'Medium', 'Low'];

function nextLevel<T extends string>(v: T): T {
  return LEVELS[(LEVELS.indexOf(v as string) + 1) % 3] as T;
}

const ACTIONS: { key: FormType; label: string; icon: React.ReactNode }[] = [
  { key: 'risk',     label: 'Risk',        icon: <IconAlertTriangle size={13} /> },
  { key: 'action',   label: 'Action Item', icon: <IconChecklist     size={13} /> },
  { key: 'reminder', label: 'Alert',       icon: <IconBell          size={13} /> },
];

// ─── Owner chip ───────────────────────────────────────────────────────────────

function OwnerChip({ owner, onChange }: { owner: string; onChange: (v: string) => void }) {
  const [open, setOpen]     = useState(false);
  const [draft, setDraft]   = useState(owner);
  const inputRef            = useRef<HTMLInputElement>(null);
  const containerRef        = useRef<HTMLDivElement>(null);
  const initial             = owner.trim().charAt(0).toUpperCase() || '?';

  function confirm() {
    const v = draft.trim();
    if (v) { onChange(v); localStorage.setItem(OWNER_KEY, v); }
    setOpen(false);
  }

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 0); }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => { setDraft(owner); setOpen((o) => !o); }}
        title={owner || 'Set owner'}
        className="group flex items-center justify-center w-5 h-5 rounded-full bg-zinc-600 text-white text-[10px] font-bold hover:bg-zinc-700 transition-colors"
      >
        {initial}
        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded-md bg-zinc-800 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
          {owner || 'Set owner'}
        </span>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 bg-white border border-zinc-200 rounded-xl shadow-lg p-2 flex gap-1.5 z-30" style={{ minWidth: 160 }}>
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') confirm(); if (e.key === 'Escape') setOpen(false); }}
            placeholder="Your name"
            className="flex-1 text-[12px] text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 focus:outline-none focus:border-zinc-400"
          />
          <button
            onClick={confirm}
            className="px-2 py-1 rounded-lg bg-orange-500 text-white text-[11px] font-medium hover:bg-orange-600 transition-colors"
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Capture card ─────────────────────────────────────────────────────────────

interface CaptureCardProps {
  placeholder: string;
  owner: string;
  onOwnerChange: (v: string) => void;
  onSave: (title: string) => void;
  meta: React.ReactNode;
}

function CaptureCard({ placeholder, owner, onOwnerChange, onSave, meta }: CaptureCardProps) {
  const [title, setTitle] = useState('');

  function handleSave() {
    if (!title.trim()) return;
    onSave(title.trim());
    setTitle('');
  }

  return (
    <div className="mt-2 rounded-xl border border-zinc-300 bg-white overflow-hidden shadow-sm">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        placeholder={placeholder}
        className="w-full bg-transparent px-3 pt-3 pb-2 text-[13px] text-zinc-800 placeholder:text-zinc-400 focus:outline-none"
      />
      <div className="flex items-end gap-1.5 px-3 pb-2.5 pt-1.5 border-t border-zinc-200">
        <div className="flex flex-col gap-1 flex-1">
          {meta}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <OwnerChip owner={owner} onChange={onOwnerChange} />
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:opacity-30"
          >
            <IconArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function QuickActions() {
  const [mounted, setMounted]       = useState(false);
  const [selected, setSelected]     = useState<FormType>('risk');
  const [projectId, setProjectId]   = useState('');
  const [impact, setImpact]         = useState<Impact>('Medium');
  const [probability, setProbability] = useState<Probability>('Medium');
  const [priority, setPriority]     = useState<Priority>('Medium');
  const [owner, setOwner]           = useState('');

  const allProjects = useProjectsStore((s) => s.projects).filter((p) => !p.archived);
  const addRisk     = useRisksStore((s) => s.addRisk);
  const addItem     = useActionItemsStore((s) => s.addItem);

  useEffect(() => {
    const LAST = 'hd-qa-last-project';
    const last = localStorage.getItem(LAST);
    const firstId = allProjects[0]?.id ?? '';
    setProjectId(last && allProjects.find((p) => p.id === last) ? last : firstId);
    setOwner(localStorage.getItem(OWNER_KEY) ?? '');
    setMounted(true);
  }, []);

  function cycleProject() {
    const idx  = allProjects.findIndex((p) => p.id === projectId);
    const next = allProjects[(idx + 1) % allProjects.length];
    if (!next) return;
    setProjectId(next.id);
    localStorage.setItem('hd-qa-last-project', next.id);
  }

if (!mounted) return null;

  const current = ACTIONS.find((a) => a.key === selected)!;

  return (
    <>
      {/* Header: title + project selector */}
      <div className="flex items-center gap-1 mb-2">
        <IconBolt size={15} className="text-orange-500 flex-shrink-0" />
        <span className="text-[13px] font-semibold text-zinc-800 flex-shrink-0">Quick Actions</span>

        {/* Project selector — compact, cycles on click, hidden for Alert */}
        {selected !== 'reminder' && (() => {
          const proj = allProjects.find((p) => p.id === projectId);
          return (
            <button
              onClick={cycleProject}
              title="Click to change project"
              className="flex-1 min-w-0 flex items-center justify-center px-2 py-1 rounded-lg text-[10px] font-medium border bg-white text-zinc-600 transition-colors focus:outline-none hover:opacity-80"
              style={{ borderColor: proj?.color ?? '#e4e4e7' }}
            >
              <span className="truncate">{proj?.name ?? '—'}</span>
            </button>
          );
        })()}
      </div>

      {/* Type selector — full width row */}
      <button
        onClick={() => {
          const idx = ACTIONS.findIndex((a) => a.key === selected);
          setSelected(ACTIONS[(idx + 1) % ACTIONS.length].key);
        }}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 mb-1 rounded-lg text-[12px] font-medium border border-orange-200 bg-orange-50 text-orange-600 hover:border-orange-400 transition-colors focus:outline-none"
      >
        {current.icon}
        <span className="flex-1 text-left">{current.label}</span>
        <IconChevronDown size={11} className="text-orange-300 flex-shrink-0" />
      </button>

      {/* Risk form */}
      {selected === 'risk' && (
        <CaptureCard
          placeholder="Describe the risk…"
          owner={owner}
          onOwnerChange={setOwner}
          onSave={(title) => addRisk({ projectId, title, description: '', impact, probability, status: 'Open', owner })}
          meta={
            <>
              <button
                onClick={() => setProbability(nextLevel)}
                title="Probability"
                className="flex items-center gap-1 px-1.5 py-px rounded-full bg-zinc-100 border border-zinc-300 text-[10px] text-zinc-600 hover:border-orange-400 hover:bg-orange-50 transition-colors w-fit"
              >
                <span className="text-zinc-500 text-[10px] truncate max-w-[52px]">Probability</span>
                <PriorityIcon priority={probability as Priority} />
              </button>
              <button
                onClick={() => setImpact(nextLevel)}
                title="Impact"
                className="flex items-center gap-1 px-1.5 py-px rounded-full bg-zinc-100 border border-zinc-300 text-[10px] text-zinc-600 hover:border-orange-400 hover:bg-orange-50 transition-colors w-fit"
              >
                <span className="text-zinc-500 text-[10px]">Impact</span>
                <PriorityIcon priority={impact as Priority} />
              </button>
            </>
          }
        />
      )}

      {/* Action Item form */}
      {selected === 'action' && (
        <CaptureCard
          placeholder="What needs to be done…"
          owner={owner}
          onOwnerChange={setOwner}
          onSave={(title) => addItem({ projectId, title, owner, dueDate: '', priority, status: 'To Do' })}
          meta={
            <button
              onClick={() => setPriority(nextLevel)}
              title="Priority"
              className="flex items-center gap-1 px-1.5 py-px rounded-full bg-zinc-100 border border-zinc-300 text-[10px] text-zinc-600 hover:border-orange-400 hover:bg-orange-50 transition-colors w-fit"
            >
              <span className="text-zinc-500 text-[10px]">Priority</span>
              <PriorityIcon priority={priority} />
            </button>
          }
        />
      )}

      {/* Reminder placeholder */}
      {selected === 'reminder' && (
        <div className="mt-2 flex flex-col items-center gap-1.5 py-5 rounded-xl bg-zinc-50 border border-zinc-200">
          <IconBell size={18} className="text-zinc-300" />
          <p className="text-[11px] text-zinc-400">Alerts coming soon</p>
          <p className="text-[10px] text-zinc-300">Google Tasks / Calendar</p>
        </div>
      )}
    </>
  );
}
