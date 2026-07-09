import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Eye, Printer, Search, Calendar, ChevronLeft, ChevronRight,
  Download, DollarSign, FileText, CheckCircle, Clock, CreditCard, RotateCcw,
  SlidersHorizontal, Loader2,
} from 'lucide-react';

import DashboardLayout  from '../../components/templates/DashboardLayout';
import Badge            from '../../components/atoms/Badge';
import Button           from '../../components/atoms/Button';
import Avatar           from '../../components/atoms/Avatar';
import { useRole }      from '../../hooks/useRole';
import { canBilling }   from '../../utils/billingPermissions';
import { STATUS_OPTIONS, METHOD_OPTIONS } from '../../data/billing';
import { getInvoices }  from '../../utils/api';


const STATUS_VARIANT = {
  Paid:     'green',
  Pending:  'amber',
  Partial:  'gold',
  Refunded: 'purple',
  Overdue:  'red',
};


const USER_NAMES = { admin: 'Admin User', manager: 'Alex Sterling', receptionist: 'Sarah Mitchell' };
const USER_ROLES = { admin: 'Super Administrator', manager: 'General Manager', receptionist: 'Front Desk Lead' };


const StatCard = ({ icon, iconBg, label, value, sub, subColor }) => (
  <div className="card p-4 flex flex-col gap-2">
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
      {icon}
    </div>
    <div>
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
      {sub && <p className={`text-[11px] mt-0.5 font-medium ${subColor || 'text-gray-400'}`}>{sub}</p>}
    </div>
  </div>
);


