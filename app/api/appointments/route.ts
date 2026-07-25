export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { db } from '@/lib/db';
import { appointments, patients } from '@/lib/db/schema';
import { eq, desc, and, gte, lte, ilike } from 'drizzle-orm';
import { appointmentSchema } from '@/lib/validations/appointment';

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
  const date = searchParams.get('date');
  const status = searchParams.get('status');
  const patientId = searchParams.get('patientId');

  const where: any[] = [];
  if (date) where.push(eq(appointments.scheduledDate, date));
  if (status) where.push(eq(appointments.status, status as any));
  if (patientId) where.push(eq(appointments.patientId, parseInt(patientId)));

  const list = await db.query.appointments.findMany({
    where: where.length > 0 ? and(...where) : undefined,
    with: { patient: true },
    orderBy: [desc(appointments.scheduledDate)],
    limit: 200,
  });

  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
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

  const body = await req.json();
  const parsed = appointmentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const [apt] = await db.insert(appointments).values(parsed.data).returning();
  return NextResponse.json(apt, { status: 201 });
}
