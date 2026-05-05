'use client';

import { useState } from 'react';
import { Text, Badge, Collapse, Stack } from '@mantine/core';
import {
  IconChevronDown,
  IconChevronRight,
  IconExternalLink,
  IconCloudDown,
  IconUsersPlus,
} from '@tabler/icons-react';
import { type Project } from '@/stores/useProjectsStore';
import { usePMToolStore } from '@/stores/usePMToolStore';
import { useStakeholdersStore } from '@/stores/useStakeholdersStore';
import { PMToolConfig } from '@/components/integrations/PMToolConfig';
import type { SFStakeholder } from '@/app/api/salesforce/stakeholders/route';

// ─── Integration row ──────────────────────────────────────────────────────────

interface IntegrationRowProps {
  icon: React.ReactNode;
  name: string;
  status: 'connected' | 'not-connected' | 'coming-soon';
  summary?: React.ReactNode;
  configurable?: boolean;
  children?: React.ReactNode;
}

function IntegrationRow({ icon, name, status, summary, configurable = false, children }: IntegrationRowProps) {
  const [open, setOpen] = useState(false);

  const statusBadge = {
    'connected':     <Badge size="xs" color="green"  variant="light">Connected</Badge>,
    'not-connected': <Badge size="xs" color="gray"   variant="light">Not connected</Badge>,
    'coming-soon':   <Badge size="xs" color="gray"   variant="outline">Coming soon</Badge>,
  }[status];

  return (
    <div className="border border-zinc-200 rounded-xl overflow-hidden">
      <div
        className={`flex items-center gap-3 px-4 py-3 bg-white ${configurable ? 'cursor-pointer hover:bg-zinc-50 transition-colors' : ''}`}
        onClick={() => configurable && setOpen((o) => !o)}
      >
        <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Text size="sm" fw={500}>{name}</Text>
            {statusBadge}
          </div>
          {summary && (
            <div className="mt-0.5">{summary}</div>
          )}
        </div>

        {configurable && (
          <div className="flex-shrink-0 text-zinc-400">
            {open ? <IconChevronDown size={15} /> : <IconChevronRight size={15} />}
          </div>
        )}
      </div>

      {configurable && children && (
        <Collapse expanded={open}>
          <div className="px-4 pb-4 pt-2 border-t border-zinc-100 bg-zinc-50">
            {children}
          </div>
        </Collapse>
      )}
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function SalesforceIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M10.03 5.12a4.4 4.4 0 0 1 3.1-1.28 4.43 4.43 0 0 1 3.97 2.44 3.44 3.44 0 0 1 1.37-.28 3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5H6.5A3.5 3.5 0 0 1 3 9.5a3.5 3.5 0 0 1 3.5-3.5c.28 0 .55.03.81.1A4.4 4.4 0 0 1 10.03 5.12Z" fill="#00A1E0"/>
    </svg>
  );
}

function JiraIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M11.53 2.1 5.17 8.46l-2.9 2.9a.42.42 0 0 0 0 .59l2.9 2.9 6.36 6.37a.42.42 0 0 0 .59 0l2.9-2.9L21.36 12l.15-.15a.42.42 0 0 0 0-.59l-.15-.15L15.02 5.2 12.12 2.1a.42.42 0 0 0-.59 0Z" fill="#2684FF"/>
      <path d="M11.83 6.66 8.48 10l3.35 3.34L15.18 10l-3.35-3.34Z" fill="url(#jira-grad)"/>
      <defs>
        <linearGradient id="jira-grad" x1="11.83" y1="10" x2="15.18" y2="10" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2684FF"/>
          <stop offset="1" stopColor="#0052CC"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function LinearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 100 100" fill="none">
      <path d="M1.22 61.3 38.7 98.78a50 50 0 0 1-37.48-37.48ZM0 50.15 49.85 100A50 50 0 0 1 0 50.15ZM7.08 27.08l65.84 65.84A50 50 0 0 1 7.08 27.08ZM27.08 7.08l65.84 65.84A50 50 0 0 1 27.08 7.08ZM50.15 0 100 49.85A50 50 0 0 1 50.15 0ZM61.3 1.22A50 50 0 0 1 98.78 38.7Z" fill="#5E6AD2"/>
    </svg>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

interface IntegrationsPanelProps {
  project: Project;
}

