'use client';

import React from 'react';
import { X, Bell, CheckCheck, ArrowRight } from 'lucide-react';

interface NotificationItem {
  id: string;
  type: string; // "DUE_TOMORROW" | "DUE_TODAY" | "OVERDUE"
  amountDue: number;
  message: string;
  sentAt: string;
  isRead: boolean;
  borrower?: {
    id: string;
    name: string;
    phone: string;
    email?: string | null;
    status: string;
  };
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  unreadCount: number;
  onMarkRead: (notificationId: string) => void;
  onMarkAllRead: () => void;
  onSelectBorrowerId: (borrowerId: string) => void;
}

export function NotificationDrawer({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onSelectBorrowerId,
}: NotificationDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs transition-opacity">
      <div className="absolute inset-y-0 right-0 max-w-full flex w-full sm:w-auto">
        <div className="w-full sm:w-screen sm:max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-sky-100 text-sky-700 rounded-xl">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Payment Reminder Alerts</h3>
                <p className="text-xs text-slate-500">{unreadCount} unread reminder{unreadCount === 1 ? '' : 's'}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700 p-2 hover:bg-sky-50 rounded-lg flex items-center gap-1 min-h-[36px]"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline sm:inline">Mark all read</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 sm:space-y-3">
            {notifications.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Bell className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-semibold text-slate-700">No Notifications</p>
                <p className="text-xs text-slate-500 mt-1">
                  Daily 1-day before and due date reminders will appear here automatically.
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const isDueToday = n.type === 'DUE_TODAY';
                const isDueTomorrow = n.type === 'DUE_TOMORROW';

                return (
                  <div
                    key={n.id}
                    className={`p-3 sm:p-3.5 rounded-2xl border transition-all relative ${
                      !n.isRead
                        ? isDueToday
                          ? 'bg-rose-50/70 border-rose-200 shadow-xs'
                          : isDueTomorrow
                          ? 'bg-amber-50/70 border-amber-200 shadow-xs'
                          : 'bg-blue-50/70 border-blue-200 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      {/* Icon Badge */}
                      <div
                        className={`mt-0.5 px-2 py-1 rounded-lg text-[10px] font-bold shrink-0 ${
                          isDueToday
                            ? 'bg-rose-500 text-white'
                            : isDueTomorrow
                            ? 'bg-amber-500 text-white'
                            : 'bg-blue-500 text-white'
                        }`}
                      >
                        {isDueToday ? 'TODAY' : isDueTomorrow ? '1-DAY' : 'ALERT'}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 leading-snug">
                          {n.message}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-slate-500 mt-1">
                          <span>{new Date(n.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>•</span>
                          <span>{new Date(n.sentAt).toLocaleDateString('en-IN')}</span>
                        </div>

                        {/* Actions */}
                        <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                          {n.borrower && (
                            <button
                              onClick={() => {
                                onSelectBorrowerId(n.borrower!.id);
                                onClose();
                              }}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-800 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs min-h-[32px]"
                            >
                              <span>View Borrower</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          {!n.isRead && (
                            <button
                              onClick={() => onMarkRead(n.id)}
                              className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500 shrink-0">
            Automated CRON runs daily at 08:00 AM
          </div>
        </div>
      </div>
    </div>
  );
}
