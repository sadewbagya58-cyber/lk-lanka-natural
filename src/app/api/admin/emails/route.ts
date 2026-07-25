import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const authResult = await verifyAdminSession();
    if (authResult.status !== 200) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: authResult.status });
    }

    // Fetch the 100 most recent email notifications
    const notifications = await prisma.emailNotification.findMany({
      orderBy: { sentAt: 'desc' },
      take: 100,
    });

    // Resolve order numbers for the notifications
    const orderIds = Array.from(new Set(notifications.map((n) => n.orderId)));
    const orders = await prisma.order.findMany({
      where: { id: { in: orderIds } },
      select: { id: true, orderNumber: true },
    });

    const orderMap = new Map(orders.map((o) => [o.id, o.orderNumber]));

    const mappedNotifications = notifications.map((n) => ({
      id: n.id,
      orderId: n.orderId,
      orderNumber: orderMap.get(n.orderId) || 'Unknown Order',
      type: n.type,
      recipient: n.recipient,
      status: n.status,
      providerMessageId: n.providerMessageId,
      error: n.error,
      createdAt: n.createdAt,
      sentAt: n.sentAt,
    }));

    return NextResponse.json({
      success: true,
      notifications: mappedNotifications,
    });
  } catch (err) {
    console.error('Admin fetch email notifications error:', err);
    return NextResponse.json({ error: 'Failed to fetch email logs' }, { status: 500 });
  }
}
