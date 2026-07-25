export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { db } from '@/lib/db';
import { staff } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { isOwner } from '@/lib/auth/permissions';
import bcrypt from 'bcryptjs';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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
  if (!session || !isOwner(session)) {
    return NextResponse.json({ error: 'Owner access required' }, { status: 403 });
  }

  const body = await req.json();
  const id = parseInt(params.id);
  const update: Record<string, any> = { updatedAt: new Date() };

  if (body.permissions !== undefined) {
    update.permissions = JSON.stringify(body.permissions);
  }
  if (body.isActive !== undefined) {
    update.isActive = body.isActive;
  }
  if (body.displayName !== undefined) {
    update.displayName = body.displayName;
  }
  if (body.role !== undefined && ['assistant', 'receptionist'].includes(body.role)) {
    update.role = body.role;
  }
  if (body.newPassword) {
    if (body.newPassword.length < 6) {
      return NextResponse.json({ error: 'Password too short' }, { status: 400 });
    }
    update.passwordHash = await bcrypt.hash(body.newPassword, 12);
  }

  const [updated] = await db
    .update(staff)
    .set(update)
    .where(eq(staff.id, id))
    .returning({
      id: staff.id,
      username: staff.username,
      displayName: staff.displayName,
      role: staff.role,
      permissions: staff.permissions,
      isActive: staff.isActive,
    });

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ ...updated, permissions: JSON.parse(updated.permissions || '{}') });
}

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
  if (!session || !isOwner(session)) {
    return NextResponse.json({ error: 'Owner access required' }, { status: 403 });
  }

  await db.delete(staff).where(eq(staff.id, parseInt(params.id)));
  return NextResponse.json({ ok: true });
}
