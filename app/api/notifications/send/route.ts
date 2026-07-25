export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

// Push notifications — disabled until configured
export async function POST(req: NextRequest) {
  return NextResponse.json({ ok: true, message: 'Push notifications not yet configured.' });
}
