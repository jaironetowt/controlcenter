// POST /api/pm/jira/velocity
// Returns committed vs done issue counts for the last N closed sprints.

interface RequestBody {
  baseUrl: string;
  email: string;
  apiToken: string;
  projectKey: string;
  limit?: number;   // sprints to display
  window?: number;  // MA window size
}

export interface VelocitySprint {
  id: string;
  name: string;
  shortName: string;
  startDate: string | null;
  endDate: string | null;
  committed: number;
  done: number;
  committedSP: number;
  doneSP: number;
}

interface JiraBoard { id: number; type: string; }
interface JiraSprint { id: number; name: string; state: string; startDate?: string; endDate?: string; }
interface JiraIssue { fields: { status: { name: string }; customfield_10024?: number | null } }

const DONE = new Set(['Done', 'Closed', 'Resolved']);

function auth(email: string, token: string) {
  return `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}`;
}

async function jget<T>(url: string, a: string): Promise<T> {
  const res = await fetch(url, { headers: { Authorization: a, Accept: 'application/json' } });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? `Jira API error: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function shortName(name: string): string {
  const m = name.match(/sprint\s+(\d+)/i);
  return m ? `Sprint ${m[1]}` : name.replace(/mobile replatform\s*/i, '').trim().slice(0, 12);
}

export async function POST(request: Request): Promise<Response> {
  let body: RequestBody;
  try { body = await request.json() as RequestBody; }
  catch { return Response.json({ error: 'Invalid body' }, { status: 400 }); }

  const { baseUrl, email, apiToken, projectKey, limit = 3, window: maWindow = 3 } = body;
  const fetchCount = limit + maWindow - 1; // extra sprints for MA context
  if (!baseUrl || !email || !apiToken || !projectKey) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const a = auth(email, apiToken);

  try {
    // 1. Find scrum board
    const boards = await jget<{ values: JiraBoard[] }>(
      `${baseUrl}/rest/agile/1.0/board?projectKeyOrId=${encodeURIComponent(projectKey)}`,
      a,
    );
    const board = boards.values.find((b) => b.type === 'scrum') ?? boards.values[0];
    if (!board) return Response.json({ error: 'No board found' }, { status: 404 });

    // 2. Fetch closed sprints (most recent first via maxResults trick — API returns oldest first)
    const sprintsRes = await jget<{ values: JiraSprint[] }>(
      `${baseUrl}/rest/agile/1.0/board/${board.id}/sprint?state=closed&maxResults=50`,
      a,
    );
    const closedSprints = sprintsRes.values.slice(-fetchCount);

    // 3. For each sprint, fetch issue counts
    const results: VelocitySprint[] = await Promise.all(
      closedSprints.map(async (sprint): Promise<VelocitySprint> => {
        const issuesRes = await jget<{ issues: JiraIssue[] }>(
          `${baseUrl}/rest/agile/1.0/sprint/${sprint.id}/issue?maxResults=500&fields=status,customfield_10024`,
          a,
        );
        const issues = issuesRes.issues;
        const doneIssues = issues.filter((i) => DONE.has(i.fields.status.name));
        const sp = (i: JiraIssue) => i.fields.customfield_10024 ?? 0;
        return {
          id: String(sprint.id),
          name: sprint.name,
          shortName: shortName(sprint.name),
          startDate: sprint.startDate ?? null,
          endDate: sprint.endDate ?? null,
          committed: issues.length,
          done: doneIssues.length,
          committedSP: issues.reduce((s, i) => s + sp(i), 0),
          doneSP: doneIssues.reduce((s, i) => s + sp(i), 0),
        };
      }),
    );

    // Last `limit` sprints are the ones to display; all are used for MA
    return Response.json({ sprints: results, displayFrom: Math.max(0, results.length - limit) });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 502 });
  }
}
