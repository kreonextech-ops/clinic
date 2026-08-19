export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { db } from '@/lib/db';
import { payments, earnings, visits, patients } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const visitId = parseInt(params.id);
  const body = await req.json();
  const { amount, paymentDate, paymentMethod, notes } = body;

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }

  try {
    // Check if visit exists and belongs to user
    const visit = await db.query.visits.findFirst({
      where: and(
        eq(visits.id, visitId),
        inArray(visits.patientId, db.select({ id: patients.id }).from(patients).where(eq(patients.userId, session.user.userId)))
      ),
      with: {
        earnings: true
      }
    });

    if (!visit) return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
    if (!visit.earnings) return NextResponse.json({ error: 'Earnings record missing' }, { status: 400 });

    // Insert payment
    await db.insert(payments).values({
      visitId,
      patientId: visit.patientId,
      amount: numAmount.toString(),
      paymentDate: paymentDate,
      paymentMethod: paymentMethod || 'cash',
      notes: notes || null
    });

    // Update earnings
    const currentPaid = parseFloat(visit.earnings.procedureFeePaid || '0');
    const newPaid = currentPaid + numAmount;
    const procedureTotal = parseFloat(visit.earnings.procedureFeeTotal || '0');
    const newBalance = Math.max(0, procedureTotal - newPaid);
    
    let status: 'pending' | 'settled' = newBalance > 0 ? 'pending' : 'settled';

    await db.update(earnings).set({
      procedureFeePaid: newPaid.toString(),
      procedureFeeBalance: newBalance.toString(),
      paymentStatus: status,
      updatedAt: new Date()
    }).where(eq(earnings.id, visit.earnings.id));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to add payment:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
