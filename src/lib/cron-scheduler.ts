import { prisma } from './prisma';
import { calculateMonthlyInterest, getDaysUntilDate, formatCurrency } from './calculator';

export interface ReminderRunResult {
  timestamp: string;
  totalActiveBorrowers: number;
  dueTomorrow: Array<{ id: string; name: string; amount: number; message: string }>;
  dueToday: Array<{ id: string; name: string; amount: number; message: string }>;
  overdue: Array<{ id: string; name: string; amount: number; daysOverdue: number }>;
  newNotificationsCreated: number;
}

/**
 * Evaluates all active loans and triggers 1-day and 0-day alerts.
 */
export async function runDailyReminderCheck(): Promise<ReminderRunResult> {
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const activeBorrowers = await prisma.borrower.findMany({
    where: { status: 'Active' },
    include: {
      notifications: {
        where: {
          sentAt: {
            gte: todayMidnight,
          },
        },
      },
    },
  });

  const result: ReminderRunResult = {
    timestamp: now.toISOString(),
    totalActiveBorrowers: activeBorrowers.length,
    dueTomorrow: [],
    dueToday: [],
    overdue: [],
    newNotificationsCreated: 0,
  };

  for (const borrower of activeBorrowers) {
    const daysUntilDue = getDaysUntilDate(borrower.nextPaymentDate);
    const amountDue = borrower.monthlyInterest || calculateMonthlyInterest(
      borrower.principalAmount,
      borrower.interestRate,
      borrower.rateType
    );
    const formattedAmount = formatCurrency(amountDue);

    if (daysUntilDue === 1) {
      // 1 Day Before: "Payment of ₹[Amount] due tomorrow for [Person Name]."
      const message = `Payment of ${formattedAmount} due tomorrow for ${borrower.name}.`;
      result.dueTomorrow.push({
        id: borrower.id,
        name: borrower.name,
        amount: amountDue,
        message,
      });

      const alreadySent = borrower.notifications.some((n) => n.type === 'DUE_TOMORROW');
      if (!alreadySent) {
        await prisma.notificationLog.create({
          data: {
            borrowerId: borrower.id,
            type: 'DUE_TOMORROW',
            amountDue,
            message,
          },
        });
        result.newNotificationsCreated++;
      }
    } else if (daysUntilDue === 0) {
      // On Due Date: "Payment of ₹[Amount] is due TODAY for [Person Name]."
      const message = `Payment of ${formattedAmount} is due TODAY for ${borrower.name}.`;
      result.dueToday.push({
        id: borrower.id,
        name: borrower.name,
        amount: amountDue,
        message,
      });

      const alreadySent = borrower.notifications.some((n) => n.type === 'DUE_TODAY');
      if (!alreadySent) {
        await prisma.notificationLog.create({
          data: {
            borrowerId: borrower.id,
            type: 'DUE_TODAY',
            amountDue,
            message,
          },
        });
        result.newNotificationsCreated++;
      }
    } else if (daysUntilDue < 0) {
      const daysOverdue = Math.abs(daysUntilDue);
      result.overdue.push({
        id: borrower.id,
        name: borrower.name,
        amount: amountDue,
        daysOverdue,
      });

      const alreadySent = borrower.notifications.some((n) => n.type === 'OVERDUE');
      if (!alreadySent) {
        await prisma.notificationLog.create({
          data: {
            borrowerId: borrower.id,
            type: 'OVERDUE',
            amountDue,
            message: `URGENT: Payment of ${formattedAmount} for ${borrower.name} is OVERDUE by ${daysOverdue} days.`,
          },
        });
        result.newNotificationsCreated++;
      }
    }
  }

  console.log(`[CRON] Reminder run completed at ${result.timestamp}: ${result.newNotificationsCreated} new notifications logged.`);
  return result;
}

// Global flag to prevent multiple cron instances
const globalForCron = globalThis as unknown as { isCronInitialized?: boolean };

export async function initCronScheduler() {
  // Disable node-cron inside Vercel or if already initialized
  if (globalForCron.isCronInitialized || process.env.VERCEL) {
    return;
  }

  try {
    const cron = (await import('node-cron')).default;
    // Schedule daily check at 08:00 AM every day
    cron.schedule('0 8 * * *', async () => {
      console.log('[CRON] 08:00 AM Daily Loan Payment Reminder Job Running...');
      try {
        await runDailyReminderCheck();
      } catch (err) {
        console.error('[CRON] Error during daily check:', err);
      }
    });

    globalForCron.isCronInitialized = true;
    console.log('[CRON] Loan Reminder Scheduler initialized (08:00 AM daily).');
  } catch (err) {
    console.warn('[CRON] Could not initialize local scheduler.', err);
  }
}