const BillingList = () => {
  const navigate = useNavigate();
  const role     = useRole();

  const [invoices,      setInvoices]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [search,        setSearch]        = useState('');
  const [statusFilter,  setStatusFilter]  = useState('All Statuses');
  const [methodFilter,  setMethodFilter]  = useState('All Methods');
  const [dateRange,     setDateRange]     = useState('');
  const [currentPage,   setCurrentPage]   = useState(1);

  useEffect(() => {
    getInvoices()
      .then(data => setInvoices(data))
      .catch(() => setError('Failed to load invoices.'))
      .finally(() => setLoading(false));
  }, []);

  const basePath = role === 'admin' ? '/admin' : role === 'manager' ? '/manager' : '/receptionist';


  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase();
    const guestName = inv.guestName || '';
    const reservationCode = inv.reservation ? `RES-${10000 + inv.reservation.id}` : '';
    const invoiceCode = `INV-${String(inv.id).padStart(3,'0')}`;
    if (q && !invoiceCode.toLowerCase().includes(q) &&
        !guestName.toLowerCase().includes(q) &&
        !reservationCode.toLowerCase().includes(q)) return false;
    if (statusFilter !== 'All Statuses' && inv.status !== statusFilter) return false;
    if (methodFilter !== 'All Methods'  && inv.method !== methodFilter)  return false;
    return true;
  });

  const BILLING_STATS = {
    todayRevenue:  `$${invoices.filter(i=>i.status==='Paid').reduce((s,i)=>s+(i.grandTotal||0),0).toLocaleString()}`,
    revenueGrowth: '',
    totalInvoices: invoices.length.toString(),
    paidInvoices:  invoices.filter(i=>i.status==='Paid').length.toString(),
    pendingAmount: `$${invoices.filter(i=>i.status==='Pending'||i.status==='Overdue').reduce((s,i)=>s+(i.grandTotal||0),0).toLocaleString()}`,
    transactions:  invoices.reduce((s,i)=>s+(i.payments?.length||0),0).toString(),
    refunds:       invoices.filter(i=>i.status==='Refunded').length.toString(),
  };

  if (loading) return (
    <DashboardLayout role={role} userName={USER_NAMES[role]} userRole={USER_ROLES[role]}>
      <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin" /> Loading invoices...
      </div>
    </DashboardLayout>
  );

  if (error) return (
    <DashboardLayout role={role} userName={USER_NAMES[role]} userRole={USER_ROLES[role]}>
      <div className="flex items-center justify-center h-64 text-red-500 text-sm">{error}</div>
    </DashboardLayout>
  );

  const ITEMS_PER_PAGE = 5;
  const totalPages     = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const pageData       = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleApplyFilters = () => setCurrentPage(1);

  return (
    <DashboardLayout
      role={role}
      userName={USER_NAMES[role]}
      userRole={USER_ROLES[role]}
      notificationCount={3}
      searchPlaceholder="Search for guest, room or booking ID..."
    >
      
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing &amp; Payments</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage invoices, payments, and financial records.</p>
        </div>
        {canBilling(role, 'generateInvoice') && (
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => navigate(`${basePath}/billing/generate`)}
          >
            Generate Invoice
          </Button>
        )}
      </div>

      
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
        <StatCard
          icon={<DollarSign className="w-4 h-4 text-green-600" />}
          iconBg="bg-green-50"
          label="Today's Revenue"
          value={BILLING_STATS.todayRevenue}
          sub={BILLING_STATS.revenueGrowth}
          subColor="text-green-500"
        />
        <StatCard
          icon={<FileText className="w-4 h-4 text-blue-600" />}
          iconBg="bg-blue-50"
          label="Total Invoices"
          value={BILLING_STATS.totalInvoices}
        />
        <StatCard
          icon={<CheckCircle className="w-4 h-4 text-emerald-600" />}
          iconBg="bg-emerald-50"
          label="Paid Invoices"
          value={BILLING_STATS.paidInvoices}
        />
        <StatCard
          icon={<Clock className="w-4 h-4 text-amber-500" />}
          iconBg="bg-amber-50"
          label="Pending"
          value={BILLING_STATS.pendingAmount}
        />
        <StatCard
          icon={<CreditCard className="w-4 h-4 text-indigo-600" />}
          iconBg="bg-indigo-50"
          label="Transactions"
          value={BILLING_STATS.transactions}
        />
        <StatCard
          icon={<RotateCcw className="w-4 h-4 text-red-500" />}
          iconBg="bg-red-50"
          label="Refunds"
          value={BILLING_STATS.refunds}
        />
      </div>

     
      <div className="card p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
         
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Search Records</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Invoice ID, Guest Name, or Reservation ID"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100 transition-colors"
              />
            </div>
          </div>

         
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Payment Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100 bg-white text-gray-700 transition-colors"
            >
              {STATUS_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>

          
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Payment Method</label>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100 bg-white text-gray-700 transition-colors"
            >
              {METHOD_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-end gap-3">
          
          <div className="flex-1 max-w-xs">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Date Range</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                placeholder="Select dates..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100 transition-colors"
              />
            </div>
          </div>

          <button
            onClick={handleApplyFilters}
            className="px-5 py-2 bg-navy-900 text-white text-sm font-semibold rounded-lg hover:bg-navy-800 transition-colors flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Apply Filters
          </button>

          {canBilling(role, 'exportBillingReports') && (
            <button className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          )}
        </div>
      </div>

      
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70">
              {['Invoice ID', 'Guest', 'Reservation', 'Amount', 'Method', 'Status', 'Date', 'Actions'].map((h) => (
                <th key={h} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((inv) => {
              const invoiceCode = `INV-${String(inv.id).padStart(3,'0')}`;
              const reservationCode = inv.reservation ? `RES-${10000 + inv.reservation.id}` : '—';
              return (
              <tr
                key={inv.id}
                className="border-b border-gray-50 hover:bg-amber-50/30 transition-colors cursor-pointer group"
                onClick={() => navigate(`${basePath}/billing/${inv.id}`)}
              >
                
                <td className="px-4 py-3.5 align-middle">
                  <span className="font-bold text-navy-900">{invoiceCode}</span>
                </td>

               
                <td className="px-4 py-3.5 align-middle">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={inv.guestName || '?'} size="sm" />
                    <span className="font-semibold text-gray-800 text-xs whitespace-nowrap">{inv.guestName}</span>
                  </div>
                </td>

               
                <td className="px-4 py-3.5 align-middle">
                  <span className="text-xs text-gray-600 font-medium">{reservationCode}</span>
                </td>

                
                <td className="px-4 py-3.5 align-middle">
                  <span className="font-bold text-gray-900">${inv.grandTotal.toFixed(2)}</span>
                </td>

                
                <td className="px-4 py-3.5 align-middle">
                  <span className="text-xs text-gray-600">{inv.method}</span>
                </td>

               
                <td className="px-4 py-3.5 align-middle">
                  <Badge variant={STATUS_VARIANT[inv.status] || 'gray'} size="sm">
                    {inv.status}
                  </Badge>
                </td>

               
                <td className="px-4 py-3.5 align-middle">
                  <span className="text-xs text-gray-500 whitespace-nowrap">{inv.date}</span>
                </td>

               
                <td className="px-4 py-3.5 align-middle" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`${basePath}/billing/${inv.id}`)}
                      className="text-gray-400 hover:text-navy-700 transition-colors"
                      title="View Invoice"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {canBilling(role, 'printInvoice') && (
                      <button
                        onClick={() => window.print()}
                        className="text-gray-400 hover:text-navy-700 transition-colors"
                        title="Print Invoice"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
            })}
            {pageData.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">
                  No invoices match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>

       
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Showing {pageData.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
            {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {BILLING_STATS.totalInvoices} invoices
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={[
                  'w-7 h-7 rounded-lg text-xs font-semibold transition-colors',
                  currentPage === p
                    ? 'bg-navy-900 text-white'
                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50',
                ].join(' ')}
              >
                {p}
              </button>
            ))}
            <span className="text-xs text-gray-400 px-1">...</span>
            <button
              onClick={() => setCurrentPage(250)}
              className="w-7 h-7 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              250
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(250, p + 1))}
              className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BillingList;
