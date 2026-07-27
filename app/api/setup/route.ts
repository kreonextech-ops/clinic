export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Clinic registration endpoint
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      username,
      password,
      clinicName,
      doctorName,
      email,
      securityQuestion1,
      securityAnswer1,
      securityQuestion2,
      securityAnswer2,
    } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
    }

    // Check if username already exists
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username));

    if (existingUser) {
      return NextResponse.json({ error: 'Username is already registered. Choose another.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const hashedAnswer1 = securityAnswer1
      ? await bcrypt.hash(securityAnswer1.toLowerCase().trim(), 12)
      : null;
    const hashedAnswer2 = securityAnswer2
      ? await bcrypt.hash(securityAnswer2.toLowerCase().trim(), 12)
      : null;

    const [user] = await db.insert(users).values({
      username,
      passwordHash,
      clinicName: clinicName || 'Dental Clinic',
      doctorName: doctorName || 'Dr. Doctor',
      email: email || null,
      securityQuestion1: securityQuestion1 || null,
      securityAnswer1: hashedAnswer1,
      securityQuestion2: securityQuestion2 || null,
      securityAnswer2: hashedAnswer2,
    }).returning({ id: users.id, username: users.username });

    return NextResponse.json({ ok: true, user });
  } catch (err: any) {
    console.error('API /api/setup POST error:', err);
    return NextResponse.json({ error: err?.message || 'Registration failed. Please try again.' }, { status: 500 });
  }
}
