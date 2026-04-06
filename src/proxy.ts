import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes (Store, Login API, and the Login page itself)
  const isPublicRoute = 
    pathname.startsWith('/store') || 
    pathname.startsWith('/api/auth') || 
    pathname === '/login';

  const authToken = request.cookies.get('sammy_session')?.value;

  // Protect all (admin) routes (everything not in /store or /login)
  if (!isPublicRoute && !authToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to dashboard if logged in and trying to access /login
  if (pathname === '/login' && authToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo.png (logo)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo.png|box-dimensions.png).*)',
  ],
};
