'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useInventory } from '@/hooks/useInventory';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { INVENTORY_UNITS } from '@/lib/constants/units';

export default function InventoryPage() {
  const { items, loading, refresh } = useInventory();
  const [editItem, setEditItem] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterLow, setFilterLow] = useState(false);

  function openEdit(item: any) {
    setEditItem(item);
    setEditForm({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      lowStockThreshold: item.lowStockThreshold,
      notes: item.notes || '',
    });
  }

  async function saveEdit() {
    if (!editItem) return;
    setSaving(true);
    await fetch(`/api/inventory/${editItem.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editForm.name,
        quantity: parseFloat(editForm.quantity),
        unit: editForm.unit,
        lowStockThreshold: parseFloat(editForm.lowStockThreshold),
        notes: editForm.notes || null,
      }),
    });
    setSaving(false);
    setEditItem(null);
    refresh();
  }

  async function deleteItem() {
    if (!deleteId) return;
    await fetch(`/api/inventory/${deleteId}`, { method: 'DELETE' });
    setDeleteId(null);
    refresh();
  }

  const displayed = filterLow ? items.filter((i) => i.isLowStock) : items;
  const lowCount = items.filter((i) => i.isLowStock).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500">{items.length} items · {lowCount} low stock</p>
        </div>
        <Link href="/inventory/new" className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700">
          + Add Item
        </Link>
      </div>

      {/* Filter toggle */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setFilterLow(false)}
          className={`px-3 py-1.5 text-xs rounded-full border font-medium ${!filterLow ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600'}`}>
          All Items
        </button>
        <button onClick={() => setFilterLow(true)}
          className={`px-3 py-1.5 text-xs rounded-full border font-medium ${filterLow ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-300 text-gray-600'}`}>
          ⚠ Low Stock ({lowCount})
        </button>
      </div>

      {loading ? <LoadingSpinner /> : displayed.length === 0 ? (
        <EmptyState icon="📦" title={filterLow ? 'No low stock items' : 'No inventory items'} description={filterLow ? 'All stock levels are good!' : 'Add your first inventory item.'} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Item Name', 'Stock', 'Unit', 'Threshold', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-600 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map((item) => (
                <tr key={item.id} className={`border-b border-gray-100 last:border-0 ${item.isLowStock ? 'bg-orange-50' : ''}`}>
                  <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${item.isLowStock ? 'text-orange-600' : 'text-gray-900'}`}>
                      {parseFloat(item.quantity).toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{item.unit}</td>
                  <td className="px-4 py-3 text-gray-500">{item.lowStockThreshold}</td>
                  <td className="px-4 py-3">
                    {item.isLowStock ? (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">⚠ Low</span>
                    ) : (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">OK</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(item)} className="text-xs text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => setDeleteId(item.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditItem(null)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit: {editItem.name}</h3>
            <div className="space-y-3">
              {[
                { label: 'Item Name', key: 'name', type: 'text' },
                { label: 'Current Quantity', key: 'quantity', type: 'number' },
                { label: 'Low Stock Threshold', key: 'lowStockThreshold', type: 'number' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                  <input type={f.type} value={editForm[f.key] || ''} min="0"
                    onChange={(e) => setEditForm((p) => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
                <select value={editForm.unit} onChange={(e) => setEditForm((p) => ({ ...p, unit: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  {INVENTORY_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <input value={editForm.notes} onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Optional" />
              </div>
            </div>
            <div className="flex gap-3 mt-5 justify-end">
              <button onClick={() => setEditItem(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={saveEdit} disabled={saving} className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Item"
        description="Delete this inventory item? This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={deleteItem}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
