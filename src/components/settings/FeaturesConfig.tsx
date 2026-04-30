'use client';

import { useState, useEffect } from 'react';
import { Switch, Text, Stack } from '@mantine/core';
import { useFeaturesStore, FEATURE_META, type FeatureKey, DEFAULT_FEATURES } from '@/stores/useFeaturesStore';

// ─── Component ────────────────────────────────────────────────────────────────

export function FeaturesConfig() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const rawFeatures = useFeaturesStore((s) => s.features);
  const setFeature = useFeaturesStore((s) => s.setFeature);

  const features = mounted ? rawFeatures : DEFAULT_FEATURES;

  return (
    <Stack gap="md">
      {(Object.keys(FEATURE_META) as FeatureKey[]).map((key) => {
        const meta = FEATURE_META[key];
        return (
          <div
            key={key}
            className="flex items-start justify-between gap-4 py-3 border-b border-zinc-100 last:border-0"
          >
            <div className="flex flex-col gap-0.5">
              <Text size="sm" fw={500} className="text-zinc-800">
                {meta.label}
              </Text>
              <Text size="xs" c="dimmed">
                {meta.description}
              </Text>
            </div>
            <Switch
              checked={features[key]}
              onChange={(e) => setFeature(key, e.currentTarget.checked)}
              disabled={!mounted}
              size="sm"
              className="flex-shrink-0 mt-0.5"
            />
          </div>
        );
      })}
    </Stack>
  );
}
