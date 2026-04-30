'use client';

import { useState, useEffect } from 'react';
import { Modal, TextInput, Textarea, Select, Button, Group, Stack, Text } from '@mantine/core';
import { useRisksStore, type Risk, type Probability, type Impact, type RiskStatus } from '@/stores/useRisksStore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RiskModalProps {
  opened: boolean;
  onClose: () => void;
  projectId: string;
  /** When provided, the modal opens in edit mode for this risk. */
  risk?: Risk;
}

interface FormState {
  title: string;
  description: string;
  probability: Probability;
  impact: Impact;
  status: RiskStatus;
  owner: string;
}

interface FormErrors {
  title?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RiskModal({ opened, onClose, projectId, risk }: RiskModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const isEditMode = !!risk;

  const addRisk    = useRisksStore((s) => s.addRisk);
  const updateRisk = useRisksStore((s) => s.updateRisk);
  const deleteRisk = useRisksStore((s) => s.deleteRisk);

  // ── Form state ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState<FormState>({
    title:       risk?.title       ?? '',
    description: risk?.description ?? '',
    probability: risk?.probability ?? 'Medium',
    impact:      risk?.impact      ?? 'Medium',
    status:      risk?.status      ?? 'Open',
    owner:       risk?.owner       ?? '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Reset form whenever the modal opens (or the risk changes)
  useEffect(() => {
    if (opened) {
      setForm({
        title:       risk?.title       ?? '',
        description: risk?.description ?? '',
        probability: risk?.probability ?? 'Medium',
        impact:      risk?.impact      ?? 'Medium',
        status:      risk?.status      ?? 'Open',
        owner:       risk?.owner       ?? '',
      });
      setErrors({});
      setConfirmingDelete(false);
    }
  }, [opened, risk]);

  // ── Helpers ─────────────────────────────────────────────────────────────────

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

    if (isEditMode && risk) {
      updateRisk(risk.id, {
        title:       form.title.trim(),
        description: form.description.trim(),
        probability: form.probability,
        impact:      form.impact,
        status:      form.status,
        owner:       form.owner.trim(),
      });
    } else {
      addRisk({
        projectId,
        title:       form.title.trim(),
        description: form.description.trim(),
        probability: form.probability,
        impact:      form.impact,
        status:      form.status,
        owner:       form.owner.trim(),
      });
    }

    onClose();
  }

  function handleDeleteConfirm() {
    if (risk) {
      deleteRisk(risk.id);
    }
    setConfirmingDelete(false);
    onClose();
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditMode ? 'Edit Risk' : 'Add Risk'}
      size="md"
      centered
    >
      {confirmingDelete ? (
        /* ── Delete confirmation ────────────────────────────────────────────── */
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Delete <strong>{form.title || 'this risk'}</strong>? This action cannot be undone.
          </Text>
          <Group justify="flex-end" gap="xs">
            <Button variant="default" size="xs" onClick={() => setConfirmingDelete(false)}>
              Cancel
            </Button>
            <Button color="red" size="xs" onClick={handleDeleteConfirm}>
              Yes, delete
            </Button>
          </Group>
        </Stack>
      ) : (
        /* ── Form view ──────────────────────────────────────────────────────── */
        <Stack gap="sm">
          <TextInput
            label="Title"
            placeholder="Describe the risk briefly"
            value={form.title}
            onChange={(e) => setField('title', e.currentTarget.value)}
            error={errors.title}
            required
            autoFocus
          />

          <Textarea
            label="Description"
            placeholder="Additional context, triggers, or consequences…"
            value={form.description}
            onChange={(e) => setField('description', e.currentTarget.value)}
            rows={3}
            autosize={false}
          />

          <Group grow gap="sm">
            <Select
              label="Probability"
              data={['High', 'Medium', 'Low']}
              value={form.probability}
              onChange={(v) => { if (v) setField('probability', v as Probability); }}
              allowDeselect={false}
            />

            <Select
              label="Impact"
              data={['High', 'Medium', 'Low']}
              value={form.impact}
              onChange={(v) => { if (v) setField('impact', v as Impact); }}
              allowDeselect={false}
            />
          </Group>

          <Select
            label="Status"
            data={['Open', 'Mitigated', 'Closed']}
            value={form.status}
            onChange={(v) => { if (v) setField('status', v as RiskStatus); }}
            allowDeselect={false}
          />

          <TextInput
            label="Owner"
            placeholder="Who is responsible for this risk?"
            value={form.owner}
            onChange={(e) => setField('owner', e.currentTarget.value)}
          />

          <Group justify="space-between" mt="xs">
            {isEditMode ? (
              <Button
                variant="subtle"
                color="red"
                size="xs"
                onClick={() => setConfirmingDelete(true)}
              >
                Delete
              </Button>
            ) : (
              <span />
            )}

            <Group gap="xs">
              <Button variant="default" size="xs" onClick={onClose}>
                Cancel
              </Button>
              <Button size="xs" onClick={handleSave}>
                Save
              </Button>
            </Group>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
