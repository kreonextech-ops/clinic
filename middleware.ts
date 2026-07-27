import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/patients/:path*',
    '/appointments/:path*',
    '/visits/:path*',
    '/follow-ups/:path*',
    '/inventory/:path*',
    '/reports/:path*',
    '/settings/:path*',
  ],
};
