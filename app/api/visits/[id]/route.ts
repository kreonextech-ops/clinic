export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { db } from '@/lib/db';
import { visits, earnings, treatments, patients } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { earningsSchema } from '@/lib/validations/earnings';
import { z } from 'zod';

const treatmentUpdateSchema = z.object({
  treatmentName: z.string().min(1),
  isCustom: z.boolean().optional().default(false),
  notes: z.string().optional().nullable(),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const visit = await db.query.visits.findFirst({
    where: and(
      eq(visits.id, parseInt(params.id)),
      inArray(visits.patientId, db.select({ id: patients.id }).from(patients).where(eq(patients.userId, session.user.userId)))
    ),
    with: {
      patient: true,
      treatments: true,
      earnings: true,
      followUps: true,
      inventoryUsed: { with: { item: true } },
      files: true,
    },
  });

  if (!visit) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(visit);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { complaints, doctorNotes, earnings: earningsData, treatments: treatmentsData } = body;
  const visitId = parseInt(params.id);

  // Update visit notes
  await db.update(visits)
    .set({ complaints: complaints ?? null, doctorNotes: doctorNotes ?? null, updatedAt: new Date() })
    .where(and(
      eq(visits.id, visitId),
      inArray(visits.patientId, db.select({ id: patients.id }).from(patients).where(eq(patients.userId, session.user.userId)))
    ));

  // Update treatments if provided (replace all)
  if (Array.isArray(treatmentsData)) {
    const parsed = z.array(treatmentUpdateSchema).safeParse(treatmentsData);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // Delete existing treatments and re-insert
    await db.delete(treatments).where(eq(treatments.visitId, visitId));

    if (parsed.data.length > 0) {
      await db.insert(treatments).values(
        parsed.data.map((t: any) => ({
          visitId,
          treatmentName: t.treatmentName,
          isCustom: t.isCustom ?? false,
          notes: t.notes ?? null,
        }))
      );
    }
  }

  // Update earnings if provided
  if (earningsData) {
    const parsed = earningsSchema.safeParse(earningsData);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const e = parsed.data;
    const procedureFeeBalance = (e.procedureFeeTotal || 0) - (e.procedureFeePaid || 0);
    const totalAmount = (e.consultationFee || 0) + (e.procedureFeeTotal || 0) + (e.medicineCharge || 0);

    const existingEarnings = await db.query.earnings.findFirst({ where: eq(earnings.visitId, visitId) });

    if (existingEarnings) {
      await db.update(earnings).set({
        consultationFee: String(e.consultationFee || 0),
        procedureFeeTotal: String(e.procedureFeeTotal || 0),
        procedureFeePaid: String(e.procedureFeePaid || 0),
        procedureFeeBalance: String(Math.max(0, procedureFeeBalance)),
        medicineCharge: String(e.medicineCharge || 0),
        totalAmount: String(totalAmount),
        paymentStatus: e.paymentStatus,
        waivedNote: e.waivedNote ?? null,
        updatedAt: new Date(),
      }).where(eq(earnings.visitId, visitId));
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await db.delete(visits).where(and(
    eq(visits.id, parseInt(params.id)),
    inArray(visits.patientId, db.select({ id: patients.id }).from(patients).where(eq(patients.userId, session.user.userId)))
  ));
  return NextResponse.json({ ok: true });
}
