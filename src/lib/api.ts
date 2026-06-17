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

/** GET /api/{resource} -> Row[] (the `data` array). */
export async function apiList<T>(resource: Resource): Promise<T[]> {
  const { data } = await request<{ data: T[] }>(`/api/${resource}`);
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
