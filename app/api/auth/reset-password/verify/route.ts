export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { username, answer1, answer2, newPassword } = await req.json();

    if (!username || !answer1 || !answer2 || !newPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const [foundUser] = await db
      .select({
        id: users.id,
        securityAnswer1: users.securityAnswer1,
        securityAnswer2: users.securityAnswer2,
      })
      .from(users)
      .where(eq(users.username, username));

    if (!foundUser) {
      return NextResponse.json({ error: 'Username not found' }, { status: 404 });
    }

    const normAns1 = answer1.toLowerCase().trim();
    const normAns2 = answer2.toLowerCase().trim();
    const dbAns1 = (foundUser.securityAnswer1 || '').toLowerCase().trim();
    const dbAns2 = (foundUser.securityAnswer2 || '').toLowerCase().trim();

    if (normAns1 !== dbAns1 || normAns2 !== dbAns2) {
      return NextResponse.json({ error: 'Incorrect security answers' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, foundUser.id));

    return NextResponse.json({ ok: true, message: 'Password updated successfully' });
  } catch (err: any) {
    console.error('Password reset verify error:', err);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
