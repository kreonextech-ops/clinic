'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppointmentStatusBadge, AppointmentTypeBadge } from '@/components/appointments/AppointmentStatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatDate, formatTime } from '@/lib/utils/formatDate';
import type { AppointmentWithPatient, AppointmentStatus } from '@/types/appointment';

const STATUS_ACTIONS: { value: AppointmentStatus; label: string; color: string }[] = [
  { value: 'upcoming', label: 'Mark Upcoming', color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
  { value: 'completed', label: 'Mark Completed', color: 'bg-green-100 text-green-800 hover:bg-green-200' },
  { value: 'cancelled', label: 'Mark Cancelled', color: 'bg-gray-100 text-gray-800 hover:bg-gray-200' },
  { value: 'noshow', label: 'Mark No Show', color: 'bg-red-100 text-red-800 hover:bg-red-200' },
];

export default function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [apt, setApt] = useState<AppointmentWithPatient | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function fetchApt() {
    const res = await fetch(`/api/appointments/${id}`);
    if (res.ok) setApt(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchApt(); }, [id]);

  async function updateStatus(status: AppointmentStatus) {
    await fetch(`/api/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchApt();
  }

  async function deleteApt() {
    await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
    router.push('/appointments');
    router.refresh();
  }

  if (loading) return <LoadingSpinner />;
  if (!apt) return <p className="text-gray-500">Appointment not found.</p>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointment</h1>
          <div className="flex gap-2 mt-1">
            <AppointmentTypeBadge type={apt.type} />
            <AppointmentStatusBadge status={apt.status} />
          </div>
        </div>
        <button onClick={() => setDeleteOpen(true)} className="text-red-500 text-sm hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50">
          Delete
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Patient</p>
            <Link href={`/patients/${apt.patient.id}`} className="font-semibold text-blue-600 hover:underline">
              {apt.patient.name}
            </Link>
            <p className="text-gray-400 text-xs">{apt.patient.patientId}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Date & Time</p>
            <p className="font-medium text-gray-900">{formatDate(apt.scheduledDate)}</p>
            {apt.scheduledTime && <p className="text-gray-500 text-xs">{formatTime(apt.scheduledTime)}</p>}
          </div>
          {apt.reason && (
            <div className="sm:col-span-2">
              <p className="text-gray-500 text-xs mb-0.5">Reason</p>
              <p className="text-gray-900">{apt.reason}</p>
            </div>
          )}
          {apt.notes && (
            <div className="sm:col-span-2">
              <p className="text-gray-500 text-xs mb-0.5">Notes</p>
              <p className="text-gray-900">{apt.notes}</p>
            </div>
          )}
        </div>

        {/* Status actions */}
        <div>
          <p className="text-xs text-gray-500 mb-2 font-medium">Update Status</p>
          <div className="flex flex-wrap gap-2">
            {STATUS_ACTIONS.filter((a) => a.value !== apt.status).map((a) => (
              <button key={a.value} onClick={() => updateStatus(a.value)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${a.color}`}>
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Record visit */}
        {apt.status === 'upcoming' && (
          <Link
            href={`/visits/new?patientId=${apt.patient.id}&appointmentId=${apt.id}`}
            className="block w-full text-center bg-teal-600 text-white py-3 rounded-xl font-medium hover:bg-teal-700"
          >
            🩺 Record Visit for This Appointment
          </Link>
        )}
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Appointment"
        description="Are you sure you want to delete this appointment?"
        confirmLabel="Delete"
        destructive
        onConfirm={deleteApt}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
