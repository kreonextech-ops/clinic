/**
 * Generates a free 1-click WhatsApp web/app reminder URL
 */
export function getWhatsAppReminderUrl(params: {
  phone?: string | null;
  patientName: string;
  date: string;
  time?: string | null;
  doctorName?: string | null;
  clinicName?: string | null;
  reason?: string | null;
}): string | null {
  if (!params.phone) return null;

  // Clean phone number format
  let cleanPhone = params.phone.replace(/[^0-9]/g, '');
  if (!cleanPhone) return null;

  // Default to India country code 91 if 10 digits
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }

  const clinic = params.clinicName || 'Way2Smile Dental Clinic';
  const doctor = params.doctorName || 'Dr. Doctor';
  const timeStr = params.time ? ` at ${params.time}` : '';
  const reasonStr = params.reason ? ` for ${params.reason}` : '';

  const message = `Hello ${params.patientName},\n\nThis is a friendly appointment reminder from *${clinic}* with *${doctor}* on *${params.date}*${timeStr}${reasonStr}.\n\nPlease let us know if you need to reschedule. Thank you!`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
