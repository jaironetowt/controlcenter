import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/_next', '/api', '/favicon.ico'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Supabase JS v2 stores session in localStorage (not HTTP cookies).
  // Client-side auth guard is handled by StoreInitializer + individual pages.
  // Full cookie-based SSR auth requires @supabase/ssr — deferred to CC-85.
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
