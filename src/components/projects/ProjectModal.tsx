'use client';

import { useState, useEffect } from 'react';
import { Modal, TextInput, Button, Group, Stack, Text } from '@mantine/core';
import { useProjectsStore, type Project } from '@/stores/useProjectsStore';

// ─── Color palette ────────────────────────────────────────────────────────────

const COLORS = [
  '#3E77FC',
  '#8B56FC',
  '#F59E0B',
  '#EF4444',
  '#22C55E',
  '#EC4899',
  '#06B6D4',
  '#64748B',
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProjectModalProps {
  opened: boolean;
  onClose: () => void;
  /** When provided, the modal opens in edit mode for this project. */
  project?: Project;
}

interface FormState {
  name: string;
  color: string;
  client: string;
  phase: string;
  dateRange: string;
}

interface FormErrors {
  name?: string;
  color?: string;
  client?: string;
  phase?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProjectModal({ opened, onClose, project }: ProjectModalProps) {
  const isEditMode = !!project;

  const addProject    = useProjectsStore((s) => s.addProject);
  const updateProject = useProjectsStore((s) => s.updateProject);
  const archiveProject = useProjectsStore((s) => s.archiveProject);

  // ── Form state ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState<FormState>({
    name:      project?.name      ?? '',
    color:     project?.color     ?? COLORS[0],
    client:    project?.client    ?? '',
    phase:     project?.phase     ?? '',
    dateRange: project?.dateRange ?? '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Confirmation step for archive
  const [confirmingArchive, setConfirmingArchive] = useState(false);

  // Reset form whenever the modal opens (or the project changes)
  useEffect(() => {
    if (opened) {
      setForm({
        name:      project?.name      ?? '',
        color:     project?.color     ?? COLORS[0],
        client:    project?.client    ?? '',
        phase:     project?.phase     ?? '',
        dateRange: project?.dateRange ?? '',
      });
      setErrors({});
      setConfirmingArchive(false);
    }
  }, [opened, project]);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key in errors) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function validate(): boolean {
    const next: FormErrors = {};
    if (!form.name.trim())   next.name   = 'Project name is required';
    if (form.name.length > 50) next.name = 'Max 50 characters';
    if (!form.color)         next.color  = 'Please select a color';
    if (!form.client.trim()) next.client = 'Client is required';
    if (!form.phase.trim())  next.phase  = 'Phase is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSave() {
    if (!validate()) return;

    if (isEditMode && project) {
      updateProject(project.id, {
        name:      form.name.trim(),
        color:     form.color,
        client:    form.client.trim(),
        phase:     form.phase.trim(),
        dateRange: form.dateRange.trim(),
      });
    } else {
      addProject({
        name:      form.name.trim(),
        color:     form.color,
        client:    form.client.trim(),
        phase:     form.phase.trim(),
        dateRange: form.dateRange.trim(),
      });
    }

    onClose();
  }

  function handleArchiveRequest() {
    setConfirmingArchive(true);
  }

  function handleArchiveConfirm() {
    if (project) {
      archiveProject(project.id);
    }
    setConfirmingArchive(false);
    onClose();
  }

  function handleArchiveCancel() {
    setConfirmingArchive(false);
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditMode ? 'Edit Project' : 'New Project'}
      size="sm"
      centered
    >
      {confirmingArchive ? (
        /* ── Confirmation view ──────────────────────────────────────────────── */
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Archive <strong>{form.name || 'this project'}</strong>? It will be hidden from the
            sidebar and global view. You can restore it later.
          </Text>
          <Group justify="flex-end" gap="xs">
            <Button variant="default" size="xs" onClick={handleArchiveCancel}>
              Cancel
            </Button>
            <Button color="red" size="xs" onClick={handleArchiveConfirm}>
              Yes, archive
            </Button>
          </Group>
        </Stack>
      ) : (
        /* ── Form view ──────────────────────────────────────────────────────── */
        <Stack gap="sm">
          {/* Project name */}
          <TextInput
            label="Project name"
            placeholder="Mosaic"
            value={form.name}
            onChange={(e) => setField('name', e.currentTarget.value)}
            error={errors.name}
            maxLength={50}
            required
            autoFocus
          />

          {/* Color picker */}
          <div>
            <Text size="xs" fw={500} mb={6} c={errors.color ? 'red' : undefined}>
              Color {errors.color && <span style={{ fontWeight: 400 }}>— {errors.color}</span>}
            </Text>
            <div className="flex items-center gap-2">
              {COLORS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  aria-label={`Select color ${hex}`}
                  onClick={() => setField('color', hex)}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: hex,
                    border: form.color === hex ? '2px solid rgba(0,0,0,0.4)' : '2px solid transparent',
                    outline: form.color === hex ? '2px solid rgba(0,0,0,0.15)' : 'none',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'transform 0.1s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.15)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
                />
              ))}
            </div>
          </div>

          {/* Client */}
          <TextInput
            label="Client"
            placeholder="WillowTree Internal"
            value={form.client}
            onChange={(e) => setField('client', e.currentTarget.value)}
            error={errors.client}
            required
          />

          {/* Phase */}
          <TextInput
            label="Phase"
            placeholder="Development, Design, Discovery…"
            value={form.phase}
            onChange={(e) => setField('phase', e.currentTarget.value)}
            error={errors.phase}
            required
          />

          {/* Date range */}
          <TextInput
            label="Date range"
            placeholder="Jan – Jun 2026"
            value={form.dateRange}
            onChange={(e) => setField('dateRange', e.currentTarget.value)}
          />

          {/* Actions */}
          <Group justify="space-between" mt="xs">
            {/* Archive — edit mode only */}
            {isEditMode ? (
              <Button
                variant="subtle"
                color="red"
                size="xs"
                onClick={handleArchiveRequest}
              >
                Archive
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
