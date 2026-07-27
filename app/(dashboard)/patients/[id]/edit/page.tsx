import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { patients } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { PatientEditClient } from './PatientEditClient';

export default async function PatientEditPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  let patient: any = null;
  try {
    const [p] = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
    patient = p;
  } catch (err) {
    console.error('Failed to query patient for edit:', err);
  }
  if (!patient) notFound();

  return (
    <PatientEditClient
      patient={{
        id: patient.id,
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        phone: patient.phone,
        address: patient.address,
        medicalHistory: patient.medicalHistory,
        patientId: patient.patientId,
      }}
    />
  );
}
