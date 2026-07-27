import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { db } from '@/lib/db';
import { appointments, earnings, followUps, inventory } from '@/lib/db/schema';
import { eq, and, gte, lt, sql } from 'drizzle-orm';
import { todayISO } from '@/lib/utils/formatDate';
import { hasPermission } from '@/lib/auth/permissions';
import { TodaySchedule } from '@/components/dashboard/TodaySchedule';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { EarningsSummary } from '@/components/dashboard/EarningsSummary';
import { QuickActions } from '@/components/dashboard/QuickActions';

async function getDashboardData(canViewEarnings: boolean) {
  try {
    const today = todayISO();
    const monthStart = today.slice(0, 7) + '-01';

    const [todayAppts, overdueFollowUps, lowStock, pending] = await Promise.all([
      db.query.appointments.findMany({
        where: and(eq(appointments.scheduledDate, today), eq(appointments.status, 'upcoming')),
        with: { patient: true },
        orderBy: (a, { asc }) => [asc(a.scheduledTime)],
      }),
      db.select({ count: sql<number>`count(*)` }).from(followUps)
        .where(and(eq(followUps.status, 'pending'), lt(followUps.dueDate, today))),
      db.select({ count: sql<number>`count(*)` }).from(inventory)
        .where(sql`quantity::numeric <= low_stock_threshold::numeric`),
      db.select({ count: sql<number>`count(*)` }).from(earnings).where(eq(earnings.paymentStatus, 'pending')),
    ]);

    let monthEarnings = [{ total: 0, settled: 0, pending: 0 }];
    let todayEarnings = [{ total: 0 }];

    if (canViewEarnings) {
      [monthEarnings, todayEarnings] = await Promise.all([
        db.select({
          total: sql<number>`coalesce(sum(total_amount::numeric), 0)`,
          settled: sql<number>`coalesce(sum(case when payment_status = 'settled' then total_amount::numeric else 0 end), 0)`,
          pending: sql<number>`coalesce(sum(case when payment_status = 'pending' then total_amount::numeric else 0 end), 0)`,
        }).from(earnings).where(gte(earnings.createdAt, new Date(monthStart))),
        db.select({ total: sql<number>`coalesce(sum(total_amount::numeric), 0)` })
          .from(earnings).where(gte(earnings.createdAt, new Date(today))),
      ]);
    }

    return {
      todayAppts,
      month: monthEarnings[0] || { total: 0, settled: 0, pending: 0 },
      todayTotal: Number(todayEarnings[0]?.total || 0),
      overdueFollowUps: Number(overdueFollowUps[0]?.count || 0),
      lowStock: Number(lowStock[0]?.count || 0),
      pendingPayments: Number(pending[0]?.count || 0),
    };
  } catch (err) {
    console.error('Database connection error in getDashboardData:', err);
    return {
      todayAppts: [],
      month: { total: 0, settled: 0, pending: 0 },
      todayTotal: 0,
      overdueFollowUps: 0,
      lowStock: 0,
      pendingPayments: 0,
    };
  }
}

export default async function DashboardPage() {
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
  const canViewEarnings = hasPermission(session, 'can_view_earnings');
  const data = await getDashboardData(canViewEarnings);

  const statCards = [
    { label: "Today's Patients", value: data.todayAppts.length, icon: '👤', color: 'blue' },
    { label: 'Overdue Follow-ups', value: data.overdueFollowUps, icon: '🔔', color: 'red' },
    { label: 'Low Stock Items', value: data.lowStock, icon: '📦', color: 'orange' },
    ...(canViewEarnings ? [{ label: 'Pending Payments', value: data.pendingPayments, icon: '💰', color: 'yellow' }] : []),
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s: any) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">{s.icon}</span>
              <span className={`text-2xl font-bold ${
                s.color === 'blue' ? 'text-blue-600' :
                s.color === 'red' ? 'text-red-600' :
                s.color === 'orange' ? 'text-orange-600' : 'text-yellow-600'
              }`}>{s.value}</span>
            </div>
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TodaySchedule appointments={data.todayAppts as any} />
        </div>
        <div className="space-y-4">
          <AlertsPanel
            overdueFollowUps={data.overdueFollowUps}
            lowStockItems={data.lowStock}
            pendingPayments={canViewEarnings ? data.pendingPayments : 0}
          />
          <QuickActions />
        </div>
      </div>

      {canViewEarnings && (
        <EarningsSummary
          monthTotal={Number(data.month.total)}
          monthSettled={Number(data.month.settled)}
          monthPending={Number(data.month.pending)}
          todayTotal={data.todayTotal}
        />
      )}
    </div>
  );
}
