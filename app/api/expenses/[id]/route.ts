import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { db } from '@/lib/db';
import { expenses } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await db.delete(expenses).where(and(
      eq(expenses.id, parseInt(params.id)),
      eq(expenses.userId, session.user.userId)
    ));
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('API /api/expenses DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}
