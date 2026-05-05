'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  return LEVELS[(LEVELS.indexOf(v as 'High' | 'Medium' | 'Low') + 1) % 3] as unknown as T;
}

const ACTIONS: { key: FormType; label: string; icon: React.ReactNode }[] = [
  { key: 'risk',     label: 'Risk',        icon: <IconAlertTriangle size={13} /> },
  { key: 'action',   label: 'Action Item', icon: <IconChecklist     size={13} /> },
  { key: 'reminder', label: 'Alert',       icon: <IconBell          size={13} /> },
];

// ─── Owner chip ───────────────────────────────────────────────────────────────

function OwnerChip({ owner, onChange }: { owner: string; onChange: (v: string) => void }) {
  const [open, setOpen]   = useState(false);
  const [draft, setDraft] = useState(owner);
  const [pos, setPos]     = useState({ top: 0, right: 0 });
  const inputRef          = useRef<HTMLInputElement>(null);
  const buttonRef         = useRef<HTMLButtonElement>(null);
  const popoverRef        = useRef<HTMLDivElement>(null);
  const initial           = owner.trim().charAt(0).toUpperCase() || '?';

  function confirm() {
    const v = draft.trim();
    if (v) { onChange(v); localStorage.setItem(OWNER_KEY, v); }
    setOpen(false);
  }

  function handleOpen() {
    if (buttonRef.current) {
      const r = buttonRef.current.getBoundingClientRect();
      setPos({ top: r.top - 8, right: window.innerWidth - r.right });
    }
    setDraft(owner);
    setOpen((o) => !o);
  }

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 0); }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (
        buttonRef.current?.contains(e.target as Node) ||
        popoverRef.current?.contains(e.target as Node)
      ) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  return (
    <div className="relative flex-shrink-0">
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className="group flex items-center justify-center w-5 h-5 rounded-full bg-zinc-600 text-white text-[10px] font-bold hover:bg-zinc-700 transition-colors"
      >
        {initial}
        <span className="pointer-events-none absolute bottom-full right-0 mb-1.5 whitespace-nowrap rounded-md bg-zinc-800 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
          {owner || 'Set owner'}
        </span>
      </button>

      {open && typeof window !== 'undefined' && createPortal(
        <div
          ref={popoverRef}
          style={{ position: 'fixed', top: pos.top, right: pos.right, transform: 'translateY(-100%)', zIndex: 9999, minWidth: 180 }}
          className="bg-white border border-zinc-200 rounded-xl shadow-lg p-2 flex gap-1.5"
        >
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') confirm(); if (e.key === 'Escape') setOpen(false); }}
            placeholder="Your name"
            autoComplete="off"
            data-form-type="other"
            data-lpignore="true"
            className="flex-1 text-[12px] text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 focus:outline-none focus:border-zinc-400 [&::-webkit-search-cancel-button]:hidden"
            type="search"
          />
          <button onClick={confirm} className="px-2 py-1 rounded-lg bg-orange-500 text-white text-[11px] font-medium hover:bg-orange-600 transition-colors">
            OK
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}

// ─── Capture card ─────────────────────────────────────────────────────────────

interface CaptureCardProps {
  placeholder: string;
  descriptionPlaceholder?: string;
  onSave: (title: string, description: string) => void;
  meta: React.ReactNode;
}

function CaptureCard({ placeholder, descriptionPlaceholder, onSave, meta }: CaptureCardProps) {
  const [title, setTitle]       = useState('');
  const [description, setDesc]  = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  function handleSave() {
    if (!title.trim()) return;
    onSave(title.trim(), description.trim());
    setTitle('');
    setDesc('');
    inputRef.current?.focus({ preventScroll: true });
  }

  return (
    <div className="rounded-xl border border-zinc-300 bg-white overflow-hidden shadow-sm">
      <input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        placeholder={placeholder}
        className="w-full bg-transparent px-3 py-2.5 text-[13px] text-zinc-800 placeholder:text-zinc-400 focus:outline-none"
      />
      {descriptionPlaceholder && (
        <input
          value={description}
          onChange={(e) => setDesc(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder={descriptionPlaceholder}
          className="w-full bg-transparent px-3 py-2.5 text-[13px] text-zinc-800 placeholder:text-zinc-400 focus:outline-none border-t border-zinc-100"
        />
      )}
      <div className="flex items-center gap-1.5 px-3 py-2.5 border-t border-zinc-200">
        <div className="flex flex-col gap-1 flex-1">
          {meta}
        </div>
        <button
          onClick={handleSave}
          disabled={!title.trim()}
          className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:opacity-30 flex-shrink-0"
        >
          <IconArrowRight size={13} />
        </button>
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
  const [openedAt, setOpenedAt]     = useState(() => new Date());
  const [dueDate, setDueDate]       = useState<Date | null>(null);
  const dateInputRef                = useRef<HTMLInputElement>(null);
  const dueDateInputRef             = useRef<HTMLInputElement>(null);

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
    <div className="flex flex-col gap-2 w-full">
      {/* Header */}
      <div className="flex items-center gap-2">
        <IconBolt size={15} className="text-orange-500 flex-shrink-0" />
        <span className="text-[13px] font-semibold text-zinc-800 flex-1">Quick Actions</span>
      </div>

      <>{/* Type selector row */}
      <button
        onClick={() => {
          const idx = ACTIONS.findIndex((a) => a.key === selected);
          setSelected(ACTIONS[(idx + 1) % ACTIONS.length].key);
        }}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium border border-orange-200 bg-orange-50 text-orange-600 hover:border-orange-400 transition-colors focus:outline-none"
      >
        {current.icon}
        <span className="flex-1 text-left">{current.label}</span>
        <IconChevronDown size={11} className="text-orange-300 flex-shrink-0" />
      </button>

      {/* Project selector + owner chip row */}
      {selected !== 'reminder' && (() => {
        const proj = allProjects.find((p) => p.id === projectId);
        return (
          <div className="flex items-center gap-1.5">
            <button
              onClick={cycleProject}
              title="Click to change project"
              className="flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium border border-zinc-200 bg-white text-zinc-600 hover:border-orange-300 hover:text-orange-600 transition-colors focus:outline-none"
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: proj?.color }} />
              <span className="flex-1 text-left truncate">{proj?.name ?? '—'}</span>
              <IconChevronDown size={11} className="text-zinc-300 flex-shrink-0" />
            </button>
            <OwnerChip owner={owner} onChange={setOwner} />
          </div>
        );
      })()}

      {/* Risk form */}
      {selected === 'risk' && (
        <CaptureCard
          placeholder="Risk title…"
          descriptionPlaceholder="Describe the risk…"
          onSave={(title, description) => {
            addRisk({ projectId, title, description, impact, probability, status: 'Open', owner, createdAt: openedAt.getTime() });
            setOpenedAt(new Date());
          }}
          meta={
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 text-[10px] w-[60px]">Probability</span>
                <button
                  onClick={() => setProbability((p) => nextLevel(p))}
                  className="flex items-center gap-1 px-1.5 py-px rounded-md bg-zinc-100 border border-zinc-300 text-[10px] text-zinc-600 hover:border-orange-400 hover:bg-orange-50 transition-colors w-[76px]"
                >
                  <PriorityIcon priority={probability as Priority} />
                  <span className="text-zinc-400 text-[10px] ml-auto">{probability}</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 text-[10px] w-[60px]">Impact</span>
                <button
                  onClick={() => setImpact((p) => nextLevel(p))}
                  className="flex items-center gap-1 px-1.5 py-px rounded-md bg-zinc-100 border border-zinc-300 text-[10px] text-zinc-600 hover:border-orange-400 hover:bg-orange-50 transition-colors w-[76px]"
                >
                  <PriorityIcon priority={impact as Priority} />
                  <span className="text-zinc-400 text-[10px] ml-auto">{impact}</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 text-[10px] w-[60px]">Opened</span>
                <div className="relative w-[98px]">
                  <div
                    onClick={() => dateInputRef.current?.showPicker?.()}
                    className="flex items-center gap-1 px-1.5 py-px rounded-md bg-zinc-100 border border-zinc-300 text-[10px] text-zinc-600 hover:border-orange-400 hover:bg-orange-50 transition-colors cursor-pointer w-full"
                  >
                    <svg className="w-2.5 h-2.5 text-zinc-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-zinc-400 text-[10px] ml-auto truncate">
                      {openedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={openedAt.toISOString().slice(0, 10)}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => {
                      const [y, m, d] = e.currentTarget.value.split('-').map(Number);
                      const date = new Date(y, m - 1, d);
                      if (!isNaN(date.getTime())) setOpenedAt(date);
                    }}
                    className="absolute inset-0 opacity-0 pointer-events-none"
                    tabIndex={-1}
                  />
                </div>
              </div>
            </div>
          }
        />
      )}

      {/* Action Item form */}
      {selected === 'action' && (
        <CaptureCard
          placeholder="What needs to be done…"
          onSave={(title) => {
            addItem({ projectId, title, owner, dueDate: dueDate ? dueDate.toISOString().slice(0, 10) : '', priority, status: 'To Do' });
            setDueDate(null);
          }}
          meta={
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 text-[10px] w-[60px]">Priority</span>
                <button
                  onClick={() => setPriority((p) => nextLevel(p))}
                  className="flex items-center gap-1 px-1.5 py-px rounded-md bg-zinc-100 border border-zinc-300 text-[10px] text-zinc-600 hover:border-orange-400 hover:bg-orange-50 transition-colors w-[76px]"
                >
                  <PriorityIcon priority={priority} />
                  <span className="text-zinc-400 text-[10px] ml-auto">{priority}</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 text-[10px] w-[60px]">Due date</span>
                <div className="relative w-[98px]">
                  <div
                    onClick={() => dueDateInputRef.current?.showPicker?.()}
                    className="flex items-center gap-1 px-1.5 py-px rounded-md bg-zinc-100 border border-zinc-300 text-[10px] text-zinc-600 hover:border-orange-400 hover:bg-orange-50 transition-colors cursor-pointer w-full"
                  >
                    <svg className="w-2.5 h-2.5 text-zinc-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-zinc-400 text-[10px] ml-auto truncate">
                      {dueDate ? dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'None'}
                    </span>
                  </div>
                  <input
                    ref={dueDateInputRef}
                    type="date"
                    value={dueDate ? dueDate.toISOString().slice(0, 10) : ''}
                    onChange={(e) => {
                      if (!e.currentTarget.value) { setDueDate(null); return; }
                      const [y, m, d] = e.currentTarget.value.split('-').map(Number);
                      const date = new Date(y, m - 1, d);
                      if (!isNaN(date.getTime())) setDueDate(date);
                    }}
                    className="absolute inset-0 opacity-0 pointer-events-none"
                    tabIndex={-1}
                  />
                </div>
              </div>
            </div>
          }
        />
      )}

      {/* Reminder placeholder */}
      {selected === 'reminder' && (
        <div className="flex flex-col items-center gap-1.5 py-5 rounded-xl bg-zinc-50 border border-zinc-200">
          <IconBell size={18} className="text-zinc-300" />
          <p className="text-[11px] text-zinc-400">Alerts coming soon</p>
          <p className="text-[10px] text-zinc-300">Google Tasks / Calendar</p>
        </div>
      )}
      </>
    </div>
  );
}
