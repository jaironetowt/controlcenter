// ─── POST /api/migrate ────────────────────────────────────────────────────────
// Recebe um dump do localStorage e insere os dados no Supabase usando a
// service role key (bypassa RLS — só usar em migração one-shot).
//
// Body esperado (JSON):
// {
//   "cc-projects":     { "state": { "projects": [...] } },
//   "cc-risks-v2":     { "state": { "risks": [...] } },
//   "cc-action-items": { "state": { "items": [...] } },
//   "cc-decisions":    { "state": { "decisions": [...] } },
//   "cc-stakeholders": { "state": { "stakeholders": [...] } }
// }
//
// Para obter o dump: abra o DevTools → Console e rode:
//   const keys = ['cc-projects','cc-risks-v2','cc-action-items','cc-decisions','cc-stakeholders'];
//   const dump = {};
//   keys.forEach(k => { try { dump[k] = JSON.parse(localStorage.getItem(k) || '{}'); } catch(e) {} });
//   copy(JSON.stringify(dump));
// Depois faça POST para /api/migrate com o JSON copiado.

import { createClient } from '@supabase/supabase-js';

// ─── Tipos locais (espelhando os stores Zustand) ──────────────────────────────

interface Project {
  id: string;
  name: string;
  color: string;
  client: string;
  phase: string;
  dateRange: string;
  archived: boolean;
  archivedAt?: number;
  createdAt: number;
  salesforceId?: string;
}

interface Risk {
  id: string;
  projectId: string;
  title: string;
  description: string;
  probability: string;
  impact: string;
  status: string;
  owner: string;
  createdAt: number;
  closedAt?: number;
}

interface ActionItem {
  id: string;
  projectId: string;
  title: string;
  owner: string;
  dueDate: string;
  priority: string;
  status: string;
  createdAt: number;
}

interface Decision {
  id: string;
  projectId: string;
  title: string;
  context: string;
  decision: string;
  alternatives: string;
  author: string;
  createdAt: number;
}

interface Stakeholder {
  id: string;
  projectId: string;
  name: string;
  role: string;
  company: string;
  influence: string;
  interest: string;
  notes: string;
  createdAt: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function msToIso(ms: number | undefined): string | null {
  if (!ms) return null;
  return new Date(ms).toISOString();
}

function ensureUuid(id: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) return id;
  // ID legado: gera UUID estável via hash simples
  // Em Node.js/Edge runtime, usamos crypto.randomUUID() — mas para manter o mapeamento
  // consistente em caso de retry, seria ideal usar deterministic UUID. Para migração
  // one-shot, UUID aleatório é suficiente.
  return crypto.randomUUID();
}

// ─── Parse do dump do localStorage ───────────────────────────────────────────

