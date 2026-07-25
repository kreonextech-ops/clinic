export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

// One-time setup endpoint to create the doctor account
// DISABLE OR DELETE after first use in production
export async function POST(req: NextRequest) {
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
    securityAnswer2
  } = body;

  // Check if users already exist
  const [count] = await db.select({ count: sql<number>`count(*)` }).from(users);
  if (Number(count.count) > 0) {
    return NextResponse.json({ error: 'Users already exist. Setup not allowed.' }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db.insert(users).values({
    username,
    passwordHash,
    clinicName: clinicName || 'Way2Smile Clinic',
    doctorName: doctorName || 'Dr. Doctor',
    email: email || null,
    securityQuestion1: securityQuestion1 || null,
    securityAnswer1: securityAnswer1 ? securityAnswer1.toLowerCase().trim() : null,
    securityQuestion2: securityQuestion2 || null,
    securityAnswer2: securityAnswer2 ? securityAnswer2.toLowerCase().trim() : null,
  }).returning({ id: users.id, username: users.username });

  return NextResponse.json({ ok: true, user });
}
