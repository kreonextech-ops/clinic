import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { hasPermission } from '@/lib/auth/permissions';
import { db } from '@/lib/db';
import { earnings, patients, visits } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'can_view_reports')) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

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
    .where(eq(earnings.paymentStatus, 'pending'))
    .orderBy(visits.visitDate);

  return NextResponse.json(rows);
}
