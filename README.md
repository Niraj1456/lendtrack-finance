# 💰 LendTrack - Loan & Interest Management System

A modern, fast, and interactive loan and monthly interest tracking platform built with **Next.js 15**, **Prisma ORM**, and **Tailwind CSS**. It automates interest calculation, payment tracking, and triggers proactive admin notifications 1 day prior and on the exact payment due date.

---

## ✨ Features

- ⚡ **Real-Time Interest Calculation**: Instantly computes and updates monthly interest owed as you type Principal and Interest Rate, with support for both **Monthly %** and **Annual % (APR)**.
- 📊 **Interactive Dashboard**: KPI summary cards for Total Principal Lent, Expected Monthly Interest, Active Borrowers, and Action Required.
- 🗓️ **Due Date & Days-Left Tracking**: Color-coded status badges indicating loans due today (🔴), due tomorrow (🟡), or upcoming/overdue.
- 🔔 **Automated Reminder Engine (CRON Job)**:
  - **1 Day Before ($T-1$)**: Dispatches `"Payment of $[Amount] due tomorrow for [Person Name]."`.
  - **Due Date ($T-0$)**: Dispatches `"Payment of $[Amount] is due TODAY for [Person Name]."`.
  - **Manual Trigger**: Built-in "Run Reminder Check" button to immediately simulate or force a daily check.
- 👤 **Borrower Detail Slide-over**: View complete financial metrics, repayment timeline, recorded payment history ledger, and append dated custom remarks.
- 💳 **Payment Recording**: Log interest or principal repayments with automatic advancement of the next cycle due date.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, React 19, TypeScript)
- **Database & ORM**: [Prisma ORM](https://www.prisma.io/) with **SQLite** (plug-and-play local) or **PostgreSQL**
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Lucide React](https://lucide.dev/) icons
- **Scheduler**: `node-cron` daily background job at `08:00 AM` + REST trigger endpoint

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database & Seed Demo Data
```bash
npx prisma db push
npm run seed
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Database Model (`prisma/schema.prisma`)

```prisma
model Borrower {
  id              String       @id @default(cuid())
  name            String       // Full name
  phone           String       // Contact phone
  email           String       // Contact email
  principalAmount Float        // Total Amount given (Principal)
  interestRate    Float        // E.g. 2.5% monthly or 15% annual
  rateType        String       @default("MONTHLY") // "MONTHLY" | "ANNUAL"
  monthlyInterest Float        // Auto-calculated monthly interest owed
  durationMonths  Int          // Time frame in months
  startDate       DateTime     @default(now())
  nextPaymentDate DateTime     // Next cycle due date
  endDate         DateTime?    // Final loan payoff date
  remarks         String?      // Notes (e.g. extensions, partial payments)
  status          String       @default("Active") // "Active" | "Completed" | "Defaulted"
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  payments        Payment[]
  notifications   NotificationLog[]
}

model Payment {
  id          String   @id @default(cuid())
  borrowerId  String
  borrower    Borrower @relation(fields: [borrowerId], references: [id], onDelete: Cascade)
  amount      Float
  paymentType String   @default("INTEREST") // "INTEREST" | "PRINCIPAL" | "BOTH"
  paidAt      DateTime @default(now())
  notes       String?
}

model NotificationLog {
  id          String   @id @default(cuid())
  borrowerId  String
  borrower    Borrower @relation(fields: [borrowerId], references: [id], onDelete: Cascade)
  type        String   // "DUE_TOMORROW" | "DUE_TODAY" | "OVERDUE"
  amountDue   Float
  message     String
  sentAt      DateTime @default(now())
  isRead      Boolean  @default(false)
}
```

---

## ⏰ Automated Reminder System & CRON Logic

Located in [`src/lib/cron-scheduler.ts`](./src/lib/cron-scheduler.ts), the engine evaluates all active borrowers:

1. **Calculates Days Left**:
   $$\text{Days Remaining} = \text{DueDate (midnight)} - \text{Today (midnight)}$$
2. **1 Day Before ($T-1$)**:
   Generates alert: `"Payment of $[Amount] due tomorrow for [Person Name]."`
3. **On the Due Date ($T-0$)**:
   Generates alert: `"Payment of $[Amount] is due TODAY for [Person Name]."`
4. **API Trigger Endpoint**:
   `POST /api/cron/trigger` can be called anytime or hooked to external webhooks (Vercel Cron, AWS EventBridge, GitHub Actions).

---

## 🧪 Verification & Testing

To run the automated verification script:
```bash
npx tsx test-verification.ts
```
