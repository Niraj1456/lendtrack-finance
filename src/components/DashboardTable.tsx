'use client';

import React, { useState } from 'react';
import {
  Search,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  Phone,
  MessageCircle,
  MapPin,
  Users,
  ArrowUpDown,
  DollarSign,
  ChevronRight,
} from 'lucide-react';
import { formatCurrency, getDaysUntilDate, getPaymentBadgeInfo } from '@/lib/calculator';

interface Payment {
  id: string;
  amount: number;
  paymentType: string;
  paidAt: string;
}

export interface Borrower {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  reference?: string | null;
  principalAmount: number;
  interestRate: number;
  rateType: string;
  monthlyInterest: number;
  durationMonths: number;
  startDate: string;
  nextPaymentDate: string;
  endDate?: string;
  remarks?: string;
  status: string;
  payments?: Payment[];
}

interface DashboardTableProps {
  borrowers: Borrower[];
  onSelectBorrower: (borrower: Borrower) => void;
  onEditBorrower: (borrower: Borrower) => void;
  onRecordPayment: (borrower: Borrower) => void;
  onDeleteBorrower: (borrowerId: string) => void;
  isLoading: boolean;
}

export function DashboardTable({
  borrowers,
  onSelectBorrower,
  onEditBorrower,
  onRecordPayment,
  onDeleteBorrower,
  isLoading,
}: DashboardTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'ALL' | 'DUE_SOON' | 'COMPLETED' | 'DEFAULTED'>('ACTIVE');
  const [sortBy, setSortBy] = useState<'days' | 'amount' | 'name'>('days');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter borrowers
  const filteredBorrowers = borrowers.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      b.name.toLowerCase().includes(q) ||
      b.phone.includes(q) ||
      (b.email && b.email.toLowerCase().includes(q)) ||
      (b.address && b.address.toLowerCase().includes(q)) ||
      (b.reference && b.reference.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    const daysLeft = getDaysUntilDate(b.nextPaymentDate);

    // Status tab filter
    if (statusFilter === 'ACTIVE') return b.status === 'Active';
    if (statusFilter === 'DUE_SOON') return b.status === 'Active' && daysLeft <= 2;
    if (statusFilter === 'COMPLETED') return b.status === 'Completed';
    if (statusFilter === 'DEFAULTED') return b.status === 'Defaulted';
    return true; // 'ALL'
  });

  // Sort borrowers
  const sortedBorrowers = [...filteredBorrowers].sort((a, b) => {
    if (sortBy === 'days') {
      const daysA = getDaysUntilDate(a.nextPaymentDate);
      const daysB = getDaysUntilDate(b.nextPaymentDate);
      return sortOrder === 'asc' ? daysA - daysB : daysB - daysA;
    }
    if (sortBy === 'amount') {
      return sortOrder === 'asc' ? a.principalAmount - b.principalAmount : b.principalAmount - a.principalAmount;
    }
    if (sortBy === 'name') {
      return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    }
    return 0;
  });

  const toggleSort = (field: 'days' | 'amount' | 'name') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // WhatsApp helper
  const getWhatsAppUrl = (phone: string, name: string, monthlyInterest: number) => {
    const cleaned = phone.replace(/[^0-9]/g, '');
    const formattedAmount = formatCurrency(monthlyInterest);
    const msg = encodeURIComponent(`Hi ${name}, this is a gentle reminder regarding your monthly interest payment of ${formattedAmount}.`);
    return `https://wa.me/${cleaned}?text=${msg}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Toolbar / Search & Filter */}
      <div className="p-3.5 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center bg-slate-50/50">
        {/* Search Input */}
        <div className="relative flex-1 max-w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, phone, address, reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all shadow-xs"
          />
        </div>

        {/* Filter Pills (Horizontal scrollable on mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
              statusFilter === 'ACTIVE'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter('DUE_SOON')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
              statusFilter === 'DUE_SOON'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>Due Soon / Today</span>
          </button>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
              statusFilter === 'ALL'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All ({borrowers.length})
          </button>
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
              statusFilter === 'COMPLETED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setStatusFilter('DEFAULTED')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
              statusFilter === 'DEFAULTED'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Defaulted
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
          <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs">Loading borrower records...</span>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && sortedBorrowers.length === 0 && (
        <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center max-w-sm mx-auto px-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <Search className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No borrowers match your search</p>
          <p className="text-xs text-slate-500 mt-1">Try another keyword or register a new borrower.</p>
        </div>
      )}

      {/* 1. MOBILE & TABLET CARD VIEW (Visible on < lg screens) */}
      {!isLoading && sortedBorrowers.length > 0 && (
        <div className="block lg:hidden divide-y divide-slate-100">
          {sortedBorrowers.map((borrower) => {
            const daysLeft = getDaysUntilDate(borrower.nextPaymentDate);
            const badgeInfo = getPaymentBadgeInfo(daysLeft);
            const formattedDate = new Date(borrower.nextPaymentDate).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={borrower.id}
                className="p-4 hover:bg-slate-50/70 transition-colors cursor-pointer space-y-3"
                onClick={() => onSelectBorrower(borrower)}
              >
                {/* Top Row: Name, Status & Days Left Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-base leading-tight">
                        {borrower.name}
                      </h4>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                          borrower.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : borrower.status === 'Completed'
                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {borrower.status}
                      </span>
                    </div>

                    {/* Phone & Location */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {borrower.phone}
                      </span>
                      {borrower.address && (
                        <span className="flex items-center gap-1 text-slate-500 max-w-[180px] sm:max-w-xs truncate" title={borrower.address}>
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{borrower.address}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Due Date Badge */}
                  {borrower.status === 'Active' && (
                    <div className="shrink-0">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] border ${badgeInfo.badgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badgeInfo.dotClass}`}></span>
                        <span>{badgeInfo.label}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Middle Row: Financial Highlights Ribbon */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Principal</span>
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                      {formatCurrency(borrower.principalAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Monthly Due</span>
                    <span className="font-bold text-emerald-600 text-xs sm:text-sm">
                      {formatCurrency(borrower.monthlyInterest)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Due Date</span>
                    <span className="font-semibold text-slate-700 text-xs truncate block">
                      {formattedDate}
                    </span>
                  </div>
                </div>

                {/* Bottom Row: Quick Tap Actions for Mobile */}
                <div
                  className="flex items-center justify-between pt-1 gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Communication Shortcuts */}
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${borrower.phone}`}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors min-h-[34px] min-w-[34px] flex items-center justify-center"
                      title="Call Borrower"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-600" />
                    </a>
                    <a
                      href={getWhatsAppUrl(borrower.phone, borrower.name, borrower.monthlyInterest)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors border border-emerald-200 min-h-[34px] min-w-[34px] flex items-center justify-center"
                      title="Send WhatsApp Reminder"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    </a>
                  </div>

                  {/* Primary Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    {borrower.status === 'Active' && (
                      <button
                        onClick={() => onRecordPayment(borrower)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.97] text-white text-xs font-semibold rounded-xl shadow-xs transition-all min-h-[34px]"
                      >
                        <span className="font-bold">₹</span>
                        <span>Pay</span>
                      </button>
                    )}

                    <button
                      onClick={() => onSelectBorrower(borrower)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-semibold rounded-xl transition-colors min-h-[34px]"
                    >
                      <span>Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. DESKTOP TABLE VIEW (Visible on >= lg screens) */}
      {!isLoading && sortedBorrowers.length > 0 && (
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-6 cursor-pointer hover:text-slate-800" onClick={() => toggleSort('name')}>
                  <div className="flex items-center gap-1.5">
                    <span>Borrower & Address</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-slate-800" onClick={() => toggleSort('amount')}>
                  <div className="flex items-center gap-1.5">
                    <span>Principal (₹)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">
                  <span>Interest Rate & Due</span>
                </th>
                <th className="py-3.5 px-4">
                  <span>Next Payment Date</span>
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-slate-800" onClick={() => toggleSort('days')}>
                  <div className="flex items-center gap-1.5">
                    <span>Days Left</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm">
              {sortedBorrowers.map((borrower) => {
                const daysLeft = getDaysUntilDate(borrower.nextPaymentDate);
                const badgeInfo = getPaymentBadgeInfo(daysLeft);
                const formattedDate = new Date(borrower.nextPaymentDate).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <tr
                    key={borrower.id}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    onClick={() => onSelectBorrower(borrower)}
                  >
                    {/* Person Name & Contact */}
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900 group-hover:text-sky-600 transition-colors">
                        {borrower.name}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1 font-medium text-slate-600">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {borrower.phone}
                        </span>
                        {borrower.address && (
                          <span className="flex items-center gap-1 text-slate-500 max-w-[220px] truncate" title={borrower.address}>
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{borrower.address}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Principal (₹) */}
                    <td className="py-4 px-4 font-bold text-slate-900">
                      {formatCurrency(borrower.principalAmount)}
                    </td>

                    {/* Monthly Interest Due */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-emerald-600">
                        {formatCurrency(borrower.monthlyInterest)}
                        <span className="text-[11px] font-normal text-slate-500"> /mo</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {borrower.interestRate}% {borrower.rateType === 'ANNUAL' ? 'p.a.' : 'p.m.'}
                      </div>
                    </td>

                    {/* Next Payment Date */}
                    <td className="py-4 px-4 text-xs font-medium text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formattedDate}</span>
                      </div>
                    </td>

                    {/* Days Left Badge */}
                    <td className="py-4 px-4">
                      {borrower.status === 'Active' ? (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${badgeInfo.badgeClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badgeInfo.dotClass}`}></span>
                          <span>{badgeInfo.label}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                          borrower.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : borrower.status === 'Completed'
                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {borrower.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td
                      className="py-4 px-6 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {/* Quick Record Payment */}
                        {borrower.status === 'Active' && (
                          <button
                            onClick={() => onRecordPayment(borrower)}
                            title="Record Payment Received (₹)"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
                          >
                            <span className="font-bold text-xs">₹</span>
                          </button>
                        )}

                        {/* View Detail */}
                        <button
                          onClick={() => onSelectBorrower(borrower)}
                          title="View Full History & Remarks"
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => onEditBorrower(borrower)}
                          title="Edit Borrower Details"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${borrower.name}? This cannot be undone.`)) {
                              onDeleteBorrower(borrower.id);
                            }
                          }}
                          title="Delete"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
