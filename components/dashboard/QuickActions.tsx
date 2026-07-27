import Link from 'next/link';

export function QuickActions() {
  const actions = [
    {
      href: '/visits/new',
      icon: '🚶',
      label: 'Walk-in / Visit',
      badge: 'Immediate',
      bg: 'bg-teal-500/10 border-teal-500/20 text-teal-700 hover:bg-teal-500/20 hover:border-teal-500/40',
    },
    {
      href: '/appointments/new',
      icon: '📅',
      label: 'New Appointment',
      badge: 'Schedule',
      bg: 'bg-blue-500/10 border-blue-500/20 text-blue-700 hover:bg-blue-500/20 hover:border-blue-500/40',
    },
    {
      href: '/patients/new',
      icon: '👤',
      label: 'Register Patient',
      badge: 'New Patient',
      bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-700 hover:bg-indigo-500/20 hover:border-indigo-500/40',
    },
    {
      href: '/inventory/new',
      icon: '📦',
      label: 'Add Stock Item',
      badge: 'Inventory',
      bg: 'bg-amber-500/10 border-amber-500/20 text-amber-700 hover:bg-amber-500/20 hover:border-amber-500/40',
    },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 p-5 shadow-sm">
      <h3 className="text-base font-bold text-slate-900 mb-4 tracking-tight">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((act) => (
          <Link
            key={act.href}
            href={act.href}
            className={`group flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 ${act.bg}`}
          >
            <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">
              {act.icon}
            </span>
            <span className="text-xs font-bold text-slate-900 text-center leading-tight">
              {act.label}
            </span>
            <span className="text-[10px] font-semibold opacity-70 mt-0.5">
              {act.badge}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
