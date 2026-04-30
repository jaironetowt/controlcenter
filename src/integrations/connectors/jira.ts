import type { PMToolConnector, PMToolConfig, PMProjectData } from '@/integrations/types';

// ─── Jira Connector ───────────────────────────────────────────────────────────
// All requests are proxied through Next.js API routes so the API token
// is never exposed to the browser.

export const jiraConnector: PMToolConnector = {
  type: 'jira',

  async testConnection(config: PMToolConfig): Promise<{ ok: boolean; error?: string }> {
    const res = await fetch('/api/pm/jira/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        baseUrl: config.baseUrl,
        email: config.email,
        apiToken: config.apiToken,
        projectKey: config.projectKey,
      }),
    });

    const data = await res.json() as { ok: boolean; error?: string };
    return data;
  },

  async fetchProjectData(config: PMToolConfig): Promise<PMProjectData> {
    const res = await fetch('/api/pm/jira/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        baseUrl: config.baseUrl,
        email: config.email,
        apiToken: config.apiToken,
        projectKey: config.projectKey,
      }),
    });

    if (!res.ok) {
      const err = await res.json() as { error?: string };
      throw new Error(err.error ?? 'Failed to fetch project data from Jira');
    }

    const data = await res.json() as PMProjectData;
    return data;
  },
};
