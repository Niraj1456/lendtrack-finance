# 💰 LendTrack - Loan & Monthly Interest Management System

A modern, fast, and responsive loan and monthly interest tracking platform built with **Next.js 15**, **Prisma ORM**, and **Tailwind CSS**. It automates interest calculation in Indian Rupees (₹), payment tracking, and triggers proactive admin notifications 1 day prior and on the exact payment due date.

---

## ✨ Core Features

- 🇮🇳 **Indian Rupee (₹) Financial Tracking**: Real-time interest calculation in ₹ (supporting 2–3% monthly or 18% annual APR) formatted using the Indian numbering system.
- 📱 **Mobile & Desktop Responsive**:
  - **Phone (< 768px)**: Adaptive **Card List** with one-tap 📞 **Call**, 💬 **WhatsApp Reminder**, and ⚡ **Pay** actions.
  - **Tablet & Desktop (≥ 1024px)**: Full multi-column data table with sortable columns, search, and status badges.
- 📍 **Borrower Location & References**: Tracks full residential address and reference contacts (Guarantor / referral) with optional email.
- 🔔 **Automated Reminder Engine (CRON Job)**:
  - **1 Day Before ($T-1$)**: Dispatches `"Payment of ₹[Amount] due tomorrow for [Person Name]."`.
  - **Due Date ($T-0$)**: Dispatches `"Payment of ₹[Amount] is due TODAY for [Person Name]."`.
  - **Vercel Cron Configured**: Daily automatic trigger at `08:00 AM`.
- 👤 **Borrower Detail Slide-over**: Full payment history ledger, loan timelines, and dated custom remarks.
- 💳 **Payment Recording**: Log monthly interest or principal repayments with automatic 1-month advancement of the next payment cycle.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Sync database & seed demo records
npx prisma db push
npm run seed

# 3. Run development server
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🌐 Deploying to Vercel

The project is fully pre-configured for Vercel with `vercel.json` (Vercel Cron for daily reminders) and automatic Prisma generation during builds.

### Option 1: Deploy via Vercel CLI (Quickest)

Open your terminal in this directory and run:

```bash
# Log in to your Vercel account
npx vercel login

# Deploy the project
npx vercel
```

Follow the prompt selections:
- Set up and deploy: **`Y`**
- Which scope: *(Select your account/team)*
- Link to existing project: **`N`**
- Project name: **`finance-loan-tracker`**
- Directory: **`./`**

To deploy to production:
```bash
npx vercel --prod
```

---

### Option 2: Deploy via GitHub & Vercel Dashboard (Recommended for Cloud DB)

1. **Push this Git repository to your GitHub**:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your GitHub repository and click **Import**.
   - Under **Environment Variables**, add:
     - `DATABASE_URL`: Your cloud PostgreSQL connection string (from [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)).
   - Click **Deploy**!

3. **Initialize Database Tables**:
   After deployment, run your database migration once:
   ```bash
   DATABASE_URL="<your-cloud-db-url>" npx prisma db push
   ```
