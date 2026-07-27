import { withAuth } from 'next-auth/middleware';

export default withAuth({
  secret:
    process.env.NEXTAUTH_SECRET ||
    'c4a37ee3fbac7b5a2fd29053fe4364f6fb31fff7615fa32b665ff2425480b89dfea41fed5036b21b',
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
