import { NextRequest, NextResponse } from 'next/server';

// Cron reminders — disabled until email/push notifications are configured
export async function GET(req: NextRequest) {
  return NextResponse.json({ ok: true, message: 'Cron reminders not yet configured.' });
}
