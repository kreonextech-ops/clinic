import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { followUps, appointments, inventory, users } from '@/lib/db/schema';
import { eq, and, lt, lte, sql } from 'drizzle-orm';
import { resend, FROM_EMAIL, DOCTOR_EMAIL } from '@/lib/resend/client';
import { webpush } from '@/lib/webpush/client';
import { reminderEmailHtml, dailySummaryEmailHtml } from '@/lib/resend/templates';
import { todayISO, formatDate } from '@/lib/utils/formatDate';

export async function GET(req: NextRequest) {
  // Secure with secret token
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = todayISO();
  const clinicName = process.env.CLINIC_NAME || 'Dental Clinic';

  // 1. Get all overdue/due-today pending follow-ups
  const dueFollowUps = await db.query.followUps.findMany({
    where: and(
      eq(followUps.status, 'pending'),
      lte(followUps.dueDate, today)
    ),
    with: { patient: true },
    limit: 50,
  });

  // 2. Mark overdue
  if (dueFollowUps.length > 0) {
    await db
      .update(followUps)
      .set({ status: 'overdue', updatedAt: new Date() })
      .where(and(eq(followUps.status, 'pending'), lt(followUps.dueDate, today)));
  }

  // 3. Today's appointment count
  const [apptCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(appointments)
    .where(and(eq(appointments.scheduledDate, today), eq(appointments.status, 'upcoming')));

  // 4. Low stock items
  const lowStockItems = await db
    .select({ name: inventory.name })
    .from(inventory)
    .where(sql`quantity::numeric <= low_stock_threshold::numeric`);

  // 5. Get doctor's push subscription
  const [user] = await db.select({ pushSubscription: users.pushSubscription }).from(users).limit(1);

  // 6. Send push notification if subscribed
  if (user?.pushSubscription) {
    try {
      const sub = JSON.parse(user.pushSubscription);
      const summaryBody = [
        `📅 ${Number(apptCount?.count || 0)} appointments today`,
        dueFollowUps.length > 0 ? `🔔 ${dueFollowUps.length} follow-ups due` : '',
        lowStockItems.length > 0 ? `📦 ${lowStockItems.length} items low on stock` : '',
      ].filter(Boolean).join(' · ');

      await webpush.sendNotification(sub, JSON.stringify({
        title: `${clinicName} — Daily Summary`,
        body: summaryBody || 'All clear today!',
      }));
    } catch (err) {
      console.error('Push error:', err);
    }
  }

  // 7. Send email to doctor
  if (DOCTOR_EMAIL) {
    try {
      // Daily summary email
      await resend.emails.send({
        from: FROM_EMAIL,
        to: DOCTOR_EMAIL,
        subject: `[${clinicName}] Daily Summary — ${formatDate(today)}`,
        html: dailySummaryEmailHtml({
          clinicName,
          date: formatDate(today),
          appointments: Number(apptCount?.count || 0),
          overdueFollowUps: dueFollowUps.filter((f) => f.dueDate < today).length,
          lowStockItems: lowStockItems.map((i) => i.name),
        }),
      });

      // Individual reminders for each due follow-up (batched, max 10 emails)
      for (const f of dueFollowUps.slice(0, 10)) {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: DOCTOR_EMAIL,
          subject: `Follow-up Reminder: ${f.patient.name} — ${f.treatmentName}`,
          html: reminderEmailHtml({
            clinicName,
            patientName: f.patient.name,
            treatmentName: f.treatmentName,
            dueDate: formatDate(f.dueDate),
            notes: f.notes,
          }),
        });
      }
    } catch (err) {
      console.error('Email error:', err);
    }
  }

  return NextResponse.json({
    ok: true,
    processed: {
      followUpsDue: dueFollowUps.length,
      appointments: Number(apptCount?.count || 0),
      lowStock: lowStockItems.length,
    },
  });
}