export function IntegrationsPanel({ project }: IntegrationsPanelProps) {
  const pmConfigs      = usePMToolStore((s) => s.configs);
  const jiraConfig     = pmConfigs[project.id] ?? null;
  const addStakeholder = useStakeholdersStore((s) => s.addStakeholder);
  const stakeholders   = useStakeholdersStore((s) => s.stakeholders);

  const [sfImporting, setSfImporting] = useState(false);
  const [sfImportMsg, setSfImportMsg] = useState<string | null>(null);

  const sfConnected   = !!project.salesforceId;
  const jiraConnected = !!jiraConfig;

  async function handleImportStakeholders() {
    if (!project.salesforceId) return;
    setSfImporting(true);
    setSfImportMsg(null);
    try {
      const res  = await fetch('/api/salesforce/stakeholders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salesforceId: project.salesforceId }),
      });
      const data = await res.json() as { stakeholders?: SFStakeholder[]; error?: string };
      if (!res.ok || data.error) { setSfImportMsg(`Error: ${data.error ?? 'Unknown'}`); return; }

      const existing = new Set(stakeholders.filter((s) => s.projectId === project.id).map((s) => s.name.toLowerCase()));
      const toAdd    = (data.stakeholders ?? []).filter((s) => !existing.has(s.name.toLowerCase()));

      await Promise.all(toAdd.map((s) => addStakeholder({
        projectId: project.id,
        name:      s.name,
        role:      s.role,
        company:   s.company,
        influence: 'Low',
        interest:  'Low',
        notes:     '',
      })));

      setSfImportMsg(toAdd.length > 0 ? `${toAdd.length} stakeholder(s) imported.` : 'All already imported.');
    } catch (err) {
      setSfImportMsg(`Error: ${err instanceof Error ? err.message : 'Unknown'}`);
    } finally {
      setSfImporting(false);
    }
  }

  return (
    <Stack gap="sm">
      {/* Salesforce */}
      <IntegrationRow
        icon={<SalesforceIcon />}
        name="Salesforce"
        status={sfConnected ? 'connected' : 'not-connected'}
        summary={sfConnected ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <IconCloudDown size={11} className="text-zinc-400 flex-shrink-0" />
              <a
                href={`https://willowtree.lightning.force.com/lightning/r/pse__Proj__c/${project.salesforceId}/view`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-0.5"
                style={{ color: '#0070a8', textDecoration: 'none', fontSize: 12 }}
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'underline'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'none'; }}
              >
                {project.sfName ?? 'View in Salesforce'}
                <IconExternalLink size={10} />
              </a>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); void handleImportStakeholders(); }}
                disabled={sfImporting}
                className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-800 transition-colors disabled:opacity-40"
              >
                <IconUsersPlus size={11} />
                {sfImporting ? 'Importing…' : 'Import stakeholders'}
              </button>
              {sfImportMsg && (
                <span className={`text-[11px] ${sfImportMsg.startsWith('Error') ? 'text-red-500' : 'text-green-600'}`}>
                  {sfImportMsg}
                </span>
              )}
            </div>
          </div>
        ) : (
          <Text size="xs" c="dimmed">Import a project via "New Project → Import from Salesforce"</Text>
        )}
      />

      {/* Jira */}
      <IntegrationRow
        icon={<JiraIcon />}
        name="Jira"
        status={jiraConnected ? 'connected' : 'not-connected'}
        summary={jiraConnected ? (
          <Text size="xs" c="dimmed">Project key: <strong>{jiraConfig.projectKey}</strong></Text>
        ) : (
          <Text size="xs" c="dimmed">Connect to pull sprint and issue data</Text>
        )}
        configurable
      >
        <PMToolConfig projectId={project.id} tool="jira" />
      </IntegrationRow>

      {/* Linear */}
      <IntegrationRow
        icon={<LinearIcon />}
        name="Linear"
        status="coming-soon"
      />

      {/* Monday */}
      <IntegrationRow
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="5" cy="12" r="3" fill="#FF3D57"/>
            <circle cx="12" cy="12" r="3" fill="#FFCB00"/>
            <circle cx="19" cy="12" r="3" fill="#00CA72"/>
          </svg>
        }
        name="Monday.com"
        status="coming-soon"
      />
    </Stack>
  );
}
