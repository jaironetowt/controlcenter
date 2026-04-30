'use client';

import { useState, useEffect } from 'react';
import {
  IconCircle, IconCircleHalf2, IconCircleCheck,
  IconPencil, IconTrash, IconChecklist,
} from '@tabler/icons-react';
import { useActionItemsStore, type ActionItem, type ActionStatus, type Priority } from '@/stores/useActionItemsStore';
import { useProjectsStore, type Project } from '@/stores/useProjectsStore';
import { ActionItemModal } from '@/components/actions/ActionItemModal';

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterTab = 'All' | ActionStatus;

const FILTER_TABS: FilterTab[] = ['All', 'To Do', 'In Progress', 'Done'];

const STATUS_CYCLE: Record<ActionStatus, ActionStatus> = {
  'To Do':       'In Progress',
  'In Progress': 'Done',
  'Done':        'To Do',
};

// ─── Badge helpers ────────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: Priority }) {
  const cls: Record<Priority, string> = {
    High:   'bg-red-100 text-red-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    Low:    'bg-zinc-100 text-zinc-600',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${cls[priority]}`}>
      {priority}
    </span>
  );
}

function StatusBadge({ status }: { status: ActionStatus }) {
  const cls: Record<ActionStatus, string> = {
    'To Do':       'bg-zinc-100 text-zinc-600',
    'In Progress': 'bg-blue-100 text-blue-700',
    'Done':        'bg-green-100 text-green-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${cls[status]}`}>
      {status}
    </span>
  );
}

