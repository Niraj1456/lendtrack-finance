/**
 * Loan and Interest Calculation Helpers (Indian Rupees INR - ₹)
 */

export type RateType = 'MONTHLY' | 'ANNUAL';

/**
 * Calculates the monthly interest amount given a principal amount and interest rate percentage.
 * @param principal Total loan amount in INR (₹)
 * @param rate Percentage interest rate (e.g., 2% for 2% per month or 18% for 18% per year)
 * @param rateType "MONTHLY" (e.g. 2% / month) or "ANNUAL" (e.g. 18% / year)
 * @returns Monthly interest amount in INR rounded to 2 decimal places
 */
export function calculateMonthlyInterest(
  principal: number,
  rate: number,
  rateType: RateType | string = 'MONTHLY'
): number {
  if (!principal || !rate || principal <= 0 || rate <= 0) {
    return 0;
  }

  let monthlyAmount: number;
  if (rateType === 'ANNUAL') {
    // Annual interest divided by 12 months
    monthlyAmount = (principal * (rate / 100)) / 12;
  } else {
    // Direct monthly percentage
    monthlyAmount = principal * (rate / 100);
  }

  return Math.round(monthlyAmount * 100) / 100;
}

/**
 * Computes calendar day difference between today and a target due date
 */
export function getDaysUntilDate(targetDate: Date | string): number {
  const target = new Date(targetDate);
  const today = new Date();

  // Normalize both dates to midnight local time to avoid hour-boundary errors
  const utcTarget = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  const utcToday = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((utcTarget - utcToday) / msPerDay);
}

/**
 * Formats a number to Indian Rupees (INR / ₹) with Indian numbering format (Lakhs / Crores)
 * e.g., ₹1,50,000.00
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

/**
 * Calculates the final payoff date based on start date and duration in months
 */
export function calculateEndDate(startDate: Date | string, durationMonths: number): Date {
  const date = new Date(startDate);
  date.setMonth(date.getMonth() + (durationMonths || 1));
  return date;
}

/**
 * Calculates the next monthly payment date based on start date
 */
export function calculateNextMonthlyPaymentDate(startDate: Date | string): Date {
  const date = new Date(startDate);
  date.setMonth(date.getMonth() + 1);
  return date;
}

/**
 * Returns human-readable label and CSS color coding for days remaining
 */
export function getPaymentBadgeInfo(daysRemaining: number) {
  if (daysRemaining < 0) {
    const overdueDays = Math.abs(daysRemaining);
    return {
      label: `Overdue by ${overdueDays} ${overdueDays === 1 ? 'day' : 'days'}`,
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
      dotClass: 'bg-rose-500 animate-pulse',
      severity: 'overdue' as const,
    };
  }
  if (daysRemaining === 0) {
    return {
      label: 'Due TODAY',
      badgeClass: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800 font-semibold',
      dotClass: 'bg-red-600 animate-ping',
      severity: 'due_today' as const,
    };
  }
  if (daysRemaining === 1) {
    return {
      label: 'Due Tomorrow',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 font-medium',
      dotClass: 'bg-amber-500',
      severity: 'due_tomorrow' as const,
    };
  }
  if (daysRemaining <= 7) {
    return {
      label: `${daysRemaining} days left`,
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
      dotClass: 'bg-blue-500',
      severity: 'upcoming_soon' as const,
    };
  }
  return {
    label: `${daysRemaining} days left`,
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    dotClass: 'bg-emerald-500',
    severity: 'upcoming' as const,
  };
}
