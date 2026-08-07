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
      SELECT treatment_name, COUNT(*) AS count
      FROM treatments t
      JOIN visits v ON t.visit_id = v.id
      JOIN patients p ON v.patient_id = p.id
      WHERE t.created_at >= NOW() - INTERVAL '${sql.raw(String(months))} months'
      AND p.user_id = ${session.user.userId}
      GROUP BY treatment_name
      ORDER BY count DESC
      LIMIT 20
    `);

    const data = rows.rows as { treatment_name: string; count: number }[];
    const total = data.reduce((s, r) => s + Number(r.count), 0);

    return NextResponse.json(
      data.map((r: any) => ({
        treatmentName: r.treatment_name,
        count: Number(r.count),
        percentage: total > 0 ? Math.round((Number(r.count) / total) * 100) : 0,
      }))
    );
  } catch (err) {
    console.error('API /api/reports/treatments GET error:', err);
    return NextResponse.json([]);
  }
}
