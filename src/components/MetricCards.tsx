'use client';

import React from 'react';
import { TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { formatCurrency, getDaysUntilDate } from '@/lib/calculator';

interface BorrowerData {
  id: string;
  principalAmount: number;
  monthlyInterest: number;
  status: string;
  nextPaymentDate: string | Date;
}

interface MetricCardsProps {
  borrowers: BorrowerData[];
}

export function MetricCards({ borrowers }: MetricCardsProps) {
  const activeBorrowers = borrowers.filter((b) => b.status === 'Active');

  const totalPrincipal = activeBorrowers.reduce((acc, curr) => acc + (curr.principalAmount || 0), 0);
  const totalMonthlyInterest = activeBorrowers.reduce((acc, curr) => acc + (curr.monthlyInterest || 0), 0);

  let dueTodayCount = 0;
  let dueTomorrowCount = 0;
  let overdueCount = 0;

  activeBorrowers.forEach((b) => {
    const days = getDaysUntilDate(b.nextPaymentDate);
    if (days === 0) dueTodayCount++;
    else if (days === 1) dueTomorrowCount++;
    else if (days < 0) overdueCount++;
  });

  const attentionNeededCount = dueTodayCount + dueTomorrowCount + overdueCount;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">
      {/* 1. Total Principal (₹) */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs relative group hover:border-slate-300 transition-all flex flex-col justify-between">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">
              Active Principal
            </p>
            <h3 className="text-base sm:text-2xl font-bold text-slate-900 mt-0.5 sm:mt-1 truncate">
              {formatCurrency(totalPrincipal)}
            </h3>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-sky-50 text-sky-700 font-extrabold text-base sm:text-lg flex items-center justify-center rounded-xl border border-sky-100 shrink-0">
            ₹
          </div>
        </div>
        <div className="mt-2 sm:mt-3 flex items-center text-[10px] sm:text-xs text-slate-500 truncate">
          <span>{activeBorrowers.length} active borrowers</span>
        </div>
      </div>

      {/* 2. Total Monthly Interest Income (₹) */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs relative group hover:border-slate-300 transition-all flex flex-col justify-between">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">
              Monthly Interest
            </p>
            <h3 className="text-base sm:text-2xl font-bold text-emerald-600 mt-0.5 sm:mt-1 truncate">
              {formatCurrency(totalMonthlyInterest)}
            </h3>
          </div>
          <div className="p-2 sm:p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shrink-0">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3 flex items-center text-[10px] sm:text-xs text-emerald-600 font-medium truncate">
          <span>Per monthly cycle</span>
        </div>
      </div>

      {/* 3. Active Borrowers */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs relative group hover:border-slate-300 transition-all flex flex-col justify-between">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">
              Borrowers
            </p>
            <h3 className="text-base sm:text-2xl font-bold text-slate-900 mt-0.5 sm:mt-1">
              {activeBorrowers.length}
            </h3>
          </div>
          <div className="p-2 sm:p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shrink-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3 flex items-center text-[10px] sm:text-xs text-slate-500 truncate">
          <span>{borrowers.filter(b => b.status === 'Completed').length} completed</span>
        </div>
      </div>

      {/* 4. Payment Alerts */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs relative group hover:border-slate-300 transition-all flex flex-col justify-between">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">
              Action Required
            </p>
            <h3 className={`text-base sm:text-2xl font-bold mt-0.5 sm:mt-1 ${attentionNeededCount > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
              {attentionNeededCount}
            </h3>
          </div>
          <div className={`p-2 sm:p-2.5 rounded-xl border shrink-0 ${attentionNeededCount > 0 ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3 flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-500 truncate">
          {dueTodayCount > 0 && <span className="font-semibold text-rose-600">{dueTodayCount} Today</span>}
          {dueTomorrowCount > 0 && <span className="font-medium text-amber-600">{dueTomorrowCount} Tmw</span>}
          {overdueCount > 0 && <span className="font-bold text-red-700">{overdueCount} Overdue</span>}
          {attentionNeededCount === 0 && <span className="text-emerald-600 truncate">All on track</span>}
        </div>
      </div>
    </div>
  );
}
