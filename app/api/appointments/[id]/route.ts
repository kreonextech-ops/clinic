export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { db } from '@/lib/db';
import { appointments } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { appointmentUpdateSchema } from '@/lib/validations/appointment';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const apt = await db.query.appointments.findFirst({
    where: and(eq(appointments.id, parseInt(params.id)), eq(appointments.userId, (session.user as any).userId)),
    with: { patient: true },
  });
  if (!apt) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(apt);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = appointmentUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const [updated] = await db
    .update(appointments)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(appointments.id, parseInt(params.id)), eq(appointments.userId, (session.user as any).userId)))
    .returning();

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await db.delete(appointments).where(and(eq(appointments.id, parseInt(params.id)), eq(appointments.userId, (session.user as any).userId)));
  return NextResponse.json({ ok: true });
}