function parseDump(raw: Record<string, unknown>) {
  const proj  = (raw['cc-projects']     as { state?: { projects?: Project[] } })?.state?.projects     ?? [];
  const risks = (raw['cc-risks-v2']     as { state?: { risks?: Risk[] } })?.state?.risks               ?? [];
  const items = (raw['cc-action-items'] as { state?: { items?: ActionItem[] } })?.state?.items         ?? [];
  const decs  = (raw['cc-decisions']    as { state?: { decisions?: Decision[] } })?.state?.decisions   ?? [];
  const shs   = (raw['cc-stakeholders'] as { state?: { stakeholders?: Stakeholder[] } })?.state?.stakeholders ?? [];
  return { projects: proj, risks, action_items: items, decisions: decs, stakeholders: shs };
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function POST(request: Request): Promise<Response> {
  // Verificar se a service role key está configurada
  const supabaseUrl      = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey   = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json(
      {
        ok: false,
        error: 'SUPABASE_SERVICE_ROLE_KEY não configurada no .env.local. ' +
               'Adicione a chave (Supabase → Settings → API → service_role) e reinicie o servidor.',
      },
      { status: 500 },
    );
  }

  // Criar cliente com service role (bypassa RLS)
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // Parsear body
  let raw: Record<string, unknown>;
  try {
    raw = await request.json() as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, error: 'Body inválido — esperado JSON.' }, { status: 400 });
  }

  const data = parseDump(raw);

  const results = {
    projects:     { ok: 0, errors: [] as string[] },
    risks:        { ok: 0, errors: [] as string[] },
    action_items: { ok: 0, errors: [] as string[] },
    decisions:    { ok: 0, errors: [] as string[] },
    stakeholders: { ok: 0, errors: [] as string[] },
  };

  // Mapa de IDs legados → UUID
  const projectIdMap: Record<string, string> = {};

  // ─── Projetos ──────────────────────────────────────────────────────────────
  for (const p of data.projects) {
    const newId = ensureUuid(p.id);
    projectIdMap[p.id] = newId;

    const { error } = await supabase.from('projects').upsert({
      id:            newId,
      name:          p.name,
      color:         p.color,
      client:        p.client,
      phase:         p.phase,
      date_range:    p.dateRange,
      archived:      p.archived,
      archived_at:   msToIso(p.archivedAt),
      salesforce_id: p.salesforceId ?? null,
      created_at:    msToIso(p.createdAt) ?? new Date().toISOString(),
    }, { onConflict: 'id' });

    if (error) results.projects.errors.push(`"${p.name}": ${error.message}`);
    else results.projects.ok++;
  }

  // ─── Risks ─────────────────────────────────────────────────────────────────
  for (const r of data.risks) {
    const newId        = ensureUuid(r.id);
    const newProjectId = projectIdMap[r.projectId] ?? ensureUuid(r.projectId);

    const { error } = await supabase.from('risks').upsert({
      id:          newId,
      project_id:  newProjectId,
      title:       r.title,
      description: r.description,
      probability: r.probability,
      impact:      r.impact,
      status:      r.status,
      owner:       r.owner,
      created_at:  msToIso(r.createdAt) ?? new Date().toISOString(),
      closed_at:   msToIso(r.closedAt),
    }, { onConflict: 'id' });

    if (error) results.risks.errors.push(`"${r.title}": ${error.message}`);
    else results.risks.ok++;
  }

  // ─── Action Items ──────────────────────────────────────────────────────────
  for (const item of data.action_items) {
    const newId        = ensureUuid(item.id);
    const newProjectId = projectIdMap[item.projectId] ?? ensureUuid(item.projectId);

    const { error } = await supabase.from('action_items').upsert({
      id:         newId,
      project_id: newProjectId,
      title:      item.title,
      owner:      item.owner,
      due_date:   item.dueDate,
      priority:   item.priority,
      status:     item.status,
      created_at: msToIso(item.createdAt) ?? new Date().toISOString(),
    }, { onConflict: 'id' });

    if (error) results.action_items.errors.push(`"${item.title}": ${error.message}`);
    else results.action_items.ok++;
  }

  // ─── Decisions ─────────────────────────────────────────────────────────────
  for (const d of data.decisions) {
    const newId        = ensureUuid(d.id);
    const newProjectId = projectIdMap[d.projectId] ?? ensureUuid(d.projectId);

    const { error } = await supabase.from('decisions').upsert({
      id:           newId,
      project_id:   newProjectId,
      title:        d.title,
      context:      d.context,
      decision:     d.decision,
      alternatives: d.alternatives,
      author:       d.author,
      created_at:   msToIso(d.createdAt) ?? new Date().toISOString(),
    }, { onConflict: 'id' });

    if (error) results.decisions.errors.push(`"${d.title}": ${error.message}`);
    else results.decisions.ok++;
  }

  // ─── Stakeholders ──────────────────────────────────────────────────────────
  for (const sh of data.stakeholders) {
    const newId        = ensureUuid(sh.id);
    const newProjectId = projectIdMap[sh.projectId] ?? ensureUuid(sh.projectId);

    const { error } = await supabase.from('stakeholders').upsert({
      id:         newId,
      project_id: newProjectId,
      name:       sh.name,
      role:       sh.role,
      company:    sh.company,
      influence:  sh.influence,
      interest:   sh.interest,
      notes:      sh.notes,
      created_at: msToIso(sh.createdAt) ?? new Date().toISOString(),
    }, { onConflict: 'id' });

    if (error) results.stakeholders.errors.push(`"${sh.name}": ${error.message}`);
    else results.stakeholders.ok++;
  }

  // ─── Resumo ────────────────────────────────────────────────────────────────
  const totalOk     = Object.values(results).reduce((s, r) => s + r.ok, 0);
  const totalErrors = Object.values(results).reduce((s, r) => s + r.errors.length, 0);

  return Response.json({
    ok: totalErrors === 0,
    summary: {
      projects:     `${results.projects.ok} ok, ${results.projects.errors.length} erro(s)`,
      risks:        `${results.risks.ok} ok, ${results.risks.errors.length} erro(s)`,
      action_items: `${results.action_items.ok} ok, ${results.action_items.errors.length} erro(s)`,
      decisions:    `${results.decisions.ok} ok, ${results.decisions.errors.length} erro(s)`,
      stakeholders: `${results.stakeholders.ok} ok, ${results.stakeholders.errors.length} erro(s)`,
    },
    totals: { ok: totalOk, errors: totalErrors },
    errors: Object.entries(results)
      .filter(([, r]) => r.errors.length > 0)
      .reduce((acc, [k, r]) => ({ ...acc, [k]: r.errors }), {}),
  });
}
