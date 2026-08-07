export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { db } from '@/lib/db';
import { files, patients } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [patient] = await db.select().from(patients).where(and(eq(patients.id, parseInt(params.id)), eq(patients.userId, session.user.userId))).limit(1);
  if (!patient) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const list = await db.select().from(files)
    .where(eq(files.patientId, parseInt(params.id)))
    .orderBy(desc(files.createdAt));

  return NextResponse.json(list);
}
