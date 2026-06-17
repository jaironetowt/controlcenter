'use client';

import { useState } from 'react';
import { Button, Stack, Text } from '@mantine/core';
import { seedDemo } from '@/lib/api';

// ─── Sample data / demo project seed ────────────────────────────────────────────
// Owner-only: the worker scopes the seed to the caller's own space (caller.sub),
// is idempotent, and redirects to /global on success so the user lands on the
// populated workspace.

export function SeedDemo() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSeed = async () => {
    setLoading(true);
    setError(null);
    try {
      await seedDemo();
      // Land on the populated workspace so the user can explore the features.
      window.location.href = '/global';
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao carregar o projeto de exemplo.');
      setLoading(false);
    }
  };

  return (
    <Stack gap="md" align="flex-start">
      <Button onClick={() => void handleSeed()} loading={loading}>
        Carregar projeto de exemplo
      </Button>

      {error && (
        <Text size="xs" c="red">
          {error}
        </Text>
      )}
    </Stack>
  );
}
