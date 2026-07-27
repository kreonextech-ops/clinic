import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { patients, visits } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { formatDate } from '@/lib/utils/formatDate';
import { formatINR } from '@/lib/utils/formatCurrency';
import { EmptyState } from '@/components/shared/EmptyState';

export default async function PatientVisitsPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  let patient: any = null;
  let allVisits: any[] = [];

  try {
    const [p] = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
    patient = p;
    if (patient) {
      allVisits = await db.query.visits.findMany({
        where: eq(visits.patientId, id),
        orderBy: [desc(visits.visitDate)],
        with: { treatments: true, earnings: true, followUps: true },
      });
    }
  } catch (err) {
    console.error('Failed to query patient visits:', err);
  }

  if (!patient) notFound();

  const tabs = [
    { href: `/patients/${id}`, label: 'Overview' },
    { href: `/patients/${id}/visits`, label: 'Visits', active: true },
    { href: `/patients/${id}/files`, label: 'Files' },
    { href: `/patients/${id}/billing`, label: 'Billing' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
          <p className="text-sm text-gray-500">{patient.patientId}</p>
        </div>
        <Link href={`/visits/new?patientId=${id}`} className="bg-teal-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700">
          + Record Visit
        </Link>
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map((tab: any) => (
          <Link key={tab.href} href={tab.href}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${tab.active ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {tab.label}
          </Link>
        ))}
      </div>

      {allVisits.length === 0 ? (
        <EmptyState icon="🩺" title="No visits recorded" description="Record the first visit for this patient." />
      ) : (
        <div className="space-y-3">
          {allVisits.map((v: any) => (
            <Link key={v.id} href={`/visits/${v.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(v.visitDate)}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {v.treatments.map((t: any) => (
                      <span key={t.id} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{t.treatmentName}</span>
                    ))}
                    {v.treatments.length === 0 && <span className="text-xs text-gray-400">No treatments</span>}
                  </div>
                  {v.complaints && <p className="text-xs text-gray-500 mt-1 line-clamp-1">Complaints: {v.complaints}</p>}
                  {v.followUps.length > 0 && (
                    <p className="text-xs text-orange-600 mt-1">🔔 {v.followUps.length} follow-up(s)</p>
                  )}
                </div>
                {v.earnings && (
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-900">{formatINR(parseFloat(v.earnings.totalAmount || '0'))}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      v.earnings.paymentStatus === 'settled' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>{v.earnings.paymentStatus}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
