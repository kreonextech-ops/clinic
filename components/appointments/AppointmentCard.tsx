import Link from 'next/link';
import { formatDate, formatTime } from '@/lib/utils/formatDate';
import { AppointmentStatusBadge, AppointmentTypeBadge } from './AppointmentStatusBadge';
import type { AppointmentWithPatient } from '@/types/appointment';

export function AppointmentCard({ apt }: { apt: AppointmentWithPatient }) {
  return (
    <Link
      href={`/appointments/${apt.id}`}
      className="group flex items-center gap-4 p-4.5 bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300"
    >
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
        {apt.patient.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
            {apt.patient.name}
          </p>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
            {apt.patient.patientId}
          </span>
        </div>
        <p className="text-xs font-medium text-slate-600 truncate mt-0.5">
          {apt.reason || 'General Visit'}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs font-bold text-slate-900">{formatDate(apt.scheduledDate)}</p>
        {apt.scheduledTime && (
          <p className="text-[11px] font-semibold text-slate-500">{formatTime(apt.scheduledTime)}</p>
        )}
        <div className="flex gap-1.5 justify-end mt-1.5 flex-wrap">
          <AppointmentTypeBadge type={apt.type} />
          <AppointmentStatusBadge status={apt.status} />
        </div>
      </div>
    </Link>
  );
}
