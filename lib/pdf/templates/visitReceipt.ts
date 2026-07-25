import { formatDate } from '@/lib/utils/formatDate';
import { formatINR } from '@/lib/utils/formatCurrency';

interface VisitReceiptData {
  clinicName: string;
  doctorName: string;
  patient: { name: string; patientId: string; age?: number | null; phone?: string | null };
  visit: { visitDate: string; complaints?: string | null; doctorNotes?: string | null };
  treatments: { treatmentName: string }[];
  earnings?: {
    consultationFee: string;
    procedureFeeTotal: string;
    procedureFeePaid: string;
    procedureFeeBalance: string;
    medicineCharge: string;
    totalAmount: string;
    paymentStatus: string;
    waivedNote?: string | null;
  } | null;
}

export function visitReceiptHtml(data: VisitReceiptData): string {
  const { clinicName, doctorName, patient, visit, treatments, earnings: e } = data;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 13px; color: #1f2937; padding: 32px; }
  .header { border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
  .clinic-name { font-size: 20px; font-weight: bold; color: #2563eb; }
  .doctor-name { color: #6b7280; font-size: 12px; margin-top: 2px; }
  .receipt-title { font-size: 14px; font-weight: bold; color: #374151; text-align: right; }
  .date { color: #6b7280; font-size: 12px; text-align: right; margin-top: 2px; }
  .section { margin-bottom: 20px; }
  .section-title { font-size: 11px; font-weight: bold; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
  .info-item label { font-size: 11px; color: #6b7280; display: block; }
  .info-item span { font-weight: 600; color: #1f2937; }
  .treatment-tag { display: inline-block; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; border-radius: 12px; padding: 3px 10px; font-size: 12px; margin: 2px; }
  .billing-table { width: 100%; border-collapse: collapse; }
  .billing-table td { padding: 6px 0; border-bottom: 1px solid #f3f4f6; }
  .billing-table td:last-child { text-align: right; font-weight: 600; }
  .billing-total { background: #eff6ff; border-radius: 6px; padding: 10px 12px; display: flex; justify-content: space-between; font-weight: bold; font-size: 15px; color: #1e40af; margin-top: 8px; }
  .status-badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; }
  .status-settled { background: #dcfce7; color: #166534; }
  .status-pending { background: #fff7ed; color: #9a3412; }
  .notes { background: #f9fafb; border-radius: 6px; padding: 10px 12px; font-size: 12px; color: #4b5563; line-height: 1.5; }
  .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 11px; color: #9ca3af; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="clinic-name">🦷 ${clinicName}</div>
      <div class="doctor-name">${doctorName}</div>
    </div>
    <div>
      <div class="receipt-title">VISIT RECEIPT</div>
      <div class="date">${formatDate(visit.visitDate)}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Patient Information</div>
    <div class="info-grid">
      <div class="info-item"><label>Name</label><span>${patient.name}</span></div>
      <div class="info-item"><label>Patient ID</label><span>${patient.patientId}</span></div>
      ${patient.age ? `<div class="info-item"><label>Age</label><span>${patient.age} years</span></div>` : ''}
      ${patient.phone ? `<div class="info-item"><label>Phone</label><span>${patient.phone}</span></div>` : ''}
    </div>
  </div>

  ${treatments.length > 0 ? `
  <div class="section">
    <div class="section-title">Treatments Performed</div>
    <div>${treatments.map((t) => `<span class="treatment-tag">${t.treatmentName}</span>`).join('')}</div>
  </div>` : ''}

  ${visit.complaints || visit.doctorNotes ? `
  <div class="section">
    <div class="section-title">Clinical Notes</div>
    ${visit.complaints ? `<div class="notes"><strong>Complaints:</strong> ${visit.complaints}</div>` : ''}
    ${visit.doctorNotes ? `<div class="notes" style="margin-top:6px"><strong>Doctor Notes:</strong> ${visit.doctorNotes}</div>` : ''}
  </div>` : ''}

  ${e ? `
  <div class="section">
    <div class="section-title">Billing Summary</div>
    <table class="billing-table">
      ${parseFloat(e.consultationFee) > 0 ? `<tr><td>Consultation Fee</td><td>${formatINR(parseFloat(e.consultationFee))}</td></tr>` : ''}
      ${parseFloat(e.procedureFeeTotal) > 0 ? `<tr><td>Procedure Fee</td><td>${formatINR(parseFloat(e.procedureFeeTotal))}</td></tr>` : ''}
      ${parseFloat(e.procedureFeePaid) > 0 ? `<tr><td>Procedure Paid</td><td>- ${formatINR(parseFloat(e.procedureFeePaid))}</td></tr>` : ''}
      ${parseFloat(e.medicineCharge) > 0 ? `<tr><td>Medicine Charge</td><td>${formatINR(parseFloat(e.medicineCharge))}</td></tr>` : ''}
    </table>
    <div class="billing-total">
      <span>Total Amount</span>
      <span>${formatINR(parseFloat(e.totalAmount))}</span>
    </div>
    ${parseFloat(e.procedureFeeBalance) > 0 ? `
    <div style="display:flex;justify-content:space-between;margin-top:6px;color:#9a3412;font-size:12px;font-weight:600">
      <span>Balance Due</span><span>${formatINR(parseFloat(e.procedureFeeBalance))}</span>
    </div>` : ''}
    <div style="margin-top:10px">
      Payment Status: <span class="status-badge ${e.paymentStatus === 'settled' ? 'status-settled' : 'status-pending'}">${e.paymentStatus.toUpperCase()}</span>
    </div>
    ${e.waivedNote ? `<div style="color:#6b7280;font-size:11px;margin-top:6px;font-style:italic">Note: ${e.waivedNote}</div>` : ''}
  </div>` : ''}

  <div class="footer">
    Thank you for visiting ${clinicName} · Generated by Dental Clinic Management System
  </div>
</body>
</html>`;
}
