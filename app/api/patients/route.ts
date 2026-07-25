export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { db } from '@/lib/db';
import { patients, visits, treatments } from '@/lib/db/schema';
import { ilike, or, eq, desc, sql } from 'drizzle-orm';
import { patientSchema } from '@/lib/validations/patient';
import { generatePatientId } from '@/lib/utils/generatePatientId';

export async function GET(req: NextRequest) {
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
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  const treatment = searchParams.get('treatment');

  let query = db.select({
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

  if (treatment) {
    query = query.leftJoin(treatments, eq(treatments.visitId, visits.id))
      .where(ilike(treatments.treatmentName, `%${treatment}%`));
  }

  const results = await query
    .groupBy(patients.id)
    .orderBy(desc(patients.createdAt))
    .limit(100);

  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
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
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = patientSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const patientId = await generatePatientId();
  const [patient] = await db.insert(patients).values({ ...parsed.data, patientId }).returning();

  return NextResponse.json(patient, { status: 201 });
}
