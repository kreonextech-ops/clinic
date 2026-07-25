'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard Overview',
  '/patients': 'Patients Management',
  '/patients/new': 'Register New Patient',
  '/appointments': 'Appointment Schedule',
  '/appointments/new': 'Schedule Appointment',
  '/follow-ups': 'Patient Follow-ups',
  '/inventory': 'Clinic Inventory',
  '/inventory/new': 'Add New Item',
  '/reports': 'Analytics & Reports',
  '/reports/earnings': 'Earnings Report',
  '/reports/treatments': 'Treatments Analysis',
  '/reports/pending-payments': 'Pending Balances',
  '/reports/inventory-reorder': 'Stock Alerts',
  '/settings': 'System Settings',
};

function getTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  if (pathname.startsWith('/patients/') && pathname.endsWith('/visits')) return 'Patient Visits';
  if (pathname.startsWith('/patients/') && pathname.endsWith('/files')) return 'Patient Gallery & Files';
  if (pathname.startsWith('/patients/') && pathname.endsWith('/billing')) return 'Patient Billing Overview';
  if (pathname.startsWith('/patients/')) return 'Patient Profile';
  if (pathname.startsWith('/appointments/')) return 'Appointment Details';
  if (pathname.startsWith('/visits/')) return 'Visit Records';
  return 'Dental Clinic Admin';
}

export function Topbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const now = new Date().toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <header className="h-16 bg-white/70 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-20">
      <div>
        <h2 className="text-base font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{getTitle(pathname)}</h2>
        <p className="text-[10px] font-semibold text-slate-400 hidden sm:block tracking-wide uppercase mt-0.5">{now}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 hidden md:block">
            {(session?.user as any)?.doctorName || 'Doctor'}
          </span>
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/10">
            <span className="text-sm font-bold text-white">
              {((session?.user as any)?.doctorName || 'D').charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

