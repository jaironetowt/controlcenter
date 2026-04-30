'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, TextInput, Button, Group, Stack, Text, Divider, Loader } from '@mantine/core';
import { IconCloudDown } from '@tabler/icons-react';
import { toast } from '@/components/ui/Toast';
import { useProjectsStore, type Project } from '@/stores/useProjectsStore';

// ─── Salesforce helpers ───────────────────────────────────────────────────────

function formatSFDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

async function fetchSalesforceProject(url: string): Promise<{ name: string; dateRange: string; client: string; salesforceId: string }> {
  const res = await fetch('/api/salesforce/record', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  const data = await res.json() as {
    record?: Record<string, unknown>;
    error?: string;
    message?: string;
  };
  if (!res.ok) {
    if (data.error === 'SF_CLI_NOT_AUTHENTICATED') {
      throw new Error('SF_CLI_NOT_AUTHENTICATED');
    }
    throw new Error(data.error ?? 'Failed to fetch from Salesforce');
  }
  const record = data.record ?? {};
  const salesforceId = String(record['Id'] ?? '');
  const name   = String(record['Name'] ?? '');
  const start  = record['pse__Start_Date__c'] ? formatSFDate(String(record['pse__Start_Date__c'])) : '';
  const end    = record['pse__End_Date__c']   ? formatSFDate(String(record['pse__End_Date__c']))   : '';
  const dateRange = start && end ? `${start} – ${end}` : start || end;
  const accountRecord = record['pse__Account__r'] as Record<string, unknown> | null | undefined;
  const client = accountRecord ? String(accountRecord['Name'] ?? '') : '';
  return { name, dateRange, client, salesforceId };
}

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
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProjectModal({ opened, onClose, project }: ProjectModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const router = useRouter();
  const isEditMode = !!project;

  const addProject     = useProjectsStore((s) => s.addProject);
  const updateProject  = useProjectsStore((s) => s.updateProject);
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

  // Salesforce import
  const [sfUrl, setSfUrl]             = useState('');
  const [sfLoading, setSfLoading]     = useState(false);
  const [sfError, setSfError]         = useState('');
  const [sfImportedId, setSfImportedId] = useState('');

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
      setSfUrl('');
      setSfError('');
      setSfLoading(false);
      setSfImportedId('');
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
        name:        form.name.trim(),
        color:       form.color,
        client:      form.client.trim(),
        phase:       form.phase.trim(),
        dateRange:   form.dateRange.trim(),
        salesforceId: sfImportedId || undefined,
      });
    }

    onClose();
  }

  async function handleSalesforceImport() {
    if (!sfUrl.trim()) return;
    setSfLoading(true);
    setSfError('');
    try {
      const imported = await fetchSalesforceProject(sfUrl.trim());
      setSfImportedId(imported.salesforceId);
      setForm((prev) => ({
        ...prev,
        name:      imported.name      || prev.name,
        dateRange: imported.dateRange || prev.dateRange,
        client:    imported.client    || prev.client,
      }));
      setErrors((prev) => ({ ...prev, name: undefined }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      if (msg === 'SF_CLI_NOT_AUTHENTICATED') {
        setSfError('Salesforce CLI not authenticated. Run: sf org login web --set-default');
      } else {
        setSfError(msg);
      }
    } finally {
      setSfLoading(false);
    }
  }

  function handleArchiveRequest() {
    setConfirmingArchive(true);
  }

  function handleArchiveConfirm() {
    const name = form.name || 'Project';
    if (project) {
      archiveProject(project.id);
    }
    setConfirmingArchive(false);
    onClose();
    toast.show({
      title: 'Project archived',
      message: `"${name}" was archived. You can still access it from All Projects.`,
    });
    router.push('/global');
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
          {/* Salesforce import — create mode only */}
          {!isEditMode && (
            <>
              <div>
                <Group gap="xs" mb={6}>
                  <IconCloudDown size={14} color="#00A1E0" />
                  <Text size="xs" fw={500} c="dimmed">Import from Salesforce</Text>
                </Group>
                <Group gap="xs" align="flex-start">
                  <TextInput
                    placeholder="Paste Salesforce project URL"
                    value={sfUrl}
                    onChange={(e) => { setSfUrl(e.currentTarget.value); setSfError(''); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void handleSalesforceImport(); } }}
                    error={sfError || undefined}
                    style={{ flex: 1 }}
                    size="xs"
                  />
                  <Button
                    size="xs"
                    variant="default"
                    loading={sfLoading}
                    disabled={!sfUrl.trim()}
                    onClick={() => void handleSalesforceImport()}
                    leftSection={sfLoading ? <Loader size={12} /> : undefined}
                  >
                    Import
                  </Button>
                </Group>
              </div>
              <Divider label="or fill manually" labelPosition="center" />
            </>
          )}

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
