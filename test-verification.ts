import { calculateMonthlyInterest, getDaysUntilDate, formatCurrency } from './src/lib/calculator';
import { runDailyReminderCheck } from './src/lib/cron-scheduler';
import { prisma } from './src/lib/prisma';

async function runTests() {
  console.log('=== 1. TESTING INTEREST CALCULATION LOGIC (INR - ₹) ===');

  // Test 1: ₹1,00,000 at 2% Monthly -> ₹2,000.00
  const test1 = calculateMonthlyInterest(100000, 2.0, 'MONTHLY');
  console.log(`Test 1: ₹1,00,000 @ 2% monthly -> Expected: 2000 | Result: ${test1} | Formatted: ${formatCurrency(test1)}`);
  if (test1 !== 2000.00) throw new Error('Test 1 failed');

  // Test 2: ₹12,00,000 at 18% Annual -> ₹18,000.00
  const test2 = calculateMonthlyInterest(1200000, 18, 'ANNUAL');
  console.log(`Test 2: ₹12,00,000 @ 18% annual -> Expected: 18000 | Result: ${test2} | Formatted: ${formatCurrency(test2)}`);
  if (test2 !== 18000.00) throw new Error('Test 2 failed');

  // Test 3: ₹1,50,000 at 2.5% Monthly -> ₹3,750.00
  const test3 = calculateMonthlyInterest(150000, 2.5, 'MONTHLY');
  console.log(`Test 3: ₹1,50,000 @ 2.5% monthly -> Expected: 3750 | Result: ${test3} | Formatted: ${formatCurrency(test3)}`);
  if (test3 !== 3750.00) throw new Error('Test 3 failed');

  console.log('\n=== 2. TESTING DATE & DAYS REMAINING LOGIC ===');
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const daysToday = getDaysUntilDate(today);
  const daysTomorrow = getDaysUntilDate(tomorrow);
  console.log(`Days to Today: ${daysToday} (Expected: 0)`);
  console.log(`Days to Tomorrow: ${daysTomorrow} (Expected: 1)`);
  if (daysToday !== 0 || daysTomorrow !== 1) throw new Error('Date calculation failed');

  console.log('\n=== 3. TESTING AUTOMATED CRON REMINDER ENGINE (INR) ===');
  const reminderResult = await runDailyReminderCheck();
  console.log('Reminder Execution Result:');
  console.log(`- Active Borrowers Scanned: ${reminderResult.totalActiveBorrowers}`);
  console.log(`- Due Tomorrow (T-1 alerts): ${reminderResult.dueTomorrow.length}`);
  reminderResult.dueTomorrow.forEach((item) => console.log(`   [T-1] ${item.message}`));
  console.log(`- Due Today (T-0 alerts): ${reminderResult.dueToday.length}`);
  reminderResult.dueToday.forEach((item) => console.log(`   [T-0] ${item.message}`));
  console.log(`- New Notifications Created: ${reminderResult.newNotificationsCreated}`);

  if (reminderResult.dueTomorrow.length === 0 || reminderResult.dueToday.length === 0) {
    throw new Error('Expected both T-1 and T-0 reminders to be triggered for seeded data');
  }

  console.log('\n✅ ALL VERIFICATION TESTS PASSED SUCCESSFULLY IN INR (₹)!');
}

runTests()
  .catch((e) => {
    console.error('❌ Test failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
