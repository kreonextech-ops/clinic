import Link from 'next/link';
import { db } from '@/lib/db';
import { visits } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { formatDate } from '@/lib/utils/formatDate';
import { formatINR } from '@/lib/utils/formatCurrency';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';

export const dynamic = 'force-dynamic';

export default async function VisitsPage() {
  const list = await db.query.visits.findMany({
    orderBy: [desc(visits.visitDate)],
    with: { patient: true, treatments: true, earnings: true },
    limit: 200,
  });

  return (
    <div>
      <PageHeader
        title="Visits"
        description={`${list.length} visit record${list.length !== 1 ? 's' : ''}`}
        actions={
          <div className="flex gap-2">
            <Link
              href="/visits/new"
              className="bg-teal-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700"
            >
              🚶 Walk-in / Record Visit
            </Link>
          </div>
        }
      />

      {/* Info banner */}
      <div className="mb-5 p-3 bg-teal-50 border border-teal-200 rounded-lg text-sm text-teal-800">
        <strong>Walk-in patients:</strong> Use the <strong>Walk-in / Record Visit</strong> button above to record a visit directly.
        For scheduled patients, go to <Link href="/appointments" className="underline">Appointments</Link> and convert to a visit from there.
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon="🩺"
          title="No visits recorded"
          description="Use the Walk-in / Record Visit button above to record a patient visit."
          action={
            <Link href="/visits/new" className="bg-teal-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700">
              🚶 Record Visit
            </Link>
          }
        />
      ) : (
        <div className="space-y-2">
          {list.map((v) => (
            <Link
              key={v.id}
              href={`/visits/${v.id}`}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-teal-700">{v.patient.name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{v.patient.name}</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {v.treatments.slice(0, 3).map((t) => (
                    <span key={t.id} className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">
                      {t.treatmentName}
                    </span>
                  ))}
                  {v.treatments.length > 3 && (
                    <span className="text-xs text-gray-400">+{v.treatments.length - 3} more</span>
                  )}
                  {v.treatments.length === 0 && (
                    <span className="text-xs text-gray-400">No treatments</span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-medium text-gray-700">{formatDate(v.visitDate)}</p>
                {v.earnings && (
                  <>
                    <p className="text-sm font-bold text-gray-900">
                      {formatINR(parseFloat(v.earnings.totalAmount || '0'))}
                    </p>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full ${
                        v.earnings.paymentStatus === 'settled'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {v.earnings.paymentStatus}
                    </span>
                  </>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
