import { formatINR } from '@/lib/utils/formatCurrency';
import Link from 'next/link';

interface EarningsSummaryProps {
  monthTotal: number;
  monthSettled: number;
  monthPending: number;
  todayTotal: number;
}

export function EarningsSummary({ monthTotal, monthSettled, monthPending, todayTotal }: EarningsSummaryProps) {
  const monthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 p-5 lg:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            <Link href="/reports/earnings" className="hover:text-blue-600 hover:underline">Financial Overview</Link>
          </h3>
          <p className="text-xs font-medium text-slate-500">Revenue performance for {monthName}</p>
        </div>
        <Link href="/reports/earnings" className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-full border border-blue-200/60 transition-colors self-start sm:self-auto">
          View All Months →
        </Link>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <Link href={`/reports/revenue?month=${new Date().toISOString().slice(0, 7)}`} className="sm:col-span-2 p-4 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all block">
          <p className="text-xs font-semibold text-slate-400">Total Monthly Revenue</p>
          <p className="text-3xl font-extrabold text-white mt-1 tracking-tight">
            {formatINR(monthTotal)}
          </p>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800 text-xs text-slate-300">
            <span>Today&apos;s Revenue:</span>
            <span className="font-bold text-emerald-400">{formatINR(todayTotal)}</span>
          </div>
        </Link>

        <Link href={`/reports/settled?month=${new Date().toISOString().slice(0, 7)}`} className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 hover:-translate-y-0.5 transition-all block">
          <p className="text-xs font-bold text-emerald-700">Settled Amount</p>
          <p className="text-2xl font-extrabold text-emerald-800 mt-1">{formatINR(monthSettled)}</p>
          <p className="text-[11px] font-medium text-emerald-600/80 mt-1">Received in account</p>
        </Link>

        <Link href={`/reports/pending-payments?month=${new Date().toISOString().slice(0, 7)}`} className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 hover:-translate-y-0.5 transition-all block">
          <p className="text-xs font-bold text-amber-700">Pending Balances</p>
          <p className="text-2xl font-extrabold text-amber-800 mt-1">{formatINR(monthPending)}</p>
          <p className="text-[11px] font-medium text-amber-600/80 mt-1">Outstanding payments</p>
        </Link>
      </div>
    </div>
  );
}
