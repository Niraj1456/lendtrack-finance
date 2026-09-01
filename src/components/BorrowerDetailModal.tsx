'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Users,
  Clock,
  FileText,
  Plus,
  Send,
  Edit2,
  Calendar,
} from 'lucide-react';
import { formatCurrency, getDaysUntilDate, getPaymentBadgeInfo } from '@/lib/calculator';
import { Borrower } from './DashboardTable';

interface Payment {
  id: string;
  amount: number;
  paymentType: string;
  paidAt: string;
  notes?: string;
}

interface BorrowerDetailModalProps {
  borrowerId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (borrower: Borrower) => void;
  onRecordPayment: (borrower: Borrower) => void;
  onDataChanged: () => void;
}

export function BorrowerDetailModal({
  borrowerId,
  isOpen,
  onClose,
  onEdit,
  onRecordPayment,
  onDataChanged,
}: BorrowerDetailModalProps) {
  const [borrower, setBorrower] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newRemark, setNewRemark] = useState('');
  const [isAddingRemark, setIsAddingRemark] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    if (borrowerId && isOpen) {
      fetchBorrowerDetails();
    }
  }, [borrowerId, isOpen]);

  const fetchBorrowerDetails = async () => {
    if (!borrowerId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/borrowers/${borrowerId}`);
      if (res.ok) {
        const data = await res.json();
        setBorrower(data);
      }
    } catch (err) {
      console.error('Failed to load details', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRemark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRemark.trim() || !borrower) return;

    setIsAddingRemark(true);
    try {
      const timestamp = new Date().toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const updatedRemarks = borrower.remarks
        ? `${borrower.remarks}\n[${timestamp}]: ${newRemark.trim()}`
        : `[${timestamp}]: ${newRemark.trim()}`;

      const res = await fetch(`/api/borrowers/${borrower.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks: updatedRemarks }),
      });

      if (res.ok) {
        const updated = await res.json();
        setBorrower(updated);
        setNewRemark('');
        onDataChanged();
      }
    } catch (err) {
      console.error('Failed to append remark', err);
    } finally {
      setIsAddingRemark(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!borrower) return;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/borrowers/${borrower.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setBorrower(updated);
        onDataChanged();
      }
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (!isOpen) return null;

  const daysLeft = borrower ? getDaysUntilDate(borrower.nextPaymentDate) : 0;
  const badgeInfo = getPaymentBadgeInfo(daysLeft);

  const totalPaidInterest = borrower?.payments
    ? borrower.payments
        .filter((p: Payment) => p.paymentType === 'INTEREST' || p.paymentType === 'BOTH')
        .reduce((sum: number, p: Payment) => sum + p.amount, 0)
    : 0;

  // WhatsApp shortcut
  const getWhatsAppUrl = () => {
    if (!borrower) return '#';
    const cleaned = borrower.phone.replace(/[^0-9]/g, '');
    const formattedAmount = formatCurrency(borrower.monthlyInterest);
    const msg = encodeURIComponent(`Hi ${borrower.name}, this is a reminder regarding your monthly interest payment of ${formattedAmount}.`);
    return `https://wa.me/${cleaned}?text=${msg}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-150 max-h-[94dvh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm sm:text-base shrink-0">
              {borrower?.name ? borrower.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-1.5 sm:gap-2 truncate">
                <span className="truncate">{borrower?.name || 'Borrower Profile'}</span>
                {borrower?.status && (
                  <span
                    className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-semibold border shrink-0 ${
                      borrower.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : borrower.status === 'Completed'
                        ? 'bg-slate-100 text-slate-700 border-slate-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {borrower.status}
                  </span>
                )}
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">ID: {borrower?.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {borrower && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(borrower);
                }}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 rounded-xl transition-colors border border-slate-200 text-xs font-semibold flex items-center gap-1 min-h-[36px]"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit Terms</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {isLoading || !borrower ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs">Loading borrower profile...</span>
          </div>
        ) : (
          <div className="overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1">
            {/* Top Stat Ribbon (2x2 on Mobile, 4x1 on Desktop) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200/80">
              <div>
                <p className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-400">Total Principal</p>
                <p className="text-base sm:text-xl font-bold text-slate-900 mt-0.5 truncate">
                  {formatCurrency(borrower.principalAmount)}
                </p>
              </div>

              <div>
                <p className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-400">Monthly Interest</p>
                <p className="text-base sm:text-xl font-bold text-emerald-600 mt-0.5 truncate">
                  {formatCurrency(borrower.monthlyInterest)}
                  <span className="text-[10px] sm:text-xs font-normal text-slate-500"> ({borrower.interestRate}%)</span>
                </p>
              </div>

              <div>
                <p className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-400">Next Payment Due</p>
                <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 truncate">
                  {new Date(borrower.nextPaymentDate).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
                <span className={`inline-block mt-1 text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full border ${badgeInfo.badgeClass}`}>
                  {badgeInfo.label}
                </span>
              </div>

              <div>
                <p className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-400">Total Paid Interest</p>
                <p className="text-base sm:text-xl font-bold text-sky-700 mt-0.5 truncate">
                  {formatCurrency(totalPaidInterest)}
                </p>
              </div>
            </div>

            {/* Direct Communication Bar on Mobile */}
            <div className="flex items-center gap-2 p-2 bg-slate-100/70 rounded-xl border border-slate-200/80">
              <a
                href={`tel:${borrower.phone}`}
                className="flex-1 py-2 px-3 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-lg border border-slate-200 flex items-center justify-center gap-1.5 shadow-2xs min-h-[38px]"
              >
                <Phone className="w-3.5 h-3.5 text-sky-600" />
                <span>Call ({borrower.phone})</span>
              </a>
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-2xs min-h-[38px]"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Contact, Address & Reference Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Contact & Address */}
              <div className="border border-slate-200 rounded-xl p-3.5 sm:p-4 space-y-2 text-xs sm:text-sm">
                <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Contact & Address</h4>
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <a href={`tel:${borrower.phone}`} className="hover:text-sky-600 font-medium">
                    {borrower.phone}
                  </a>
                </div>
                {borrower.email && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <a href={`mailto:${borrower.email}`} className="hover:text-sky-600 font-medium truncate">
                      {borrower.email}
                    </a>
                  </div>
                )}
                {borrower.address ? (
                  <div className="flex items-start gap-2 text-slate-600 pt-1 border-t border-slate-100">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed text-xs">{borrower.address}</span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No address provided</p>
                )}
              </div>

              {/* Reference Info & Loan Terms */}
              <div className="border border-slate-200 rounded-xl p-3.5 sm:p-4 space-y-2 text-xs text-slate-700">
                <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Reference & Terms</h4>
                {borrower.reference ? (
                  <div className="flex items-start gap-2 text-slate-600 pb-2 border-b border-slate-100">
                    <Users className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium">{borrower.reference}</span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic pb-2 border-b border-slate-100">No reference provided</p>
                )}

                <div className="flex justify-between">
                  <span className="text-slate-500">Loan Start Date:</span>
                  <span className="font-semibold">{new Date(borrower.startDate).toLocaleDateString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Duration:</span>
                  <span className="font-semibold">{borrower.durationMonths} Months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Rate Basis:</span>
                  <span className="font-semibold">{borrower.rateType === 'ANNUAL' ? 'Annual % (p.a.)' : 'Monthly % (p.m.)'}</span>
                </div>
                {borrower.endDate && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Expected Maturity:</span>
                    <span className="font-semibold">{new Date(borrower.endDate).toLocaleDateString('en-IN')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment History Table */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Payment History ({borrower.payments?.length || 0})</span>
                </h4>
                {borrower.status === 'Active' && (
                  <button
                    onClick={() => {
                      onClose();
                      onRecordPayment(borrower);
                    }}
                    className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1 bg-sky-50 px-2.5 py-1.5 rounded-xl border border-sky-200 min-h-[34px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Record Payment (₹)</span>
                  </button>
                )}
              </div>

              {borrower.payments && borrower.payments.length > 0 ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                        <tr>
                          <th className="py-2.5 px-3 whitespace-nowrap">Date</th>
                          <th className="py-2.5 px-3 whitespace-nowrap">Amount</th>
                          <th className="py-2.5 px-3 whitespace-nowrap">Type</th>
                          <th className="py-2.5 px-3">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {borrower.payments.map((p: Payment) => (
                          <tr key={p.id} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-medium text-slate-700 whitespace-nowrap">
                              {new Date(p.paidAt).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-emerald-600 whitespace-nowrap">
                              {formatCurrency(p.amount)}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold">
                                {p.paymentType}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 italic text-[11px]">
                              {p.notes || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 bg-slate-50 p-4 rounded-xl text-center border border-dashed border-slate-200">
                  No payment records recorded yet.
                </div>
              )}
            </div>

            {/* Remarks & Notes Log */}
            <div className="space-y-2.5">
              <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Remarks & Custom Notes</span>
              </h4>

              {borrower.remarks ? (
                <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-3 text-xs text-slate-700 whitespace-pre-line leading-relaxed font-mono">
                  {borrower.remarks}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No notes added yet.</p>
              )}

              {/* Append Remark Form */}
              <form onSubmit={handleAddRemark} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Append a note (e.g. 'Paid via PhonePe...')..."
                  value={newRemark}
                  onChange={(e) => setNewRemark(e.target.value)}
                  className="flex-1 px-3 py-2 text-base sm:text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={isAddingRemark || !newRemark.trim()}
                  className="px-3.5 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-900 disabled:opacity-50 flex items-center gap-1.5 shrink-0 min-h-[38px]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Add Note</span>
                </button>
              </form>
            </div>

            {/* Status Quick Changer */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-slate-500 font-medium">Quick Status:</span>
              <div className="flex gap-1.5 flex-wrap">
                {borrower.status !== 'Active' && (
                  <button
                    onClick={() => handleStatusChange('Active')}
                    disabled={isUpdatingStatus}
                    className="text-xs px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-semibold border border-emerald-200 min-h-[34px]"
                  >
                    Mark Active
                  </button>
                )}
                {borrower.status !== 'Completed' && (
                  <button
                    onClick={() => handleStatusChange('Completed')}
                    disabled={isUpdatingStatus}
                    className="text-xs px-2.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-semibold border border-slate-200 min-h-[34px]"
                  >
                    Mark Completed
                  </button>
                )}
                {borrower.status !== 'Defaulted' && (
                  <button
                    onClick={() => handleStatusChange('Defaulted')}
                    disabled={isUpdatingStatus}
                    className="text-xs px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-semibold border border-rose-200 min-h-[34px]"
                  >
                    Mark Defaulted
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
