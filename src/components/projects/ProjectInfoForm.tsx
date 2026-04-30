'use client';

import { useState, useEffect } from 'react';
import { TextInput, Button, Group, Text } from '@mantine/core';
import { useProjectsStore, type Project } from '@/stores/useProjectsStore';

// ─── Color palette ────────────────────────────────────────────────────────────

export const PROJECT_COLORS = [
  '#3E77FC',
  '#8B56FC',
  '#F59E0B',
  '#EF4444',
  '#22C55E',
  '#EC4899',
  '#06B6D4',
  '#64748B',
];

// ─── Component ────────────────────────────────────────────────────────────────

interface ProjectInfoFormProps {
  project: Project;
  onSaved?: () => void;
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
  client?: string;
}

export function ProjectInfoForm({ project, onSaved }: ProjectInfoFormProps) {
  const updateProject = useProjectsStore((s) => s.updateProject);

  const [form, setForm] = useState<FormState>({
    name:      project.name,
    color:     project.color,
    client:    project.client,
    phase:     project.phase,
    dateRange: project.dateRange,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saved, setSaved] = useState(false);

  // Keep form in sync if project changes externally
  useEffect(() => {
    setForm({
      name:      project.name,
      color:     project.color,
      client:    project.client,
      phase:     project.phase,
      dateRange: project.dateRange,
    });
  }, [project.id]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    if (key in errors) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const next: FormErrors = {};
    if (!form.name.trim())      next.name   = 'Project name is required';
    if (form.name.length > 50)  next.name   = 'Max 50 characters';
    if (!form.client.trim())    next.client = 'Client is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    updateProject(project.id, {
      name:      form.name.trim(),
      color:     form.color,
      client:    form.client.trim(),
      phase:     form.phase.trim(),
      dateRange: form.dateRange.trim(),
    });
    setSaved(true);
    onSaved?.();
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Project name */}
      <TextInput
        label="Project name"
        value={form.name}
        onChange={(e) => setField('name', e.currentTarget.value)}
        error={errors.name}
        maxLength={50}
        required
      />

      {/* Color picker */}
      <div>
        <Text size="xs" fw={500} mb={6}>Color</Text>
        <div className="flex items-center gap-2">
          {PROJECT_COLORS.map((hex) => (
            <button
              key={hex}
              type="button"
              aria-label={`Select color ${hex}`}
              onClick={() => setField('color', hex)}
              style={{
                width: 22,
                height: 22,
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
      />

      {/* Date range */}
      <TextInput
        label="Date range"
        placeholder="Jan – Jun 2026"
        value={form.dateRange}
        onChange={(e) => setField('dateRange', e.currentTarget.value)}
      />

      <Group justify="flex-end" mt="xs">
        {saved && (
          <Text size="xs" c="green">Saved</Text>
        )}
        <Button size="xs" onClick={handleSave}>Save</Button>
      </Group>
    </div>
  );
}
