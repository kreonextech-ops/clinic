'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils/cn';
import { hasPermission, isOwner } from '@/lib/auth/permissions';

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const owner = isOwner(session);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '⚡', show: true },
    {
      href: '/patients', label: 'Patients', icon: '👥',
      show: hasPermission(session, 'can_view_patients'),
    },
    {
      href: '/appointments', label: 'Appointments', icon: '📅',
      show: hasPermission(session, 'can_view_appointments'),
    },
    {
      href: '/visits', label: 'Visits & Records', icon: '🩺',
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
      href: '/reports', label: 'Analytics & Reports', icon: '📊',
      show: hasPermission(session, 'can_view_reports'),
    },
    { href: '/settings', label: 'Settings', icon: '⚙️', show: true },
  ].filter((i: any) => i.show);

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white/95 backdrop-blur-2xl border-r border-slate-200/80 min-h-screen fixed left-0 top-0 z-30 shadow-sm text-slate-800">
      {/* Brand Header */}
      <div className="px-6 py-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/20">
            <span className="text-xl">🦷</span>
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight truncate">
              {(session?.user as any)?.clinicName || 'Way2Smile Clinic'}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-semibold text-slate-500 truncate">
                {(session?.user as any)?.doctorName || 'Dr. Doctor'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Role badge */}
      {!owner && (
        <div className="mx-4 mt-4">
          <div className="bg-blue-50/80 border border-blue-200/60 rounded-xl px-3.5 py-2 text-center">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              {(session?.user as any)?.role || 'Staff'} Mode
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Main Navigation</p>
        {navItems.map((item: any) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200',
                active
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              )}
            >
              <span className="text-lg transition-transform duration-200 group-hover:scale-110">
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
              {active && (
                <span className="absolute right-2.5 w-1.5 h-4 rounded-full bg-white/90 shadow-sm" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 m-3 bg-slate-50 border border-slate-200/60 rounded-2xl">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span>System Status</span>
          <span className="text-emerald-600 font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Operational
          </span>
        </div>
      </div>
    </aside>
  );
}
