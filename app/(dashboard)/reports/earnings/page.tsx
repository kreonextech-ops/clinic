'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useReport } from '@/hooks/useReports';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatINR } from '@/lib/utils/formatCurrency';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { MonthlyEarning } from '@/types/report';

export default function EarningsReportPage() {
  const [months, setMonths] = useState(12);
  const { data, loading } = useReport<MonthlyEarning[]>(`/api/reports/earnings?months=${months}`);

  const totals = data?.reduce(
    (acc, r) => ({
      total: acc.total + Number(r.total),
      settled: acc.settled + Number(r.settled),
      pending: acc.pending + Number(r.pending),
    }),
    { total: 0, settled: 0, pending: 0 }
  ) || { total: 0, settled: 0, pending: 0 };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/reports" className="text-xs text-blue-600 hover:underline mb-1 block">← Reports</Link>
          <h1 className="text-2xl font-bold text-gray-900">Earnings Report</h1>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Period:</label>
          <select value={months} onChange={(e) => setMonths(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value={3}>Last 3 months</option>
            <option value={6}>Last 6 months</option>
            <option value={12}>Last 12 months</option>
            <option value={24}>Last 2 years</option>
          </select>
          <Link href={`/api/pdf/report?type=earnings&months=${months}`} target="_blank"
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            🖨 Export PDF
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Revenue', value: totals.total, color: 'blue' },
          { label: 'Settled', value: totals.settled, color: 'green' },
          { label: 'Pending', value: totals.pending, color: 'orange' },
        ].map((s) => (
          <div key={s.label} className={`bg-white rounded-xl border p-4 ${s.color === 'green' ? 'border-green-200' : s.color === 'orange' ? 'border-orange-200' : 'border-gray-200'}`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.color === 'green' ? 'text-green-700' : s.color === 'orange' ? 'text-orange-700' : 'text-blue-700'}`}>
              {formatINR(s.value)}
            </p>
          </div>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : !data?.length ? (
        <p className="text-center text-gray-400 py-12">No earnings data for this period.</p>
      ) : (
        <>
          {/* Bar chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Monthly Revenue</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => formatINR(value)} />
                <Legend />
                <Bar dataKey="consultation" name="Consultation" fill="#3b82f6" stackId="a" radius={[0,0,0,0]} />
                <Bar dataKey="procedure" name="Procedure" fill="#0d9488" stackId="a" />
                <Bar dataKey="medicine" name="Medicine" fill="#8b5cf6" stackId="a" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Month', 'Consultation', 'Procedure', 'Medicine', 'Total', 'Settled', 'Pending'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-600 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...data].reverse().map((r) => (
                  <tr key={r.month} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{r.label}</td>
                    <td className="px-4 py-3 text-gray-700">{formatINR(Number(r.consultation))}</td>
                    <td className="px-4 py-3 text-gray-700">{formatINR(Number(r.procedure))}</td>
                    <td className="px-4 py-3 text-gray-700">{formatINR(Number(r.medicine))}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">{formatINR(Number(r.total))}</td>
                    <td className="px-4 py-3 text-green-700 font-medium">{formatINR(Number(r.settled))}</td>
                    <td className="px-4 py-3 text-orange-700 font-medium">{formatINR(Number(r.pending))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
