'use client';

import React from 'react';
import { Bell, Plus, Play, RefreshCw } from 'lucide-react';

interface NavbarProps {
  onOpenAddModal: () => void;
  onOpenNotifications: () => void;
  onTriggerCron: () => void;
  isCronRunning: boolean;
  unreadCount: number;
}

export function Navbar({
  onOpenAddModal,
  onOpenNotifications,
  onTriggerCron,
  isCronRunning,
  unreadCount,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 gap-2">
          {/* Brand & Logo */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-sm font-extrabold text-base sm:text-xl shrink-0">
              ₹
            </div>
            <div className="min-w-0">
              <span className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Lend<span className="text-sky-600">Track</span>
              </span>
              <span className="hidden md:inline-block ml-2 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                INR Loan & Reminder Engine
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Run CRON Test Button */}
            <button
              onClick={onTriggerCron}
              disabled={isCronRunning}
              title="Run automated 1-day and 0-day reminder check"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-colors border border-slate-200 disabled:opacity-50 min-h-[36px]"
            >
              {isCronRunning ? (
                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-sky-600" />
              ) : (
                <Play className="w-3.5 h-3.5 text-slate-600" />
              )}
              <span className="hidden sm:inline">Check Reminders</span>
              <span className="sm:hidden">Check</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 rounded-xl transition-colors border border-slate-200 min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-rose-500 text-[9px] sm:text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Add Borrower Button */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 active:scale-[0.97] rounded-xl shadow-xs transition-all min-h-[36px]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden xs:inline sm:inline">Add Borrower</span>
              <span className="xs:hidden sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
