'use client';

import { useState } from 'react';

interface ToothChartProps {
  selectedTeeth?: number[];
  onChange?: (teeth: number[]) => void;
}

const UPPER_TEETH = Array.from({ length: 16 }, (_, i) => i + 1); // 1 to 16
const LOWER_TEETH = Array.from({ length: 16 }, (_, i) => 32 - i); // 32 to 17

export function ToothChart({ selectedTeeth = [], onChange }: ToothChartProps) {
  const [selected, setSelected] = useState<number[]>(selectedTeeth);

  const toggleTooth = (num: number) => {
    const updated = selected.includes(num)
      ? selected.filter((t) => t !== num)
      : [...selected, num].sort((a, b) => a - b);
    
    setSelected(updated);
    if (onChange) onChange(updated);
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 text-white shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <span>🦷</span> Interactive 32-Tooth Dental Arch Diagram
          </h4>
          <p className="text-xs text-slate-400">Click individual teeth to tag for procedures & treatments</p>
        </div>
        {selected.length > 0 && (
          <span className="text-xs font-extrabold px-3 py-1 bg-blue-600/90 text-white rounded-full border border-blue-400/40">
            {selected.length} Teeth Selected: #{selected.join(', #')}
          </span>
        )}
      </div>

      {/* Arch Grid */}
      <div className="space-y-4">
        {/* Upper Arch */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">Upper Arch (Maxillary 1 - 16)</p>
          <div className="flex justify-center gap-1.5 flex-wrap">
            {UPPER_TEETH.map((t) => {
              const active = selected.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTooth(t)}
                  className={`w-8 h-10 rounded-lg text-xs font-bold transition-all duration-200 flex flex-col items-center justify-center border ${
                    active
                      ? 'bg-gradient-to-b from-blue-500 to-indigo-600 text-white border-blue-300 shadow-lg shadow-blue-500/40 scale-105'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span className="text-[9px] opacity-70">T</span>
                  <span>{t}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Arch Divider */}
        <div className="border-b border-slate-800/80 my-2" />

        {/* Lower Arch */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">Lower Arch (Mandibular 17 - 32)</p>
          <div className="flex justify-center gap-1.5 flex-wrap">
            {LOWER_TEETH.map((t) => {
              const active = selected.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTooth(t)}
                  className={`w-8 h-10 rounded-lg text-xs font-bold transition-all duration-200 flex flex-col items-center justify-center border ${
                    active
                      ? 'bg-gradient-to-b from-blue-500 to-indigo-600 text-white border-blue-300 shadow-lg shadow-blue-500/40 scale-105'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span>{t}</span>
                  <span className="text-[9px] opacity-70">T</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
