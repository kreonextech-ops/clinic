import Link from 'next/link';

interface AlertsPanelProps {
  overdueFollowUps: number;
  lowStockItems: number;
  pendingPayments: number;
}

export function AlertsPanel({ overdueFollowUps, lowStockItems, pendingPayments }: AlertsPanelProps) {
  const alerts = [
    {
      href: '/follow-ups',
      icon: '🔔',
      label: 'Overdue Follow-ups',
      count: overdueFollowUps,
      badge: 'Urgent',
      bg: 'bg-rose-500/10 border-rose-500/20 text-rose-700 hover:border-rose-500/40',
    },
    {
      href: '/inventory',
      icon: '📦',
      label: 'Low Stock Items',
      count: lowStockItems,
      badge: 'Reorder',
      bg: 'bg-amber-500/10 border-amber-500/20 text-amber-700 hover:border-amber-500/40',
    },
    {
      href: '/reports/pending-payments',
      icon: '💰',
      label: 'Pending Balances',
      count: pendingPayments,
      badge: 'Finance',
      bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-700 hover:border-indigo-500/40',
    },
  ];

  const active = alerts.filter((a: any) => a.count > 0);

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">Active Alerts</h3>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
          {active.length} active
        </span>
      </div>

      {active.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-6 text-center bg-emerald-500/5 rounded-xl border border-emerald-500/15">
          <span className="text-2xl mb-1">✨</span>
          <p className="text-xs font-bold text-emerald-700">All Systems Clear</p>
          <p className="text-[11px] text-emerald-600/80 mt-0.5">No overdue follow-ups or low inventory items</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {active.map((a: any) => (
            <Link
              key={a.href}
              href={a.href}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 hover:shadow-md ${a.bg}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{a.icon}</span>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{a.label}</span>
                  <span className="text-[10px] font-semibold opacity-75">{a.badge}</span>
                </div>
              </div>
              <span className="text-sm font-extrabold px-2.5 py-1 rounded-lg bg-white/80 shadow-sm border border-slate-200/60">
                {a.count}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
