export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { hasPermission } from '@/lib/auth/permissions';
import { db } from '@/lib/db';
import { inventory } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'can_view_reports')) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  try {
    const rows = await db
      .select()
      .from(inventory)
      .where(sql`quantity::numeric <= low_stock_threshold::numeric`)
      .orderBy(inventory.name);

    return NextResponse.json(
      rows.map((r: any) => ({
        ...r,
        deficit: Math.max(0, parseFloat(r.lowStockThreshold) - parseFloat(r.quantity)),
      }))
    );
  } catch (err) {
    console.error('API /api/reports/inventory-reorder GET error:', err);
    return NextResponse.json([]);
  }
}
