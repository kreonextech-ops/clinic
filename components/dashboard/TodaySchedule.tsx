'use client';

import Link from 'next/link';
import { formatTime } from '@/lib/utils/formatDate';
import type { AppointmentWithPatient } from '@/types/appointment';

export function TodaySchedule({ appointments }: { appointments: AppointmentWithPatient[] }) {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 p-5 lg:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Today&apos;s Schedule</h3>
          <p className="text-xs font-medium text-slate-500">Upcoming appointments for today</p>
        </div>
        <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200/60 shadow-sm">
          {appointments.length} Appointments
        </span>
      </div>

      {appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <span className="text-3xl mb-2">📅</span>
          <p className="text-sm font-bold text-slate-700">No Appointments Today</p>
          <p className="text-xs text-slate-400 mt-0.5">Use Quick Actions to schedule or add a walk-in patient.</p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
          {appointments.map((apt: any) => (
            <Link
              key={apt.id}
              href={`/appointments/${apt.id}`}
              className="group flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-100 hover:border-blue-500/40 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/15 group-hover:scale-105 transition-transform shrink-0">
                  {apt.patient.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                    {apt.patient.name}
                  </p>
                  <p className="text-xs font-medium text-slate-500 truncate mt-0.5">
                    {apt.reason || 'General Visit'}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p className="text-xs font-bold text-slate-800">
                  {apt.scheduledTime ? formatTime(apt.scheduledTime) : 'Walk-in'}
                </p>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mt-0.5 ${
                  apt.type === 'walkin' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {apt.type === 'walkin' ? 'Walk-in' : 'Scheduled'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
