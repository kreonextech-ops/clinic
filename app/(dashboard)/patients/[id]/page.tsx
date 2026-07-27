import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { patients, visits, earnings, followUps } from '@/lib/db/schema';
import { eq, desc, sql, and, eq as drizzleEq } from 'drizzle-orm';
import { PageHeader } from '@/components/shared/PageHeader';
import { formatDate } from '@/lib/utils/formatDate';
import { formatINR } from '@/lib/utils/formatCurrency';

export default async function PatientProfilePage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  let patient: any = null;
  let stats: any = { visitCount: 0, totalEarned: 0, pendingAmount: 0, overdueFollowUps: 0 };
  let recentVisits: any[] = [];

  try {
    const [p] = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
    patient = p;

    if (patient) {
      const [s] = await db.select({
        visitCount: sql<number>`count(distinct ${visits.id})`,
        totalEarned: sql<number>`coalesce(sum(${earnings.totalAmount}::numeric), 0)`,
        pendingAmount: sql<number>`coalesce(sum(case when ${earnings.paymentStatus} = 'pending' then ${earnings.totalAmount}::numeric else 0 end), 0)`,
        overdueFollowUps: sql<number>`count(distinct case when ${followUps.status} = 'pending' and ${followUps.dueDate} < current_date then ${followUps.id} end)`,
      })
        .from(patients)
        .leftJoin(visits, eq(visits.patientId, patients.id))
        .leftJoin(earnings, eq(earnings.visitId, visits.id))
        .leftJoin(followUps, eq(followUps.patientId, patients.id))
        .where(eq(patients.id, id));
      stats = s;

      recentVisits = await db.query.visits.findMany({
        where: eq(visits.patientId, id),
        orderBy: [desc(visits.visitDate)],
        limit: 5,
        with: { treatments: true, earnings: true },
      });
    }
  } catch (err) {
    console.error('Failed to query patient profile:', err);
  }

  if (!patient) notFound();

  const tabs = [
    { href: `/patients/${id}`, label: 'Overview', active: true },
    { href: `/patients/${id}/visits`, label: 'Visits' },
    { href: `/patients/${id}/files`, label: 'Files' },
    { href: `/patients/${id}/billing`, label: 'Billing' },
  ];

  return (
    <div>
      <PageHeader
        title={patient.name}
        description={`${patient.patientId} · Registered ${formatDate(patient.createdAt)}`}
        actions={
          <div className="flex gap-2">
            <Link href={`/patients/${id}/edit`} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
              ✏️ Edit
            </Link>
            <Link href={`/visits/new?patientId=${id}`} className="px-4 py-2 text-sm border border-teal-600 text-teal-700 rounded-lg hover:bg-teal-50">
              🚶 Walk-in Visit
            </Link>
            <Link href={`/appointments/new?patientId=${id}`} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              📅 Appointment
            </Link>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab.active
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Info + Stats */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Patient info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Patient Information</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Age', value: patient.age ? `${patient.age} years` : '—' },
                { label: 'Gender', value: patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : '—' },
                { label: 'Phone', value: patient.phone || '—' },
                { label: 'Address', value: patient.address || '—' },
              ].map((f) => (
                <div key={f.label}>
                  <p className="text-gray-500 text-xs mb-0.5">{f.label}</p>
                  <p className="text-gray-900 font-medium">{f.value}</p>
                </div>
              ))}
              {patient.medicalHistory && (
                <div className="sm:col-span-2">
                  <p className="text-gray-500 text-xs mb-0.5">Medical History</p>
                  <p className="text-gray-900">{patient.medicalHistory}</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent visits */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Visits</h3>
              <Link href={`/patients/${id}/visits`} className="text-xs text-blue-600 hover:underline">View all</Link>
            </div>
            {recentVisits.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No visits yet</p>
            ) : (
              <div className="space-y-2">
                {recentVisits.map((v) => (
                  <Link
                    key={v.id}
                    href={`/visits/${v.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{formatDate(v.visitDate)}</p>
                      <p className="text-xs text-gray-500">
                        {v.treatments.map((t: any) => t.treatmentName).join(', ') || 'No treatments recorded'}
                      </p>
                    </div>
                    {v.earnings && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-800">{formatINR(parseFloat(v.earnings.totalAmount || '0'))}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          v.earnings.paymentStatus === 'settled'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {v.earnings.paymentStatus}
                        </span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats sidebar */}
        <div className="space-y-4">
          {[
            { label: 'Total Visits', value: String(stats?.visitCount || 0), icon: '🩺', color: 'blue' },
            { label: 'Total Earned', value: formatINR(Number(stats?.totalEarned || 0)), icon: '💰', color: 'green' },
            { label: 'Pending Amount', value: formatINR(Number(stats?.pendingAmount || 0)), icon: '⏳', color: 'orange' },
            { label: 'Overdue Follow-ups', value: String(stats?.overdueFollowUps || 0), icon: '🔔', color: 'red' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">{s.label}</p>
                <span className="text-xl">{s.icon}</span>
              </div>
              <p className={`text-xl font-bold mt-1 ${
                s.color === 'blue' ? 'text-blue-700' :
                s.color === 'green' ? 'text-green-700' :
                s.color === 'orange' ? 'text-orange-700' : 'text-red-700'
              }`}>{s.value}</p>
            </div>
          ))}

          <Link
            href={`/visits/new?patientId=${id}`}
            className="block w-full text-center bg-teal-600 text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-teal-700"
          >
            🚶 Walk-in / Record Visit
          </Link>
          <Link
            href={`/patients/${id}/edit`}
            className="block w-full text-center border border-gray-300 text-gray-700 px-4 py-3 rounded-xl text-sm font-medium hover:bg-gray-50"
          >
            ✏️ Edit Patient Info
          </Link>
        </div>
      </div>
    </div>
  );
}
