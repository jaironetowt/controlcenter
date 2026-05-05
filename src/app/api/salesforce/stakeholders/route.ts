import { exec } from 'child_process';

function runSF(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const shell = process.env.SHELL || '/bin/zsh';
    exec(`${shell} -l -c ${JSON.stringify(cmd)}`, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout) => {
      if (stdout?.trim()) resolve(stdout);
      else reject(err ?? new Error('No output from SF CLI'));
    });
  });
}

export interface SFStakeholder {
  name: string;
  role: string;
  company: string;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { salesforceId } = body as { salesforceId?: string };

  if (!salesforceId) {
    return Response.json({ error: 'Missing salesforceId' }, { status: 400 });
  }

  try {
    const soql = [
      'SELECT pse__Resource__r.Name, pse__Resource__r.Title, pse__Resource__r.Account.Name',
      'FROM pse__Assignment__c',
      `WHERE pse__Project__c = '${salesforceId}'`,
      'AND pse__Status__c = \'Active\'',
      'ORDER BY pse__Resource__r.Name',
    ].join(' ');

    const stdout = await runSF(`sf data query --query ${JSON.stringify(soql)} --json`);
    const result = JSON.parse(stdout) as {
      status?: number;
      result?: { records: Record<string, unknown>[] };
      message?: string;
    };

    if (result.status !== 0 || !result.result) {
      return Response.json({ error: result.message ?? 'SF query failed' }, { status: 502 });
    }

    const seen = new Set<string>();
    const stakeholders: SFStakeholder[] = [];

    for (const r of result.result.records) {
      const res     = r['pse__Resource__r'] as Record<string, unknown> | null;
      const account = res?.['Account']      as Record<string, unknown> | null;
      const name    = res ? String(res['Name'] ?? '') : '';
      if (!name || seen.has(name)) continue;
      seen.add(name);
      stakeholders.push({
        name,
        role:    res?.['Title']  ? String(res['Title'])         : '',
        company: account?.['Name'] ? String(account['Name'])    : '',
      });
    }

    return Response.json({ stakeholders });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
