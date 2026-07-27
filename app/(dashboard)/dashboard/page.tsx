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
      clinicName: 'Way2Smile Clinic',
      doctorName: 'Dr. Doctor',
    }
  };
  const canViewEarnings = hasPermission(session, 'can_view_earnings');
  const data = await getDashboardData(canViewEarnings);

  const statCards = [
    {
      label: "Today's Appointments",
      value: data.todayAppts.length,
      icon: '👥',
      gradient: 'from-blue-600 to-cyan-500',
      badge: 'Today',
      bgGlow: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      label: 'Overdue Follow-ups',
      value: data.overdueFollowUps,
      icon: '🔔',
      gradient: 'from-rose-600 to-amber-500',
      badge: 'Requires Action',
      bgGlow: 'bg-rose-500/10 border-rose-500/20',
    },
    {
      label: 'Low Stock Alerts',
      value: data.lowStock,
      icon: '📦',
      gradient: 'from-amber-500 to-orange-600',
      badge: 'Inventory',
      bgGlow: 'bg-amber-500/10 border-amber-500/20',
    },
    ...(canViewEarnings ? [{
      label: 'Pending Balances',
      value: data.pendingPayments,
      icon: '💰',
      gradient: 'from-indigo-600 to-violet-600',
      badge: 'Finance',
      bgGlow: 'bg-indigo-500/10 border-indigo-500/20',
    }] : []),
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 lg:p-8 text-white shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 -mb-8 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-blue-300 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Way2Smile Clinic Command Center
            </div>
            <h1 className="text-2xl lg:text-4xl font-extrabold tracking-tight">
              Welcome Back, <span className="gradient-text">Dr. Doctor</span> 👋
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Here is your daily operational summary. Manage appointments, patient visits, inventory levels, and financial performance.
            </p>
          </div>
        </div>
      </div>

      {/* Modern Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((s: any) => (
          <div
            key={s.label}
            className="group relative bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl p-2.5 rounded-xl bg-slate-100/80 group-hover:scale-110 transition-transform">
                {s.icon}
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${s.bgGlow} text-slate-700`}>
                {s.badge}
              </span>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
              {s.value}
            </p>
            <p className="text-xs font-semibold text-slate-500 tracking-wide">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Main Grid Section */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <TodaySchedule appointments={data.todayAppts as any} />
        </div>
        <div className="space-y-6">
          <AlertsPanel
            overdueFollowUps={data.overdueFollowUps}
            lowStockItems={data.lowStock}
            pendingPayments={canViewEarnings ? data.pendingPayments : 0}
          />
          <QuickActions />
        </div>
      </div>

      {/* Earnings Summary Section */}
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
