/**
 * Control Center — Cloudflare Worker API (Gizmos platform, D1 backend).
 *
 * Same-origin REST API under /api/*. The gizmos loader serves the static
 * Next.js export for all other paths, and guarantees SSO before requests
 * reach this worker (identity arrives via x-gizmos-* headers).
 *
 * ── Multi-tenant model (workspace per person) ───────────────────────────────
 * Each user = one "space" identified by their x-gizmos-sub (owner_sub).
 * Content tables (projects | risks | action_items | decisions | stakeholders)
 * carry an owner_sub column. space_shares lets an owner invite viewers by email.
 *
 * Access to a space S by a caller (sub C, email E lowercased):
 *   C === S (owner)  OR  space_shares(owner_sub=S, viewer_email=E) exists.
 * WRITE (POST/PATCH/DELETE) is OWNER-ONLY; a viewer gets 403.
 *
 * Contract:
 *   GET  /api/me                          -> { sub, email }
 *   GET  /api/spaces                      -> { me:{sub,email}, spaces:[{owner_sub,owner_email,role}] }
 *   CRUD resources (projects | risks | action_items | decisions | stakeholders)
 *     GET    /api/{resource}?space=<owner_sub> -> { data: Row[] }  (default space = caller.sub; 403 if no access)
 *     POST   /api/{resource}                   -> { data: Row }    (owner_sub FORCED = caller.sub)
 *     PATCH  /api/{resource}/{id}              -> { data: Row }    (403 unless row.owner_sub === caller.sub)
 *     DELETE /api/{resource}/{id}              -> { ok: true }     (403 unless row.owner_sub === caller.sub)
 *   Shares:
 *     GET    /api/shares                  -> { data: [{ viewer_email, role }] }
 *     POST   /api/shares  { email }       -> { ok: true }  (upsert into caller's space)
 *     DELETE /api/shares/{email}          -> { ok: true }
 *   Settings:
 *     GET /api/user_settings              -> { features: object }
 *     PUT /api/user_settings              -> { ok: true }  (body = { features: object })
 *
 * Rows travel in snake_case exactly as the table columns. No npm imports.
 */

interface D1Result<T = Record<string, unknown>> {
  results?: T[];
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(colName?: string): Promise<T | null>;
  run<T = Record<string, unknown>>(): Promise<{ results?: T[]; meta?: unknown }>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = Record<string, unknown>>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  first<T = Record<string, unknown>>(query: string, ...params: unknown[]): Promise<T | null>;
  run(query: string, ...params: unknown[]): Promise<unknown>;
  exec(query: string): Promise<unknown>;
}

interface Env {
  DB: D1Database;
}

interface Caller {
  sub: string;
  email: string;
}

// Allow-list of CRUD resources -> physical table names. Guards against
// SQL injection via the resource path segment (table name can't be bound).
const RESOURCES: Record<string, string> = {
  projects: 'projects',
  risks: 'risks',
  action_items: 'action_items',
  decisions: 'decisions',
  stakeholders: 'stakeholders',
};

const JSON_HEADERS = { 'content-type': 'application/json' };

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function notFound(): Response {
  return json({ error: 'Not found' }, 404);
}

function forbidden(): Response {
  return json({ error: 'Forbidden' }, 403);
}

// Quote a SQLite identifier (column name) safely. Keys come from object
// keys of the request body — we still quote and reject anything with a
// double-quote to be defensive.
function ident(name: string): string {
  if (name.includes('"')) throw new Error(`Invalid column name: ${name}`);
  return `"${name}"`;
}

// Identity from the gizmos SSO headers. Email is lowercased everywhere.
function getCaller(req: Request): Caller {
  return {
    sub: req.headers.get('x-gizmos-sub') ?? '',
    email: (req.headers.get('x-gizmos-user') ?? '').toLowerCase(),
  };
}

