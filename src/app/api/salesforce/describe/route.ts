import { exec } from 'child_process';

function runSF(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const shell = process.env.SHELL || '/bin/zsh';
    exec(`${shell} -l -c ${JSON.stringify(cmd)}`, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout) => {
      if (stdout?.trim()) resolve(stdout);
      else reject(err ?? new Error('No output'));
    });
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sobject = searchParams.get('sobject');
  if (!sobject) return Response.json({ error: 'Missing ?sobject=' }, { status: 400 });

  const stdout = await runSF(`sf sobject describe --sobject ${sobject} --json`);
  const result = JSON.parse(stdout) as { result: { fields: { name: string; type: string; label: string }[] } };
  const fields = result.result?.fields?.map((f) => ({ name: f.name, type: f.type, label: f.label })) ?? [];
  return Response.json({ fields });
}
