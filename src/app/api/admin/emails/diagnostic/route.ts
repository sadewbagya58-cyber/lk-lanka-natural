import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Gate with admin authentication to ensure complete security
  const authResult = await verifyAdminSession();
  if (authResult.status !== 200) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: authResult.status });
  }

  const emailFrom = process.env.EMAIL_FROM;
  const emailFromConfigured = !!emailFrom;
  let emailFromValue = 'NOT_CONFIGURED';

  if (emailFrom) {
    // Extract the email address, which may be formatted as "Name <email@domain.com>"
    const match = emailFrom.match(/<([^>]+)>/);
    const emailAddress = match ? match[1] : emailFrom.trim();
    const parts = emailAddress.split('@');
    if (parts.length === 2) {
      emailFromValue = `***@${parts[1]}`;
    } else {
      emailFromValue = 'INVALID_FORMAT';
    }
  }

  return NextResponse.json({
    emailFromConfigured,
    emailFromValue,
  });
}
