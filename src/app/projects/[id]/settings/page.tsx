'use client';

import { use, useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { Text, Title, Divider, Stack } from '@mantine/core';
import { ProjectHeader } from '@/components/layout/ProjectHeader';
import { PMToolConfig } from '@/components/integrations/PMToolConfig';
import { ProjectInfoForm } from '@/components/projects/ProjectInfoForm';
import { useProjectsStore } from '@/stores/useProjectsStore';
import { slugify } from '@/lib/slugify';

export default function ProjectSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const storeProjects   = useProjectsStore((s) => s.projects);
  const projectsLoading = useProjectsStore((s) => s.loading);
  const project = mounted ? storeProjects.find((p) => (slugify(p.name) === id || p.id === id) && !p.archived) ?? storeProjects.find((p) => slugify(p.name) === id || p.id === id) : null;

  if (mounted && !projectsLoading && !project) return notFound();
  const p = project ?? { id, name: '…', color: '#3E77FC', client: '…', phase: '…', dateRange: '…', archived: false };
  const projectId = p.id;

  return (
    <>
      <ProjectHeader name={p.name} color={p.color} client={p.client} phase={p.phase} dateRange={p.dateRange} projectId={projectId} archived={p.archived} />

      <div className="flex-1 overflow-y-auto px-10 pt-8 max-w-2xl">
        <Title order={2} className="text-zinc-900 mb-1">Project Settings</Title>
        <Text size="sm" c="dimmed" mb="xl">
          Configure integrations for <strong>{p.name}</strong>.
        </Text>

        <Divider mb="xl" />

        <Stack gap="xl">
          <div>
            <Text fw={600} size="sm" mb="xs">Project Info</Text>
            <Text size="xs" c="dimmed" mb="md">
              Edit name, color, client, phase, and date range for this project.
            </Text>
            {mounted && project && <ProjectInfoForm project={project} />}
          </div>

          <Divider />

          <div>
            <Text fw={600} size="sm" mb="xs">PM Tool Integration</Text>
            <Text size="xs" c="dimmed" mb="md">
              Connect a project management tool to pull sprint and issue data into Control Center.
            </Text>
            {mounted && <PMToolConfig projectId={projectId} />}
          </div>
        </Stack>
      </div>
    </>
  );
}