function CycleStatusButton({ status, onClick }: { status: ActionStatus; onClick: () => void }) {
  const icons: Record<ActionStatus, React.ReactNode> = {
    'To Do':       <IconCircle      size={16} className="text-zinc-400" />,
    'In Progress': <IconCircleHalf2 size={16} className="text-blue-500" />,
    'Done':        <IconCircleCheck size={16} className="text-green-500" />,
  };
  return (
    <button onClick={onClick} className="flex items-center justify-center w-6 h-6 rounded hover:bg-zinc-100 transition-colors">
      {icons[status]}
    </button>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

interface RowProps {
  item: ActionItem;
  onEdit: (item: ActionItem) => void;
  onDelete: (id: string) => void;
  onCycleStatus: (id: string, next: ActionStatus) => void;
}

function ActionRow({ item, onEdit, onDelete, onCycleStatus }: RowProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const isPastDue = item.dueDate && item.dueDate < today && item.status !== 'Done';

  return (
    <tr className="border-b border-zinc-100 hover:bg-zinc-50/60 transition-colors">
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-2">
          <CycleStatusButton status={item.status} onClick={() => onCycleStatus(item.id, STATUS_CYCLE[item.status])} />
          <span className={`text-[13px] text-zinc-800 ${item.status === 'Done' ? 'line-through text-zinc-400' : ''}`}>
            {item.title}
          </span>
        </div>
      </td>
      <td className="py-2.5 px-3 text-[12px] text-zinc-500 whitespace-nowrap">
        {item.owner || <span className="text-zinc-300">—</span>}
      </td>
      <td className={`py-2.5 px-3 text-[12px] whitespace-nowrap ${isPastDue ? 'text-red-500 font-medium' : 'text-zinc-500'}`}>
        {item.dueDate || <span className="text-zinc-300">—</span>}
      </td>
      <td className="py-2.5 px-3"><PriorityBadge priority={item.priority} /></td>
      <td className="py-2.5 px-3"><StatusBadge status={item.status} /></td>
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setConfirmDelete(false); onEdit(item); }}
            className="flex items-center justify-center w-7 h-7 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <IconPencil size={13} />
          </button>
          <button
            onClick={() => { if (confirmDelete) { onDelete(item.id); } else { setConfirmDelete(true); } }}
            onBlur={() => setConfirmDelete(false)}
            className={`flex items-center justify-center w-7 h-7 rounded-md transition-colors ${
              confirmDelete ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'text-zinc-400 hover:text-red-500 hover:bg-zinc-100'
            }`}
          >
            <IconTrash size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Swimlane ─────────────────────────────────────────────────────────────────

interface SwimlaneProps {
  project: Project;
  items: ActionItem[];
  onEdit: (item: ActionItem) => void;
  onDelete: (id: string) => void;
  onCycleStatus: (id: string, next: ActionStatus) => void;
}

function Swimlane({ project, items, onEdit, onDelete, onCycleStatus }: SwimlaneProps) {
  const openCount = items.filter((i) => i.status !== 'Done').length;

  return (
    <div className="flex flex-col">
      {/* Swimlane header */}
      <div className="flex items-center gap-2.5 mb-2">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
        <span className="text-[13px] font-semibold text-zinc-800">{project.name}</span>
        <span className="text-[11px] text-zinc-400">{project.client}</span>
        <span className="ml-auto text-[11px] font-medium text-zinc-500">
          {openCount} open · {items.length} total
        </span>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/60">
              <th className="py-2 px-3 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wide">Title</th>
              <th className="py-2 px-3 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wide">Owner</th>
              <th className="py-2 px-3 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wide">Due Date</th>
              <th className="py-2 px-3 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wide">Priority</th>
              <th className="py-2 px-3 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wide">Status</th>
              <th className="py-2 px-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <ActionRow
                key={item.id}
                item={item}
                onEdit={onEdit}
                onDelete={onDelete}
                onCycleStatus={onCycleStatus}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GlobalActionsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const rawItems   = useActionItemsStore((s) => s.items);
  const updateItem = useActionItemsStore((s) => s.updateItem);
  const deleteItem = useActionItemsStore((s) => s.deleteItem);
  const projects   = useProjectsStore((s) => s.projects);

  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing,   setEditing]   = useState<ActionItem | undefined>(undefined);

  const items = mounted ? rawItems : [];

  const sortItems = (list: ActionItem[]) => {
    const order: Record<ActionStatus, number> = { 'In Progress': 0, 'To Do': 1, 'Done': 2 };
    return [...list].sort((a, b) => order[a.status] - order[b.status] || (a.dueDate ?? '').localeCompare(b.dueDate ?? ''));
  };

  const activeProjects = projects.filter(
    (p) => !p.archived && items.some((i) => i.projectId === p.id),
  );

  const swimlanes = activeProjects
    .map((p) => ({
      project: p,
      items: sortItems(
        items.filter((i) => i.projectId === p.id && (activeTab === 'All' || i.status === activeTab)),
      ),
    }))
    .filter((s) => s.items.length > 0);

  const totalFiltered = swimlanes.reduce((sum, s) => sum + s.items.length, 0);

  const tabCount = (tab: FilterTab) =>
    tab === 'All' ? items.length : items.filter((i) => i.status === tab).length;

  function openEdit(item: ActionItem) { setEditing(item); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditing(undefined); }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 pl-10 pr-14 py-4 border-b border-zinc-200 bg-white flex-shrink-0">
        <IconChecklist size={20} className="text-blue-500 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-[20px] font-semibold text-zinc-900 leading-tight">Action Items</p>
          <p className="text-[12px] text-zinc-500 mt-0.5">All projects · {totalFiltered} items</p>
        </div>
        {/* Status tabs */}
        <div className="flex items-center gap-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors ${
                activeTab === tab ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800'
              }`}
            >
              {tab}
              <span className={`ml-1.5 text-[11px] ${activeTab === tab ? 'text-white/70' : 'text-zinc-400'}`}>
                {tabCount(tab)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Swimlanes */}
      <div className="flex-1 overflow-y-auto px-10 py-6 flex flex-col gap-8">
        {swimlanes.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-[13px] text-zinc-400">
            No action items found
          </div>
        ) : (
          swimlanes.map(({ project, items: projItems }) => (
            <Swimlane
              key={project.id}
              project={project}
              items={projItems}
              onEdit={openEdit}
              onDelete={deleteItem}
              onCycleStatus={(id, next) => updateItem(id, { status: next })}
            />
          ))
        )}
      </div>

      {editing && (
        <ActionItemModal
          opened={modalOpen}
          onClose={closeModal}
          projectId={editing.projectId}
          item={editing}
        />
      )}
    </div>
  );
}
