import type { AppointmentStatus, AppointmentType } from '@/types/appointment';

const statusConfig: Record<AppointmentStatus, { label: string; color: string }> = {
  upcoming: { label: 'Upcoming', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-600' },
  noshow: { label: 'No Show', color: 'bg-red-100 text-red-700' },
};

const typeConfig: Record<AppointmentType, { label: string; color: string }> = {
  scheduled: { label: 'Scheduled', color: 'bg-indigo-100 text-indigo-700' },
  walkin: { label: 'Walk-in', color: 'bg-purple-100 text-purple-700' },
};

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const cfg = statusConfig[status];
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

export function AppointmentTypeBadge({ type }: { type: AppointmentType }) {
  const cfg = typeConfig[type];
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}
