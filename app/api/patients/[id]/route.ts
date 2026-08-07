export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { db } from '@/lib/db';
import { patients } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { patientSchema } from '@/lib/validations/patient';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [patient] = await db.select().from(patients).where(and(eq(patients.id, parseInt(params.id)), eq(patients.userId, session.user.userId))).limit(1);
  if (!patient) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(patient);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = patientSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const [updated] = await db
    .update(patients)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(patients.id, parseInt(params.id)), eq(patients.userId, session.user.userId)))
    .returning();

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await db.delete(patients).where(and(eq(patients.id, parseInt(params.id)), eq(patients.userId, session.user.userId)));
  return NextResponse.json({ ok: true });
}
