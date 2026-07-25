'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { cn } from '@/lib/utils/cn';
import { hasPermission, isOwner } from '@/lib/auth/permissions';

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const owner = isOwner(session);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠', show: true },
    {
      href: '/patients', label: 'Patients', icon: '👤',
      show: hasPermission(session, 'can_view_patients'),
    },
    {
      href: '/appointments', label: 'Appointments', icon: '📅',
      show: hasPermission(session, 'can_view_appointments'),
    },
    {
      href: '/visits', label: 'Visits', icon: '🩺',
      show: hasPermission(session, 'can_view_visits'),
    },
    {
      href: '/follow-ups', label: 'Follow-ups', icon: '🔔',
      show: hasPermission(session, 'can_view_follow_ups'),
    },
    {
      href: '/inventory', label: 'Inventory', icon: '📦',
      show: hasPermission(session, 'can_manage_inventory'),
    },
    {
      href: '/reports', label: 'Reports', icon: '📊',
      show: hasPermission(session, 'can_view_reports'),
    },
    { href: '/settings', label: 'Settings', icon: '⚙️', show: true },
  ].filter((i) => i.show);

  return (
    <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-lg">🦷</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">
              {(session?.user as any)?.clinicName || 'Dental Clinic'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {(session?.user as any)?.doctorName || 'Staff'}
            </p>
          </div>
        </div>
      </div>

      {/* Role badge */}
      {!owner && (
        <div className="mx-3 mt-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 text-center">
            <span className="text-xs font-medium text-blue-700 capitalize">
              {(session?.user as any)?.role || 'Staff'} Account
            </span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}>
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 pb-4 border-t border-gray-100 pt-3">
        <button onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 w-full transition-colors">
          <span className="text-base w-5 text-center">🚪</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
