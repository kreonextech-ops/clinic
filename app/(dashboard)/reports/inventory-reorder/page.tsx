'use client';

import Link from 'next/link';
import { useReport } from '@/hooks/useReports';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import type { InventoryReorderItem } from '@/types/report';

export default function InventoryReorderPage() {
  const { data, loading } = useReport<InventoryReorderItem[]>('/api/reports/inventory-reorder');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/reports" className="text-xs text-blue-600 hover:underline mb-1 block">← Reports</Link>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Reorder List</h1>
          {data && <p className="text-sm text-gray-500">{data.length} item{data.length !== 1 ? 's' : ''} need restocking</p>}
        </div>
        <Link href="/inventory" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Manage Inventory
        </Link>
      </div>

      {loading ? <LoadingSpinner /> : !data?.length ? (
        <EmptyState icon="✅" title="All stock levels OK" description="No items need restocking right now." />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Item Name', 'Current Stock', 'Min. Threshold', 'Need to Order', 'Unit'].map((h: any) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-600 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((r: any) => (
                <tr key={r.id} className="border-b border-gray-100 last:border-0 bg-orange-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                  <td className="px-4 py-3 font-bold text-orange-700">{parseFloat(r.quantity).toFixed(1)}</td>
                  <td className="px-4 py-3 text-gray-600">{r.lowStockThreshold}</td>
                  <td className="px-4 py-3 font-bold text-red-700">+{r.deficit.toFixed(1)}</td>
                  <td className="px-4 py-3 text-gray-500">{r.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
