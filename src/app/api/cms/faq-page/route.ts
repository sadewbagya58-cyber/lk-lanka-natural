import { NextResponse } from 'next/server';
import { getCmsPage } from '@/lib/cms';

export const dynamic = 'force-dynamic';

/**
 * Dedicated route for the FAQ page metadata (title, subtitle).
 * Separate from /api/cms/faq which returns FAQ items.
 */
export async function GET() {
  try {
    const page = await getCmsPage('faq');
    if (!page) {
      return NextResponse.json({
        success: true,
        page: {
          title: 'Frequently Asked Questions',
          subtitle: 'Find answers to the most common questions about shopping, orders, payments, and more.',
        },
      });
    }
    return NextResponse.json({
      success: true,
      page: {
        title: page.title,
        subtitle: page.subtitle,
      },
    });
  } catch {
    return NextResponse.json({
      success: true,
      page: {
        title: 'Frequently Asked Questions',
        subtitle: 'Find answers to the most common questions about shopping, orders, payments, and more.',
      },
    });
  }
}
