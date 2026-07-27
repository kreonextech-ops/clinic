export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { db } from '@/lib/db';
import { visits } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { visitReceiptHtml } from '@/lib/pdf/templates/visitReceipt';

// Returns HTML that the browser can print-to-PDF natively
// For server-side PDF: swap this for chromium/puppeteer on your Oracle VM
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  const { searchParams } = new URL(req.url);
  const visitId = searchParams.get('visitId');
  if (!visitId) return new NextResponse('visitId required', { status: 400 });

  const visit = await db.query.visits.findFirst({
    where: eq(visits.id, parseInt(visitId)),
    with: { patient: true, treatments: true, earnings: true },
  });

  if (!visit) return new NextResponse('Not found', { status: 404 });

  const clinicName = process.env.CLINIC_NAME || 'Dental Clinic';
  const doctorName = process.env.DOCTOR_NAME || 'Dr. Doctor';

  const html = visitReceiptHtml({
    clinicName,
    doctorName,
    patient: visit.patient,
    visit: { visitDate: visit.visitDate, complaints: visit.complaints, doctorNotes: visit.doctorNotes },
    treatments: visit.treatments,
    earnings: visit.earnings ? {
      consultationFee: visit.earnings.consultationFee ?? '0',
      procedureFeeTotal: visit.earnings.procedureFeeTotal ?? '0',
      procedureFeePaid: visit.earnings.procedureFeePaid ?? '0',
      procedureFeeBalance: visit.earnings.procedureFeeBalance ?? '0',
      medicineCharge: visit.earnings.medicineCharge ?? '0',
      totalAmount: visit.earnings.totalAmount ?? '0',
      paymentStatus: visit.earnings.paymentStatus,
      waivedNote: visit.earnings.waivedNote,
    } : null,
  });

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Print-Ready': 'true',
    },
  });
}
