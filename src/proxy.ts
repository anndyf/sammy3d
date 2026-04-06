import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas sempre públicas — sem autenticação necessária
  const isPublicRoute =
    pathname.startsWith('/store') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/quote-requests') ||
    pathname === '/calculator' ||
    pathname === '/login';

  const authToken = request.cookies.get('sammy_session')?.value;

  // 1. Rota protegida sem sessão → vai para login
  if (!isPublicRoute && !authToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Já está logado e tenta acessar /login → vai para o catálogo (dashboard)
  if (pathname === '/login' && authToken) {
    return NextResponse.redirect(new URL('/catalog', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|logo.png|box-dimensions.png).*)',
  ],
};
