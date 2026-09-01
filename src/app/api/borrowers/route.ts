import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateMonthlyInterest, calculateEndDate } from '@/lib/calculator';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
        { address: { contains: search } },
        { reference: { contains: search } },
      ];
    }

    const borrowers = await prisma.borrower.findMany({
      where,
      orderBy: { nextPaymentDate: 'asc' },
      include: {
        payments: {
          orderBy: { paidAt: 'desc' },
          take: 5,
        },
        notifications: {
          orderBy: { sentAt: 'desc' },
          take: 3,
        },
      },
    });

    return NextResponse.json(borrowers);
  } catch (error: any) {
    console.error('Error fetching borrowers:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch borrowers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      phone,
      email,
      address,
      reference,
      principalAmount,
      interestRate,
      rateType = 'MONTHLY',
      durationMonths,
      startDate,
      nextPaymentDate,
      remarks,
      status = 'Active',
    } = body;

    if (!name || !phone || principalAmount == null || interestRate == null || !durationMonths) {
      return NextResponse.json(
        { error: 'Missing mandatory fields: Name, Phone, Principal Amount, Interest Rate, and Duration are required.' },
        { status: 400 }
      );
    }

    const parsedPrincipal = parseFloat(principalAmount);
    const parsedRate = parseFloat(interestRate);
    const parsedDuration = parseInt(durationMonths, 10);
    const parsedStartDate = startDate ? new Date(startDate) : new Date();

    const monthlyInterest = calculateMonthlyInterest(parsedPrincipal, parsedRate, rateType);

    let parsedNextPaymentDate: Date;
    if (nextPaymentDate) {
      parsedNextPaymentDate = new Date(nextPaymentDate);
    } else {
      parsedNextPaymentDate = new Date(parsedStartDate);
      parsedNextPaymentDate.setMonth(parsedNextPaymentDate.getMonth() + 1);
    }

    const endDate = calculateEndDate(parsedStartDate, parsedDuration);

    const borrower = await prisma.borrower.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        email: email ? email.trim() : null,
        address: address ? address.trim() : null,
        reference: reference ? reference.trim() : null,
        principalAmount: parsedPrincipal,
        interestRate: parsedRate,
        rateType,
        monthlyInterest,
        durationMonths: parsedDuration,
        startDate: parsedStartDate,
        nextPaymentDate: parsedNextPaymentDate,
        endDate,
        remarks: remarks ? remarks.trim() : '',
        status,
      },
    });

    return NextResponse.json(borrower, { status: 201 });
  } catch (error: any) {
    console.error('Error creating borrower:', error);
    return NextResponse.json({ error: error.message || 'Failed to create borrower' }, { status: 500 });
  }
}
