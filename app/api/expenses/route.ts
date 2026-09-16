import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { db } from '@/lib/db';
import { expenses, users } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const list = await db.query.expenses.findMany({
      where: eq(expenses.userId, session.user.userId),
      orderBy: [desc(expenses.expenseDate), desc(expenses.createdAt)],
    });
    return NextResponse.json(list);
  } catch (err: any) {
    console.error('API /api/expenses GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { title, amount, category, expenseDate, notes } = body;

    const [newExpense] = await db.insert(expenses).values({
      userId: session.user.userId,
      title,
      amount: String(amount),
      category: category || 'other',
      expenseDate,
      notes: notes || null,
    }).returning();

    return NextResponse.json(newExpense, { status: 201 });
  } catch (err: any) {
    console.error('API /api/expenses POST error:', err);
    return NextResponse.json({ error: 'Failed to add expense' }, { status: 500 });
  }
}
