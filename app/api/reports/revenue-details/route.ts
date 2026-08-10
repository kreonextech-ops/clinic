import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { hasPermission } from '@/lib/auth/permissions';
import { db } from '@/lib/db';
import { earnings, patients, visits } from '@/lib/db/schema';
import { eq, and, sql, gte, lt, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'can_view_reports')) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month'); // YYYY-MM or 'all'

  let conditions = [eq(patients.userId, session.user.userId)];

  if (month && month !== 'all') {
    const startDate = `${month}-01`;
    // calculate next month's start date for the upper bound
    const dateObj = new Date(startDate);
    dateObj.setMonth(dateObj.getMonth() + 1);
    const endDate = dateObj.toISOString().slice(0, 10);
    
    conditions.push(gte(visits.visitDate, startDate));
    conditions.push(lt(visits.visitDate, endDate));
  }

  try {
    const rows = await db
      .select({
        visitId: visits.id,
        visitDate: visits.visitDate,
        patientId: patients.id,
        patientName: patients.name,
        patientPhone: patients.phone,
        consultationFee: earnings.consultationFee,
        procedureFeeTotal: earnings.procedureFeeTotal,
        medicineCharge: earnings.medicineCharge,
        totalAmount: earnings.totalAmount,
      })
      .from(visits)
      .innerJoin(patients, eq(patients.id, visits.patientId))
      .leftJoin(earnings, eq(earnings.visitId, visits.id))
      .where(and(...conditions))
      .orderBy(desc(visits.visitDate));

    return NextResponse.json(rows);
  } catch (err) {
    console.error('API /api/reports/revenue-details GET error:', err);
    return NextResponse.json([]);
  }
}
