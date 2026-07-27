export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { earningsReportHtml, pendingPaymentsReportHtml } from '@/lib/pdf/templates/reportPdf';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const months = parseInt(searchParams.get('months') || '12');
  const clinicName = process.env.CLINIC_NAME || 'Dental Clinic';

  let html = '';

  if (type === 'earnings') {
    const res = await fetch(
      `${process.env.NEXTAUTH_URL}/api/reports/earnings?months=${months}`,
      { headers: { cookie: req.headers.get('cookie') || '' } }
    );
    const data = await res.json();
    html = earningsReportHtml(clinicName, data, months);
  } else if (type === 'pending-payments') {
    const res = await fetch(
      `${process.env.NEXTAUTH_URL}/api/reports/pending-payments`,
      { headers: { cookie: req.headers.get('cookie') || '' } }
    );
    const data = await res.json();
    html = pendingPaymentsReportHtml(clinicName, data);
  } else {
    return new NextResponse('Invalid report type', { status: 400 });
  }

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
