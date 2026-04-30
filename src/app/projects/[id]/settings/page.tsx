'use client';

import { use, useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { Text, Title, Divider, Stack } from '@mantine/core';
import { Sidebar } from '@/components/layout/Sidebar';
import { RightPanel } from '@/components/layout/RightPanel';
import { ProjectHeader } from '@/components/layout/ProjectHeader';
import { PMToolConfig } from '@/components/integrations/PMToolConfig';
import { useProjectsStore } from '@/stores/useProjectsStore';

export default function ProjectSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const storeProjects = useProjectsStore((s) => s.projects);
  const project = mounted ? storeProjects.find((p) => p.id === id && !p.archived) : null;

  if (mounted && !project) return notFound();
  const p = project ?? { id, name: '…', color: '#3E77FC', client: '…', phase: '…', dateRange: '…' };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F4F5]">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <ProjectHeader name={p.name} color={p.color} client={p.client} phase={p.phase} dateRange={p.dateRange} projectId={id} />

        <div className="flex-1 overflow-y-auto px-10 pt-8 max-w-2xl">
          <Title order={2} className="text-zinc-900 mb-1">Project Settings</Title>
          <Text size="sm" c="dimmed" mb="xl">
            Configure integrations for <strong>{p.name}</strong>.
          </Text>

          <Divider mb="xl" />

          <Stack gap="xl">
            <div>
              <Text fw={600} size="sm" mb="xs">PM Tool Integration</Text>
              <Text size="xs" c="dimmed" mb="md">
                Connect a project management tool to pull sprint and issue data into Control Center.
              </Text>
              {mounted && <PMToolConfig projectId={id} />}
            </div>
          </Stack>
        </div>
      </main>

      <RightPanel />
    </div>
  );
}
