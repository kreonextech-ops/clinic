'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ patients: any[]; appointments: any[]; inventory: any[] }>({
    patients: [],
    appointments: [],
    inventory: [],
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Listen for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch search results
  useEffect(() => {
    if (!query.trim()) {
      setResults({ patients: [], appointments: [], inventory: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [pRes, aRes, iRes] = await Promise.all([
          fetch(`/api/patients?search=${encodeURIComponent(query)}`).then((r) => r.json()),
          fetch('/api/appointments').then((r) => r.json()),
          fetch('/api/inventory').then((r) => r.json()),
        ]);

        const filteredAppts = Array.isArray(aRes)
          ? aRes.filter((a) => a.patient?.name?.toLowerCase().includes(query.toLowerCase()))
          : [];
        const filteredInv = Array.isArray(iRes)
          ? iRes.filter((i) => i.name?.toLowerCase().includes(query.toLowerCase()))
          : [];

        setResults({
          patients: Array.isArray(pRes) ? pRes.slice(0, 5) : [],
          appointments: filteredAppts.slice(0, 5),
          inventory: filteredInv.slice(0, 5),
        });
      } catch (err) {
        // Silent error
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!open) return null;

  const navigateTo = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white">
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800">
          <span className="text-xl mr-3">🔍</span>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients, appointments, stock items... (ESC to close)"
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <kbd className="text-[10px] font-bold px-2 py-1 bg-slate-800 border border-slate-700 text-slate-400 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {loading && <p className="text-xs text-slate-400 text-center py-4">Searching database...</p>}

          {!loading && !query && (
            <div className="text-center py-6 text-slate-500 text-xs">
              Type a patient name, phone, or item to search...
            </div>
          )}

          {/* Patients Section */}
          {results.patients.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Patients</p>
              <div className="space-y-1">
                {results.patients.map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => navigateTo(`/patients/${p.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800 text-left text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 font-bold">👤</span>
                      <span className="font-bold text-slate-200">{p.name}</span>
                      <span className="text-[10px] text-slate-400">({p.patientId})</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{p.phone || 'No phone'}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Appointments Section */}
          {results.appointments.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Appointments</p>
              <div className="space-y-1">
                {results.appointments.map((a: any) => (
                  <button
                    key={a.id}
                    onClick={() => navigateTo(`/appointments/${a.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800 text-left text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold">📅</span>
                      <span className="font-bold text-slate-200">{a.patient?.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{a.scheduledDate}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Inventory Section */}
          {results.inventory.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Inventory Stock</p>
              <div className="space-y-1">
                {results.inventory.map((i: any) => (
                  <button
                    key={i.id}
                    onClick={() => navigateTo('/inventory')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800 text-left text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 font-bold">📦</span>
                      <span className="font-bold text-slate-200">{i.name}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-amber-400">{i.quantity} {i.unit}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
