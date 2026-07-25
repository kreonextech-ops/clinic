import Link from 'next/link';
import { formatDate, formatTime } from '@/lib/utils/formatDate';
import { AppointmentStatusBadge, AppointmentTypeBadge } from './AppointmentStatusBadge';
import type { AppointmentWithPatient } from '@/types/appointment';

export function AppointmentCard({ apt }: { apt: AppointmentWithPatient }) {
  return (
    <Link
      href={`/appointments/${apt.id}`}
      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
        <span className="text-sm font-bold text-indigo-700">
          {apt.patient.name.charAt(0).toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{apt.patient.name}</p>
        <p className="text-xs text-gray-500 truncate">{apt.reason || 'General visit'}</p>
        <p className="text-xs text-gray-400 mt-0.5">{apt.patient.patientId}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-medium text-gray-800">{formatDate(apt.scheduledDate)}</p>
        {apt.scheduledTime && <p className="text-xs text-gray-500">{formatTime(apt.scheduledTime)}</p>}
        <div className="flex gap-1 justify-end mt-1 flex-wrap">
          <AppointmentTypeBadge type={apt.type} />
          <AppointmentStatusBadge status={apt.status} />
        </div>
      </div>
    </Link>
  );
}
