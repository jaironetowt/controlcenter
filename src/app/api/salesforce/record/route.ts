import { exec } from 'child_process';

// Runs a shell command and returns stdout even when exit code is non-zero.
// SF CLI exits with code 1 due to dev-plugin warnings but stdout still has valid JSON.
function runSF(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const shell = process.env.SHELL || '/bin/zsh';
    exec(`${shell} -l -c ${JSON.stringify(cmd)}`, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout) => {
      if (stdout?.trim()) {
        resolve(stdout);
      } else {
        reject(err ?? new Error('No output from SF CLI'));
      }
    });
  });
}

// ─── URL parser ───────────────────────────────────────────────────────────────

function parseLightningUrl(url: string): { objectApiName: string; recordId: string } | null {
  try {
    const { pathname } = new URL(url);
    const match = pathname.match(/^\/lightning\/r\/([^/]+)\/([^/]+)\/view$/);
    if (!match) return null;
    return { objectApiName: match[1], recordId: match[2] };
  } catch {
    return null;
  }
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { url } = body as { url?: string };

  if (!url?.trim()) {
    return Response.json({ error: 'Missing url' }, { status: 400 });
  }

  const parsed = parseLightningUrl(url.trim());
  if (!parsed) {
    return Response.json(
      { error: 'Invalid Salesforce URL. Expected: .../lightning/r/{Object}/{Id}/view' },
      { status: 400 },
    );
  }

  const { objectApiName, recordId } = parsed;

  /*
   * ⚠️  LOCAL-ONLY — uses SF CLI session (Okta SSO compatible)
   *
   * Prerequisites: SF CLI installed + `sf org login web --set-default`
   *
   * BEFORE DISTRIBUTING:
   * Replace with OAuth 2.0 via Salesforce External Client App (ECA).
   * See BACKLOG CC-60.
   */
  try {
    const soql = `SELECT Id, Name, pse__Account__r.Name, pse__Start_Date__c, pse__End_Date__c FROM ${objectApiName} WHERE Id='${recordId}'`;
    const stdout = await runSF(`sf data query --query ${JSON.stringify(soql)} --json`);

    const result = JSON.parse(stdout) as { status: number; result: { records: Record<string, unknown>[] } };

    if (!result.result?.records?.length) {
      return Response.json({ error: 'Record not found' }, { status: 404 });
    }

    return Response.json({ record: result.result.records[0] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);

    const isAuthError =
      message.includes('No authorization information found') ||
      message.includes('not authenticated') ||
      message.includes('RefreshTokenAuthError');

    if (isAuthError) {
      return Response.json(
        { error: 'SF CLI not authenticated. Run: sf org login web --set-default' },
        { status: 401 },
      );
    }

    return Response.json({ error: message }, { status: 500 });
  }
}
