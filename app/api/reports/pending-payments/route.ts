export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { hasPermission } from '@/lib/auth/permissions';
import { db } from '@/lib/db';
import { earnings, patients, visits } from '@/lib/db/schema';
import { eq, and, gte, lt, lte } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'can_view_reports')) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month'); // YYYY-MM or 'all'
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  let conditions = [
    eq(earnings.paymentStatus, 'pending'), 
    eq(patients.userId, session.user.userId)
  ];

  if (from && to) {
    conditions.push(gte(visits.visitDate, from));
    conditions.push(lte(visits.visitDate, to));
  } else if (month && month !== 'all') {
    const startDate = `${month}-01`;
    const dateObj = new Date(startDate);
    dateObj.setMonth(dateObj.getMonth() + 1);
    const endDate = dateObj.toISOString().slice(0, 10);
    
    conditions.push(gte(visits.visitDate, startDate));
    conditions.push(lt(visits.visitDate, endDate));
  }

  try {
    const rows = await db
      .select({
        visitId: earnings.visitId,
        patientId: patients.id,
        patientName: patients.name,
        patientPhone: patients.phone,
        visitDate: visits.visitDate,
        totalAmount: earnings.totalAmount,
        procedureFeeBalance: earnings.procedureFeeBalance,
      })
      .from(earnings)
      .innerJoin(patients, eq(patients.id, earnings.patientId))
      .innerJoin(visits, eq(visits.id, earnings.visitId))
      .where(and(...conditions))
      .orderBy(visits.visitDate);

    return NextResponse.json(rows);
  } catch (err) {
    console.error('API /api/reports/pending-payments GET error:', err);
    return NextResponse.json([]);
  }
}
