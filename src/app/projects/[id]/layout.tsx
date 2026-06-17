// ─── Server segment layout for /projects/[id] ───────────────────────────────
// Under output:'export', dynamic route segments require generateStaticParams.
// We prerender a single placeholder shell ('_'); the real project id is read at
// runtime by the client pages via useParams()/usePathname(). dynamicParams must
// be false under output:'export'; deep-link/refresh to arbitrary ids relies on
// the gizmos loader SPA-fallback, while in-app navigation works client-side.

export function generateStaticParams() {
  return [{ id: '_' }];
}

export const dynamicParams = false;

export default function ProjectIdLayout({ children }: { children: React.ReactNode }) {
  return children;
}
