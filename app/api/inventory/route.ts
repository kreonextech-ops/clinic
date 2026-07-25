export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { db } from '@/lib/db';
import { inventory } from '@/lib/db/schema';
import { asc, sql } from 'drizzle-orm';
import { inventorySchema } from '@/lib/validations/inventory';

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
  const lowStock = searchParams.get('lowStock');

  let list = await db.select().from(inventory).orderBy(asc(inventory.name));

  if (lowStock === '1') {
    list = list.filter((i) => parseFloat(i.quantity) <= parseFloat(i.lowStockThreshold));
  }

  return NextResponse.json(
    list.map((i) => ({ ...i, isLowStock: parseFloat(i.quantity) <= parseFloat(i.lowStockThreshold) }))
  );
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
  const parsed = inventorySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const [item] = await db.insert(inventory).values({
    ...parsed.data,
    quantity: String(parsed.data.quantity),
    lowStockThreshold: String(parsed.data.lowStockThreshold),
  }).returning();

  return NextResponse.json(item, { status: 201 });
}
