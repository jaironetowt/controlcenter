'use client';

import { useEffect, useState } from 'react';
import { Modal, TextInput, Select, Button, Group, Stack } from '@mantine/core';
import { useActionItemsStore, type ActionItem, type Priority, type ActionStatus } from '@/stores/useActionItemsStore';
import { PriorityIcon } from '@/components/ui/PriorityIcon';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActionItemModalProps {
  opened: boolean;
  onClose: () => void;
  projectId: string;
  /** When provided, the modal opens in edit mode. */
  item?: ActionItem;
}

interface FormState {
  title: string;
  owner: string;
  dueDate: string;
  priority: Priority;
  status: ActionStatus;
}

interface FormErrors {
  title?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'High',   label: 'High'   },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low',    label: 'Low'    },
];

const STATUS_OPTIONS: { value: ActionStatus; label: string }[] = [
  { value: 'To Do',       label: 'To Do'       },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Done',        label: 'Done'        },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function ActionItemModal({ opened, onClose, projectId, item }: ActionItemModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const isEditMode = !!item;

  const addItem    = useActionItemsStore((s) => s.addItem);
  const updateItem = useActionItemsStore((s) => s.updateItem);

  const [form, setForm] = useState<FormState>({
    title:    item?.title    ?? '',
    owner:    item?.owner    ?? '',
    dueDate:  item?.dueDate  ?? '',
    priority: item?.priority ?? 'Medium',
    status:   item?.status   ?? 'To Do',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (opened) {
      setForm({
        title:    item?.title    ?? '',
        owner:    item?.owner    ?? '',
        dueDate:  item?.dueDate  ?? '',
        priority: item?.priority ?? 'Medium',
        status:   item?.status   ?? 'To Do',
      });
      setErrors({});
    }
  }, [opened, item]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key in errors) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function validate(): boolean {
    const next: FormErrors = {};
    if (!form.title.trim()) next.title = 'Title is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSave() {
    if (!validate()) return;

    if (isEditMode && item) {
      updateItem(item.id, {
        title:    form.title.trim(),
        owner:    form.owner.trim(),
        dueDate:  form.dueDate.trim(),
        priority: form.priority,
        status:   form.status,
      });
    } else {
      addItem({
        projectId,
        title:    form.title.trim(),
        owner:    form.owner.trim(),
        dueDate:  form.dueDate.trim(),
        priority: form.priority,
        status:   form.status,
      });
    }

    onClose();
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditMode ? 'Edit Action Item' : 'Add Action Item'}
      size="sm"
      centered
    >
      <Stack gap="sm">
        <TextInput
          label="Title"
          placeholder="Review API contract with backend"
          value={form.title}
          onChange={(e) => setField('title', e.currentTarget.value)}
          error={errors.title}
          required
          autoFocus
        />

        <TextInput
          label="Owner"
          placeholder="Jairo Neto"
          value={form.owner}
          onChange={(e) => setField('owner', e.currentTarget.value)}
        />

        <TextInput
          label="Due date"
          placeholder="2026-05-01"
          value={form.dueDate}
          onChange={(e) => setField('dueDate', e.currentTarget.value)}
        />

        <Select
          label="Priority"
          data={PRIORITY_OPTIONS}
          value={form.priority}
          onChange={(val) => { if (val) setField('priority', val as Priority); }}
          allowDeselect={false}
          renderOption={({ option }) => (
            <div className="flex items-center gap-2">
              <PriorityIcon priority={option.value as Priority} />
              <span>{option.label}</span>
            </div>
          )}
        />

        <Select
          label="Status"
          data={STATUS_OPTIONS}
          value={form.status}
          onChange={(val) => { if (val) setField('status', val as ActionStatus); }}
          allowDeselect={false}
        />

        <Group justify="flex-end" gap="xs" mt="xs">
          <Button variant="default" size="xs" onClick={onClose}>
            Cancel
          </Button>
          <Button size="xs" onClick={handleSave}>
            Save
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
