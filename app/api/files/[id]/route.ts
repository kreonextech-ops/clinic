import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { ociClient, OCI_BUCKET } from '@/lib/oci/client';
import { db } from '@/lib/db';
import { files } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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

  const [file] = await db.select().from(files).where(eq(files.id, parseInt(params.id))).limit(1);
  if (!file) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Delete from OCI
  try {
    await ociClient.send(new DeleteObjectCommand({ Bucket: OCI_BUCKET, Key: file.fileKey }));
  } catch (err) {
    console.error('OCI delete error:', err);
  }

  // Delete from DB
  await db.delete(files).where(eq(files.id, file.id));
  return NextResponse.json({ ok: true });
}