// A caller may read a space if they own it, or were invited as a viewer.
async function canAccessSpace(env: Env, caller: Caller, spaceSub: string): Promise<boolean> {
  if (spaceSub === caller.sub) return true;
  if (!caller.email) return false;
  const row = await env.DB.prepare(
    'SELECT 1 FROM space_shares WHERE owner_sub = ? AND viewer_email = ? LIMIT 1',
  )
    .bind(spaceSub, caller.email)
    .first();
  return row != null;
}

// ─── Identity / spaces ────────────────────────────────────────────────────────

function handleMe(caller: Caller): Response {
  return json({ sub: caller.sub, email: caller.email });
}

async function handleSpaces(env: Env, caller: Caller): Promise<Response> {
  const spaces: Array<{ owner_sub: string; owner_email: string; role: string }> = [
    { owner_sub: caller.sub, owner_email: caller.email, role: 'owner' },
  ];

  if (caller.email) {
    const { results } = await env.DB.prepare(
      'SELECT owner_sub, owner_email FROM space_shares WHERE viewer_email = ? ORDER BY created_at ASC',
    )
      .bind(caller.email)
      .all<{ owner_sub: string; owner_email: string }>();
    for (const r of results ?? []) {
      spaces.push({ owner_sub: r.owner_sub, owner_email: r.owner_email, role: 'viewer' });
    }
  }

  return json({ me: { sub: caller.sub, email: caller.email }, spaces });
}

// ─── CRUD resources (space-aware) ──────────────────────────────────────────────

async function handleList(
  env: Env,
  caller: Caller,
  table: string,
  url: URL,
): Promise<Response> {
  const space = url.searchParams.get('space') || caller.sub;
  if (!(await canAccessSpace(env, caller, space))) return forbidden();

  const order = table === 'projects' ? ' ORDER BY created_at ASC' : '';
  const { results } = await env.DB.prepare(
    `SELECT * FROM ${ident(table)} WHERE owner_sub = ?${order}`,
  )
    .bind(space)
    .all();
  return json({ data: results ?? [] });
}

async function handleCreate(
  env: Env,
  caller: Caller,
  table: string,
  req: Request,
): Promise<Response> {
  const body = (await req.json()) as Record<string, unknown>;
  // owner_sub is always forced to the caller's own space; ignore any from body.
  delete body.owner_sub;
  const keys = Object.keys(body);
  if (keys.length === 0) return json({ error: 'Empty body' }, 400);

  const allKeys = [...keys, 'owner_sub'];
  const cols = allKeys.map(ident).join(', ');
  const placeholders = allKeys.map(() => '?').join(', ');
  const values = [...keys.map((k) => body[k] as unknown), caller.sub];

  await env.DB.prepare(`INSERT INTO ${ident(table)} (${cols}) VALUES (${placeholders})`)
    .bind(...values)
    .run();

  const row = await env.DB.prepare(`SELECT * FROM ${ident(table)} WHERE id = ?`)
    .bind(body.id)
    .first();
  return json({ data: row });
}

async function handleUpdate(
  env: Env,
  caller: Caller,
  table: string,
  id: string,
  req: Request,
): Promise<Response> {
  const existing = await env.DB.prepare(
    `SELECT owner_sub FROM ${ident(table)} WHERE id = ?`,
  )
    .bind(id)
    .first<{ owner_sub: string | null }>();
  if (!existing) return notFound();
  if (existing.owner_sub !== caller.sub) return forbidden();

  const body = (await req.json()) as Record<string, unknown>;
  // owner_sub is immutable from the client.
  delete body.owner_sub;
  const keys = Object.keys(body).filter((k) => k !== 'id');
  if (keys.length === 0) return json({ error: 'Empty patch' }, 400);

  const assignments = keys.map((k) => `${ident(k)} = ?`).join(', ');
  const values = keys.map((k) => body[k] as unknown);

  await env.DB.prepare(`UPDATE ${ident(table)} SET ${assignments} WHERE id = ?`)
    .bind(...values, id)
    .run();

  const row = await env.DB.prepare(`SELECT * FROM ${ident(table)} WHERE id = ?`)
    .bind(id)
    .first();
  return json({ data: row });
}

