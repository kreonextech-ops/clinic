import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// Routes that require specific permissions
const FINANCE_ROUTES = ['/reports/earnings', '/reports/pending-payments', '/reports/treatments', '/reports/inventory-reorder', '/reports'];
const REPORT_ROUTES = ['/reports'];

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token as any;

    if (!token) return NextResponse.redirect(new URL('/login', req.url));

    const role = token.role as string;
    const permissions = token.permissions as Record<string, boolean> || {};

    const isOwner = role === 'owner';

    // Helper
    const has = (key: string) => isOwner || permissions[key] === true;

    // Block reports for non-owners without permission
    if (pathname.startsWith('/reports') && !has('can_view_reports')) {
      return NextResponse.redirect(new URL('/dashboard?blocked=reports', req.url));
    }

    // Block inventory management
    if (pathname.startsWith('/inventory') && !has('can_manage_inventory')) {
      return NextResponse.redirect(new URL('/dashboard?blocked=inventory', req.url));
    }

    // Block visit recording/editing
    if ((pathname.startsWith('/visits') || pathname.includes('/visits/new')) && !has('can_view_visits')) {
      return NextResponse.redirect(new URL('/dashboard?blocked=visits', req.url));
    }

    // Block patient management
    if (pathname.startsWith('/patients') && !has('can_view_patients')) {
      return NextResponse.redirect(new URL('/dashboard?blocked=patients', req.url));
    }

    // Block follow-ups
    if (pathname.startsWith('/follow-ups') && !has('can_view_follow_ups')) {
      return NextResponse.redirect(new URL('/dashboard?blocked=follow-ups', req.url));
    }

    // Staff management — owner only
    if (pathname.startsWith('/settings/staff') && !isOwner) {
      return NextResponse.redirect(new URL('/dashboard?blocked=staff', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/patients/:path*',
    '/appointments/:path*',
    '/visits/:path*',
    '/inventory/:path*',
    '/follow-ups/:path*',
    '/reports/:path*',
    '/settings/:path*',
  ],
};
