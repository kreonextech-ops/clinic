'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export function MonthPicker({ showAllTime = false, currentMonth }: { showAllTime?: boolean, currentMonth: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleMonthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (val) {
      params.set('month', val);
    } else {
      params.delete('month');
    }
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  const handleAllTimeClick = useCallback(() => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('month', 'all');
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
      <label htmlFor="month-picker" className="text-sm font-medium text-gray-700">Filter:</label>
      
      {currentMonth === 'all' && showAllTime ? (
        <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">All Time</span>
      ) : (
        <input 
          id="month-picker"
          type="month" 
          value={currentMonth !== 'all' ? currentMonth : ''}
          onChange={handleMonthChange}
          className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-transparent p-1 cursor-pointer"
        />
      )}

      {showAllTime && currentMonth !== 'all' && (
         <button 
           onClick={handleAllTimeClick} 
           className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline px-2 py-1 bg-blue-50 rounded"
         >
           Show All Time
         </button>
      )}

      {showAllTime && currentMonth === 'all' && (
         <button 
           onClick={() => {
             const params = new URLSearchParams(searchParams?.toString() || '');
             params.set('month', new Date().toISOString().slice(0, 7));
             router.push(`?${params.toString()}`);
           }} 
           className="text-xs font-medium text-gray-500 hover:text-gray-700 hover:underline px-2 py-1"
         >
           Pick Month
         </button>
      )}
    </div>
  );
}