async function handleDelete(
  env: Env,
  caller: Caller,
  table: string,
  id: string,
): Promise<Response> {
  const existing = await env.DB.prepare(
    `SELECT owner_sub FROM ${ident(table)} WHERE id = ?`,
  )
    .bind(id)
    .first<{ owner_sub: string | null }>();
  if (!existing) return notFound();
  if (existing.owner_sub !== caller.sub) return forbidden();

  await env.DB.prepare(`DELETE FROM ${ident(table)} WHERE id = ?`).bind(id).run();
  return json({ ok: true });
}

// ─── Shares ─────────────────────────────────────────────────────────────────────

async function handleListShares(env: Env, caller: Caller): Promise<Response> {
  const { results } = await env.DB.prepare(
    'SELECT viewer_email, role FROM space_shares WHERE owner_sub = ? ORDER BY created_at ASC',
  )
    .bind(caller.sub)
    .all<{ viewer_email: string; role: string }>();
  return json({ data: results ?? [] });
}

async function handleAddShare(env: Env, caller: Caller, req: Request): Promise<Response> {
  const body = (await req.json()) as { email?: unknown };
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!email) return json({ error: 'Missing email' }, 400);

  await env.DB.prepare(
    `INSERT INTO space_shares (owner_sub, owner_email, viewer_email, role, created_at)
     VALUES (?, ?, ?, 'viewer', ?)
     ON CONFLICT(owner_sub, viewer_email) DO UPDATE SET
       owner_email = excluded.owner_email,
       role        = excluded.role`,
  )
    .bind(caller.sub, caller.email, email, new Date().toISOString())
    .run();
  return json({ ok: true });
}

async function handleRemoveShare(env: Env, caller: Caller, email: string): Promise<Response> {
  await env.DB.prepare('DELETE FROM space_shares WHERE owner_sub = ? AND viewer_email = ?')
    .bind(caller.sub, email.toLowerCase())
    .run();
  return json({ ok: true });
}

// ─── Dev seed (populate the caller's own space with a demo project) ─────────────

// Idempotent: inserts a generic demo project + children scoped to the caller's
// space, but only if a project named DEMO_PROJECT_NAME doesn't already exist.
const DEMO_PROJECT_NAME = 'Projeto Exemplo (Demo)';

