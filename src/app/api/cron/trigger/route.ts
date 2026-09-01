import { NextResponse } from 'next/server';
import { runDailyReminderCheck } from '@/lib/cron-scheduler';

export async function POST() {
  try {
    const result = await runDailyReminderCheck();
    return NextResponse.json({
      success: true,
      message: 'Automated daily loan reminder check completed successfully.',
      result,
    });
  } catch (error: any) {
    console.error('Error running cron reminder check:', error);
    return NextResponse.json({ error: error.message || 'Failed to run reminder check' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await runDailyReminderCheck();
    return NextResponse.json({
      success: true,
      message: 'Automated daily loan reminder check completed successfully.',
      result,
    });
  } catch (error: any) {
    console.error('Error running cron reminder check:', error);
    return NextResponse.json({ error: error.message || 'Failed to run reminder check' }, { status: 500 });
  }
}
