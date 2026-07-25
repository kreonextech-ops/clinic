import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { webpush } from '@/lib/webpush/client';

import { eq } from 'drizzle-orm';

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
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, body } = await req.json();
  const userId = parseInt((session.user as any).id);

  const [user] = await db.select().from(users).where(
    eq(users.id, userId)
  ).limit(1);

  if (!user?.pushSubscription) return NextResponse.json({ error: 'No subscription' }, { status: 400 });

  const subscription = JSON.parse(user.pushSubscription);
  await webpush.sendNotification(subscription, JSON.stringify({ title, body }));

  return NextResponse.json({ ok: true });
}
