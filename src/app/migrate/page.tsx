'use client';

import { useState, useEffect, useRef } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LocalStorageData {
  'cc-projects'?:     { state?: { projects?: unknown[] } };
  'cc-risks-v2'?:     { state?: { risks?: unknown[] } };
  'cc-action-items'?: { state?: { items?: unknown[] } };
  'cc-decisions'?:    { state?: { decisions?: unknown[] } };
  'cc-stakeholders'?: { state?: { stakeholders?: unknown[] } };
}

interface DataCounts {
  projects:     number;
  risks:        number;
  action_items: number;
  decisions:    number;
  stakeholders: number;
}

interface TableStatus {
  [key: string]: boolean;
}

interface SetupResult {
  ok: boolean;
  tables: TableStatus;
  allTablesExist: boolean;
  migrationSql: string | null;
  message: string;
  error?: string;
}

interface MigrateResult {
  ok: boolean;
  summary?: {
    projects:     string;
    risks:        string;
    action_items: string;
    decisions:    string;
    stakeholders: string;
  };
  totals?: { ok: number; errors: number };
  errors?: Record<string, string[]>;
  error?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readLocalStorage(): { data: LocalStorageData; counts: DataCounts } {
  const keys = ['cc-projects', 'cc-risks-v2', 'cc-action-items', 'cc-decisions', 'cc-stakeholders'] as const;
  const data: LocalStorageData = {};

  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) data[key] = JSON.parse(raw) as LocalStorageData[typeof key];
    } catch {
      // ignorar erros de parse
    }
  }

  const counts: DataCounts = {
    projects:     data['cc-projects']?.state?.projects?.length     ?? 0,
    risks:        data['cc-risks-v2']?.state?.risks?.length         ?? 0,
    action_items: data['cc-action-items']?.state?.items?.length     ?? 0,
    decisions:    data['cc-decisions']?.state?.decisions?.length    ?? 0,
    stakeholders: data['cc-stakeholders']?.state?.stakeholders?.length ?? 0,
  };

  return { data, counts };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MigratePage() {
  const [mounted, setMounted]           = useState(false);
  const [lsData, setLsData]             = useState<LocalStorageData>({});
  const [counts, setCounts]             = useState<DataCounts | null>(null);
  const [setupResult, setSetupResult]   = useState<SetupResult | null>(null);
  const [migrateResult, setMigrateResult] = useState<MigrateResult | null>(null);
  const [checkingSetup, setCheckingSetup] = useState(false);
  const [migrating, setMigrating]       = useState(false);
  const [copied, setCopied]             = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const { data, counts: c } = readLocalStorage();
    setLsData(data);
    setCounts(c);
  }, []);

  const totalRecords = counts
    ? counts.projects + counts.risks + counts.action_items + counts.decisions + counts.stakeholders
    : 0;

  async function checkSetup() {
    setCheckingSetup(true);
    setSetupResult(null);
    try {
      const res = await fetch('/api/setup');
      const json = await res.json() as SetupResult;
      setSetupResult(json);
    } catch (e) {
      setSetupResult({ ok: false, tables: {}, allTablesExist: false, migrationSql: null, message: 'Erro ao conectar com /api/setup', error: String(e) });
    } finally {
      setCheckingSetup(false);
    }
  }

  async function runMigration() {
    if (totalRecords === 0) return;
    setMigrating(true);
    setMigrateResult(null);
    try {
      const res = await fetch('/api/migrate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(lsData),
      });
      const json = await res.json() as MigrateResult;
      setMigrateResult(json);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (e) {
      setMigrateResult({ ok: false, error: String(e) });
    } finally {
      setMigrating(false);
    }
  }

  async function copySQL() {
    if (!setupResult?.migrationSql) return;
    await navigator.clipboard.writeText(setupResult.migrationSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 overflow-y-auto bg-zinc-50">
    <div className="py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Migração de Dados</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Migra dados do localStorage do browser para o Supabase.
            Execute as etapas abaixo em ordem.
          </p>
        </div>

        {/* Etapa 1 — Dados encontrados no localStorage */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
          <h2 className="font-medium text-zinc-900 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">1</span>
            Dados encontrados no localStorage
          </h2>

          {counts === null ? (
            <p className="text-sm text-zinc-500">Carregando...</p>
          ) : totalRecords === 0 ? (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
              <p className="text-sm text-amber-800 font-medium">Nenhum dado encontrado no localStorage.</p>
              <p className="text-xs text-amber-700 mt-1">
                Certifique-se de abrir esta página no mesmo browser onde o Control Center estava rodando antes da migração para Supabase.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  { label: 'Projetos',      value: counts.projects },
                  { label: 'Riscos',        value: counts.risks },
                  { label: 'Action Items',  value: counts.action_items },
                  { label: 'Decisões',      value: counts.decisions },
                  { label: 'Stakeholders',  value: counts.stakeholders },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-3">
                    <p className="text-xs text-zinc-500">{label}</p>
                    <p className={`text-2xl font-semibold mt-0.5 ${value > 0 ? 'text-zinc-900' : 'text-zinc-300'}`}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-zinc-600">
                Total: <strong>{totalRecords}</strong> registro(s) prontos para migrar.
              </p>
            </>
          )}
        </div>

        {/* Etapa 2 — Verificar tabelas */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
          <h2 className="font-medium text-zinc-900 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">2</span>
            Verificar tabelas no Supabase
          </h2>

          <p className="text-sm text-zinc-500">
            Verifica se as tabelas já foram criadas no Supabase. Se não existirem, o SQL de criação será exibido aqui para você copiar e rodar no{' '}
            <a
              href="https://app.supabase.com/project/ffonrcyyjrexlpeapxwm/sql/new"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              SQL Editor
            </a>
            .
          </p>

          <button
            onClick={checkSetup}
            disabled={checkingSetup}
            className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {checkingSetup ? 'Verificando...' : 'Verificar tabelas'}
          </button>

          {setupResult && (
            <div className={`rounded-lg border px-4 py-3 space-y-3 ${setupResult.allTablesExist ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
              <p className={`text-sm font-medium ${setupResult.allTablesExist ? 'text-green-800' : 'text-amber-800'}`}>
                {setupResult.message}
              </p>

              {/* Status de cada tabela */}
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {Object.entries(setupResult.tables).map(([table, exists]) => (
                  <div key={table} className="flex items-center gap-1.5 text-xs">
                    <span className={exists ? 'text-green-600' : 'text-red-500'}>{exists ? '✓' : '✗'}</span>
                    <span className={exists ? 'text-zinc-700' : 'text-zinc-500 line-through'}>{table}</span>
                  </div>
                ))}
              </div>

              {/* SQL de criação se precisar */}
              {setupResult.migrationSql && (
                <div className="space-y-2">
                  <p className="text-xs text-amber-700 font-medium">
                    Execute o SQL abaixo no Supabase SQL Editor e depois volte para verificar novamente:
                  </p>
                  <div className="relative">
                    <pre className="text-xs bg-zinc-900 text-zinc-100 rounded-lg p-3 overflow-auto max-h-64 font-mono">
                      {setupResult.migrationSql}
                    </pre>
                    <button
                      onClick={copySQL}
                      className="absolute top-2 right-2 px-2 py-1 rounded bg-zinc-700 hover:bg-zinc-600 text-xs text-zinc-200 transition"
                    >
                      {copied ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                  <a
                    href="https://app.supabase.com/project/ffonrcyyjrexlpeapxwm/sql/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                  >
                    Abrir SQL Editor no Supabase →
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Etapa 3 — Migrar dados */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
          <h2 className="font-medium text-zinc-900 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">3</span>
            Migrar dados para o Supabase
          </h2>

          <p className="text-sm text-zinc-500">
            Envia os dados do localStorage para o Supabase via{' '}
            <code className="text-xs bg-zinc-100 px-1 py-0.5 rounded">/api/migrate</code>.
            A operação é idempotente — pode ser executada mais de uma vez com segurança (usa upsert).
          </p>

          {totalRecords === 0 && (
            <div className="rounded-lg bg-zinc-50 border border-zinc-200 px-4 py-3">
              <p className="text-sm text-zinc-500">Nenhum dado no localStorage para migrar.</p>
            </div>
          )}

          {totalRecords > 0 && (
            <button
              onClick={runMigration}
              disabled={migrating || (setupResult !== null && !setupResult.allTablesExist)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {migrating ? 'Migrando...' : `Migrar ${totalRecords} registro(s) para o Supabase`}
            </button>
          )}

          {setupResult !== null && !setupResult.allTablesExist && totalRecords > 0 && (
            <p className="text-xs text-amber-700">
              Crie as tabelas na Etapa 2 antes de migrar os dados.
            </p>
          )}

          {migrateResult && (
            <div ref={resultRef} className={`rounded-lg border px-4 py-4 space-y-3 ${migrateResult.ok ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              {migrateResult.error ? (
                <p className="text-sm text-red-700 font-medium">Erro: {migrateResult.error}</p>
              ) : (
                <>
                  <p className={`text-sm font-medium ${migrateResult.ok ? 'text-green-800' : 'text-red-800'}`}>
                    {migrateResult.ok
                      ? `Migração concluída! ${migrateResult.totals?.ok ?? 0} registro(s) inseridos.`
                      : `Migração concluída com ${migrateResult.totals?.errors ?? 0} erro(s).`}
                  </p>

                  {migrateResult.summary && (
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      {Object.entries(migrateResult.summary).map(([key, val]) => (
                        <div key={key} className="flex gap-2">
                          <span className="text-zinc-500 w-28">{key}:</span>
                          <span className="text-zinc-700">{val}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {migrateResult.errors && Object.keys(migrateResult.errors).length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-red-700">Primeiro erro de cada tabela:</p>
                      {Object.entries(migrateResult.errors).map(([table, errs]) => (
                        <div key={table} className="text-xs text-red-600 bg-red-100 rounded px-2 py-1">
                          <strong>{table}:</strong> {errs[0]}
                        </div>
                      ))}
                    </div>
                  )}

                  {migrateResult.ok && (
                    <p className="text-xs text-green-700">
                      Verifique os dados no{' '}
                      <a
                        href="https://app.supabase.com/project/ffonrcyyjrexlpeapxwm/editor"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-green-900"
                      >
                        Supabase Table Editor
                      </a>
                      .
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Nota de segurança */}
        <p className="text-xs text-zinc-400 text-center">
          Esta página usa service role key apenas no servidor. Nenhum dado sensível é exposto no client.
          Após a migração, esta página pode ser removida.
        </p>
      </div>
    </div>
    </div>
  );
}
