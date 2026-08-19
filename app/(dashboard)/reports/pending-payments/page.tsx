'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useReport } from '@/hooks/useReports';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatINR } from '@/lib/utils/formatCurrency';
import { formatDate } from '@/lib/utils/formatDate';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import type { PendingPayment } from '@/types/report';

export default function PendingPaymentsPage() {
  const searchParams = useSearchParams();
  const month = searchParams?.get('month');
  const from = searchParams?.get('from');
  const to = searchParams?.get('to');
  
  const query = from && to ? `?from=${from}&to=${to}` : `?month=${month || 'all'}`;
  
  const { data, loading } = useReport<PendingPayment[]>(`/api/reports/pending-payments${query}`);

  const balanceTotal = data?.reduce((s, r) => s + parseFloat(r.procedureFeeBalance || '0'), 0) || 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <Link href="/reports" className="text-xs text-blue-600 hover:underline mb-1 block">← Reports</Link>
          <h1 className="text-2xl font-bold text-gray-900">Pending Payments</h1>
          {data && <p className="text-sm text-gray-500">{data.length} visits with outstanding balance</p>}
        </div>
        <div className="flex gap-2 items-center self-start sm:self-auto flex-wrap">
          <DateRangePicker />
          <Link href={`/api/pdf/report?type=pending-payments${query.replace('?', '&')}`} target="_blank"
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 bg-white shrink-0">
            🖨 Export
          </Link>
        </div>
      </div>

      {/* Totals */}
      {data && data.length > 0 && (
        <div className="grid grid-cols-1 mb-6">
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <p className="text-xs text-gray-500">Total Pending Balance</p>
            <p className="text-2xl font-bold text-orange-700">{formatINR(balanceTotal)}</p>
          </div>
        </div>
      )}

      {loading ? <LoadingSpinner /> : (!data || data.length === 0) ? (
        <EmptyState icon="✅" title="No pending payments" description="All visits have been settled." />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Patient', 'Phone', 'Visit Date', 'Total Amount', 'Balance Due', 'Action'].map((h: any) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-600 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((r: any) => (
                <tr key={r.visitId} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/patients/${r.patientId}`} className="font-medium text-blue-600 hover:underline">
                      {r.patientName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.patientPhone || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(r.visitDate)}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{formatINR(parseFloat(r.totalAmount))}</td>
                  <td className="px-4 py-3 font-bold text-red-700">{formatINR(parseFloat(r.procedureFeeBalance))}</td>
                  <td className="px-4 py-3">
                    <Link href={`/visits/${r.visitId}`} className="text-xs text-blue-600 hover:underline">View Visit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
