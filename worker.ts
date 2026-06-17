/**
 * Control Center — Cloudflare Worker API (Gizmos platform, D1 backend).
 *
 * Same-origin REST API under /api/*. The gizmos loader serves the static
 * Next.js export for all other paths, and guarantees SSO before requests
 * reach this worker (identity arrives via x-gizmos-* headers).
 *
 * Contract:
 *   CRUD resources (projects | risks | action_items | decisions | stakeholders)
 *     GET    /api/{resource}        -> { data: Row[] }
 *     POST   /api/{resource}        -> { data: Row }   (body = full Row, snake_case)
 *     PATCH  /api/{resource}/{id}   -> { data: Row }   (body = Partial<Row>, snake_case)
 *     DELETE /api/{resource}/{id}   -> { ok: true }
 *   Settings:
 *     GET /api/user_settings        -> { features: object }
 *     PUT /api/user_settings        -> { ok: true }    (body = { features: object })
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

// Quote a SQLite identifier (column name) safely. Keys come from object
// keys of the request body — we still quote and reject anything with a
// double-quote to be defensive.
function ident(name: string): string {
  if (name.includes('"')) throw new Error(`Invalid column name: ${name}`);
  return `"${name}"`;
}

async function handleList(env: Env, table: string): Promise<Response> {
  const order = table === 'projects' ? ' ORDER BY created_at ASC' : '';
  const { results } = await env.DB.prepare(`SELECT * FROM ${ident(table)}${order}`).all();
  return json({ data: results ?? [] });
}

async function handleCreate(env: Env, table: string, req: Request): Promise<Response> {
  const body = (await req.json()) as Record<string, unknown>;
  const keys = Object.keys(body);
  if (keys.length === 0) return json({ error: 'Empty body' }, 400);

  const cols = keys.map(ident).join(', ');
  const placeholders = keys.map(() => '?').join(', ');
  const values = keys.map((k) => body[k] as unknown);

  await env.DB.prepare(`INSERT INTO ${ident(table)} (${cols}) VALUES (${placeholders})`)
    .bind(...values)
    .run();

  const row = await env.DB.prepare(`SELECT * FROM ${ident(table)} WHERE id = ?`)
    .bind(body.id)
    .first();
  return json({ data: row });
}

async function handleUpdate(env: Env, table: string, id: string, req: Request): Promise<Response> {
  const body = (await req.json()) as Record<string, unknown>;
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

async function handleDelete(env: Env, table: string, id: string): Promise<Response> {
  await env.DB.prepare(`DELETE FROM ${ident(table)} WHERE id = ?`).bind(id).run();
  return json({ ok: true });
}

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
      // ─── user_settings ────────────────────────────────────────────────
      if (path === '/api/user_settings') {
        const sub = req.headers.get('x-gizmos-sub') ?? '';
        if (req.method === 'GET') return await handleGetSettings(env, sub);
        if (req.method === 'PUT') return await handlePutSettings(env, sub, req);
        return json({ error: 'Method not allowed' }, 405);
      }

      // ─── CRUD resources ───────────────────────────────────────────────
      // /api/{resource}        -> ['', 'api', resource]
      // /api/{resource}/{id}   -> ['', 'api', resource, id]
      const parts = path.split('/').filter(Boolean); // drops leading ''
      // parts[0] === 'api'
      const resource = parts[1];
      const id = parts[2] ? decodeURIComponent(parts[2]) : undefined;

      const table = resource ? RESOURCES[resource] : undefined;
      if (!table) return notFound();

      if (!id) {
        if (req.method === 'GET') return await handleList(env, table);
        if (req.method === 'POST') return await handleCreate(env, table, req);
        return json({ error: 'Method not allowed' }, 405);
      } else {
        if (req.method === 'PATCH') return await handleUpdate(env, table, id, req);
        if (req.method === 'DELETE') return await handleDelete(env, table, id);
        return json({ error: 'Method not allowed' }, 405);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return json({ error: message }, 500);
    }
  },
};
