import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateMonthlyInterest } from '@/lib/calculator';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { amount, paymentType = 'INTEREST', notes } = body;

    const borrower = await prisma.borrower.findUnique({ where: { id } });
    if (!borrower) {
      return NextResponse.json({ error: 'Borrower not found' }, { status: 404 });
    }

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 });
    }

    const payment = await prisma.payment.create({
      data: {
        borrowerId: id,
        amount: parsedAmount,
        paymentType,
        notes: notes ? notes.trim() : `Payment of ₹${parsedAmount} received (${paymentType})`,
      },
    });

    let newPrincipal = borrower.principalAmount;
    let newStatus = borrower.status;
    let nextDate = new Date(borrower.nextPaymentDate);

    if (paymentType === 'INTEREST') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else if (paymentType === 'PRINCIPAL') {
      newPrincipal = Math.max(0, borrower.principalAmount - parsedAmount);
      if (newPrincipal === 0) {
        newStatus = 'Completed';
      }
    } else if (paymentType === 'BOTH') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }

    const newMonthlyInterest = calculateMonthlyInterest(newPrincipal, borrower.interestRate, borrower.rateType);

    const updatedRemarks = notes
      ? `${borrower.remarks ? borrower.remarks + '\n' : ''}[${new Date().toLocaleDateString('en-IN')}]: Received ${paymentType} payment of ₹${parsedAmount}. ${notes}`
      : borrower.remarks;

    const updatedBorrower = await prisma.borrower.update({
      where: { id },
      data: {
        principalAmount: newPrincipal,
        monthlyInterest: newMonthlyInterest,
        nextPaymentDate: nextDate,
        status: newStatus,
        remarks: updatedRemarks,
      },
      include: {
        payments: { orderBy: { paidAt: 'desc' } },
        notifications: { orderBy: { sentAt: 'desc' } },
      },
    });

    return NextResponse.json({ payment, borrower: updatedBorrower }, { status: 201 });
  } catch (error: any) {
    console.error('Error recording payment:', error);
    return NextResponse.json({ error: error.message || 'Failed to record payment' }, { status: 500 });
  }
}
