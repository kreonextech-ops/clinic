export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username')?.trim();

    if (!username) {
      return NextResponse.json({ error: 'Username parameter required' }, { status: 400 });
    }

    const [foundUser] = await db
      .select({
        id: users.id,
        securityQuestion1: users.securityQuestion1,
        securityQuestion2: users.securityQuestion2,
      })
      .from(users)
      .where(eq(users.username, username));

    if (!foundUser) {
      return NextResponse.json({ error: 'Username not found' }, { status: 404 });
    }

    return NextResponse.json({
      q1: foundUser.securityQuestion1 || 'Security Question 1',
      q2: foundUser.securityQuestion2 || 'Security Question 2',
    });
  } catch (err: any) {
    console.error('Fetch security questions error:', err);
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }
}
