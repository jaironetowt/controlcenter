export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove accents
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export function projectPath(projectName: string, suffix = ''): string {
  return `/projects/${slugify(projectName)}${suffix}`;
}

export function projectSlugPath(slug: string, suffix = ''): string {
  return `/projects/${slug}${suffix}`;
}

export function buildSlugMap(
  projects: Array<{ id: string; name: string; createdAt: number }>,
): Record<string, string> {
  const sorted = [...projects].sort((a, b) => a.createdAt - b.createdAt);
  const counts = new Map<string, number>();
  const result: Record<string, string> = {};
  for (const p of sorted) {
    const base = slugify(p.name);
    const n = counts.get(base) ?? 0;
    counts.set(base, n + 1);
    result[p.id] = n === 0 ? base : `${base}-${n + 1}`;
  }
  return result;
}
