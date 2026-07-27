import { formatDate } from '@/lib/utils/formatDate';
import { formatINR } from '@/lib/utils/formatCurrency';

const baseStyle = `
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:Arial,sans-serif; font-size:13px; color:#1f2937; padding:32px; }
  .header { border-bottom:2px solid #2563eb; padding-bottom:14px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:flex-start; }
  .clinic-name { font-size:18px; font-weight:bold; color:#2563eb; }
  h2 { font-size:15px; color:#374151; margin-bottom:16px; }
  table { width:100%; border-collapse:collapse; margin-top:12px; }
  th { background:#eff6ff; text-align:left; padding:8px 10px; font-size:11px; color:#1e40af; text-transform:uppercase; }
  td { padding:7px 10px; border-bottom:1px solid #f3f4f6; font-size:12px; }
  tr:last-child td { border-bottom:none; }
  .total-row td { font-weight:bold; background:#f9fafb; }
  .footer { margin-top:24px; text-align:center; font-size:11px; color:#9ca3af; border-top:1px solid #e5e7eb; padding-top:12px; }
`;

export function earningsReportHtml(clinicName: string, data: any[], months: number): string {
  const totals = data.reduce((acc, r) => ({
    consultation: acc.consultation + Number(r.consultation),
    procedure: acc.procedure + Number(r.procedure),
    medicine: acc.medicine + Number(r.medicine),
    total: acc.total + Number(r.total),
    settled: acc.settled + Number(r.settled),
    pending: acc.pending + Number(r.pending),
  }), { consultation: 0, procedure: 0, medicine: 0, total: 0, settled: 0, pending: 0 });

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${baseStyle}</style></head><body>
  <div class="header">
    <div><div class="clinic-name">🦷 ${clinicName}</div></div>
    <div style="text-align:right;font-size:12px;color:#6b7280">Earnings Report · Last ${months} months<br>Generated: ${formatDate(new Date().toISOString())}</div>
  </div>
  <h2>Monthly Earnings Breakdown</h2>
  <table>
    <thead><tr><th>Month</th><th>Consultation</th><th>Procedure</th><th>Medicine</th><th>Total</th><th>Settled</th><th>Pending</th></tr></thead>
    <tbody>
      ${[...data].reverse().map((r: any) => `<tr>
        <td>${r.label}</td>
        <td>${formatINR(Number(r.consultation))}</td>
        <td>${formatINR(Number(r.procedure))}</td>
        <td>${formatINR(Number(r.medicine))}</td>
        <td><strong>${formatINR(Number(r.total))}</strong></td>
        <td style="color:#166534">${formatINR(Number(r.settled))}</td>
        <td style="color:#9a3412">${formatINR(Number(r.pending))}</td>
      </tr>`).join('')}
      <tr class="total-row">
        <td>TOTAL</td>
        <td>${formatINR(totals.consultation)}</td>
        <td>${formatINR(totals.procedure)}</td>
        <td>${formatINR(totals.medicine)}</td>
        <td>${formatINR(totals.total)}</td>
        <td style="color:#166534">${formatINR(totals.settled)}</td>
        <td style="color:#9a3412">${formatINR(totals.pending)}</td>
      </tr>
    </tbody>
  </table>
  <div class="footer">🦷 ${clinicName} · Dental Clinic Management System</div>
</body></html>`;
}

export function pendingPaymentsReportHtml(clinicName: string, data: any[]): string {
  const total = data.reduce((s, r) => s + parseFloat(r.totalAmount || '0'), 0);
  const balance = data.reduce((s, r) => s + parseFloat(r.procedureFeeBalance || '0'), 0);

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${baseStyle}</style></head><body>
  <div class="header">
    <div><div class="clinic-name">🦷 ${clinicName}</div></div>
    <div style="text-align:right;font-size:12px;color:#6b7280">Pending Payments Report<br>Generated: ${formatDate(new Date().toISOString())}</div>
  </div>
  <div style="display:flex;gap:16px;margin-bottom:20px">
    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:12px 16px;flex:1">
      <div style="font-size:11px;color:#6b7280">Total Outstanding</div>
      <div style="font-size:18px;font-weight:bold;color:#c2410c">${formatINR(total)}</div>
    </div>
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px 16px;flex:1">
      <div style="font-size:11px;color:#6b7280">Procedure Balance</div>
      <div style="font-size:18px;font-weight:bold;color:#b91c1c">${formatINR(balance)}</div>
    </div>
  </div>
  <table>
    <thead><tr><th>Patient</th><th>Phone</th><th>Visit Date</th><th>Total Amount</th><th>Balance Due</th></tr></thead>
    <tbody>
      ${data.map((r: any) => `<tr>
        <td><strong>${r.patientName}</strong></td>
        <td>${r.patientPhone || '—'}</td>
        <td>${formatDate(r.visitDate)}</td>
        <td>${formatINR(parseFloat(r.totalAmount))}</td>
        <td style="color:#b91c1c;font-weight:bold">${formatINR(parseFloat(r.procedureFeeBalance))}</td>
      </tr>`).join('')}
    </tbody>
  </table>
  <div class="footer">🦷 ${clinicName} · Dental Clinic Management System</div>
</body></html>`;
}
