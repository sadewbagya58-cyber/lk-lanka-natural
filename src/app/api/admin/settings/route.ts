import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await verifyAdminSession();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const dbSettings = await prisma.websiteSetting.findMany();
    const settings: Record<string, string> = {};

    dbSettings.forEach((item) => {
      settings[item.key] = item.value;
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Admin fetch settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await verifyAdminSession();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Settings object is required.' }, { status: 400 });
    }

    const validKeys = [
      'companyAddress',
      'phoneNumber',
      'supportEmail',
      'facebookUrl',
      'instagramUrl',
      'linkedinUrl',
      'newsletterTitle',
      'newsletterDescription',
      'helpLink_trackOrder',
      'helpLink_shippingPolicy',
      'helpLink_returnsRefunds',
      'helpLink_faq',
      'helpLink_helpCenter',
    ];

    // Validation
    for (const key of Object.keys(settings)) {
      if (!validKeys.includes(key)) {
        return NextResponse.json({ error: `Invalid setting key: ${key}` }, { status: 400 });
      }

      const val = String(settings[key]);
      if (val.length > 2000) {
        return NextResponse.json({ error: `Value for ${key} exceeds length limit of 2000 characters.` }, { status: 400 });
      }

      if (key === 'supportEmail') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val.trim())) {
          return NextResponse.json({ error: 'Please enter a valid support email address.' }, { status: 400 });
        }
      }
    }

    // Update or create settings in database atomically
    await prisma.$transaction(
      Object.keys(settings).map((key) => {
        const val = String(settings[key]).trim();
        return prisma.websiteSetting.upsert({
          where: { key },
          update: { value: val },
          create: { key, value: val },
        });
      })
    );

    return NextResponse.json({ success: true, message: 'Settings saved successfully.' });
  } catch (error) {
    console.error('Admin update settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings.' }, { status: 500 });
  }
}
