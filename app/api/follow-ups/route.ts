export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { db } from '@/lib/db';
import { followUps, patients } from '@/lib/db/schema';
import { eq, and, lt, desc, inArray } from 'drizzle-orm';
import { todayISO } from '@/lib/utils/formatDate';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  try {
    // Auto-mark overdue follow-ups
    const today = todayISO();
    await db
      .update(followUps)
      .set({ status: 'overdue', updatedAt: new Date() })
      .where(and(
        eq(followUps.status, 'pending'),
        lt(followUps.dueDate, today),
        inArray(followUps.patientId, db.select({ id: patients.id }).from(patients).where(eq(patients.userId, session.user.userId)))
      ));

    const where = and(
      status ? eq(followUps.status, status as any) : undefined,
      inArray(followUps.patientId, db.select({ id: patients.id }).from(patients).where(eq(patients.userId, session.user.userId)))
    );

    const list = await db.query.followUps.findMany({
      where,
      with: { patient: true },
      orderBy: [desc(followUps.dueDate)],
      limit: 200,
    });

    return NextResponse.json(list);
  } catch (err) {
    console.error('API /api/follow-ups GET error:', err);
    return NextResponse.json([]);
  }
}
