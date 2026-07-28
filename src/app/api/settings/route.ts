import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dbSettings = await prisma.websiteSetting.findMany();
    const settings: Record<string, string> = {};
    
    dbSettings.forEach((item) => {
      settings[item.key] = item.value;
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Public fetch settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}
