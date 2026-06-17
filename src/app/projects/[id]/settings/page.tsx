'use client';

import { use, useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { Text, Title, Divider, Stack, Switch } from '@mantine/core';
import { ProjectHeader } from '@/components/layout/ProjectHeader';
import { IntegrationsPanel } from '@/components/integrations/IntegrationsPanel';
import { ProjectInfoForm } from '@/components/projects/ProjectInfoForm';
import { useProjectsStore } from '@/stores/useProjectsStore';
import { buildSlugMap } from '@/lib/slugify';

export const SHOW_ISSUES_KEY = (id: string) => `sprint-show-issues-${id}`;

export default function ProjectSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [mounted, setMounted] = useState(false);
  const [showIssues, setShowIssues] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (!mounted) return;
    setShowIssues(localStorage.getItem(SHOW_ISSUES_KEY(id)) === 'true');
  }, [mounted, id]);

  function toggleShowIssues(val: boolean) {
    setShowIssues(val);
    localStorage.setItem(SHOW_ISSUES_KEY(id), String(val));
  }

  const storeProjects   = useProjectsStore((s) => s.projects);
  const projectsLoading = useProjectsStore((s) => s.loading);
  const slugMap = mounted ? buildSlugMap(storeProjects) : {};
  const matchedId = mounted ? (Object.entries(slugMap).find(([, s]) => s === id)?.[0] ?? id) : null;
  const project = mounted ? storeProjects.find((p) => p.id === matchedId) ?? null : null;

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
            <Text fw={600} size="sm" mb="xs">Metrics</Text>
            <Text size="xs" c="dimmed" mb="md">Configure o que é exibido na tela de Metrics.</Text>
            {mounted && (
              <Switch
                label="Exibir toggle de Issues no gráfico de Velocity"
                description="Quando ativado, aparece a opção de alternar entre Story Points e Issues no gráfico."
                checked={showIssues}
                onChange={(e) => toggleShowIssues(e.currentTarget.checked)}
                size="sm"
              />
            )}
          </div>

          <Divider />

          <div>
            <Text fw={600} size="sm" mb="xs">Integrations</Text>
            <Text size="xs" c="dimmed" mb="md">
              Connect external tools to pull data into Project Management Center.
            </Text>
            {mounted && project && <IntegrationsPanel project={project} />}
          </div>
        </Stack>
      </div>
    </>
  );
}
