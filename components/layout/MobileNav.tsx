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
    { href: '/dashboard', label: 'Home', icon: '🏠', show: true },
    { href: '/patients', label: 'Patients', icon: '👤', show: hasPermission(session, 'can_view_patients') },
    { href: '/appointments', label: 'Appts', icon: '📅', show: hasPermission(session, 'can_view_appointments') },
    { href: '/inventory', label: 'Stock', icon: '📦', show: hasPermission(session, 'can_manage_inventory') },
    { href: '/reports', label: 'Reports', icon: '📊', show: hasPermission(session, 'can_view_reports') },
  ].filter((i) => i.show).slice(0, 5);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 flex">
      {allItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link key={item.href} href={item.href}
            className={cn('flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors',
              active ? 'text-blue-600' : 'text-gray-500')}>
            <span className="text-xl mb-0.5">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
