import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'super-secret-fallback-key-change-in-production';
const key = new TextEncoder().encode(secretKey);

export async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  // Protected routes prefixes
  const isUserRoute = pathname.startsWith('/user') || pathname.startsWith('/learn') || pathname.startsWith('/checkout');
  const isAdminRoute = pathname.startsWith('/admin');
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');

  let session: any = null;

  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie, key, { algorithms: ['HS256'] });
      session = payload;
    } catch (err) {
      session = null;
    }
  }

  // If trying to access protected route without valid session
  if (!session && (isUserRoute || isAdminRoute)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If admin route but not admin
  if (session && isAdminRoute && session.role !== 'admin' && session.role !== 'super_admin') {
    const url = request.nextUrl.clone();
    url.pathname = '/user/dashboard';
    return NextResponse.redirect(url);
  }

  // If logged in and trying to access login/register
  if (session && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = session.role === 'super_admin' || session.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
    return NextResponse.redirect(url);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    }
  });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
};
