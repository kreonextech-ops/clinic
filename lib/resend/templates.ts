interface ReminderEmailOptions {
  clinicName: string;
  patientName: string;
  treatmentName: string;
  dueDate: string;
  notes?: string | null;
}

export function reminderEmailHtml(opts: ReminderEmailOptions): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Follow-up Reminder</title></head>
<body style="font-family:sans-serif;background:#f9fafb;padding:24px;margin:0">
  <div style="max-width:520px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
    <div style="background:#2563EB;padding:20px 24px">
      <h1 style="color:white;margin:0;font-size:18px">🦷 ${opts.clinicName}</h1>
      <p style="color:#bfdbfe;margin:4px 0 0;font-size:13px">Daily Follow-up Reminder</p>
    </div>
    <div style="padding:24px">
      <p style="color:#374151;font-size:15px;margin:0 0 16px">You have a follow-up due today:</p>
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin-bottom:16px">
        <p style="margin:0 0 6px;color:#1e40af;font-size:14px"><strong>Patient:</strong> ${opts.patientName}</p>
        <p style="margin:0 0 6px;color:#1e40af;font-size:14px"><strong>Treatment:</strong> ${opts.treatmentName}</p>
        <p style="margin:0;color:#1e40af;font-size:14px"><strong>Due:</strong> ${opts.dueDate}</p>
        ${opts.notes ? `<p style="margin:6px 0 0;color:#3b82f6;font-size:13px">${opts.notes}</p>` : ''}
      </div>
      <p style="color:#6b7280;font-size:12px;margin:0">This is an automated reminder from your clinic management system.</p>
    </div>
  </div>
</body>
</html>`;
}

interface DailySummaryOptions {
  clinicName: string;
  date: string;
  appointments: number;
  overdueFollowUps: number;
  lowStockItems: string[];
}

export function dailySummaryEmailHtml(opts: DailySummaryOptions): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;background:#f9fafb;padding:24px;margin:0">
  <div style="max-width:520px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
    <div style="background:#0D9488;padding:20px 24px">
      <h1 style="color:white;margin:0;font-size:18px">🦷 ${opts.clinicName}</h1>
      <p style="color:#99f6e4;margin:4px 0 0;font-size:13px">Daily Summary — ${opts.date}</p>
    </div>
    <div style="padding:24px">
      <div style="display:grid;gap:12px">
        <div style="background:#eff6ff;border-radius:8px;padding:12px">
          <p style="margin:0;color:#1e40af;font-size:14px">📅 Today's Appointments: <strong>${opts.appointments}</strong></p>
        </div>
        ${opts.overdueFollowUps > 0 ? `<div style="background:#fff7ed;border-radius:8px;padding:12px">
          <p style="margin:0;color:#c2410c;font-size:14px">🔔 Overdue Follow-ups: <strong>${opts.overdueFollowUps}</strong></p>
        </div>` : ''}
        ${opts.lowStockItems.length > 0 ? `<div style="background:#fff7ed;border-radius:8px;padding:12px">
          <p style="margin:0 0 6px;color:#c2410c;font-size:14px">📦 Low Stock Items:</p>
          <ul style="margin:0;padding-left:18px;color:#92400e;font-size:13px">
            ${opts.lowStockItems.map((i) => `<li>${i}</li>`).join('')}
          </ul>
        </div>` : ''}
      </div>
    </div>
  </div>
</body>
</html>`;
}
