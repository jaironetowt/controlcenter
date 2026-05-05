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
