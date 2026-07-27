export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { appointments, followUps, inventory, users } from '@/lib/db/schema';
import { eq, and, lt, sql } from 'drizzle-orm';
import { todayISO } from '@/lib/utils/formatDate';

export async function GET(req: NextRequest) {
  try {
    const today = todayISO();

    // Fetch active clinic owners who have notifications enabled
    const activeClinics = await db
      .select({
        id: users.id,
        clinicName: users.clinicName,
        doctorName: users.doctorName,
        notificationsEnabled: users.notificationsEnabled,
      })
      .from(users);

    const reminderSummaries = await Promise.all(
      activeClinics.map(async (clinic: any) => {
        const [todayAppts, overdueFollows, lowStock] = await Promise.all([
          db.query.appointments.findMany({
            where: and(
              eq(appointments.scheduledDate, today),
              eq(appointments.status, 'upcoming')
            ),
            with: { patient: true },
          }),
          db.select({ count: sql<number>`count(*)` })
            .from(followUps)
            .where(and(eq(followUps.status, 'pending'), lt(followUps.dueDate, today))),
          db.select({ count: sql<number>`count(*)` })
            .from(inventory)
            .where(sql`quantity::numeric <= low_stock_threshold::numeric`),
        ]);

        return {
          clinicId: clinic.id,
          clinicName: clinic.clinicName,
          doctorName: clinic.doctorName,
          upcomingAppointmentsCount: todayAppts.length,
          overdueFollowUpsCount: Number(overdueFollows[0]?.count || 0),
          lowStockItemsCount: Number(lowStock[0]?.count || 0),
          timestamp: new Date().toISOString(),
        };
      })
    );

    return NextResponse.json({
      ok: true,
      remindersProcessed: reminderSummaries.length,
      digests: reminderSummaries,
    });
  } catch (err: any) {
    console.error('Cron reminders execution error:', err);
    return NextResponse.json({ error: 'Failed to process cron reminders' }, { status: 500 });
  }
}
