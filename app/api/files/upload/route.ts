export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { db } from '@/lib/db';
import { files, patients } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

// Check if OCI is properly configured
function isOCIConfigured(): boolean {
  const endpoint = process.env.OCI_STORAGE_ENDPOINT || '';
  const accessKey = process.env.OCI_STORAGE_ACCESS_KEY_ID || '';
  const secretKey = process.env.OCI_STORAGE_SECRET_ACCESS_KEY || '';
  return (
    endpoint.length > 0 &&
    !endpoint.includes('your-') &&
    accessKey.length > 0 &&
    !accessKey.includes('your-') &&
    secretKey.length > 0 &&
    !secretKey.includes('your-')
  );
}

async function uploadToOCI(file: File, key: string): Promise<string> {
  // Lazy-import to avoid crash when credentials are missing
  const { PutObjectCommand } = await import('@aws-sdk/client-s3');
  const { getOciClient, OCI_BUCKET, OCI_PUBLIC_URL } = await import('@/lib/oci/client');

  const bytes = await file.arrayBuffer();
  await getOciClient().send(
    new PutObjectCommand({
      Bucket: OCI_BUCKET,
      Key: key,
      Body: Buffer.from(bytes),
      ContentType: file.type,
    })
  );
  return `${OCI_PUBLIC_URL}/${key}`;
}

async function uploadToLocal(file: File, key: string): Promise<string> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', path.dirname(key));
  await fs.mkdir(uploadDir, { recursive: true });

  const filePath = path.join(process.cwd(), 'public', 'uploads', key);
  const bytes = await file.arrayBuffer();
  await fs.writeFile(filePath, Buffer.from(bytes));

  return `/uploads/${key}`;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const patientId = formData.get('patientId')?.toString();
  const visitId = formData.get('visitId')?.toString();
  const fileType = (formData.get('fileType')?.toString() || 'document') as 'xray' | 'document' | 'photo' | 'other';

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  if (!patientId) return NextResponse.json({ error: 'patientId required' }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: 'File type not allowed. Use JPG, PNG, WebP, GIF or PDF.' }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });

  const ext = file.name.split('.').pop() || 'bin';
  const key = `patients/${patientId}/${uuidv4()}.${ext}`;

  const [patient] = await db.select().from(patients).where(and(eq(patients.id, parseInt(patientId)), eq(patients.userId, session.user.userId))).limit(1);
  if (!patient) return NextResponse.json({ error: 'Unauthorized patient' }, { status: 403 });

  let fileUrl: string;
  try {
    if (isOCIConfigured()) {
      fileUrl = await uploadToOCI(file, key);
    } else {
      fileUrl = await uploadToLocal(file, key);
    }
  } catch (err) {
    console.error('Upload error, falling back to local storage:', err);
    try {
      fileUrl = await uploadToLocal(file, key);
    } catch (localErr) {
      console.error('Local upload also failed:', localErr);
      return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
    }
  }

  const [saved] = await db.insert(files).values({
    patientId: parseInt(patientId),
    visitId: visitId ? parseInt(visitId) : null,
    fileType,
    fileName: file.name,
    fileKey: key,
    fileUrl,
    fileSize: file.size,
    mimeType: file.type,
  }).returning();

  return NextResponse.json(saved, { status: 201 });
}
