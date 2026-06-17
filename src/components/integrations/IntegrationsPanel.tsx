'use client';

import { Text } from '@mantine/core';
import { IconPlugConnected } from '@tabler/icons-react';
import { type Project } from '@/stores/useProjectsStore';

// NOTE: Passive-portal model — the portal no longer connects to live tools
// (Slack / Jira / Salesforce / Gmail). Data is collected and stored by Claude /
// cowork, which feeds the D1 database. The per-tool config forms (Jira / Salesforce)
// were removed from this panel so nothing calls the deleted /api/* routes.
// Re-implementation tracked in CC-60.

interface IntegrationsPanelProps {
  project: Project;
}

export function IntegrationsPanel(_props: IntegrationsPanelProps) {
  return (
    <div className="border border-zinc-200 rounded-xl bg-white px-4 py-5">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
          <IconPlugConnected size={16} className="text-zinc-400" />
        </div>
        <div>
          <Text size="sm" fw={500}>Integrações gerenciadas pelo Claude</Text>
          <Text size="xs" c="dimmed" mt={2}>
            Este é um portal passivo. As integrações (Jira, Salesforce e afins) são
            coletadas e mantidas pelo Claude — não há configuração de conexão aqui.
          </Text>
        </div>
      </div>
    </div>
  );
}
