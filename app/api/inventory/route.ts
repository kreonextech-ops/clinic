export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { db } from '@/lib/db';
import { inventory } from '@/lib/db/schema';
import { asc, sql, eq } from 'drizzle-orm';
import { inventorySchema } from '@/lib/validations/inventory';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const lowStock = searchParams.get('lowStock');

  try {
    let list = await db.select().from(inventory).where(eq(inventory.userId, session.user.userId)).orderBy(asc(inventory.name));

    if (lowStock === '1') {
      list = list.filter((i: any) => parseFloat(i.quantity) <= parseFloat(i.lowStockThreshold));
    }

    return NextResponse.json(
      list.map((i: any) => ({ ...i, isLowStock: parseFloat(i.quantity) <= parseFloat(i.lowStockThreshold) }))
    );
  } catch (err) {
    console.error('API /api/inventory GET error:', err);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = inventorySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const [item] = await db.insert(inventory).values({
      ...parsed.data,
      quantity: String(parsed.data.quantity),
      lowStockThreshold: String(parsed.data.lowStockThreshold),
      userId: session.user.userId,
    }).returning();

    return NextResponse.json(item, { status: 201 });
  } catch (err: any) {
    console.error('API /api/inventory POST error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to create inventory item' }, { status: 500 });
  }
}
