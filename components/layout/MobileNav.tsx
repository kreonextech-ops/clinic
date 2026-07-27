'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils/cn';
import { hasPermission } from '@/lib/auth/permissions';

export function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const allItems = [
    { href: '/dashboard', label: 'Home', icon: '⚡', show: true },
    { href: '/patients', label: 'Patients', icon: '👥', show: hasPermission(session, 'can_view_patients') },
    { href: '/appointments', label: 'Appts', icon: '📅', show: hasPermission(session, 'can_view_appointments') },
    { href: '/visits', label: 'Visits', icon: '🩺', show: hasPermission(session, 'can_view_visits') },
    { href: '/inventory', label: 'Stock', icon: '📦', show: hasPermission(session, 'can_manage_inventory') },
  ].filter((i: any) => i.show).slice(0, 5);

  return (
    <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40">
      <nav className="bg-slate-950/90 backdrop-blur-2xl border border-slate-800/80 rounded-2xl p-1.5 shadow-2xl flex items-center justify-around">
        {allItems.map((item: any) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center py-2 px-1 rounded-xl text-[11px] font-semibold transition-all duration-200',
                active
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <span className="text-base mb-0.5">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
