'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Patient } from '@/types/patient';

interface PatientFormProps {
  initial?: Partial<Patient>;
  patientId?: number;
}

export function PatientForm({ initial, patientId }: PatientFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initial?.name || '',
    age: initial?.age?.toString() || '',
    gender: initial?.gender || '',
    phone: initial?.phone || '',
    address: initial?.address || '',
    medicalHistory: initial?.medicalHistory || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      name: form.name,
      age: form.age ? parseInt(form.age) : null,
      gender: form.gender || null,
      phone: form.phone || null,
      address: form.address || null,
      medicalHistory: form.medicalHistory || null,
    };

    const url = patientId ? `/api/patients/${patientId}` : '/api/patients';
    const method = patientId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError('Failed to save patient. Please check all fields.');
      return;
    }

    router.push(`/patients/${data.id}`);
    router.refresh();
  }

  const inputClass = 'w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-xl border border-gray-200 p-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input value={form.name} onChange={set('name')} required className={inputClass} placeholder="Patient full name" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
          <input type="number" value={form.age} onChange={set('age')} min={0} max={150} className={inputClass} placeholder="Age" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select value={form.gender} onChange={set('gender')} className={inputClass}>
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input value={form.phone} onChange={set('phone')} className={inputClass} placeholder="+91 XXXXX XXXXX" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input value={form.address} onChange={set('address')} className={inputClass} placeholder="Address (optional)" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Medical History</label>
          <textarea
            value={form.medicalHistory}
            onChange={set('medicalHistory')}
            rows={3}
            className={inputClass}
            placeholder="Allergies, existing conditions, medications..."
          />
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : patientId ? 'Update Patient' : 'Register Patient'}
        </button>
      </div>
    </form>
  );
}
