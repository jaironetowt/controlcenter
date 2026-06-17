'use client';

import { useState, useEffect, useCallback } from 'react';
import { TextInput, Button, ActionIcon, Group, Stack, Text, Loader } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { getShares, addShare, removeShare, type ShareRow } from '@/lib/api';

// ─── Sharing / Workspace viewers ────────────────────────────────────────────────
// Owner-only: every action targets the caller's own space (the worker scopes by
// caller.sub server-side), so no space selector is needed here.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SharingConfig() {
  const [mounted, setMounted] = useState(false);
  const [viewers, setViewers] = useState<ShareRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await getShares();
      setViewers(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load viewers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    void reload();
  }, [reload]);

  const handleAdd = async () => {
    const value = email.trim().toLowerCase();
    if (!EMAIL_RE.test(value)) {
      setError('Enter a valid e-mail address.');
      return;
    }
    setAdding(true);
    setError(null);
    try {
      await addShare(value);
      setEmail('');
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add viewer.');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (viewerEmail: string) => {
    setRemoving(viewerEmail);
    setError(null);
    try {
      await removeShare(viewerEmail);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove viewer.');
    } finally {
      setRemoving(null);
    }
  };

  // Avoid hydration mismatch: render a stable shell until mounted.
  if (!mounted) {
    return (
      <Text size="xs" c="dimmed">
        Loading viewers…
      </Text>
    );
  }

  return (
    <Stack gap="md">
      <Group gap="sm" align="flex-end" wrap="nowrap">
        <TextInput
          label="Add viewer"
          placeholder="someone@example.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !adding) {
              e.preventDefault();
              void handleAdd();
            }
          }}
          disabled={adding}
          className="flex-1"
        />
        <Button onClick={() => void handleAdd()} loading={adding}>
          Add viewer
        </Button>
      </Group>

      {error && (
        <Text size="xs" c="red">
          {error}
        </Text>
      )}

      {loading ? (
        <Group gap="xs">
          <Loader size="xs" />
          <Text size="xs" c="dimmed">
            Loading viewers…
          </Text>
        </Group>
      ) : viewers.length === 0 ? (
        <Text size="xs" c="dimmed">
          No viewers yet. Add someone above to share your workspace.
        </Text>
      ) : (
        <Stack gap={0}>
          {viewers.map((v) => (
            <div
              key={v.viewer_email}
              className="flex items-center justify-between gap-4 py-2.5 border-b border-zinc-100 last:border-0"
            >
              <Text size="sm" className="text-zinc-800">
                {v.viewer_email}
              </Text>
              <ActionIcon
                variant="subtle"
                color="red"
                aria-label={`Remove ${v.viewer_email}`}
                loading={removing === v.viewer_email}
                onClick={() => void handleRemove(v.viewer_email)}
                className="flex-shrink-0"
              >
                <IconTrash size={16} />
              </ActionIcon>
            </div>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
