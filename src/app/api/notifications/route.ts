import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const where: any = {};
    if (unreadOnly) {
      where.isRead = false;
    }

    const notifications = await prisma.notificationLog.findMany({
      where,
      orderBy: { sentAt: 'desc' },
      take: 50,
      include: {
        borrower: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            status: true,
          },
        },
      },
    });

    const unreadCount = await prisma.notificationLog.count({
      where: { isRead: false },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, markAllRead } = body;

    if (markAllRead) {
      await prisma.notificationLog.updateMany({
        where: { isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (notificationId) {
      const updated = await prisma.notificationLog.update({
        where: { id: notificationId },
        data: { isRead: true },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'Missing notificationId or markAllRead parameter' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ error: error.message || 'Failed to update notification' }, { status: 500 });
  }
}
