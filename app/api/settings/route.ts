import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { db } from '@/lib/db';
import { users, staff } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

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
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = (session.user as any).role;
  const userIdStr = (session.user as any).id as string;

  if (role === 'owner') {
    const ownerId = parseInt(userIdStr.replace('owner-', ''), 10);
    const [owner] = await db
      .select({
        clinicName: users.clinicName,
        doctorName: users.doctorName,
        email: users.email,
        securityQuestion1: users.securityQuestion1,
        securityQuestion2: users.securityQuestion2,
      })
      .from(users)
      .where(eq(users.id, ownerId))
      .limit(1);

    if (!owner) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(owner);
  } else {
    // Staff doesn't have profile or security questions columns in schema
    const staffId = parseInt(userIdStr.replace('staff-', ''), 10);
    const [member] = await db
      .select({
        displayName: staff.displayName,
        username: staff.username,
      })
      .from(staff)
      .where(eq(staff.id, staffId))
      .limit(1);

    if (!member) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    return NextResponse.json({
      clinicName: 'Dental Clinic',
      doctorName: member.displayName,
      email: '',
      securityQuestion1: '',
      securityQuestion2: '',
    });
  }
}

export async function PUT(req: NextRequest) {
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
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = (session.user as any).role;
  const userIdStr = (session.user as any).id as string;
  const body = await req.json();
  const { action } = body;

  if (action === 'profile') {
    if (role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const ownerId = parseInt(userIdStr.replace('owner-', ''), 10);
    const { clinicName, doctorName, email } = body;

    await db
      .update(users)
      .set({ clinicName, doctorName, email, updatedAt: new Date() })
      .where(eq(users.id, ownerId));

    return NextResponse.json({ success: true });
  }

  if (action === 'password') {
    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Missing passwords' }, { status: 400 });
    }

    if (role === 'owner') {
      const ownerId = parseInt(userIdStr.replace('owner-', ''), 10);
      const [owner] = await db
        .select()
        .from(users)
        .where(eq(users.id, ownerId))
        .limit(1);

      if (!owner) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      const valid = await bcrypt.compare(currentPassword, owner.passwordHash);
      if (!valid) return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });

      const passwordHash = await bcrypt.hash(newPassword, 12);
      await db
        .update(users)
        .set({ passwordHash, updatedAt: new Date() })
        .where(eq(users.id, ownerId));

      return NextResponse.json({ success: true });
    } else {
      const staffId = parseInt(userIdStr.replace('staff-', ''), 10);
      const [member] = await db
        .select()
        .from(staff)
        .where(eq(staff.id, staffId))
        .limit(1);

      if (!member) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      const valid = await bcrypt.compare(currentPassword, member.passwordHash);
      if (!valid) return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });

      const passwordHash = await bcrypt.hash(newPassword, 12);
      await db
        .update(staff)
        .set({ passwordHash, updatedAt: new Date() })
        .where(eq(staff.id, staffId));

      return NextResponse.json({ success: true });
    }
  }

  if (action === 'security') {
    if (role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const ownerId = parseInt(userIdStr.replace('owner-', ''), 10);
    const { q1, a1, q2, a2 } = body;

    const updateData: any = {
      securityQuestion1: q1,
      securityQuestion2: q2,
      updatedAt: new Date(),
    };

    if (a1 && a1.trim() !== '') {
      updateData.securityAnswer1 = await bcrypt.hash(a1.trim().toLowerCase(), 12);
    }
    if (a2 && a2.trim() !== '') {
      updateData.securityAnswer2 = await bcrypt.hash(a2.trim().toLowerCase(), 12);
    }

    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, ownerId));

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