async function handleSeed(env: Env, caller: Caller): Promise<Response> {
  if (!caller.sub) return json({ error: 'Unauthorized' }, 401);

  // Idempotency guard: don't duplicate the demo project.
  const existing = await env.DB.prepare(
    'SELECT id FROM projects WHERE owner_sub = ? AND name = ? LIMIT 1',
  )
    .bind(caller.sub, DEMO_PROJECT_NAME)
    .first<{ id: string }>();
  if (existing) return json({ ok: true, alreadySeeded: true });

  const sub = caller.sub;
  const now = new Date().toISOString();
  const projectId = crypto.randomUUID();

  // Relative dates so the demo always has a mix of past and future due dates.
  const day = (offset: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  };

  const statements: D1PreparedStatement[] = [];

  // ── Project ──
  statements.push(
    env.DB.prepare(
      `INSERT INTO projects (id, name, color, client, phase, date_range, archived, created_at, owner_sub)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`,
    ).bind(projectId, DEMO_PROJECT_NAME, '#3E77FC', 'Cliente Demo', 'Discovery', 'Jan 2026 – Jun 2026', now, sub),
  );

  // ── Risks (4 — varied probability/impact/status) ──
  const risks: Array<[string, string, string, string, string, string]> = [
    [
      'Escopo ainda não validado com o cliente',
      'Os requisitos da fase de Discovery não foram formalmente aprovados, o que pode gerar retrabalho.',
      'High', 'High', 'Open', 'Ana Souza',
    ],
    [
      'Dependência de API externa de terceiros',
      'A integração depende de um serviço externo cuja documentação está incompleta.',
      'Medium', 'High', 'Open', 'Bruno Lima',
    ],
    [
      'Disponibilidade parcial da equipe de design',
      'A designer está alocada parcialmente em outro projeto durante o próximo sprint.',
      'Medium', 'Medium', 'Mitigated', 'Carla Mendes',
    ],
    [
      'Curva de aprendizado da nova stack',
      'A equipe está adotando uma ferramenta nova; risco já endereçado com sessões de onboarding.',
      'Low', 'Low', 'Closed', 'Diego Alves',
    ],
  ];
  for (const [title, description, probability, impact, status, owner] of risks) {
    statements.push(
      env.DB.prepare(
        `INSERT INTO risks (id, project_id, title, description, probability, impact, status, owner, created_at, owner_sub)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(crypto.randomUUID(), projectId, title, description, probability, impact, status, owner, now, sub),
    );
  }

  // ── Action items (5 — varied priority/status/owner, past & future due dates) ──
  const actions: Array<[string, string, string, string, string]> = [
    ['Agendar workshop de kickoff com o cliente', 'Ana Souza', day(-5), 'High', 'Done'],
    ['Mapear jornada atual do usuário', 'Carla Mendes', day(-2), 'High', 'In Progress'],
    ['Levantar requisitos técnicos da integração', 'Bruno Lima', day(3), 'Medium', 'In Progress'],
    ['Definir critérios de sucesso do MVP', 'Diego Alves', day(7), 'Medium', 'To Do'],
    ['Preparar proposta de roadmap para a próxima fase', 'Ana Souza', day(14), 'Low', 'To Do'],
  ];
  for (const [title, owner, due, priority, status] of actions) {
    statements.push(
      env.DB.prepare(
        `INSERT INTO action_items (id, project_id, title, owner, due_date, priority, status, created_at, owner_sub)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(crypto.randomUUID(), projectId, title, owner, due, priority, status, now, sub),
    );
  }

  // ── Decisions (3) ──
  const decisions: Array<[string, string, string, string, string]> = [
    [
      'Adotar abordagem mobile-first',
      'A maioria dos usuários acessa pelo celular, segundo dados preliminares do cliente.',
      'O produto será projetado mobile-first, com adaptação progressiva para desktop.',
      'Considerou-se desktop-first e responsivo simétrico; descartados pelo perfil de uso.',
      'Ana Souza',
    ],
    [
      'Priorizar fluxo de onboarding no MVP',
      'A retenção inicial foi apontada como métrica crítica pelo cliente.',
      'O onboarding entra no escopo do MVP, antes de funcionalidades avançadas.',
      'Adiar onboarding para a v2; descartado por impacto direto na retenção.',
      'Carla Mendes',
    ],
    [
      'Usar autenticação via SSO da organização',
      'Os usuários já possuem contas corporativas e exigem login único.',
      'A autenticação será feita via SSO corporativo, sem cadastro próprio.',
      'Login próprio com e-mail/senha; descartado por atrito e segurança.',
      'Bruno Lima',
    ],
  ];
  for (const [title, context, decision, alternatives, author] of decisions) {
    statements.push(
      env.DB.prepare(
        `INSERT INTO decisions (id, project_id, title, context, decision, alternatives, author, created_at, owner_sub)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(crypto.randomUUID(), projectId, title, context, decision, alternatives, author, now, sub),
    );
  }

  // ── Stakeholders (4 — mix of influence/interest) ──
  const stakeholders: Array<[string, string, string, string, string, string]> = [
    ['Eduardo Ramos', 'Patrocinador (Sponsor)', 'Cliente Demo', 'High', 'High', 'Decisor final de orçamento; reuniões quinzenais.'],
    ['Fernanda Costa', 'Product Owner', 'Cliente Demo', 'High', 'High', 'Principal ponto de contato do dia a dia.'],
    ['Gustavo Pereira', 'Líder de TI', 'Cliente Demo', 'High', 'Low', 'Aprova integrações e questões de segurança.'],
    ['Helena Martins', 'Analista de Negócios', 'Cliente Demo', 'Low', 'High', 'Fornece contexto de processo; muito engajada.'],
  ];
  for (const [name, role, company, influence, interest, notes] of stakeholders) {
    statements.push(
      env.DB.prepare(
        `INSERT INTO stakeholders (id, project_id, name, role, company, influence, interest, notes, created_at, owner_sub)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(crypto.randomUUID(), projectId, name, role, company, influence, interest, notes, now, sub),
    );
  }

  // All inserts in a single batch (transactional in D1).
  await env.DB.batch(statements);

  return json({ ok: true, projectId });
}

// ─── User settings (unchanged; keyed by x-gizmos-sub) ───────────────────────────

async function handleGetSettings(env: Env, sub: string): Promise<Response> {
  const row = await env.DB.prepare('SELECT features FROM user_settings WHERE user_id = ?')
    .bind(sub)
    .first<{ features: string }>();
  let features: unknown = {};
  if (row?.features) {
    try {
      features = JSON.parse(row.features);
    } catch {
      features = {};
    }
  }
  return json({ features });
}

async function handlePutSettings(env: Env, sub: string, req: Request): Promise<Response> {
  const body = (await req.json()) as { features?: unknown };
  const features = JSON.stringify(body.features ?? {});
  await env.DB.prepare(
    `INSERT INTO user_settings (user_id, features) VALUES (?, ?)
     ON CONFLICT(user_id) DO UPDATE SET features = excluded.features`,
  )
    .bind(sub, features)
    .run();
  return json({ ok: true });
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;

    // Loader serves static assets for everything that isn't the API.
    if (!path.startsWith('/api/')) return notFound();

    try {
      const caller = getCaller(req);

      // ─── identity / spaces ──────────────────────────────────────────────
      if (path === '/api/me') {
        if (req.method === 'GET') return handleMe(caller);
        return json({ error: 'Method not allowed' }, 405);
      }

      if (path === '/api/spaces') {
        if (req.method === 'GET') return await handleSpaces(env, caller);
        return json({ error: 'Method not allowed' }, 405);
      }

      // ─── dev seed (must be handled before generic resource routing) ─────
      if (path === '/api/dev/seed') {
        if (req.method === 'POST') return await handleSeed(env, caller);
        return json({ error: 'Method not allowed' }, 405);
      }

      // ─── user_settings ────────────────────────────────────────────────
      if (path === '/api/user_settings') {
        if (req.method === 'GET') return await handleGetSettings(env, caller.sub);
        if (req.method === 'PUT') return await handlePutSettings(env, caller.sub, req);
        return json({ error: 'Method not allowed' }, 405);
      }

      // /api/{seg}        -> ['', 'api', seg]
      // /api/{seg}/{id}   -> ['', 'api', seg, id]
      const parts = path.split('/').filter(Boolean); // drops leading ''
      // parts[0] === 'api'
      const seg = parts[1];
      const id = parts[2] ? decodeURIComponent(parts[2]) : undefined;

      // ─── shares ───────────────────────────────────────────────────────
      if (seg === 'shares') {
        if (!id) {
          if (req.method === 'GET') return await handleListShares(env, caller);
          if (req.method === 'POST') return await handleAddShare(env, caller, req);
          return json({ error: 'Method not allowed' }, 405);
        }
        if (req.method === 'DELETE') return await handleRemoveShare(env, caller, id);
        return json({ error: 'Method not allowed' }, 405);
      }

      // ─── CRUD resources ───────────────────────────────────────────────
      const table = seg ? RESOURCES[seg] : undefined;
      if (!table) return notFound();

      if (!id) {
        if (req.method === 'GET') return await handleList(env, caller, table, url);
        if (req.method === 'POST') return await handleCreate(env, caller, table, req);
        return json({ error: 'Method not allowed' }, 405);
      } else {
        if (req.method === 'PATCH') return await handleUpdate(env, caller, table, id, req);
        if (req.method === 'DELETE') return await handleDelete(env, caller, table, id);
        return json({ error: 'Method not allowed' }, 405);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return json({ error: message }, 500);
    }
  },
};
