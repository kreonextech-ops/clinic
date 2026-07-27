'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useReport } from '@/hooks/useReports';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import type { TreatmentFrequency } from '@/types/report';

const COLORS = ['#2563eb','#0d9488','#8b5cf6','#f59e0b','#ef4444','#06b6d4','#84cc16','#f97316','#ec4899','#6366f1'];

export default function TreatmentsReportPage() {
  const [months, setMonths] = useState(12);
  const { data, loading } = useReport<TreatmentFrequency[]>(`/api/reports/treatments?months=${months}`);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/reports" className="text-xs text-blue-600 hover:underline mb-1 block">← Reports</Link>
          <h1 className="text-2xl font-bold text-gray-900">Treatments Report</h1>
        </div>
        <select value={months} onChange={(e) => setMonths(parseInt(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
          <option value={3}>Last 3 months</option>
          <option value={6}>Last 6 months</option>
          <option value={12}>Last 12 months</option>
          <option value={24}>Last 2 years</option>
        </select>
      </div>

      {loading ? <LoadingSpinner /> : !data?.length ? (
        <p className="text-center text-gray-400 py-12">No treatment data for this period.</p>
      ) : (
        <div className="space-y-6">
          {/* Bar chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Top 10 Treatments</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.slice(0, 10)} layout="vertical" margin={{ left: 130, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="treatmentName" type="category" tick={{ fontSize: 11 }} width={125} />
                <Tooltip />
                <Bar dataKey="count" name="Count" radius={[0, 4, 4, 0]}>
                  {data.slice(0, 10).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['#', 'Treatment', 'Count', 'Share', 'Bar'].map((h: any) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-600 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((r, i) => (
                  <tr key={r.treatmentName} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{r.treatmentName}</td>
                    <td className="px-4 py-3 text-gray-700 font-bold">{r.count}</td>
                    <td className="px-4 py-3 text-gray-500">{r.percentage}%</td>
                    <td className="px-4 py-3 w-40">
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${r.percentage}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
