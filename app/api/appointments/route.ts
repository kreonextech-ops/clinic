export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { db } from '@/lib/db';
import { appointments, patients } from '@/lib/db/schema';
import { eq, desc, and, gte, lte, ilike } from 'drizzle-orm';
import { appointmentSchema } from '@/lib/validations/appointment';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const status = searchParams.get('status');
  const patientId = searchParams.get('patientId');

  const where: any[] = [eq(appointments.userId, session.user.userId)];
  if (date) where.push(eq(appointments.scheduledDate, date));
  if (status) where.push(eq(appointments.status, status as any));
  if (patientId) where.push(eq(appointments.patientId, parseInt(patientId)));

  try {
    const list = await db.query.appointments.findMany({
      where: where.length > 0 ? and(...where) : undefined,
      with: { patient: true },
      orderBy: [desc(appointments.scheduledDate)],
      limit: 200,
    });

    return NextResponse.json(list);
  } catch (err) {
    console.error('API /api/appointments GET error:', err);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = appointmentSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const [apt] = await db.insert(appointments).values({ ...parsed.data, userId: session.user.userId }).returning();
    return NextResponse.json(apt, { status: 201 });
  } catch (err: any) {
    console.error('API /api/appointments POST error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to create appointment' }, { status: 500 });
  }
}
