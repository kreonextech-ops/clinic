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
    <aside className="hidden lg:flex flex-col w-64 bg-slate-950/95 backdrop-blur-2xl border-r border-slate-800/80 min-h-screen fixed left-0 top-0 z-30 shadow-2xl text-slate-200">
      {/* Brand Header */}
      <div className="px-6 py-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25">
            <span className="text-xl">🦷</span>
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white tracking-wide truncate">
              {(session?.user as any)?.clinicName || 'Way2Smile Clinic'}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs text-slate-400 truncate">
                {(session?.user as any)?.doctorName || 'Dr. Doctor'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Role badge */}
      {!owner && (
        <div className="mx-4 mt-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-center">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              {(session?.user as any)?.role || 'Staff'} Mode
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Main Menu</p>
        {navItems.map((item: any) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-gradient-to-r from-blue-600/90 to-indigo-600/90 text-white shadow-lg shadow-blue-600/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
              )}
            >
              <span className="text-lg transition-transform duration-200 group-hover:scale-110">
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
              {active && (
                <span className="absolute right-2 w-1.5 h-5 rounded-full bg-white shadow-sm" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 m-3 bg-slate-900/80 border border-slate-800/80 rounded-2xl">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>System Status</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active
          </span>
        </div>
      </div>
    </aside>
  );
}
