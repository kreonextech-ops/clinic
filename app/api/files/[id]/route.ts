export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getOciClient, OCI_BUCKET } from '@/lib/oci/client';
import { db } from '@/lib/db';
import { files, patients } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [file] = await db.select().from(files)
    .where(and(
      eq(files.id, parseInt(params.id)),
      inArray(files.patientId, db.select({ id: patients.id }).from(patients).where(eq(patients.userId, session.user.userId)))
    ))
    .limit(1);
  if (!file) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Delete from OCI (only if configured)
  try {
    await getOciClient().send(new DeleteObjectCommand({ Bucket: OCI_BUCKET, Key: file.fileKey }));
  } catch (err) {
    console.error('OCI delete error:', err);
  }

  // Delete from DB
  await db.delete(files).where(eq(files.id, file.id));
  return NextResponse.json({ ok: true });
}
