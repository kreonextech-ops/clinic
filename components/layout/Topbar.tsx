'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard Overview',
  '/patients': 'Patient Registry',
  '/patients/new': 'Register New Patient',
  '/appointments': 'Appointment Schedule',
  '/appointments/new': 'Schedule Appointment',
  '/visits': 'Visit Logs & Records',
  '/visits/new': 'Record Walk-in / Visit',
  '/follow-ups': 'Follow-up Reminders',
  '/inventory': 'Inventory & Stock Control',
  '/inventory/new': 'Add Inventory Item',
  '/reports': 'Analytics & Performance',
  '/reports/earnings': 'Revenue Breakdown',
  '/reports/treatments': 'Treatment Distribution',
  '/reports/pending-payments': 'Outstanding Balances',
  '/reports/inventory-reorder': 'Stock Reorder Alerts',
  '/settings': 'Clinic Settings',
  '/settings/staff': 'Staff Management',
};

function getTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  if (pathname.startsWith('/patients/') && pathname.endsWith('/visits')) return 'Patient Visits';
  if (pathname.startsWith('/patients/') && pathname.endsWith('/files')) return 'Patient Documents & Files';
  if (pathname.startsWith('/patients/') && pathname.endsWith('/billing')) return 'Patient Financial Overview';
  if (pathname.startsWith('/patients/') && pathname.endsWith('/edit')) return 'Edit Patient Details';
  if (pathname.startsWith('/patients/')) return 'Patient Record';
  if (pathname.startsWith('/appointments/')) return 'Appointment Record';
  if (pathname.startsWith('/visits/')) return 'Visit Clinical Summary';
  return 'Way2Smile Clinic Management';
}

export function Topbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const dateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
  });

  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20 transition-all">
      <div className="flex items-center gap-3">
        <div className="lg:hidden w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm shadow-md shadow-blue-500/20">
          🦷
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">
            {getTitle(pathname)}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Date badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/80 border border-slate-200/60 rounded-xl text-xs font-semibold text-slate-600">
          <span>📅</span>
          <span>{dateFormatted}</span>
        </div>

        {/* Doctor / User profile card */}
        <div className="flex items-center gap-2.5 bg-slate-100/60 border border-slate-200/60 pl-3 pr-1.5 py-1 rounded-2xl">
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-slate-900 leading-tight">
              {(session?.user as any)?.doctorName || 'Dr. Doctor'}
            </p>
            <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
              {(session?.user as any)?.role || 'Owner'}
            </p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-blue-500/20">
            {((session?.user as any)?.doctorName || 'D').charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
