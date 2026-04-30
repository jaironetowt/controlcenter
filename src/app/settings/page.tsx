'use client';

import { useState, useEffect } from 'react';
import { Select, Text, Stack, Title, Divider } from '@mantine/core';
import { useProjectsStore } from '@/stores/useProjectsStore';
import { PMToolConfig } from '@/components/integrations/PMToolConfig';
import { FeaturesConfig } from '@/components/settings/FeaturesConfig';

// ─── Settings Page ────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const storeProjects = useProjectsStore((s) => s.projects);
  const projects = mounted ? storeProjects.filter((p) => !p.archived) : [];

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // Default to first project once hydrated
  useEffect(() => {
    if (mounted && projects.length > 0 && activeProjectId === null) {
      setActiveProjectId(projects[0].id);
    }
  }, [mounted, projects, activeProjectId]);

  const projectOptions = projects.map((p) => ({ value: p.id, label: p.name }));

  return (
    <div className="flex-1 overflow-y-auto pt-8 px-10 max-w-2xl">
      <Title order={2} className="text-zinc-900 mb-1">
        Settings
      </Title>
      <Text size="sm" c="dimmed" mb="xl">
        Configure integrations and preferences for each project.
      </Text>

      <Divider mb="xl" />

      <Stack gap="xl">
        {/* Section: PM Tool Integration */}
        <div>
          <Text fw={600} size="sm" mb="xs">
            PM Tool Integration
          </Text>
          <Text size="xs" c="dimmed" mb="md">
            Connect a project management tool to pull sprint and issue data into Control Center.
          </Text>

          {/* Project selector */}
          <Select
            label="Project"
            description="Choose which project to configure."
            data={projectOptions}
            value={activeProjectId}
            onChange={setActiveProjectId}
            allowDeselect={false}
            mb="md"
            disabled={!mounted || projects.length === 0}
          />

          {mounted && activeProjectId ? (
            <PMToolConfig projectId={activeProjectId} />
          ) : (
            <Text size="sm" c="dimmed">
              {mounted && projects.length === 0
                ? 'Create a project first to configure integrations.'
                : 'Loading…'}
            </Text>
          )}
        </div>
        <Divider />

        {/* Section: Features */}
        <div>
          <Text fw={600} size="sm" mb="xs">
            Features
          </Text>
          <Text size="xs" c="dimmed" mb="md">
            Enable or disable optional UI features across the entire application.
          </Text>
          <FeaturesConfig />
        </div>
      </Stack>
    </div>
  );
}
