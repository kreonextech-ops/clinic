'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatINR } from '@/lib/utils/formatCurrency';
import { formatDate } from '@/lib/utils/formatDate';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { useReport } from '@/hooks/useReports';

export default function SettledDetailsPage() {
  const searchParams = useSearchParams();
  const month = searchParams?.get('month');
  const from = searchParams?.get('from');
  const to = searchParams?.get('to');
  
  const query = from && to ? `?from=${from}&to=${to}` : `?month=${month || 'all'}`;

  const { data, loading } = useReport<any[]>(`/api/reports/settled-details${query}`);

  const totalSettled = data?.reduce((acc, row) => acc + Number(row.amount || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/reports" className="text-xs text-blue-600 hover:underline mb-1 block">← Reports</Link>
          <h1 className="text-2xl font-bold text-gray-900">Settled Payments</h1>
          {data && <p className="text-sm text-gray-500">{data.length} payments received</p>}
        </div>
        <div className="flex gap-2 items-center self-start sm:self-auto flex-wrap">
          <DateRangePicker />
          <Link href={`/api/pdf/report?type=settled${query.replace('?', '&')}`} target="_blank"
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 bg-white shrink-0">
            🖨 Export
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-emerald-50 text-emerald-900 border-b border-emerald-100 flex justify-between items-center">
          <span className="font-medium">Total Received</span>
          <span className="text-2xl font-bold">{formatINR(totalSettled)}</span>
        </div>
        
        {loading ? (
          <div className="p-8 flex justify-center"><LoadingSpinner /></div>
        ) : (!data || data.length === 0) ? (
          <div className="p-8 text-center text-gray-500">No payments received during this period.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Payment Date</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Notes</th>
                  <th className="px-4 py-3 text-right">Consultation Fee</th>
                  <th className="px-4 py-3 text-right">Related Visit</th>
                  <th className="px-4 py-3 text-right font-bold text-gray-900">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((row) => (
                  <tr key={row.paymentId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900 font-medium">{formatDate(row.paymentDate)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/patients/${row.patientId}`} className="font-medium text-gray-900 hover:underline">
                        {row.patientName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500 capitalize">{row.paymentMethod.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-gray-500 truncate max-w-[200px]">{row.notes || '-'}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{formatINR(Number(row.consultationFee || 0))}</td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      <Link href={`/visits/${row.visitId}`} className="hover:underline text-blue-600">
                        {formatDate(row.visitDate)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-700">+{formatINR(Number(row.amount || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
