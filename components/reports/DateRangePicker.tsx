'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export function DateRangePicker() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const month = searchParams?.get('month');
  const fromParam = searchParams?.get('from');
  const toParam = searchParams?.get('to');

  const isAllTime = month === 'all';
  const isCustomRange = Boolean(fromParam && toParam);
  const isMonth = Boolean(month && month !== 'all');

  const currentMode = isAllTime ? 'all' : isCustomRange ? 'custom' : 'month';

  const [mode, setMode] = useState<'month' | 'custom' | 'all'>(currentMode);
  
  const todayStr = new Date().toISOString().slice(0, 10);
  const [from, setFrom] = useState(fromParam || todayStr);
  const [to, setTo] = useState(toParam || todayStr);

  const applyCustomRange = () => {
    if (!from || !to) return;
    const params = new URLSearchParams();
    params.set('from', from);
    params.set('to', to);
    router.push(`?${params.toString()}`);
  };

  const handleModeChange = (newMode: 'month' | 'custom' | 'all') => {
    setMode(newMode);
    if (newMode === 'all') {
      router.push(`?month=all`);
    } else if (newMode === 'month') {
      const current = new Date().toISOString().slice(0, 7);
      router.push(`?month=${current}`);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
      <label className="text-sm font-medium text-gray-700">Filter:</label>
      
      <select 
        value={mode} 
        onChange={(e) => handleModeChange(e.target.value as any)}
        className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-gray-50 py-1"
      >
        <option value="month">By Month</option>
        <option value="custom">Date Range</option>
        <option value="all">All Time</option>
      </select>

      {mode === 'month' && (
        <input 
          type="month" 
          value={isMonth ? (month || '') : new Date().toISOString().slice(0, 7)}
          onChange={(e) => {
            const val = e.target.value;
            if (val) router.push(`?month=${val}`);
          }}
          className="text-sm border-gray-300 rounded-md bg-transparent p-1 cursor-pointer"
        />
      )}

      {mode === 'custom' && (
        <div className="flex items-center gap-1 sm:gap-2 ml-1 sm:ml-2">
          <input 
            type="date" 
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="text-xs sm:text-sm border-gray-300 rounded-md bg-transparent p-1"
          />
          <span className="text-gray-500 text-xs sm:text-sm">to</span>
          <input 
            type="date" 
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="text-xs sm:text-sm border-gray-300 rounded-md bg-transparent p-1"
          />
          <button 
            onClick={applyCustomRange}
            className="ml-1 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
