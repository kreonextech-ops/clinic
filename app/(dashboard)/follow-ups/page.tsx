'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useFollowUps } from '@/hooks/useFollowUps';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { formatDate } from '@/lib/utils/formatDate';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'overdue', label: '🔴 Overdue' },
  { value: 'pending', label: '🟡 Pending' },
  { value: 'completed', label: '🟢 Completed' },
];

export default function FollowUpsPage() {
  const [activeStatus, setActiveStatus] = useState('');
  const { followUps, loading, refresh } = useFollowUps(activeStatus || undefined);
  const [markingId, setMarkingId] = useState<number | null>(null);

  async function markComplete(id: number) {
    await fetch(`/api/follow-ups/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    });
    refresh();
  }

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    completed: 'bg-green-100 text-green-800 border-green-300',
    overdue: 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Follow-ups</h1>
          <p className="text-sm text-gray-500">{followUps.length} records</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {STATUS_TABS.map((tab: any) => (
          <button key={tab.value} onClick={() => setActiveStatus(tab.value)}
            className={`px-4 py-2 text-sm rounded-full border font-medium transition-colors ${
              activeStatus === tab.value ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : followUps.length === 0 ? (
        <EmptyState icon="🔔" title="No follow-ups" description="Follow-up reminders are created when recording visits." />
      ) : (
        <div className="space-y-2">
          {followUps.map((f: any) => (
            <div key={f.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href={`/patients/${f.patientId}`} className="text-sm font-semibold text-blue-600 hover:underline">
                    {f.patient.name}
                  </Link>
                  <span className="text-xs text-gray-400">{f.patient.patientId}</span>
                  {f.patient.phone && <span className="text-xs text-gray-400">📞 {f.patient.phone}</span>}
                </div>
                <p className="text-sm text-gray-800 mt-0.5">{f.treatmentName}</p>
                <p className="text-xs text-gray-500 mt-0.5">Due: {formatDate(f.dueDate)}</p>
                {f.notes && <p className="text-xs text-gray-400 italic">{f.notes}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-2 py-1 rounded-full border font-medium capitalize ${statusColor[f.status]}`}>
                  {f.status}
                </span>
                {f.status !== 'completed' && (
                  <button onClick={() => setMarkingId(f.id)}
                    className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    ✓ Done
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={markingId !== null}
        title="Mark as Completed"
        description="Mark this follow-up as completed?"
        confirmLabel="Mark Complete"
        onConfirm={() => { markComplete(markingId!); setMarkingId(null); }}
        onCancel={() => setMarkingId(null)}
      />
    </div>
  );
}
