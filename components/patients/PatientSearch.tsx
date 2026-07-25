'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function PatientSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [treatment, setTreatment] = useState(searchParams.get('treatment') || '');

  const search = useCallback(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (treatment) params.set('treatment', treatment);
    router.push(`/patients?${params.toString()}`);
  }, [q, treatment, router]);

  const clear = () => {
    setQ('');
    setTreatment('');
    router.push('/patients');
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-6">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && search()}
        placeholder="Search by name, phone, or Patient ID..."
        className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        value={treatment}
        onChange={(e) => setTreatment(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && search()}
        placeholder="Filter by treatment..."
        className="sm:w-52 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={search}
        className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700"
      >
        Search
      </button>
      {(q || treatment) && (
        <button onClick={clear} className="text-sm text-gray-500 hover:text-gray-700 px-3">
          Clear
        </button>
      )}
    </div>
  );
}
