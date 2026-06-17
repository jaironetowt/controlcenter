'use client';

import { useState, useEffect } from 'react';
import { IconPencil, IconTrash, IconCircle, IconCircleHalf2, IconCircleCheck } from '@tabler/icons-react';
import { useActionItemsStore, type ActionItem, type ActionStatus } from '@/stores/useActionItemsStore';
import { useSpaceStore } from '@/stores/useSpaceStore';
import { PriorityIcon } from '@/components/ui/PriorityIcon';
import { ViewState } from '@/components/ui/ViewState';
import { ActionItemModal } from './ActionItemModal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActionItemListProps {
  projectId: string;
}

type FilterTab = 'All' | ActionStatus;

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTER_TABS: FilterTab[] = ['All', 'To Do', 'In Progress', 'Done'];

const STATUS_CYCLE: Record<ActionStatus, ActionStatus> = {
  'To Do':       'In Progress',
  'In Progress': 'Done',
  'Done':        'To Do',
};

// ─── Badge helpers ────────────────────────────────────────────────────────────


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
    'To Do':       <IconCircle       size={16} className="text-zinc-400" />,
    'In Progress': <IconCircleHalf2  size={16} className="text-blue-500" />,
    'Done':        <IconCircleCheck  size={16} className="text-green-500" />,
  };

  return (
    <button
      aria-label={`Cycle status (currently ${status})`}
      onClick={onClick}
      className="flex items-center justify-center w-6 h-6 rounded hover:bg-zinc-100 transition-colors"
    >
      {icons[status]}
    </button>
  );
}

// ─── Row sub-component ────────────────────────────────────────────────────────

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
      {/* Title */}
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-2">
          <CycleStatusButton
            status={item.status}
            onClick={() => onCycleStatus(item.id, STATUS_CYCLE[item.status])}
          />
          <span className={`text-[13px] text-zinc-800 truncate ${item.status === 'Done' ? 'line-through text-zinc-400' : ''}`}>
            {item.title}
          </span>
        </div>
      </td>

      {/* Owner */}
      <td className="py-2.5 px-3 text-[12px] text-zinc-500 truncate">
        {item.owner || <span className="text-zinc-300">—</span>}
      </td>

      {/* Due date */}
      <td className={`py-2.5 px-3 text-[12px] whitespace-nowrap ${isPastDue ? 'text-red-500 font-medium' : 'text-zinc-500'}`}>
        {item.dueDate || <span className="text-zinc-300">—</span>}
      </td>

      {/* Priority */}
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-1.5">
          <PriorityIcon priority={item.priority} />
          <span className="text-[12px] text-zinc-600">{item.priority}</span>
        </div>
      </td>

      {/* Status */}
      <td className="py-2.5 px-3">
        <StatusBadge status={item.status} />
      </td>

      {/* Actions */}
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-1">
          <button
            aria-label="Edit action item"
            onClick={() => { setConfirmDelete(false); onEdit(item); }}
            className="flex items-center justify-center w-7 h-7 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <IconPencil size={13} />
          </button>
          <button
            aria-label={confirmDelete ? 'Confirm delete' : 'Delete action item'}
            onClick={() => {
              if (confirmDelete) {
                onDelete(item.id);
              } else {
                setConfirmDelete(true);
              }
            }}
            onBlur={() => setConfirmDelete(false)}
            className={`flex items-center justify-center w-7 h-7 rounded-md transition-colors ${
              confirmDelete
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'text-zinc-400 hover:text-red-500 hover:bg-zinc-100'
            }`}
          >
            <IconTrash size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ActionItemList({ projectId }: ActionItemListProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const rawItems  = useActionItemsStore((s) => s.items);
  const loading    = useActionItemsStore((s) => s.loading);
  const error      = useActionItemsStore((s) => s.error);
  const updateItem = useActionItemsStore((s) => s.updateItem);
  const deleteItem = useActionItemsStore((s) => s.deleteItem);
  const canEdit    = useSpaceStore((s) => s.me != null && s.selectedSpace === s.me.sub);

  const items = mounted ? rawItems.filter((i) => i.projectId === projectId) : [];

  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState<ActionItem | undefined>(undefined);

  const filtered = activeTab === 'All' ? items : items.filter((i) => i.status === activeTab);

  function openCreate() {
    setEditing(undefined);
    setModalOpen(true);
  }

  function openEdit(item: ActionItem) {
    setEditing(item);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(undefined);
  }

  function handleCycleStatus(id: string, next: ActionStatus) {
    updateItem(id, { status: next });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-semibold text-zinc-900">Action Items</h2>
        {canEdit && (
          <button
            onClick={openCreate}
            className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-[13px] font-medium hover:bg-blue-600 transition-colors"
          >
            Add Item
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1">
        {FILTER_TABS.map((tab) => {
          const count = tab === 'All' ? items.length : items.filter((i) => i.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800'
              }`}
            >
              {tab}
              <span className={`ml-1.5 text-[11px] ${activeTab === tab ? 'text-white/70' : 'text-zinc-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <ViewState
        loading={!mounted || loading}
        error={error}
        isEmpty={filtered.length === 0}
        emptyMessage={activeTab === 'All' ? 'Nenhum action item ainda' : `Nenhum item com status "${activeTab}"`}
        className="py-16"
      >
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-auto" />
              <col style={{ width: 100 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: 90 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: 64 }} />
            </colgroup>
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
              {filtered.map((item) => (
                <ActionRow
                  key={item.id}
                  item={item}
                  onEdit={openEdit}
                  onDelete={deleteItem}
                  onCycleStatus={handleCycleStatus}
                />
              ))}
            </tbody>
          </table>
        </div>
      </ViewState>

      {/* Modal */}
      <ActionItemModal
        opened={modalOpen}
        onClose={closeModal}
        projectId={projectId}
        item={editing}
      />
    </div>
  );
}
