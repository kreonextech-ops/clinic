import { formatINR } from '@/lib/utils/formatCurrency';
import Link from 'next/link';

interface EarningsSummaryProps {
  monthSettled: number;
  monthPending: number;
  monthExpenses: number;
}

export function EarningsSummary({ monthSettled, monthPending, monthExpenses }: EarningsSummaryProps) {
  const monthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const profit = monthSettled - monthExpenses;

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 p-5 lg:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            <Link href="/reports/earnings" className="hover:text-blue-600 hover:underline">Financial Overview</Link>
          </h3>
          <p className="text-xs font-medium text-slate-500">Performance for {monthName}</p>
        </div>
        <Link href="/reports/earnings" className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-full border border-blue-200/60 transition-colors self-start sm:self-auto">
          View All Months →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link href={`/reports/settled?month=${new Date().toISOString().slice(0, 7)}`} className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 hover:-translate-y-0.5 transition-all block">
          <p className="text-xs font-bold text-emerald-700">Settled (Revenue)</p>
          <p className="text-lg sm:text-2xl font-extrabold text-emerald-800 mt-1">{formatINR(monthSettled)}</p>
        </Link>

        <Link href={`/reports/pending-payments?month=${new Date().toISOString().slice(0, 7)}`} className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 hover:-translate-y-0.5 transition-all block">
          <p className="text-xs font-bold text-amber-700">Pending</p>
          <p className="text-lg sm:text-2xl font-extrabold text-amber-800 mt-1">{formatINR(monthPending)}</p>
        </Link>

        <Link href="/expenses" className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 hover:-translate-y-0.5 transition-all block">
          <p className="text-xs font-bold text-rose-700">Expenses</p>
          <p className="text-lg sm:text-2xl font-extrabold text-rose-800 mt-1">{formatINR(monthExpenses)}</p>
        </Link>

        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 block">
          <p className="text-xs font-bold text-blue-700">Profit</p>
          <p className={`text-lg sm:text-2xl font-extrabold mt-1 ${profit >= 0 ? 'text-blue-800' : 'text-rose-600'}`}>{formatINR(profit)}</p>
        </div>
      </div>
    </div>
  );
}
