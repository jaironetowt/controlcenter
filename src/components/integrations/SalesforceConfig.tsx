'use client';

import { useState, useEffect } from 'react';
import { TextInput, PasswordInput, Button, Group, Stack, Text, Alert } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useSalesforceStore, type SalesforceCredentials } from '@/stores/useSalesforceStore';

type TestStatus = 'idle' | 'loading' | 'ok' | 'error';

const EMPTY: SalesforceCredentials = {
  instanceUrl: '',
  username: '',
  password: '',
  securityToken: '',
};

export function SalesforceConfig() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const saved           = useSalesforceStore((s) => s.credentials);
  const setCredentials  = useSalesforceStore((s) => s.setCredentials);
  const clearCredentials = useSalesforceStore((s) => s.clearCredentials);

  const [form, setForm]       = useState<SalesforceCredentials>(EMPTY);
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [testError, setTestError]   = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (mounted) {
      setForm(saved ?? EMPTY);
    }
  }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  function setField(key: keyof SalesforceCredentials, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setTestStatus('idle');
    setSaveSuccess(false);
  }

  async function handleTest() {
    setTestStatus('loading');
    setTestError('');
    try {
      const res = await fetch('/api/salesforce/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: `${form.instanceUrl}/lightning/r/User/000000000000000/view`,
          ...form,
        }),
      });
      // A 400 "Invalid URL" here means auth worked but URL is wrong — that's fine
      // A 401 means credentials are wrong
      if (res.status === 401) {
        const data = await res.json() as { error: string };
        setTestStatus('error');
        setTestError(data.error);
      } else {
        setTestStatus('ok');
      }
    } catch {
      setTestStatus('error');
      setTestError('Could not reach Salesforce. Check the instance URL.');
    }
  }

  function handleSave() {
    setCredentials(form);
    setSaveSuccess(true);
  }

  function handleDisconnect() {
    clearCredentials();
    setForm(EMPTY);
    setSaveSuccess(false);
    setTestStatus('idle');
  }

  const filled = !!(form.instanceUrl && form.username && form.password);

  if (!mounted) return null;

  return (
    <Stack gap="md">
      <TextInput
        label="Instance URL"
        description='e.g. https://willowtree.lightning.force.com'
        placeholder="https://yourorg.lightning.force.com"
        value={form.instanceUrl}
        onChange={(e) => setField('instanceUrl', e.currentTarget.value)}
      />
      <TextInput
        label="Username"
        placeholder="you@willowtree.com"
        value={form.username}
        onChange={(e) => setField('username', e.currentTarget.value)}
      />
      <PasswordInput
        label="Password"
        value={form.password}
        onChange={(e) => setField('password', e.currentTarget.value)}
      />
      <PasswordInput
        label="Security Token"
        description={
          <span>
            Reset yours at <strong>Salesforce → Settings → My Personal Information → Reset My Security Token</strong>. Arrives by email.
          </span>
        }
        placeholder="Leave blank if your IP is whitelisted"
        value={form.securityToken}
        onChange={(e) => setField('securityToken', e.currentTarget.value)}
      />

      {testStatus === 'ok' && (
        <Alert color="green" icon={<IconCheck size={16} />} title="Connection successful" variant="light">
          Salesforce credentials are valid.
        </Alert>
      )}
      {testStatus === 'error' && (
        <Alert color="red" icon={<IconX size={16} />} title="Connection failed" variant="light">
          {testError}
        </Alert>
      )}
      {saveSuccess && <Text size="sm" c="green">Settings saved.</Text>}

      <Group justify="space-between" mt="xs">
        {saved && (
          <Button variant="subtle" color="red" size="xs" onClick={handleDisconnect}>
            Disconnect
          </Button>
        )}
        <Group gap="xs" ml="auto">
          <Button variant="default" size="xs" loading={testStatus === 'loading'} disabled={!filled} onClick={handleTest}>
            Test Connection
          </Button>
          <Button size="xs" disabled={!filled} onClick={handleSave}>
            Save
          </Button>
        </Group>
      </Group>
    </Stack>
  );
}
