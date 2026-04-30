import type { PMProjectData, PMIssue, PMSprint } from '@/integrations/types';

// ─── POST /api/pm/jira/data ───────────────────────────────────────────────────
// Fetches sprint + issue data from Jira Agile API.
// The API token never leaves the server.

interface DataRequestBody {
  baseUrl: string;
  email: string;
  apiToken: string;
  projectKey: string;
}

// ─── Jira raw shapes ──────────────────────────────────────────────────────────

interface JiraBoard {
  id: number;
  name: string;
  type: string;
}

interface JiraBoardsResponse {
  values: JiraBoard[];
}

interface JiraSprint {
  id: number;
  name: string;
  state: string;
  startDate?: string;
  endDate?: string;
}

interface JiraSprintsResponse {
  values: JiraSprint[];
}

interface JiraIssueFields {
  summary: string;
  status: { name: string };
  assignee: { displayName: string } | null;
  priority: { name: string } | null;
  issuetype: { name: string };
}

interface JiraIssue {
  id: string;
  key: string;
  fields: JiraIssueFields;
}

interface JiraIssuesResponse {
  issues: JiraIssue[];
  total: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeAuth(email: string, apiToken: string): string {
  return `Basic ${Buffer.from(`${email}:${apiToken}`).toString('base64')}`;
}

async function jiraFetch<T>(url: string, auth: string): Promise<T> {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: auth,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    let msg = `Jira API error: ${res.status}`;
    try {
      const body = await res.json() as { message?: string };
      if (body.message) msg = body.message;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  return res.json() as Promise<T>;
}

function normalisePriority(
  name: string | undefined,
): PMIssue['priority'] {
  switch (name) {
    case 'Highest': return 'Highest';
    case 'High':    return 'High';
    case 'Medium':  return 'Medium';
    case 'Low':     return 'Low';
    case 'Lowest':  return 'Lowest';
    default:        return null;
  }
}

function normaliseSprintState(state: string): PMSprint['state'] {
  if (state === 'active') return 'active';
  if (state === 'closed') return 'closed';
  return 'future';
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(request: Request): Promise<Response> {
  let body: DataRequestBody;

  try {
    body = await request.json() as DataRequestBody;
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { baseUrl, email, apiToken, projectKey } = body;

  if (!baseUrl || !email || !apiToken || !projectKey) {
    return Response.json(
      { error: 'baseUrl, email, apiToken, and projectKey are required' },
      { status: 400 },
    );
  }

  const auth = makeAuth(email, apiToken);

  try {
    // 1. Find the board for the project
    const boardsData = await jiraFetch<JiraBoardsResponse>(
      `${baseUrl}/rest/agile/1.0/board?projectKeyOrId=${encodeURIComponent(projectKey)}`,
      auth,
    );

    const board = boardsData.values[0];
    if (!board) {
      return Response.json({ error: `No board found for project ${projectKey}` }, { status: 404 });
    }

    // 2. Get the active sprint for the board
    const sprintsData = await jiraFetch<JiraSprintsResponse>(
      `${baseUrl}/rest/agile/1.0/board/${board.id}/sprint?state=active`,
      auth,
    );

    const rawSprint = sprintsData.values[0] ?? null;

    let activeSprint: PMSprint | null = null;
    let issues: PMIssue[] = [];

    if (rawSprint) {
      activeSprint = {
        id: String(rawSprint.id),
        name: rawSprint.name,
        state: normaliseSprintState(rawSprint.state),
        startDate: rawSprint.startDate ?? null,
        endDate: rawSprint.endDate ?? null,
      };

      // 3. Fetch issues in the active sprint
      const issuesData = await jiraFetch<JiraIssuesResponse>(
        `${baseUrl}/rest/agile/1.0/sprint/${rawSprint.id}/issue`,
        auth,
      );

      issues = issuesData.issues.map((issue): PMIssue => ({
        id: issue.id,
        key: issue.key,
        title: issue.fields.summary,
        status: issue.fields.status.name,
        assignee: issue.fields.assignee?.displayName ?? null,
        priority: normalisePriority(issue.fields.priority?.name),
        type: issue.fields.issuetype.name,
        url: `${baseUrl}/browse/${issue.key}`,
      }));
    }

    const closedStatuses = new Set(['Done', 'Closed', 'Resolved']);
    const closedIssues = issues.filter((i) => closedStatuses.has(i.status)).length;
    const openIssues = issues.length - closedIssues;

    const result: PMProjectData = {
      issues,
      activeSprint,
      totalIssues: issues.length,
      openIssues,
      closedIssues,
    };

    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 502 });
  }
}
