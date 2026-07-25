import { formatINR } from '@/lib/utils/formatCurrency';

interface EarningsSummaryProps {
  monthTotal: number;
  monthSettled: number;
  monthPending: number;
  todayTotal: number;
}

export function EarningsSummary({ monthTotal, monthSettled, monthPending, todayTotal }: EarningsSummaryProps) {
  const month = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-900 mb-1">Earnings — {month}</h3>
      <p className="text-3xl font-bold text-blue-600 mt-2">{formatINR(monthTotal)}</p>
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Settled</p>
          <p className="text-base font-bold text-green-700">{formatINR(monthSettled)}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-base font-bold text-orange-700">{formatINR(monthPending)}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 col-span-2">
          <p className="text-xs text-gray-500">Today&apos;s earnings</p>
          <p className="text-base font-bold text-blue-700">{formatINR(todayTotal)}</p>
        </div>
      </div>
    </div>
  );
}
