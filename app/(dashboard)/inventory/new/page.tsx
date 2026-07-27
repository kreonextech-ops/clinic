'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { INVENTORY_UNITS } from '@/lib/constants/units';

export default function NewInventoryPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', quantity: '0', unit: 'piece', lowStockThreshold: '5', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, quantity: parseFloat(form.quantity), lowStockThreshold: parseFloat(form.lowStockThreshold) }),
    });
    setLoading(false);
    if (!res.ok) { setError('Failed to add item'); return; }
    router.push('/inventory');
    router.refresh();
  }

  const inputClass = 'w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="max-w-lg">
      <PageHeader title="Add Inventory Item" />
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
          <input value={form.name} onChange={set('name')} required className={inputClass} placeholder="e.g. Dental Gloves" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Initial Quantity</label>
            <input type="number" min="0" step="0.01" value={form.quantity} onChange={set('quantity')} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <select value={form.unit} onChange={set('unit')} className={inputClass}>
              {INVENTORY_UNITS.map((u: any) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert at</label>
            <input type="number" min="0" step="0.01" value={form.lowStockThreshold} onChange={set('lowStockThreshold')} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
          <textarea value={form.notes} onChange={set('notes')} rows={2} className={inputClass} placeholder="Brand, supplier, etc." />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()} className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Adding...' : 'Add to Inventory'}
          </button>
        </div>
      </form>
    </div>
  );
}
