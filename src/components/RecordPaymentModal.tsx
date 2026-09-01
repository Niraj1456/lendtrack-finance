'use client';

import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/calculator';
import { Borrower } from './DashboardTable';

interface RecordPaymentModalProps {
  borrower: Borrower | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RecordPaymentModal({
  borrower,
  isOpen,
  onClose,
  onSuccess,
}: RecordPaymentModalProps) {
  const [amount, setAmount] = useState<string>(
    borrower?.monthlyInterest ? borrower.monthlyInterest.toString() : ''
  );
  const [paymentType, setPaymentType] = useState<'INTEREST' | 'PRINCIPAL' | 'BOTH'>('INTEREST');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync default amount when borrower changes
  React.useEffect(() => {
    if (borrower) {
      setAmount(borrower.monthlyInterest?.toString() || '');
      setNotes('');
      setErrorMsg(null);
    }
  }, [borrower]);

  if (!isOpen || !borrower) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setErrorMsg('Please enter a valid payment amount.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/borrowers/${borrower.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parsedAmount,
          paymentType,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record payment');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-150 max-h-[92dvh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900">Record Payment (₹)</h2>
            <p className="text-xs text-slate-500">For {borrower.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">
          {/* Quick preset card */}
          <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-3 flex justify-between items-center text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Monthly Due:</span>
              <span className="text-base font-bold text-sky-700">{formatCurrency(borrower.monthlyInterest)}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setAmount(borrower.monthlyInterest.toString());
                setPaymentType('INTEREST');
              }}
              className="px-3 py-1.5 bg-white border border-sky-200 text-sky-700 font-semibold text-xs rounded-lg hover:bg-sky-50 shadow-2xs min-h-[34px]"
            >
              Use Monthly Due
            </button>
          </div>

          {/* Payment Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Payment Type</label>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {(['INTEREST', 'PRINCIPAL', 'BOTH'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPaymentType(type)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all min-h-[40px] ${
                    paymentType === type
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {type === 'INTEREST' ? 'Monthly Interest' : type === 'PRINCIPAL' ? 'Principal Repay' : 'Both / Full'}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {paymentType === 'INTEREST'
                ? 'Advances next payment cycle date by 1 month.'
                : paymentType === 'PRINCIPAL'
                ? 'Reduces outstanding principal balance.'
                : 'Custom full/combined payment.'}
            </p>
          </div>

          {/* Amount in INR (₹) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Amount Paid (₹)</label>
            <div className="relative">
              <span className="text-slate-500 font-bold text-lg absolute left-3.5 top-2">₹</span>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-base font-bold text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none min-h-[44px]"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method / Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. UPI / Google Pay / Cash / Bank Transfer"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-base sm:text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none min-h-[42px]"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors min-h-[42px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all min-h-[42px]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Recording...' : 'Confirm Payment (₹)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
