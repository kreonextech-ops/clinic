'use client';

import { useState, useEffect } from 'react';
import type { PatientWithVisitCount } from '@/types/patient';

export function usePatients(query?: string) {
  const [patients, setPatients] = useState<PatientWithVisitCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    fetch(`/api/patients?${params}`)
      .then((r) => r.json())
      .then(setPatients)
      .finally(() => setLoading(false));
  }, [query]);

  return { patients, loading };
}
