import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SECRET =
  process.env.NEXTAUTH_SECRET ||
  'c4a37ee3fbac7b5a2fd29053fe4364f6fb31fff7615fa32b665ff2425480b89dfea41fed5036b21b';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: SECRET });
  const { pathname } = req.nextUrl;

  const protectedRoutes = [
    '/dashboard',
    '/patients',
    '/appointments',
    '/visits',
    '/follow-ups',
    '/inventory',
    '/reports',
    '/settings',
  ];

  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  if (isProtected && !token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/patients',
    '/patients/:path*',
    '/appointments',
    '/appointments/:path*',
    '/visits',
    '/visits/:path*',
    '/follow-ups',
    '/follow-ups/:path*',
    '/inventory',
    '/inventory/:path*',
    '/reports',
    '/reports/:path*',
    '/settings',
    '/settings/:path*',
  ],
};
