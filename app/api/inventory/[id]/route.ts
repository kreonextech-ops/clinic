export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { db } from '@/lib/db';
import { inventory } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { inventoryUpdateSchema } from '@/lib/validations/inventory';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = inventoryUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updateData: Record<string, any> = { updatedAt: new Date() };
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.quantity !== undefined) updateData.quantity = String(parsed.data.quantity);
  if (parsed.data.unit !== undefined) updateData.unit = parsed.data.unit;
  if (parsed.data.lowStockThreshold !== undefined) updateData.lowStockThreshold = String(parsed.data.lowStockThreshold);
  if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;

  const [updated] = await db.update(inventory).set(updateData).where(and(eq(inventory.id, parseInt(params.id)), eq(inventory.userId, session.user.userId))).returning();
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await db.delete(inventory).where(and(eq(inventory.id, parseInt(params.id)), eq(inventory.userId, session.user.userId)));
  return NextResponse.json({ ok: true });
}
