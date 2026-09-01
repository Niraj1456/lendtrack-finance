'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { MetricCards } from '@/components/MetricCards';
import { DashboardTable, Borrower } from '@/components/DashboardTable';
import { BorrowerFormModal } from '@/components/BorrowerFormModal';
import { BorrowerDetailModal } from '@/components/BorrowerDetailModal';
import { RecordPaymentModal } from '@/components/RecordPaymentModal';
import { NotificationDrawer } from '@/components/NotificationDrawer';
import { CheckCircle, AlertTriangle, Plus } from 'lucide-react';

export default function Home() {
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCronRunning, setIsCronRunning] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'alert' } | null>(null);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingBorrower, setEditingBorrower] = useState<Borrower | null>(null);
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBorrowerId, setSelectedBorrowerId] = useState<string | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentBorrower, setPaymentBorrower] = useState<Borrower | null>(null);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Show toast notification
  const showToast = (text: string, type: 'success' | 'info' | 'alert' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch borrowers
  const fetchBorrowers = useCallback(async () => {
    try {
      const res = await fetch('/api/borrowers');
      if (res.ok) {
        const data = await res.json();
        setBorrowers(data);
      }
    } catch (err) {
      console.error('Failed to fetch borrowers:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchBorrowers();
    fetchNotifications();
  }, [fetchBorrowers, fetchNotifications]);

  // Handle Trigger CRON Check
  const handleTriggerCron = async () => {
    setIsCronRunning(true);
    try {
      const res = await fetch('/api/cron/trigger', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        const { dueTomorrow, dueToday, newNotificationsCreated } = data.result || {};
        const totalAlerts = (dueTomorrow?.length || 0) + (dueToday?.length || 0);
        showToast(
          `Reminder check complete: ${totalAlerts} payment(s) due (${dueToday?.length || 0} today, ${dueTomorrow?.length || 0} tomorrow). ${newNotificationsCreated} new alert(s) logged.`,
          totalAlerts > 0 ? 'alert' : 'info'
        );
        fetchNotifications();
        fetchBorrowers();
      }
    } catch (err) {
      console.error('CRON trigger failed', err);
      showToast('Failed to execute reminder check', 'alert');
    } finally {
      setIsCronRunning(false);
    }
  };

  // Handlers for Borrower Actions
  const handleOpenAddModal = () => {
    setEditingBorrower(null);
    setIsFormModalOpen(true);
  };

  const handleEditBorrower = (borrower: Borrower) => {
    setEditingBorrower(borrower);
    setIsFormModalOpen(true);
  };

  const handleSelectBorrower = (borrower: Borrower) => {
    setSelectedBorrowerId(borrower.id);
    setIsDetailModalOpen(true);
  };

  const handleRecordPayment = (borrower: Borrower) => {
    setPaymentBorrower(borrower);
    setIsPaymentModalOpen(true);
  };

  const handleDeleteBorrower = async (borrowerId: string) => {
    try {
      const res = await fetch(`/api/borrowers/${borrowerId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Borrower deleted successfully');
        fetchBorrowers();
        fetchNotifications();
      }
    } catch (err) {
      console.error('Failed to delete borrower', err);
    }
  };

  const handleMarkNotificationRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased">
      {/* Toast banner (Mobile bottom, Desktop bottom-right) */}
      {toastMessage && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-semibold max-w-md ${
              toastMessage.type === 'alert'
                ? 'bg-amber-900 text-amber-50 border-amber-800'
                : toastMessage.type === 'info'
                ? 'bg-sky-900 text-sky-50 border-sky-800'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            {toastMessage.type === 'alert' ? (
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        onOpenAddModal={handleOpenAddModal}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onTriggerCron={handleTriggerCron}
        isCronRunning={isCronRunning}
        unreadCount={unreadCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-20 sm:pb-8">
        {/* Page Title & Intro */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Loan & Interest Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
            Real-time tracking of borrowed capital, automated monthly interest calculations, and daily payment reminder alerts.
          </p>
        </div>

        {/* Top Summary Metrics */}
        <MetricCards borrowers={borrowers} />

        {/* Core Borrower Table / Card View */}
        <DashboardTable
          borrowers={borrowers}
          onSelectBorrower={handleSelectBorrower}
          onEditBorrower={handleEditBorrower}
          onRecordPayment={handleRecordPayment}
          onDeleteBorrower={handleDeleteBorrower}
          isLoading={isLoading}
        />
      </main>

      {/* Floating Action Button for mobile devices */}
      <div className="fixed sm:hidden bottom-5 right-5 z-40">
        <button
          onClick={handleOpenAddModal}
          className="w-14 h-14 bg-sky-600 active:bg-sky-700 text-white rounded-full shadow-lg flex items-center justify-center border-2 border-white ring-4 ring-sky-500/20 active:scale-95 transition-transform"
          aria-label="Add new borrower"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>
      </div>

      {/* Modals & Drawers */}
      <BorrowerFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        initialData={editingBorrower}
        onSuccess={() => {
          fetchBorrowers();
          showToast(editingBorrower ? 'Borrower updated successfully!' : 'New borrower registered successfully!');
        }}
      />

      <BorrowerDetailModal
        borrowerId={selectedBorrowerId}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={(b) => {
          setIsDetailModalOpen(false);
          handleEditBorrower(b);
        }}
        onRecordPayment={(b) => {
          setIsDetailModalOpen(false);
          handleRecordPayment(b);
        }}
        onDataChanged={() => {
          fetchBorrowers();
        }}
      />

      <RecordPaymentModal
        borrower={paymentBorrower}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={() => {
          fetchBorrowers();
          fetchNotifications();
          showToast('Payment recorded and next payment date updated!');
        }}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onSelectBorrowerId={(id) => {
          setSelectedBorrowerId(id);
          setIsDetailModalOpen(true);
        }}
      />
    </div>
  );
}
