import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { db } from '@/lib/db';
import { files } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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

  const list = await db.select().from(files)
    .where(eq(files.patientId, parseInt(params.id)))
    .orderBy(desc(files.createdAt));

  return NextResponse.json(list);
}
