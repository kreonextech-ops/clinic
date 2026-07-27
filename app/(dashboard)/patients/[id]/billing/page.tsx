import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { db } from '@/lib/db';
import { patients, visits, earnings } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { hasPermission } from '@/lib/auth/permissions';
import { formatDate } from '@/lib/utils/formatDate';
import { formatINR } from '@/lib/utils/formatCurrency';
import { EmptyState } from '@/components/shared/EmptyState';

export default async function PatientBillingPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  const session = {
    user: {
      id: 'owner-1',
      role: 'owner',
      name: 'Dr. Doctor',
      email: 'doctor@example.com',
      clinicName: 'Dental Clinic',
      doctorName: 'Dr. Doctor',
    }
  };

  // Gate: only users with finance permission see billing
  if (!hasPermission(session, 'can_view_earnings')) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl mb-4">🔒</span>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Access Restricted</h3>
        <p className="text-sm text-gray-500">You do not have permission to view billing information.</p>
      </div>
    );
  }

  let patient: any = null;
  let earningsList: any[] = [];

  try {
    const [p] = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
    patient = p;
    if (patient) {
      earningsList = await db.query.earnings.findMany({
        where: eq(earnings.patientId, id),
        orderBy: [desc(earnings.createdAt)],
        with: { visit: true },
      });
    }
  } catch (err) {
    console.error('Failed to query patient billing:', err);
  }

  if (!patient) notFound();

  const total = earningsList.reduce((s, e) => s + parseFloat(e.totalAmount || '0'), 0);
  const settled = earningsList.filter((e: any) => e.paymentStatus === 'settled').reduce((s, e) => s + parseFloat(e.totalAmount || '0'), 0);
  const pending = total - settled;

  const tabs = [
    { href: `/patients/${id}`, label: 'Overview' },
    { href: `/patients/${id}/visits`, label: 'Visits' },
    { href: `/patients/${id}/files`, label: 'Files' },
    { href: `/patients/${id}/billing`, label: 'Billing', active: true },
  ];

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{patient.name} — Billing</h1>
      </div>
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map((tab: any) => (
          <Link key={tab.href} href={tab.href}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${(tab as any).active ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {tab.label}
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500">Total</p><p className="text-xl font-bold text-gray-900">{formatINR(total)}</p></div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4"><p className="text-xs text-gray-500">Settled</p><p className="text-xl font-bold text-green-700">{formatINR(settled)}</p></div>
        <div className="bg-orange-50 rounded-xl border border-orange-200 p-4"><p className="text-xs text-gray-500">Pending</p><p className="text-xl font-bold text-orange-700">{formatINR(pending)}</p></div>
      </div>
      {earningsList.length === 0 ? (
        <EmptyState icon="💰" title="No billing records" />
      ) : (
        <div className="space-y-2">
          {earningsList.map((e: any) => (
            <Link key={e.id} href={`/visits/${e.visitId}`}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all">
              <div>
                <p className="text-sm font-medium text-gray-900">{formatDate(e.visit.visitDate)}</p>
                <p className="text-xs text-gray-500 mt-0.5">Consult: {formatINR(parseFloat(e.consultationFee || '0'))} · Procedure: {formatINR(parseFloat(e.procedureFeeTotal || '0'))}</p>
              </div>
              <div className="text-right">
                <p className="text-base font-bold text-gray-900">{formatINR(parseFloat(e.totalAmount || '0'))}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${e.paymentStatus === 'settled' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{e.paymentStatus}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
