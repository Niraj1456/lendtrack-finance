import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial Indian Rupee (₹) loan & borrower demo records...');

  // Clean existing records
  await prisma.notificationLog.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.borrower.deleteMany({});

  const today = new Date();
  
  // Date due today (0 days left)
  const dueToday = new Date(today);
  
  // Date due tomorrow (1 day left)
  const dueTomorrow = new Date(today);
  dueTomorrow.setDate(dueTomorrow.getDate() + 1);

  // Date due in 15 days
  const dueIn15Days = new Date(today);
  dueIn15Days.setDate(dueIn15Days.getDate() + 15);

  // 1. Borrower due TODAY - Rajesh Sharma (₹2,00,000 at 2% monthly = ₹4,000/mo)
  const borrower1 = await prisma.borrower.create({
    data: {
      name: 'Rajesh Sharma',
      phone: '+91 98450 11223',
      email: 'rajesh.sharma@example.com',
      address: '#142, 4th Cross, Malleshwaram, Bengaluru, Karnataka - 560003',
      reference: 'Ref 1: Vikram Sharma (Brother) - 9845099887; Ref 2: Anand Rao (Shop Partner) - 9448011223',
      principalAmount: 200000, // ₹2 Lakhs
      interestRate: 2.0, // 2% per month = ₹4,000/mo
      rateType: 'MONTHLY',
      monthlyInterest: 4000,
      durationMonths: 12,
      startDate: new Date(today.getFullYear(), today.getMonth() - 2, 1),
      nextPaymentDate: dueToday,
      endDate: new Date(today.getFullYear(), today.getMonth() + 10, 1),
      status: 'Active',
      remarks: '[Initial]: Approved for Kirana store inventory expansion.\n[Month 1]: Paid ₹4,000 interest via Google Pay.',
      payments: {
        create: [
          {
            amount: 4000,
            paymentType: 'INTEREST',
            paidAt: new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()),
            notes: 'Cycle 1 monthly interest received via UPI.',
          },
        ],
      },
    },
  });

  // 2. Borrower due TOMORROW - Priya Nair (₹1,50,000 at 2.5% monthly = ₹3,750/mo)
  const borrower2 = await prisma.borrower.create({
    data: {
      name: 'Priya Nair',
      phone: '+91 99887 76655',
      email: null, // No email provided
      address: 'Flat 302, Green Acres Apartment, HSR Layout Sector 2, Bengaluru - 560102',
      reference: 'Ref: Dr. K. Nair (Father) - 9886012345 (Govt Hospital HSR)',
      principalAmount: 150000, // ₹1.5 Lakhs
      interestRate: 2.5, // 2.5% per month = ₹3,750/mo
      rateType: 'MONTHLY',
      monthlyInterest: 3750,
      durationMonths: 6,
      startDate: new Date(today.getFullYear(), today.getMonth() - 1, today.getDate() + 1),
      nextPaymentDate: dueTomorrow,
      endDate: new Date(today.getFullYear(), today.getMonth() + 5, today.getDate() + 1),
      status: 'Active',
      remarks: '[Initial]: Bridge loan for boutique setup. Agreed on 2.5% monthly cycle due on 5th.',
    },
  });

  // 3. Borrower due in 15 days - Amit Patel (₹5,00,000 at 18% annual = ₹7,500/mo)
  const borrower3 = await prisma.borrower.create({
    data: {
      name: 'Amit Patel',
      phone: '+91 97123 45678',
      email: 'amit.patel@gujarattextiles.in',
      address: 'Shop #12, Surat Textile Market, Ring Road, Surat, Gujarat - 395002',
      reference: 'Ref 1: Chetan Patel (Cousin) - 9723456789; Ref 2: Harish Bhai - 9825011223',
      principalAmount: 500000, // ₹5 Lakhs
      interestRate: 18.0, // 18% Annual = ₹7,500/mo
      rateType: 'ANNUAL',
      monthlyInterest: 7500,
      durationMonths: 24,
      startDate: new Date(today.getFullYear(), today.getMonth() - 3, today.getDate() + 15),
      nextPaymentDate: dueIn15Days,
      endDate: new Date(today.getFullYear() + 2, today.getMonth() - 3, today.getDate() + 15),
      status: 'Active',
      remarks: '[Initial]: Working capital loan with annual percentage rate.',
      payments: {
        create: [
          {
            amount: 7500,
            paymentType: 'INTEREST',
            paidAt: new Date(today.getFullYear(), today.getMonth() - 2, today.getDate() + 15),
            notes: 'Cycle 1 paid via IMPS bank transfer.',
          },
          {
            amount: 7500,
            paymentType: 'INTEREST',
            paidAt: new Date(today.getFullYear(), today.getMonth() - 1, today.getDate() + 15),
            notes: 'Cycle 2 paid via IMPS bank transfer.',
          },
        ],
      },
    },
  });

  // 4. Borrower Completed - Sunita Verma (₹1,00,000)
  await prisma.borrower.create({
    data: {
      name: 'Sunita Verma',
      phone: '+91 94150 98765',
      email: null,
      address: '15/2B, Civil Lines, Kanpur, Uttar Pradesh - 208001',
      reference: 'Ref: Ramesh Verma (Husband - SBI Manager Civil Lines)',
      principalAmount: 100000,
      interestRate: 3.0,
      rateType: 'MONTHLY',
      monthlyInterest: 3000,
      durationMonths: 3,
      startDate: new Date(today.getFullYear(), today.getMonth() - 4, 1),
      nextPaymentDate: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      endDate: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      status: 'Completed',
      remarks: 'All principal (₹1,00,000) and interest settled in full ahead of maturity.',
      payments: {
        create: [
          {
            amount: 3000,
            paymentType: 'INTEREST',
            paidAt: new Date(today.getFullYear(), today.getMonth() - 3, 1),
          },
          {
            amount: 3000,
            paymentType: 'INTEREST',
            paidAt: new Date(today.getFullYear(), today.getMonth() - 2, 1),
          },
          {
            amount: 100000,
            paymentType: 'PRINCIPAL',
            paidAt: new Date(today.getFullYear(), today.getMonth() - 1, 1),
            notes: 'Full principal return settled in cash.',
          },
        ],
      },
    },
  });

  console.log('✅ Indian Rupee (₹) Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
