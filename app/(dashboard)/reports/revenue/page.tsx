'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatINR } from '@/lib/utils/formatCurrency';
import { formatDate } from '@/lib/utils/formatDate';
import { DateRangePicker } from '@/components/reports/DateRangePicker';

export default function RevenueDetailsPage() {
  const searchParams = useSearchParams();
  const month = searchParams?.get('month');
  const from = searchParams?.get('from');
  const to = searchParams?.get('to');
  
  const query = from && to ? `?from=${from}&to=${to}` : `?month=${month || new Date().toISOString().slice(0, 7)}`;

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const res = await fetch(`/api/reports/revenue-details${query}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
      setLoading(false);
    }
    fetchData();
  }, [query]);

  const totalBilled = data?.reduce((acc, row) => acc + Number(row.totalAmount || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader 
          title="Total Monthly Revenue" 
          description="Detailed breakdown of all treatments billed in this period."
        />
        <DateRangePicker />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex justify-between items-center">
          <span className="font-medium text-slate-300">Total Billed</span>
          <span className="text-2xl font-bold">{formatINR(totalBilled)}</span>
        </div>
        
        {loading ? (
          <div className="p-8 flex justify-center"><LoadingSpinner /></div>
        ) : (!data || data.length === 0) ? (
          <div className="p-8 text-center text-gray-500">No revenue data found for this period.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3 text-right">Consultation</th>
                  <th className="px-4 py-3 text-right">Procedure</th>
                  <th className="px-4 py-3 text-right">Medicine</th>
                  <th className="px-4 py-3 text-right font-bold text-gray-900">Total Billed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((row) => (
                  <tr key={row.visitId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">
                      <Link href={`/visits/${row.visitId}`} className="hover:underline text-blue-600">
                        {formatDate(row.visitDate)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/patients/${row.patientId}`} className="font-medium text-gray-900 hover:underline">
                        {row.patientName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">{formatINR(Number(row.consultationFee || 0))}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{formatINR(Number(row.procedureFeeTotal || 0))}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{formatINR(Number(row.medicineCharge || 0))}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">{formatINR(Number(row.totalAmount || 0))}</td>
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
