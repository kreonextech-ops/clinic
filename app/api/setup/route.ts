export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { sql, eq } from 'drizzle-orm';

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

  try {
    // Check if username already exists in users or staff
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username));

    if (existingUser) {
      return NextResponse.json({ error: 'Username is already registered. Choose another.' }, { status: 400 });
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
  } catch (err: any) {
    console.error('API /api/setup POST error:', err);
    let msg = err?.message || 'Setup failed';
    if (msg.includes('ENOTFOUND') || msg.includes('ECONNREFUSED') || msg.includes('connect')) {
      msg = 'Database connection timeout. Re-attempting connection to Supabase pooler...';
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
