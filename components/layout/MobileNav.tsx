'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import { hasPermission } from '@/lib/auth/permissions';

export function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const [showMore, setShowMore] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMore(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const primaryItems = [
    { href: '/dashboard', label: 'Home', icon: '⚡', show: true },
    { href: '/patients', label: 'Patients', icon: '👥', show: hasPermission(session, 'can_view_patients') },
    { href: '/appointments', label: 'Appts', icon: '📅', show: hasPermission(session, 'can_view_appointments') },
    { href: '/visits', label: 'Visits', icon: '🩺', show: hasPermission(session, 'can_view_visits') },
  ].filter((i: any) => i.show).slice(0, 4);

  const moreItems = [
    { href: '/follow-ups', label: 'Follow-ups', icon: '🔔', show: hasPermission(session, 'can_view_follow_ups') },
    { href: '/inventory', label: 'Stock', icon: '📦', show: hasPermission(session, 'can_manage_inventory') },
    { href: '/reports', label: 'Reports', icon: '📊', show: hasPermission(session, 'can_view_reports') },
    { href: '/settings', label: 'Settings', icon: '⚙️', show: true },
  ].filter((i: any) => i.show);

  return (
    <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40" ref={menuRef}>
      {/* More Menu Dropup */}
      {showMore && (
        <div className="absolute bottom-full right-0 w-48 mb-3 bg-slate-900 border border-slate-700 rounded-2xl p-2 shadow-2xl flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-2 origin-bottom-right">
          {moreItems.map((item: any) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setShowMore(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all',
                  active ? 'bg-blue-600/20 text-blue-400' : 'text-slate-300 hover:bg-slate-800'
                )}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="h-px bg-slate-800 my-1 mx-2" />
          <button
            onClick={() => {
              setShowMore(false);
              signOut({ callbackUrl: '/login' });
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-950/30 transition-all w-full text-left"
          >
            <span>🚪</span>
            <span>Log Out</span>
          </button>
        </div>
      )}

      <nav className="bg-slate-950/90 backdrop-blur-2xl border border-slate-800/80 rounded-2xl p-1.5 shadow-2xl flex items-center justify-around relative">
        {primaryItems.map((item: any) => {
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
        
        {/* Menu Toggle Button */}
        <button
          onClick={() => setShowMore(!showMore)}
          className={cn(
            'flex-1 flex flex-col items-center py-2 px-1 rounded-xl text-[11px] font-semibold transition-all duration-200',
            showMore
              ? 'bg-slate-800 text-white font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          )}
        >
          <span className="text-base mb-0.5">☰</span>
          <span>Menu</span>
        </button>
      </nav>
    </div>
  );
}
