import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateMonthlyInterest, calculateEndDate } from '@/lib/calculator';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const borrower = await prisma.borrower.findUnique({
      where: { id },
      include: {
        payments: {
          orderBy: { paidAt: 'desc' },
        },
        notifications: {
          orderBy: { sentAt: 'desc' },
        },
      },
    });

    if (!borrower) {
      return NextResponse.json({ error: 'Borrower not found' }, { status: 404 });
    }

    return NextResponse.json(borrower);
  } catch (error: any) {
    console.error('Error fetching borrower detail:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch borrower' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await prisma.borrower.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Borrower not found' }, { status: 404 });
    }

    const principalAmount = body.principalAmount !== undefined ? parseFloat(body.principalAmount) : existing.principalAmount;
    const interestRate = body.interestRate !== undefined ? parseFloat(body.interestRate) : existing.interestRate;
    const rateType = body.rateType !== undefined ? body.rateType : existing.rateType;
    const durationMonths = body.durationMonths !== undefined ? parseInt(body.durationMonths, 10) : existing.durationMonths;
    const startDate = body.startDate ? new Date(body.startDate) : existing.startDate;
    const nextPaymentDate = body.nextPaymentDate ? new Date(body.nextPaymentDate) : existing.nextPaymentDate;

    const monthlyInterest = calculateMonthlyInterest(principalAmount, interestRate, rateType);
    const endDate = calculateEndDate(startDate, durationMonths);

    const updated = await prisma.borrower.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name.trim() : existing.name,
        phone: body.phone !== undefined ? body.phone.trim() : existing.phone,
        email: body.email !== undefined ? (body.email ? body.email.trim() : null) : existing.email,
        address: body.address !== undefined ? (body.address ? body.address.trim() : null) : existing.address,
        reference: body.reference !== undefined ? (body.reference ? body.reference.trim() : null) : existing.reference,
        principalAmount,
        interestRate,
        rateType,
        monthlyInterest,
        durationMonths,
        startDate,
        nextPaymentDate,
        endDate,
        remarks: body.remarks !== undefined ? body.remarks : existing.remarks,
        status: body.status !== undefined ? body.status : existing.status,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating borrower:', error);
    return NextResponse.json({ error: error.message || 'Failed to update borrower' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await prisma.borrower.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Borrower deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting borrower:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete borrower' }, { status: 500 });
  }
}
