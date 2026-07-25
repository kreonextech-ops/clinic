export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { db } from '@/lib/db';
import { appointments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { appointmentUpdateSchema } from '@/lib/validations/appointment';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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

  const apt = await db.query.appointments.findFirst({
    where: eq(appointments.id, parseInt(params.id)),
    with: { patient: true },
  });
  if (!apt) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(apt);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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
  const parsed = appointmentUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const [updated] = await db
    .update(appointments)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(appointments.id, parseInt(params.id)))
    .returning();

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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

  await db.delete(appointments).where(eq(appointments.id, parseInt(params.id)));
  return NextResponse.json({ ok: true });
}
