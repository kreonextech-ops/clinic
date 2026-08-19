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
        to_char(v.visit_date, 'YYYY-MM') AS month,
        to_char(v.visit_date, 'Mon YYYY') AS label,
        COALESCE(SUM(e.consultation_fee::numeric), 0) AS consultation,
        COALESCE(SUM(e.procedure_fee_total::numeric), 0) AS procedure,
        COALESCE(SUM(e.medicine_charge::numeric), 0) AS medicine,
        COALESCE(SUM(e.total_amount::numeric), 0) AS total,
        COALESCE(SUM((e.total_amount::numeric) - (e.procedure_fee_balance::numeric)), 0) AS settled,
        COALESCE(SUM(e.procedure_fee_balance::numeric), 0) AS pending
      FROM earnings e
      JOIN visits v ON e.visit_id = v.id
      JOIN patients p ON e.patient_id = p.id
      WHERE v.visit_date >= CURRENT_DATE - INTERVAL '${sql.raw(String(months))} months'
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
