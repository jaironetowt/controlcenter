// ─── API client for the same-origin worker (/api/*) ────────────────────────────
// All rows travel in snake_case exactly as the D1 table columns. The worker
// runs behind the gizmos loader (SSO already enforced), so no auth wiring here.

type Resource =
  | 'projects'
  | 'risks'
  | 'action_items'
  | 'decisions'
  | 'stakeholders';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    let detail = '';
    try {
      const body = (await res.json()) as { error?: string };
      detail = body?.error ? `: ${body.error}` : '';
    } catch {
      /* ignore non-JSON error bodies */
    }
    throw new Error(`API ${init?.method ?? 'GET'} ${path} failed (${res.status})${detail}`);
  }
  return (await res.json()) as T;
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/{resource}?space=<space> -> Row[] (the `data` array).
 * When `space` (an owner_sub) is passed it scopes the read to that space;
 * the worker defaults to the caller's own space when it is omitted.
 */
export async function apiList<T>(resource: Resource, space?: string): Promise<T[]> {
  const qs = space ? `?space=${encodeURIComponent(space)}` : '';
  const { data } = await request<{ data: T[] }>(`/api/${resource}${qs}`);
  return data;
}

/** POST /api/{resource} (body = full Row, snake_case) -> inserted Row. */
export async function apiCreate<T>(resource: Resource, row: T): Promise<T> {
  const { data } = await request<{ data: T }>(`/api/${resource}`, {
    method: 'POST',
    body: JSON.stringify(row),
  });
  return data;
}

/** PATCH /api/{resource}/{id} (body = Partial<Row>, snake_case) -> updated Row. */
export async function apiUpdate<T>(
  resource: Resource,
  id: string,
  patch: Partial<T>,
): Promise<T> {
  const { data } = await request<{ data: T }>(`/api/${resource}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  return data;
}

/** DELETE /api/{resource}/{id} -> void. */
export async function apiDelete(resource: Resource, id: string): Promise<void> {
  await request<{ ok: true }>(`/api/${resource}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

// ─── Identity / spaces ────────────────────────────────────────────────────────

export interface Me {
  sub: string;
  email: string;
}

export interface SpaceRow {
  owner_sub: string;
  owner_email: string;
  role: 'owner' | 'viewer';
}

export interface ShareRow {
  viewer_email: string;
  role: string;
}

/** GET /api/me -> { sub, email } (email lowercased by the worker). */
export async function getMe(): Promise<Me> {
  return request<Me>('/api/me');
}

/**
 * GET /api/spaces -> { me, spaces }.
 * `spaces` always includes the caller's own space (role 'owner') plus every
 * space they were invited to as a viewer.
 */
export async function getSpaces(): Promise<{ me: Me; spaces: SpaceRow[] }> {
  return request<{ me: Me; spaces: SpaceRow[] }>('/api/spaces');
}

// ─── Shares (viewers of the caller's own space) ────────────────────────────────

/** GET /api/shares -> ShareRow[] (the `data` array). */
export async function getShares(): Promise<ShareRow[]> {
  const { data } = await request<{ data: ShareRow[] }>('/api/shares');
  return data;
}

/** POST /api/shares { email } -> invites a viewer to the caller's space (upsert). */
export async function addShare(email: string): Promise<void> {
  await request<{ ok: true }>('/api/shares', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/** DELETE /api/shares/{email} -> removes a viewer from the caller's space. */
export async function removeShare(email: string): Promise<void> {
  await request<{ ok: true }>(`/api/shares/${encodeURIComponent(email)}`, {
    method: 'DELETE',
  });
}

// ─── Dev seed ─────────────────────────────────────────────────────────────────

/**
 * POST /api/dev/seed -> populates the caller's own space with a generic demo
 * project (idempotent). Returns { ok, projectId? } on a fresh seed, or
 * { ok, alreadySeeded: true } when the demo project already exists.
 */
export async function seedDemo(): Promise<{
  ok: boolean;
  projectId?: string;
  alreadySeeded?: boolean;
}> {
  return request<{ ok: boolean; projectId?: string; alreadySeeded?: boolean }>(
    '/api/dev/seed',
    { method: 'POST' },
  );
}

// ─── User settings ──────────────────────────────────────────────────────────────

/** GET /api/user_settings -> features object. */
export async function getUserSettings(): Promise<Record<string, boolean>> {
  const { features } = await request<{ features: Record<string, boolean> }>(
    '/api/user_settings',
  );
  return features ?? {};
}

/** PUT /api/user_settings (body = { features }). */
export async function putUserSettings(features: Record<string, boolean>): Promise<void> {
  await request<{ ok: true }>('/api/user_settings', {
    method: 'PUT',
    body: JSON.stringify({ features }),
  });
}
