import { NextResponse } from 'next/server';
import { getFaqItems } from '@/lib/cms';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await getFaqItems();
    return NextResponse.json({ success: true, items });
  } catch (err) {
    console.error('FAQ GET error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
