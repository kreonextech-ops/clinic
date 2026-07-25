'use client';

import { useState, useEffect } from 'react';
import type { AppointmentWithPatient } from '@/types/appointment';

export function useAppointments(filters?: { date?: string; status?: string }) {
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters?.date) params.set('date', filters.date);
    if (filters?.status) params.set('status', filters.status);
    fetch(`/api/appointments?${params}`)
      .then((r) => r.json())
      .then(setAppointments)
      .finally(() => setLoading(false));
  }, [filters?.date, filters?.status]);

  return { appointments, loading };
}
