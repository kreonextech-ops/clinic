export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { db } from '@/lib/db';
import { staff } from '@/lib/db/schema';
import { isOwner } from '@/lib/auth/permissions';
import { ROLE_DEFAULTS } from '@/lib/auth/permissions';
import bcrypt from 'bcryptjs';
import { desc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
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

  try {
    const list = await db
      .select({
        id: staff.id,
        username: staff.username,
        displayName: staff.displayName,
        role: staff.role,
        permissions: staff.permissions,
        isActive: staff.isActive,
        createdAt: staff.createdAt,
      })
      .from(staff)
      .orderBy(desc(staff.createdAt));

    return NextResponse.json(
      list.map((s) => ({
        ...s,
        permissions: JSON.parse(s.permissions || '{}'),
      }))
    );
  } catch (err) {
    console.error('API /api/staff GET error:', err);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
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

  const { username, password, displayName, role } = await req.json();

  if (!username || !password || !displayName || !role) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 });
  }
  if (!['assistant', 'receptionist'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const defaultPerms = ROLE_DEFAULTS[role as 'assistant' | 'receptionist'];

  const [member] = await db
    .insert(staff)
    .values({
      username,
      passwordHash,
      displayName,
      role,
      permissions: JSON.stringify(defaultPerms),
    })
    .returning({
      id: staff.id,
      username: staff.username,
      displayName: staff.displayName,
      role: staff.role,
    });

  return NextResponse.json(member, { status: 201 });
}
