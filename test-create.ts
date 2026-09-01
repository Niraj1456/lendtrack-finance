import { prisma } from './src/lib/prisma';

async function testCreate() {
  console.log('Testing borrower creation...');
  const borrower = await prisma.borrower.create({
    data: {
      name: 'Test Borrower',
      phone: '+91 99999 88888',
      email: 'test@example.com',
      principalAmount: 50000,
      interestRate: 2.0,
      monthlyInterest: 1000,
      durationMonths: 6,
      startDate: new Date(),
      nextPaymentDate: new Date(),
      status: 'Active',
    },
  });
  console.log('✅ Successfully created borrower:', borrower.id, borrower.name);
  
  // Clean up
  await prisma.borrower.delete({ where: { id: borrower.id } });
  console.log('✅ Successfully cleaned up test borrower');
}

testCreate()
  .catch((e) => {
    console.error('❌ Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
