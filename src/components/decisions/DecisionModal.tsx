'use client';

import { useEffect, useState } from 'react';
import { Modal, TextInput, Textarea, Button, Group, Stack } from '@mantine/core';
import { useDecisionsStore, type Decision } from '@/stores/useDecisionsStore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DecisionModalProps {
  opened: boolean;
  onClose: () => void;
  projectId: string;
  /** When provided, the modal opens in edit mode. */
  decision?: Decision;
}

interface FormState {
  title: string;
  context: string;
  decision: string;
  alternatives: string;
  author: string;
}

interface FormErrors {
  title?: string;
  decision?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DecisionModal({ opened, onClose, projectId, decision }: DecisionModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const isEditMode = !!decision;

  const addDecision    = useDecisionsStore((s) => s.addDecision);
  const updateDecision = useDecisionsStore((s) => s.updateDecision);

  const [form, setForm] = useState<FormState>({
    title:        decision?.title        ?? '',
    context:      decision?.context      ?? '',
    decision:     decision?.decision     ?? '',
    alternatives: decision?.alternatives ?? '',
    author:       decision?.author       ?? '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (opened) {
      setForm({
        title:        decision?.title        ?? '',
        context:      decision?.context      ?? '',
        decision:     decision?.decision     ?? '',
        alternatives: decision?.alternatives ?? '',
        author:       decision?.author       ?? '',
      });
      setErrors({});
    }
  }, [opened, decision]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key in errors) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function validate(): boolean {
    const next: FormErrors = {};
    if (!form.title.trim())    next.title    = 'Title is required';
    if (!form.decision.trim()) next.decision = 'Decision is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSave() {
    if (!validate()) return;

    if (isEditMode && decision) {
      updateDecision(decision.id, {
        title:        form.title.trim(),
        context:      form.context.trim(),
        decision:     form.decision.trim(),
        alternatives: form.alternatives.trim(),
        author:       form.author.trim(),
      });
    } else {
      addDecision({
        projectId,
        title:        form.title.trim(),
        context:      form.context.trim(),
        decision:     form.decision.trim(),
        alternatives: form.alternatives.trim(),
        author:       form.author.trim(),
      });
    }

    onClose();
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditMode ? 'Edit Decision' : 'Add Decision'}
      size="lg"
      centered
    >
      <Stack gap="sm">
        <TextInput
          label="Title"
          placeholder="Use Zustand for state management"
          value={form.title}
          onChange={(e) => setField('title', e.currentTarget.value)}
          error={errors.title}
          required
          autoFocus
        />

        <Textarea
          label="Context"
          placeholder="What situation or question prompted this decision?"
          value={form.context}
          onChange={(e) => setField('context', e.currentTarget.value)}
          rows={3}
          autosize
          minRows={3}
        />

        <Textarea
          label="Decision"
          placeholder="What was decided?"
          value={form.decision}
          onChange={(e) => setField('decision', e.currentTarget.value)}
          error={errors.decision}
          rows={3}
          autosize
          minRows={3}
          required
        />

        <Textarea
          label="Alternatives considered"
          placeholder="What other options were evaluated?"
          value={form.alternatives}
          onChange={(e) => setField('alternatives', e.currentTarget.value)}
          rows={2}
          autosize
          minRows={2}
        />

        <TextInput
          label="Author"
          placeholder="Jairo Neto"
          value={form.author}
          onChange={(e) => setField('author', e.currentTarget.value)}
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
