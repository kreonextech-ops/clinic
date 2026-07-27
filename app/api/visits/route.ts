export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { db } from '@/lib/db';
import { visits, treatments, earnings, followUps, inventoryUsed, inventory, appointments } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { visitSchema, treatmentSchema, inventoryUsedSchema } from '@/lib/validations/visit';
import { earningsSchema } from '@/lib/validations/earnings';
import { followUpSchema } from '@/lib/validations/follow-up';
import { z } from 'zod';

const createVisitSchema = z.object({
  visit: visitSchema,
  treatments: z.array(treatmentSchema).default([]),
  earnings: earningsSchema.optional(),
  followUps: z.array(followUpSchema.omit({ visitId: true, patientId: true })).default([]),
  inventoryUsed: z.array(inventoryUsedSchema).default([]),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get('patientId');

  try {
    const list = await db.query.visits.findMany({
      where: patientId ? eq(visits.patientId, parseInt(patientId)) : undefined,
      with: { patient: true, treatments: true, earnings: true },
      orderBy: [desc(visits.visitDate)],
      limit: 100,
    });

    return NextResponse.json(list);
  } catch (err) {
    console.error('API /api/visits GET error:', err);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = createVisitSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const { visit: visitData, treatments: treatmentData, earnings: earningsData, followUps: followUpData, inventoryUsed: inventoryUsedData } = parsed.data;

    // Transaction-like: create all in order
    const [visit] = await db.insert(visits).values(visitData).returning();

    if (treatmentData.length > 0) {
      await db.insert(treatments).values(treatmentData.map((t: any) => ({ ...t, visitId: visit.id })));
    }

    if (earningsData) {
      const procedureFeeBalance = (earningsData.procedureFeeTotal || 0) - (earningsData.procedureFeePaid || 0);
      const totalAmount =
        (earningsData.consultationFee || 0) +
        (earningsData.procedureFeeTotal || 0) +
        (earningsData.medicineCharge || 0);

      await db.insert(earnings).values({
        visitId: visit.id,
        patientId: visitData.patientId,
        consultationFee: String(earningsData.consultationFee || 0),
        procedureFeeTotal: String(earningsData.procedureFeeTotal || 0),
        procedureFeePaid: String(earningsData.procedureFeePaid || 0),
        procedureFeeBalance: String(Math.max(0, procedureFeeBalance)),
        medicineCharge: String(earningsData.medicineCharge || 0),
        totalAmount: String(totalAmount),
        paymentStatus: earningsData.paymentStatus,
        waivedNote: earningsData.waivedNote ?? null,
      });
    }

    if (followUpData.length > 0) {
      await db.insert(followUps).values(
        followUpData.map((f: any) => ({ ...f, visitId: visit.id, patientId: visitData.patientId }))
      );
    }

    if (inventoryUsedData.length > 0) {
      for (const item of inventoryUsedData) {
        await db.insert(inventoryUsed).values({
          visitId: visit.id,
          inventoryId: item.inventoryId,
          quantityUsed: String(item.quantityUsed),
        });
        // Deduct stock
        await db.execute(
          sql`UPDATE inventory SET quantity = (quantity::numeric - ${item.quantityUsed})::text, updated_at = now() WHERE id = ${item.inventoryId}`
        );
      }
    }

    // Mark appointment as completed if linked
    if (visitData.appointmentId) {
      await db.update(appointments).set({ status: 'completed', updatedAt: new Date() })
        .where(eq(appointments.id, visitData.appointmentId));
    }

    return NextResponse.json({ id: visit.id }, { status: 201 });
  } catch (err: any) {
    console.error('API /api/visits POST error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to record visit' }, { status: 500 });
  }
}
