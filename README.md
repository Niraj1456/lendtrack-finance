# 💰 LendTrack - Loan & Monthly Interest Management System

A modern, fast, and responsive loan and monthly interest tracking platform built with **Next.js**, **Prisma ORM (SQLite)**, and **Tailwind CSS**. It automates interest calculation in Indian Rupees (₹), payment tracking, and triggers proactive admin notifications 1 day prior and on the exact payment due date.

---

## ✨ Core Features

- 🇮🇳 **Indian Rupee (₹) Financial Tracking**: Real-time interest calculation in ₹ (supporting 2–3% monthly or 18% annual APR) formatted with the Indian numbering system.
- 📱 **Mobile & Desktop Responsive**:
  - **Phone (< 768px)**: Adaptive **Card List** with one-tap 📞 **Call**, 💬 **WhatsApp Reminder**, and ⚡ **Quick Pay** actions.
  - **Tablet & Desktop (≥ 1024px)**: Full multi-column data table with sortable columns, search, and status badges.
- 📍 **Borrower Location & References**: Tracks residential address and reference contacts (Guarantor / referral) with optional email.
- 🔔 **Automated Reminder Engine (CRON Job)**:
  - **1 Day Before ($T-1$)**: Dispatches `"Payment of ₹[Amount] due tomorrow for [Person Name]."`.
  - **Due Date ($T-0$)**: Dispatches `"Payment of ₹[Amount] is due TODAY for [Person Name]."`.
  - **Manual Trigger**: "Run Reminder Check" button on top navbar to simulate daily check on demand.
- 👤 **Borrower Detail Slide-over**: Full payment history ledger, loan timelines, and dated custom remarks.
- 💳 **Payment Recording**: Log monthly interest or principal repayments with automatic 1-month advancement of the next payment cycle.

---

## 🚀 Quick Start (Local Setup)

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database & Seed Demo Data
```bash
npx prisma db push
npm run seed
```

### 3. Start Development Server
```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Run Automated Verification Tests

```bash
npx tsx test-verification.ts
```
