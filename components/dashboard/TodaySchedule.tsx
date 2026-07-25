'use client';

import Link from 'next/link';
import { formatTime } from '@/lib/utils/formatDate';
import type { AppointmentWithPatient } from '@/types/appointment';

export function TodaySchedule({ appointments }: { appointments: AppointmentWithPatient[] }) {
  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Today&apos;s Schedule</h3>
        <p className="text-sm text-gray-400 text-center py-8">No appointments today</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Today&apos;s Schedule</h3>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
          {appointments.length} total
        </span>
      </div>
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {appointments.map((apt) => (
          <Link
            key={apt.id}
            href={`/appointments/${apt.id}`}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-100 group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-blue-700">
                  {apt.patient.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{apt.patient.name}</p>
                <p className="text-xs text-gray-500 truncate">{apt.reason || 'General visit'}</p>
              </div>
            </div>
            <div className="text-right shrink-0 ml-2">
              <p className="text-xs font-medium text-gray-700">{apt.scheduledTime ? formatTime(apt.scheduledTime) : 'Walk-in'}</p>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                apt.type === 'walkin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
              }`}>
                {apt.type === 'walkin' ? 'Walk-in' : 'Scheduled'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
