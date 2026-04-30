// ─── POST /api/pm/jira/test ───────────────────────────────────────────────────
// Validates Jira credentials by calling GET /rest/api/3/myself.
// The API token never leaves the server.

interface TestRequestBody {
  baseUrl: string;
  email: string;
  apiToken: string;
  projectKey: string;
}

export async function POST(request: Request): Promise<Response> {
  let body: TestRequestBody;

  try {
    body = await request.json() as TestRequestBody;
  } catch {
    return Response.json({ ok: false, error: 'Invalid request body' }, { status: 400 });
  }

  const { baseUrl, email, apiToken } = body;

  if (!baseUrl || !email || !apiToken) {
    return Response.json(
      { ok: false, error: 'baseUrl, email, and apiToken are required' },
      { status: 400 },
    );
  }

  const credentials = Buffer.from(`${email}:${apiToken}`).toString('base64');

  try {
    const jiraRes = await fetch(`${baseUrl}/rest/api/3/myself`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${credentials}`,
        Accept: 'application/json',
      },
    });

    if (jiraRes.ok) {
      return Response.json({ ok: true });
    }

    let errorMessage = `Jira returned status ${jiraRes.status}`;
    try {
      const errBody = await jiraRes.json() as { message?: string };
      if (errBody.message) errorMessage = errBody.message;
    } catch {
      // ignore parse errors
    }

    return Response.json({ ok: false, error: errorMessage });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error';
    return Response.json({ ok: false, error: message }, { status: 502 });
  }
}
