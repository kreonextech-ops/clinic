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
      color: 'red',
    },
    {
      href: '/inventory',
      icon: '📦',
      label: 'Low Stock Items',
      count: lowStockItems,
      color: 'orange',
    },
    {
      href: '/reports/pending-payments',
      icon: '💰',
      label: 'Pending Payments',
      count: pendingPayments,
      color: 'yellow',
    },
  ];

  const active = alerts.filter((a: any) => a.count > 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Alerts</h3>
      {active.length === 0 ? (
        <p className="text-sm text-green-600 text-center py-4">✅ All clear — no alerts</p>
      ) : (
        <div className="space-y-2">
          {active.map((a: any) => (
            <Link
              key={a.href}
              href={a.href}
              className={`flex items-center justify-between p-3 rounded-lg border hover:opacity-90 transition-opacity ${
                a.color === 'red'
                  ? 'bg-red-50 border-red-200'
                  : a.color === 'orange'
                  ? 'bg-orange-50 border-orange-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{a.icon}</span>
                <span className="text-sm font-medium text-gray-800">{a.label}</span>
              </div>
              <span className={`text-sm font-bold ${
                a.color === 'red' ? 'text-red-700' : a.color === 'orange' ? 'text-orange-700' : 'text-yellow-700'
              }`}>
                {a.count}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
