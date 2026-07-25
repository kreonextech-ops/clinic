import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, username } = body;

  if (!username) return NextResponse.json({ error: 'Username required' }, { status: 400 });

  const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (action === 'getQuestions') {
    if (!user.securityQuestion1 || !user.securityQuestion2) {
      return NextResponse.json({ error: 'No security questions set. Contact admin.' }, { status: 400 });
    }
    return NextResponse.json({ q1: user.securityQuestion1, q2: user.securityQuestion2 });
  }

  if (action === 'verifyAnswers') {
    const { answer1, answer2 } = body;
    const match1 = user.securityAnswer1?.toLowerCase() === answer1?.toLowerCase();
    const match2 = user.securityAnswer2?.toLowerCase() === answer2?.toLowerCase();
    if (!match1 || !match2) {
      return NextResponse.json({ error: 'Incorrect answers' }, { status: 401 });
    }
    return NextResponse.json({ ok: true });
  }

  if (action === 'resetPassword') {
    const { answer1, answer2, newPassword } = body;
    const match1 = user.securityAnswer1?.toLowerCase() === answer1?.toLowerCase();
    const match2 = user.securityAnswer2?.toLowerCase() === answer2?.toLowerCase();
    if (!match1 || !match2) {
      return NextResponse.json({ error: 'Incorrect answers' }, { status: 401 });
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, user.id));
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
