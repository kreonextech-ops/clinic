export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { hasPermission } from '@/lib/auth/permissions';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!hasPermission(session, 'can_view_reports')) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const months = parseInt(searchParams.get('months') || '12');

  try {
    const rows = await db.execute(sql`
      SELECT
        to_char(created_at, 'YYYY-MM') AS month,
        to_char(created_at, 'Mon YYYY') AS label,
        COALESCE(SUM(consultation_fee::numeric), 0) AS consultation,
        COALESCE(SUM(procedure_fee_total::numeric), 0) AS procedure,
        COALESCE(SUM(medicine_charge::numeric), 0) AS medicine,
        COALESCE(SUM(total_amount::numeric), 0) AS total,
        COALESCE(SUM(CASE WHEN payment_status = 'settled' THEN total_amount::numeric ELSE 0 END), 0) AS settled,
        COALESCE(SUM(CASE WHEN payment_status = 'pending' THEN total_amount::numeric ELSE 0 END), 0) AS pending
      FROM earnings e
      JOIN patients p ON e.patient_id = p.id
      WHERE e.created_at >= NOW() - INTERVAL '${sql.raw(String(months))} months'
      AND p.user_id = ${session.user.userId}
      GROUP BY month, label
      ORDER BY month ASC
    `);

    return NextResponse.json(rows.rows);
  } catch (err) {
    console.error('API /api/reports/earnings GET error:', err);
    return NextResponse.json([]);
  }
}
