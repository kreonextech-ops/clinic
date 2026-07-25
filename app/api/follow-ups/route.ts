export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { db } from '@/lib/db';
import { followUps } from '@/lib/db/schema';
import { eq, and, lt, desc } from 'drizzle-orm';
import { todayISO } from '@/lib/utils/formatDate';

export async function GET(req: NextRequest) {
  const session = {
    user: {
      id: 'owner-1',
      role: 'owner',
      name: 'Dr. Doctor',
      email: 'doctor@example.com',
      clinicName: 'Dental Clinic',
      doctorName: 'Dr. Doctor',
    }
  };
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  // Auto-mark overdue follow-ups
  const today = todayISO();
  await db
    .update(followUps)
    .set({ status: 'overdue', updatedAt: new Date() })
    .where(and(eq(followUps.status, 'pending'), lt(followUps.dueDate, today)));

  const where = status ? eq(followUps.status, status as any) : undefined;

  const list = await db.query.followUps.findMany({
    where,
    with: { patient: true },
    orderBy: [desc(followUps.dueDate)],
    limit: 200,
  });

  return NextResponse.json(list);
}
