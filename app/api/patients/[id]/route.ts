import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { db } from '@/lib/db';
import { patients } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { patientSchema } from '@/lib/validations/patient';

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

  const [patient] = await db.select().from(patients).where(eq(patients.id, parseInt(params.id))).limit(1);
  if (!patient) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(patient);
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
  const parsed = patientSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const [updated] = await db
    .update(patients)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(patients.id, parseInt(params.id)))
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

  await db.delete(patients).where(eq(patients.id, parseInt(params.id)));
  return NextResponse.json({ ok: true });
}
