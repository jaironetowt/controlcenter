'use client';

import { useState, useEffect } from 'react';
import { Modal, TextInput, Select, Textarea, Button, Group, Stack } from '@mantine/core';
import { useStakeholdersStore, type Stakeholder, type InfluenceLevel, type InterestLevel } from '@/stores/useStakeholdersStore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StakeholderModalProps {
  opened: boolean;
  onClose: () => void;
  projectId: string;
  /** When provided, the modal opens in edit mode for this stakeholder. */
  stakeholder?: Stakeholder;
}

interface FormState {
  name: string;
  role: string;
  company: string;
  influence: InfluenceLevel;
  interest: InterestLevel;
  notes: string;
}

interface FormErrors {
  name?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StakeholderModal({ opened, onClose, projectId, stakeholder }: StakeholderModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const isEditMode = !!stakeholder;

  const addStakeholder    = useStakeholdersStore((s) => s.addStakeholder);
  const updateStakeholder = useStakeholdersStore((s) => s.updateStakeholder);

  // ── Form state ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState<FormState>({
    name:      stakeholder?.name      ?? '',
    role:      stakeholder?.role      ?? '',
    company:   stakeholder?.company   ?? '',
    influence: stakeholder?.influence ?? 'High',
    interest:  stakeholder?.interest  ?? 'High',
    notes:     stakeholder?.notes     ?? '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Reset form whenever the modal opens or the stakeholder changes
  useEffect(() => {
    if (opened) {
      setForm({
        name:      stakeholder?.name      ?? '',
        role:      stakeholder?.role      ?? '',
        company:   stakeholder?.company   ?? '',
        influence: stakeholder?.influence ?? 'High',
        interest:  stakeholder?.interest  ?? 'High',
        notes:     stakeholder?.notes     ?? '',
      });
      setErrors({});
    }
  }, [opened, stakeholder]);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === 'name') {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  }

  function validate(): boolean {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = 'Name is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSave() {
    if (!validate()) return;

    if (isEditMode && stakeholder) {
      updateStakeholder(stakeholder.id, {
        name:      form.name.trim(),
        role:      form.role.trim(),
        company:   form.company.trim(),
        influence: form.influence,
        interest:  form.interest,
        notes:     form.notes.trim(),
      });
    } else {
      addStakeholder({
        projectId,
        name:      form.name.trim(),
        role:      form.role.trim(),
        company:   form.company.trim(),
        influence: form.influence,
        interest:  form.interest,
        notes:     form.notes.trim(),
      });
    }

    onClose();
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditMode ? 'Edit Stakeholder' : 'Add Stakeholder'}
      size="sm"
      centered
    >
      <Stack gap="sm">
        <TextInput
          label="Name"
          placeholder="Amanda Rivera"
          value={form.name}
          onChange={(e) => setField('name', e.currentTarget.value)}
          error={errors.name}
          required
          autoFocus
        />

        <TextInput
          label="Role"
          placeholder="VP of Engineering"
          value={form.role}
          onChange={(e) => setField('role', e.currentTarget.value)}
        />

        <TextInput
          label="Company"
          placeholder="WillowTree"
          value={form.company}
          onChange={(e) => setField('company', e.currentTarget.value)}
        />

        <Select
          label="Influence"
          data={['High', 'Low']}
          value={form.influence}
          onChange={(val) => { if (val === 'High' || val === 'Low') setField('influence', val); }}
          allowDeselect={false}
        />

        <Select
          label="Interest"
          data={['High', 'Low']}
          value={form.interest}
          onChange={(val) => { if (val === 'High' || val === 'Low') setField('interest', val); }}
          allowDeselect={false}
        />

        <Textarea
          label="Notes"
          placeholder="Key context, communication preferences…"
          value={form.notes}
          onChange={(e) => setField('notes', e.currentTarget.value)}
          rows={3}
          autosize={false}
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
