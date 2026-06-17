'use client';

import { useState, useEffect } from 'react';
import { Text, Stack, Title, Divider } from '@mantine/core';
import { FeaturesConfig } from '@/components/settings/FeaturesConfig';
import { SharingConfig } from '@/components/settings/SharingConfig';

// ─── Settings Page ────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="flex-1 overflow-y-auto pt-8 px-10 max-w-2xl">
      <Title order={2} className="text-zinc-900 mb-1">Settings</Title>
      <Text size="sm" c="dimmed" mb="xl">
        Global application preferences. For project integrations, go to the project's own Settings.
      </Text>

      <Divider mb="xl" />

      <Stack gap="xl">
        <div>
          <Text fw={600} size="sm" mb="xs">Features</Text>
          <Text size="xs" c="dimmed" mb="md">
            Enable or disable optional UI features across the entire application.
          </Text>
          {mounted && <FeaturesConfig />}
        </div>

        <Divider />

        <div>
          <Text fw={600} size="sm" mb="xs">Sharing</Text>
          <Text size="xs" c="dimmed" mb="md">
            Pessoas adicionadas aqui podem VER todo o seu workspace (somente leitura).
          </Text>
          {mounted && <SharingConfig />}
        </div>
      </Stack>
    </div>
  );
}
