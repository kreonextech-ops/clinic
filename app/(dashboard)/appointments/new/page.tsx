import { PageHeader } from '@/components/shared/PageHeader';
import { AppointmentForm } from '@/components/appointments/AppointmentForm';
import { Suspense } from 'react';

export default function NewAppointmentPage() {
  return (
    <div className="max-w-2xl">
      <PageHeader title="New Appointment" description="Schedule a new appointment or register a walk-in" />
      <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading form details...</div>}>
        <AppointmentForm />
      </Suspense>
    </div>
  );
}
