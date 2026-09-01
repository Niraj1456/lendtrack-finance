'use client';

import React, { useState, useEffect } from 'react';
import { X, Calculator, Percent, User, Phone, Mail, MapPin, Users, CheckCircle2 } from 'lucide-react';
import { calculateMonthlyInterest, formatCurrency, RateType } from '@/lib/calculator';

interface BorrowerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any | null; // For Edit mode
}

export function BorrowerFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: BorrowerFormModalProps) {
  const isEdit = Boolean(initialData?.id);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [reference, setReference] = useState('');
  const [principalAmount, setPrincipalAmount] = useState<string>('');
  const [interestRate, setInterestRate] = useState<string>('');
  const [rateType, setRateType] = useState<RateType>('MONTHLY');
  const [durationMonths, setDurationMonths] = useState<string>('12');
  const [startDate, setStartDate] = useState<string>('');
  const [nextPaymentDate, setNextPaymentDate] = useState<string>('');
  const [remarks, setRemarks] = useState('');
  const [status, setStatus] = useState('Active');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize form when opened or initialData changes
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setPhone(initialData.phone || '');
      setEmail(initialData.email || '');
      setAddress(initialData.address || '');
      setReference(initialData.reference || '');
      setPrincipalAmount(initialData.principalAmount?.toString() || '');
      setInterestRate(initialData.interestRate?.toString() || '');
      setRateType((initialData.rateType as RateType) || 'MONTHLY');
      setDurationMonths(initialData.durationMonths?.toString() || '12');
      setStartDate(
        initialData.startDate
          ? new Date(initialData.startDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setNextPaymentDate(
        initialData.nextPaymentDate
          ? new Date(initialData.nextPaymentDate).toISOString().split('T')[0]
          : ''
      );
      setRemarks(initialData.remarks || '');
      setStatus(initialData.status || 'Active');
    } else {
      // Default new form values
      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setReference('');
      setPrincipalAmount('');
      setInterestRate('2'); // Standard 2% monthly in India
      setRateType('MONTHLY');
      setDurationMonths('12');
      setStartDate(today.toISOString().split('T')[0]);
      setNextPaymentDate(nextMonth.toISOString().split('T')[0]);
      setRemarks('');
      setStatus('Active');
    }
    setErrorMsg(null);
  }, [initialData, isOpen]);

  // Update Next Payment Date automatically when start date changes (if in Add mode)
  const handleStartDateChange = (newStart: string) => {
    setStartDate(newStart);
    if (!isEdit && newStart) {
      const d = new Date(newStart);
      d.setMonth(d.getMonth() + 1);
      setNextPaymentDate(d.toISOString().split('T')[0]);
    }
  };

  // Live real-time calculations
  const numPrincipal = parseFloat(principalAmount) || 0;
  const numRate = parseFloat(interestRate) || 0;
  const numDuration = parseInt(durationMonths, 10) || 1;

  const liveMonthlyInterest = calculateMonthlyInterest(numPrincipal, numRate, rateType);
  const totalInterestOverDuration = liveMonthlyInterest * numDuration;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Please enter the person\'s full name.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Please provide a contact phone number.');
      return;
    }
    if (numPrincipal <= 0) {
      setErrorMsg('Please enter a valid Principal Amount (greater than ₹0).');
      return;
    }
    if (numRate <= 0) {
      setErrorMsg('Please enter an Interest Rate greater than 0%.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name,
        phone,
        email: email.trim() || null,
        address: address.trim() || null,
        reference: reference.trim() || null,
        principalAmount: numPrincipal,
        interestRate: numRate,
        rateType,
        durationMonths: numDuration,
        startDate,
        nextPaymentDate,
        remarks,
        status,
      };

      const url = isEdit ? `/api/borrowers/${initialData.id}` : '/api/borrowers';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save borrower details');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-150 max-h-[92dvh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {isEdit ? 'Edit Borrower / Loan Details' : 'Add New Borrower (₹)'}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500">
              {isEdit
                ? 'Update terms, schedules, references, address, or remarks'
                : 'Register a loan with automated monthly interest calculation & daily reminder alerts'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {/* Section 1: Person & Contact Details */}
          <div className="space-y-2.5 sm:space-y-3">
            <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">1. Individual & Contact Info</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Person Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-base sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    inputMode="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-base sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    inputMode="email"
                    placeholder="ramesh.kumar@example.com (optional)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-base sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Address & Reference Info */}
          <div className="space-y-2.5 sm:space-y-3 pt-1">
            <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">2. Address & References / Guarantor</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Borrower Address</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="#42, MG Road, Indiranagar, Bengaluru - 560038"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-base sm:text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none resize-none"
                />
              </div>

              {/* Reference Info */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Reference Contacts & Guarantor</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Ref 1: Suresh (Brother) - 9845012345; Ref 2: Manoj - 9988776655"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full px-3 py-2 text-base sm:text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Financial Details & Interest Calculation */}
          <div className="space-y-2.5 sm:space-y-3 pt-1">
            <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">3. Financial Terms & Live Calculation</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {/* Total Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Principal (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="text-slate-500 font-bold absolute left-3 top-2.5 text-base sm:text-sm">₹</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min="1"
                    required
                    placeholder="100000"
                    value={principalAmount}
                    onChange={(e) => setPrincipalAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-base sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Interest Rate */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Interest Rate (%) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Percent className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="2.0"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-base sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Rate Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rate Frequency
                </label>
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 min-h-[42px] sm:min-h-[38px] items-center">
                  <button
                    type="button"
                    onClick={() => setRateType('MONTHLY')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      rateType === 'MONTHLY'
                        ? 'bg-white text-sky-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Monthly %
                  </button>
                  <button
                    type="button"
                    onClick={() => setRateType('ANNUAL')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      rateType === 'ANNUAL'
                        ? 'bg-white text-sky-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Annual %
                  </button>
                </div>
              </div>
            </div>

            {/* LIVE INTEREST CALCULATION HIGHLIGHT BOX */}
            <div className="bg-gradient-to-r from-sky-50 via-indigo-50 to-blue-50 border border-sky-200/80 rounded-2xl p-3 sm:p-4 shadow-xs">
              <div className="flex items-center gap-2 text-sky-800 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5">
                <Calculator className="w-4 h-4 text-sky-600" />
                <span>Auto-Calculated Monthly Interest</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5 sm:gap-2">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-sky-700">
                    {formatCurrency(liveMonthlyInterest)}
                    <span className="text-xs sm:text-sm font-semibold text-sky-600 ml-1">/ month</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">
                    {rateType === 'MONTHLY'
                      ? `Based on ${numRate}% monthly interest on ${formatCurrency(numPrincipal)} principal`
                      : `Based on ${numRate}% annual interest on ${formatCurrency(numPrincipal)}`}
                  </p>
                </div>

                <div className="text-left sm:text-right sm:border-l sm:border-sky-200/80 sm:pl-4 pt-1 sm:pt-0">
                  <div className="text-[11px] text-slate-500 font-medium">Est. Total Interest ({numDuration} mo):</div>
                  <div className="text-xs sm:text-sm font-bold text-slate-800">{formatCurrency(totalInterestOverDuration)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Timeline & Status */}
          <div className="space-y-2.5 sm:space-y-3 pt-1">
            <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">4. Dates & Status</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Duration (Mo)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="120"
                  required
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(e.target.value)}
                  className="w-full px-3 py-2 text-base sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Next Due <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={nextPaymentDate}
                  onChange={(e) => setNextPaymentDate(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none font-semibold text-slate-900 bg-sky-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 text-base sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none bg-white font-medium min-h-[42px] sm:min-h-[38px]"
                >
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Defaulted">Defaulted</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Remarks */}
          <div className="space-y-1 pt-1">
            <label className="block text-xs font-semibold text-slate-700">
              Remarks & Custom Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Given via cash / UPI. Agreed interest payment date on 5th..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 text-base sm:text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none resize-none"
            />
          </div>

          {/* Sticky/Fixed Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 sticky bottom-0 bg-white">
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
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 active:scale-[0.98] rounded-xl shadow-md shadow-sky-500/20 disabled:opacity-50 transition-all min-h-[42px]"
            >
              {isSubmitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEdit ? 'Update Details' : 'Save & Track (₹)'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
