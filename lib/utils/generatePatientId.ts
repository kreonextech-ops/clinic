import { db } from '@/lib/db';
import { patients } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export async function generatePatientId(): Promise<string> {
  try {
    const [last] = await db
      .select({ patientId: patients.patientId })
      .from(patients)
      .orderBy(desc(patients.id))
      .limit(1);

    if (!last) return 'PT-0001';

    const num = parseInt(last.patientId.replace('PT-', ''), 10);
    if (isNaN(num)) return `PT-${Date.now().toString().slice(-4)}`;
    const next = (num + 1).toString().padStart(4, '0');
    return `PT-${next}`;
  } catch (err) {
    return `PT-${Math.floor(1000 + Math.random() * 9000)}`;
  }
}
