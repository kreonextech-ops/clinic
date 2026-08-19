import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { hasPermission } from '@/lib/auth/permissions';
import { db } from '@/lib/db';
import { payments, patients, visits, earnings } from '@/lib/db/schema';
import { eq, and, gte, lt, desc, lte } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

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

  let conditions = [eq(patients.userId, session.user.userId)];

  if (from && to) {
    conditions.push(gte(payments.paymentDate, from));
    conditions.push(lte(payments.paymentDate, to));
  } else if (month && month !== 'all') {
    const startDate = `${month}-01`;
    const dateObj = new Date(startDate);
    dateObj.setMonth(dateObj.getMonth() + 1);
    const endDate = dateObj.toISOString().slice(0, 10);
    
    conditions.push(gte(payments.paymentDate, startDate));
    conditions.push(lt(payments.paymentDate, endDate));
  }

  try {
    const rows = await db
      .select({
        paymentId: payments.id,
        amount: payments.amount,
        paymentDate: payments.paymentDate,
        paymentMethod: payments.paymentMethod,
        notes: payments.notes,
        visitId: visits.id,
        visitDate: visits.visitDate,
        patientId: patients.id,
        patientName: patients.name,
        consultationFee: earnings.consultationFee,
      })
      .from(payments)
      .innerJoin(visits, eq(visits.id, payments.visitId))
      .innerJoin(patients, eq(patients.id, visits.patientId))
      .leftJoin(earnings, eq(earnings.visitId, visits.id))
      .where(and(...conditions))
      .orderBy(desc(payments.paymentDate), desc(payments.id));

    return NextResponse.json(rows);
  } catch (err) {
    console.error('API /api/reports/settled-details GET error:', err);
    return NextResponse.json([]);
  }
}
