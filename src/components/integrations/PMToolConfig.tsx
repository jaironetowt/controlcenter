'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  TextInput,
  PasswordInput,
  Button,
  Group,
  Stack,
  Text,
  Alert,
} from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { usePMToolStore } from '@/stores/usePMToolStore';
import { jiraConnector } from '@/integrations/connectors/jira';
import type { PMToolType, PMToolConfig } from '@/integrations/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PMToolConfigProps {
  projectId: string;
  /** When provided, skips the tool selector and shows this tool's form directly. */
  tool?: 'jira';
}

interface FormState {
  baseUrl: string;
  email: string;
  apiToken: string;
  projectKey: string;
}

type TestStatus = 'idle' | 'loading' | 'ok' | 'error';

// ─── Tool options ─────────────────────────────────────────────────────────────

const TOOL_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'jira', label: 'Jira' },
  { value: 'linear',       label: 'Linear (coming soon)',       disabled: true },
  { value: 'monday',       label: 'Monday.com (coming soon)',   disabled: true },
  { value: 'azure-devops', label: 'Azure DevOps (coming soon)', disabled: true },
];

const EMPTY_FORM: FormState = {
  baseUrl: '',
  email: '',
  apiToken: '',
  projectKey: '',
};

// ─── Component ────────────────────────────────────────────────────────────────

export function PMToolConfig({ projectId, tool: fixedTool }: PMToolConfigProps) {
  const configs      = usePMToolStore((s) => s.configs);
  const setConfig    = usePMToolStore((s) => s.setConfig);
  const removeConfig = usePMToolStore((s) => s.removeConfig);

  const saved = configs[projectId] ?? null;

  const [selectedTool, setSelectedTool] = useState<string>(
    fixedTool ?? saved?.type ?? 'none',
  );
  const [form, setForm] = useState<FormState>(
    saved?.type === 'jira'
      ? { baseUrl: saved.baseUrl, email: saved.email, apiToken: saved.apiToken, projectKey: saved.projectKey }
      : EMPTY_FORM,
  );
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [testError, setTestError]   = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync form when projectId changes
  useEffect(() => {
    const next = configs[projectId] ?? null;
    setSelectedTool(fixedTool ?? next?.type ?? 'none');
    setForm(
      next?.type === 'jira'
        ? { baseUrl: next.baseUrl, email: next.email, apiToken: next.apiToken, projectKey: next.projectKey }
        : EMPTY_FORM,
    );
    setTestStatus('idle');
    setTestError('');
    setSaveSuccess(false);
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ─────────────────────────────────────────────────────────────────

  function handleToolChange(value: string | null) {
    const tool = value ?? 'none';
    setSelectedTool(tool);
    setTestStatus('idle');
    setTestError('');
    setSaveSuccess(false);

    // If switching away from a configured tool, clear form
    if (tool === 'none') {
      setForm(EMPTY_FORM);
    }
  }

  function setField<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setTestStatus('idle');
    setSaveSuccess(false);
  }

  async function handleTestConnection() {
    if (selectedTool !== 'jira') return;

    setTestStatus('loading');
    setTestError('');

    const config: PMToolConfig = {
      type: 'jira',
      baseUrl: form.baseUrl.trim().replace(/\/$/, ''),
      email: form.email.trim(),
      apiToken: form.apiToken,
      projectKey: form.projectKey.trim().toUpperCase(),
    };

    try {
      const result = await jiraConnector.testConnection(config);
      if (result.ok) {
        setTestStatus('ok');
      } else {
        setTestStatus('error');
        setTestError(result.error ?? 'Connection failed');
      }
    } catch (err) {
      setTestStatus('error');
      setTestError(err instanceof Error ? err.message : 'Unexpected error');
    }
  }

  function handleSave() {
    if (selectedTool === 'none') {
      removeConfig(projectId);
      setSaveSuccess(true);
      return;
    }

    if (selectedTool === 'jira') {
      const config: PMToolConfig = {
        type: 'jira' as PMToolType,
        baseUrl: form.baseUrl.trim().replace(/\/$/, ''),
        email: form.email.trim(),
        apiToken: form.apiToken,
        projectKey: form.projectKey.trim().toUpperCase(),
      };
      setConfig(projectId, config);
      setSaveSuccess(true);
    }
  }

  // ── Derived state ─────────────────────────────────────────────────────────────

  const isJira = fixedTool === 'jira' || selectedTool === 'jira';
  const jiraFormFilled =
    form.baseUrl.trim() !== '' &&
    form.email.trim() !== '' &&
    form.apiToken !== '' &&
    form.projectKey.trim() !== '';

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <Stack gap="md">
      {!fixedTool && (
        <Select
          label="PM Tool"
          description="Connect a project management tool to pull sprint and issue data."
          data={TOOL_OPTIONS}
          value={selectedTool}
          onChange={handleToolChange}
          allowDeselect={false}
        />
      )}

      {isJira && (
        <Stack gap="sm">
          <TextInput
            label="Base URL"
            description='e.g. https://yourorg.atlassian.net'
            placeholder="https://yourorg.atlassian.net"
            value={form.baseUrl}
            onChange={(e) => setField('baseUrl', e.currentTarget.value)}
            required
          />

          <TextInput
            label="Email"
            description="The email address associated with your Atlassian account."
            placeholder="you@example.com"
            type="email"
            value={form.email}
            onChange={(e) => setField('email', e.currentTarget.value)}
            required
          />

          <PasswordInput
            label="API Token"
            description={
              <span>
                Generate one at{' '}
                <a
                  href="https://id.atlassian.com/manage-profile/security/api-tokens"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  id.atlassian.com
                </a>
                . Never shared with anyone.
              </span>
            }
            placeholder="Your Atlassian API token"
            value={form.apiToken}
            onChange={(e) => setField('apiToken', e.currentTarget.value)}
            required
          />

          <TextInput
            label="Project Key"
            description='The short identifier for your project, e.g. "MOS" or "PROJ".'
            placeholder="PROJ"
            value={form.projectKey}
            onChange={(e) => setField('projectKey', e.currentTarget.value.toUpperCase())}
            required
          />

          {/* Test connection feedback */}
          {testStatus === 'ok' && (
            <Alert
              color="green"
              icon={<IconCheck size={16} />}
              title="Connection successful"
              variant="light"
            >
              Jira credentials are valid.
            </Alert>
          )}

          {testStatus === 'error' && (
            <Alert
              color="red"
              icon={<IconX size={16} />}
              title="Connection failed"
              variant="light"
            >
              {testError}
            </Alert>
          )}

          <Group gap="xs">
            <Button
              variant="default"
              size="xs"
              loading={testStatus === 'loading'}
              disabled={!jiraFormFilled}
              onClick={handleTestConnection}
            >
              Test Connection
            </Button>
            {fixedTool && (
              <Button
                size="xs"
                disabled={!jiraFormFilled}
                onClick={handleSave}
              >
                Save
              </Button>
            )}
          </Group>
        </Stack>
      )}

      {/* Save success feedback */}
      {saveSuccess && (
        <Text size="xs" c="green">
          Settings saved.
        </Text>
      )}

      {!fixedTool && (
        <Group justify="flex-end" mt="xs">
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
        </Group>
      )}
    </Stack>
  );
}
