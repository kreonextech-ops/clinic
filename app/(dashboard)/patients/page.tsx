import Link from 'next/link';
import { db } from '@/lib/db';
import { patients, visits } from '@/lib/db/schema';
import { ilike, or, eq, desc, sql } from 'drizzle-orm';
import { PatientCard } from '@/components/patients/PatientCard';
import { PatientSearch } from '@/components/patients/PatientSearch';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';

interface Props {
  searchParams: { q?: string; treatment?: string };
}

export default async function PatientsPage({ searchParams }: Props) {
  const { q, treatment } = searchParams;

  let query = db
    .select({
      id: patients.id,
      patientId: patients.patientId,
      name: patients.name,
      age: patients.age,
      gender: patients.gender,
      phone: patients.phone,
      address: patients.address,
      medicalHistory: patients.medicalHistory,
      createdAt: patients.createdAt,
      updatedAt: patients.updatedAt,
      visitCount: sql<number>`count(distinct ${visits.id})`,
      lastVisit: sql<string>`max(${visits.visitDate})`,
    })
    .from(patients)
    .leftJoin(visits, eq(visits.patientId, patients.id))
    .$dynamic();

  if (q) {
    query = query.where(
      or(
        ilike(patients.name, `%${q}%`),
        ilike(patients.phone, `%${q}%`),
        ilike(patients.patientId, `%${q}%`)
      )
    );
  }

  let list: any[] = [];
  try {
    list = await query.groupBy(patients.id).orderBy(desc(patients.createdAt)).limit(100);
  } catch (err) {
    console.error('Failed to query patients:', err);
  }

  return (
    <div>
      <PageHeader
        title="Patients"
        description={`${list.length} patient${list.length !== 1 ? 's' : ''} found`}
        actions={
          <Link
            href="/patients/new"
            className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            + New Patient
          </Link>
        }
      />

      <PatientSearch />

      {list.length === 0 ? (
        <EmptyState
          icon="👤"
          title="No patients found"
          description={q ? `No patients match "${q}"` : 'Start by registering your first patient.'}
          action={
            <Link href="/patients/new" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700">
              Register Patient
            </Link>
          }
        />
      ) : (
        <div className="space-y-2">
          {list.map((p: any) => (
            <PatientCard key={p.id} patient={p as any} />
          ))}
        </div>
      )}
    </div>
  );
}
