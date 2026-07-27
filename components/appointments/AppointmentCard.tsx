import Link from 'next/link';
import { formatDate, formatTime } from '@/lib/utils/formatDate';
import { getWhatsAppReminderUrl } from '@/lib/utils/whatsapp';
import { AppointmentStatusBadge, AppointmentTypeBadge } from './AppointmentStatusBadge';
import type { AppointmentWithPatient } from '@/types/appointment';

export function AppointmentCard({ apt }: { apt: AppointmentWithPatient }) {
  const waUrl = getWhatsAppReminderUrl({
    phone: apt.patient.phone,
    patientName: apt.patient.name,
    date: formatDate(apt.scheduledDate),
    time: apt.scheduledTime ? formatTime(apt.scheduledTime) : null,
    reason: apt.reason,
  });

  return (
    <div className="group flex items-center justify-between p-4.5 bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/80 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
      <Link href={`/appointments/${apt.id}`} className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
          {apt.patient.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
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
      </Link>

      <div className="flex items-center gap-3 shrink-0 ml-4">
        <div className="text-right">
          <p className="text-xs font-bold text-slate-900">{formatDate(apt.scheduledDate)}</p>
          {apt.scheduledTime && (
            <p className="text-[11px] font-semibold text-slate-500">{formatTime(apt.scheduledTime)}</p>
          )}
          <div className="flex gap-1.5 justify-end mt-1 flex-wrap">
            <AppointmentTypeBadge type={apt.type} />
            <AppointmentStatusBadge status={apt.status} />
          </div>
        </div>

        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Send WhatsApp Reminder"
            className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-200 transition-all duration-200 text-base"
          >
            💬
          </a>
        )}
      </div>
    </div>
  );
}
