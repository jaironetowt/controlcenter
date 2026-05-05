import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/_next', '/api', '/favicon.ico'];

/**
 * Middleware de autenticação.
 *
 * O Supabase JS v2 armazena a sessão em cookies com o padrão:
 *   sb-<project-ref>-auth-token     (JSON do token)
 *   sb-<project-ref>-auth-token.0   (chunk 0 quando o token é grande)
 *
 * A presença de qualquer cookie com prefixo "sb-" e sufixo "auth-token"
 * é suficiente para indicar que o usuário pode estar autenticado.
 * A validação definitiva fica no servidor/componentes — aqui só bloqueamos
 * usuários claramente sem sessão para evitar flicker na UI.
 *
 * Nota: Para validação server-side completa, instalar @supabase/ssr e usar
 * createServerClient. Por ora, a proteção é suficiente para single-user.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Deixar passar rotas públicas e assets
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Verificar presença de cookie de sessão do Supabase
  const cookies = request.cookies.getAll();
  const hasAuthCookie = cookies.some(
    (c) => c.name.startsWith('sb-') && c.name.includes('auth-token'),
  );

  if (!hasAuthCookie) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('next', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Aplicar o middleware a todas as rotas exceto arquivos estáticos e
     * a própria página de login (já coberta por PUBLIC_PATHS).
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
