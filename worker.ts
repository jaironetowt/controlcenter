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
