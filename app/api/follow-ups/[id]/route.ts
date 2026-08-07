export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { db } from '@/lib/db';
import { followUps, patients } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { status, notes } = await req.json();

  const [updated] = await db
    .update(followUps)
    .set({
      status,
      notes: notes ?? null,
      completedAt: status === 'completed' ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(and(
      eq(followUps.id, parseInt(params.id)),
      inArray(followUps.patientId, db.select({ id: patients.id }).from(patients).where(eq(patients.userId, session.user.userId)))
    ))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await db.delete(followUps).where(and(
    eq(followUps.id, parseInt(params.id)),
    inArray(followUps.patientId, db.select({ id: patients.id }).from(patients).where(eq(patients.userId, session.user.userId)))
  ));
  return NextResponse.json({ ok: true });
}
