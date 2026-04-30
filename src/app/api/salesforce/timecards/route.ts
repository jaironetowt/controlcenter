import { exec } from 'child_process';

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

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { salesforceId } = body as { salesforceId?: string };

  if (!salesforceId) {
    return Response.json({ error: 'Missing salesforceId' }, { status: 400 });
  }

  if (salesforceId === 'mock-mosaic') {
    return Response.json({ timecards: [
      { resourceName: 'John Smith', assignment: 'Mosaic - John Smith', startDate: '2026-04-20', endDate: '2026-04-26', actualHours: 0, estimatedHours: 40 },
      { resourceName: 'Ana Lima',   assignment: 'Mosaic - Ana Lima',   startDate: '2026-04-27', endDate: '2026-04-30', actualHours: 0, estimatedHours: 24 },
    ]});
  }

  try {
    const soql = [
      'SELECT pse__Resource__r.Name, pse__Assignment__r.Name, pse__Start_Date__c, pse__End_Date__c, pse__Actual_Hours__c, pse__Estimated_Hours__c',
      'FROM pse__Est_Vs_Actuals__c',
      `WHERE pse__Project__c = '${salesforceId}'`,
      "AND pse__Time_Period_Type__c = 'SplitWeek'",
      'AND Should_Have_Timecard__c = true',
      'AND pse__Actual_Hours__c = 0',
      'AND pse__Timecards_Submitted__c = false',
      'AND Reviewed__c = false',
      'AND pse__Assignment__r.pse__End_Date__c >= TODAY',
      'ORDER BY pse__Start_Date__c DESC, pse__Resource__r.Name',
    ].join(' ');

    const stdout = await runSF(`sf data query --query ${JSON.stringify(soql)} --json`);
    const result = JSON.parse(stdout) as { status?: number; result?: { records: Record<string, unknown>[] }; message?: string; name?: string };

    if (result.status !== 0 || !result.result) {
      return Response.json({ error: result.message ?? result.name ?? 'SF query failed', raw: result }, { status: 502 });
    }

    const records = result.result?.records ?? [];

    const timecards = records.map((r) => {
      const resource   = r['pse__Resource__r']   as Record<string, unknown> | null;
      const assignment = r['pse__Assignment__r']  as Record<string, unknown> | null;
      return {
        resourceName:   resource   ? String(resource['Name']   ?? '—') : '—',
        assignment:     assignment ? String(assignment['Name'] ?? '—') : '—',
        startDate:      r['pse__Start_Date__c']      ? String(r['pse__Start_Date__c'])      : null,
        endDate:        r['pse__End_Date__c']        ? String(r['pse__End_Date__c'])        : null,
        actualHours:    r['pse__Actual_Hours__c']    != null ? Number(r['pse__Actual_Hours__c'])    : null,
        estimatedHours: r['pse__Estimated_Hours__c'] != null ? Number(r['pse__Estimated_Hours__c']) : null,
      };
    });

    return Response.json({ timecards });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}
