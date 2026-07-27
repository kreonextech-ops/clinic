'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { todayISO } from '@/lib/utils/formatDate';

interface PatientOption { id: number; name: string; patientId: string; phone?: string | null; }

export function AppointmentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultType = searchParams.get('type') || 'scheduled';
  const defaultPatientId = searchParams.get('patientId') || '';

  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [form, setForm] = useState({
    patientId: defaultPatientId,
    type: defaultType,
    scheduledDate: todayISO(),
    scheduledTime: '',
    reason: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/patients' + (patientSearch ? `?q=${encodeURIComponent(patientSearch)}` : ''))
      .then((r) => r.json())
      .then(setPatients)
      .catch(() => {});
  }, [patientSearch]);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        patientId: parseInt(form.patientId),
        scheduledTime: form.scheduledTime || null,
        reason: form.reason || null,
        notes: form.notes || null,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError('Failed to create appointment'); return; }

    router.push(`/appointments/${data.id}`);
    router.refresh();
  }

  const inputClass = 'w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-xl border border-gray-200 p-6">
      {/* Patient */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
        <input
          className={inputClass + ' mb-2'}
          placeholder="Search patient name or ID..."
          value={patientSearch}
          onChange={(e) => setPatientSearch(e.target.value)}
        />
        <select
          required
          value={form.patientId}
          onChange={set('patientId')}
          className={inputClass}
        >
          <option value="">Select patient</option>
          {patients.map((p: any) => (
            <option key={p.id} value={p.id}>
              {p.name} — {p.patientId} {p.phone ? `(${p.phone})` : ''}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-400 mt-1">
          New patient?{' '}
          <a href="/patients/new" target="_blank" className="text-blue-600 hover:underline">Register first</a>
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select value={form.type} onChange={set('type')} className={inputClass}>
            <option value="scheduled">Scheduled Appointment</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">For walk-in patients, use <a href="/visits/new" className="text-blue-600 hover:underline">Record Visit</a> instead.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
          <input type="date" value={form.scheduledDate} onChange={set('scheduledDate')} required className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time (optional)</label>
          <input type="time" value={form.scheduledTime} onChange={set('scheduledTime')} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
          <input value={form.reason} onChange={set('reason')} className={inputClass} placeholder="Chief complaint or reason" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea value={form.notes} onChange={set('notes')} rows={2} className={inputClass} placeholder="Additional notes" />
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button type="button" onClick={() => router.back()} className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Creating...' : 'Create Appointment'}
        </button>
      </div>
    </form>
  );
}
