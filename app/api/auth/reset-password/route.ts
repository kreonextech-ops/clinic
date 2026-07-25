import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { action, username, a1, a2, newPassword } = await req.json();

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // 1. Fetch user (only owners have security questions)
    const [owner] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!owner) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    if (action === 'get-questions') {
      if (!owner.securityQuestion1 || !owner.securityAnswer1 || !owner.securityQuestion2 || !owner.securityAnswer2) {
        return NextResponse.json({
          error: 'Security questions have not been set up for this account. Please contact support or your administrator.'
        }, { status: 400 });
      }

      return NextResponse.json({
        q1: owner.securityQuestion1,
        q2: owner.securityQuestion2,
      });
    }

    if (action === 'reset') {
      if (!a1 || !a2 || !newPassword) {
        return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
      }

      if (!owner.securityAnswer1 || !owner.securityAnswer2) {
        return NextResponse.json({ error: 'Security questions not set up' }, { status: 400 });
      }

      // Check first answer
      const match1 = await bcrypt.compare(a1.trim().toLowerCase(), owner.securityAnswer1);
      // Check second answer
      const match2 = await bcrypt.compare(a2.trim().toLowerCase(), owner.securityAnswer2);

      if (!match1 || !match2) {
        return NextResponse.json({ error: 'Incorrect answers to security questions' }, { status: 400 });
      }

      if (newPassword.length < 8) {
        return NextResponse.json({ error: 'New password must be at least 8 characters long' }, { status: 400 });
      }

      // Update password
      const newHash = await bcrypt.hash(newPassword, 12);
      await db
        .update(users)
        .set({ passwordHash: newHash, updatedAt: new Date() })
        .where(eq(users.id, owner.id));

      return NextResponse.json({ success: true, message: 'Password reset successful' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
