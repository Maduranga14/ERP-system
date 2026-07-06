import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Printer, Mail, Download, CreditCard, ChevronRight,
  Phone, User, MapPin, Calendar, Moon, BedDouble,
  CheckCircle2, AlertCircle, Clock, RotateCcw, MinusCircle,
  X, DollarSign,
} from 'lucide-react';

import DashboardLayout  from '../../components/templates/DashboardLayout';
import Badge            from '../../components/atoms/Badge';
import { useRole }      from '../../hooks/useRole';
import { canBilling }   from '../../utils/billingPermissions';
import { INVOICES }     from '../../data/billing';

/* ─── Status config ───────────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  Paid:     { variant: 'green',  icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  Pending:  { variant: 'amber',  icon: <Clock className="w-3.5 h-3.5" />        },
  Partial:  { variant: 'gold',   icon: <MinusCircle className="w-3.5 h-3.5" />  },
  Refunded: { variant: 'purple', icon: <RotateCcw className="w-3.5 h-3.5" />   },
  Overdue:  { variant: 'red',    icon: <AlertCircle className="w-3.5 h-3.5" />  },
};

const USER_NAMES = { admin: 'Admin User', manager: 'Alex Sterling', receptionist: 'Sarah Mitchell' };
const USER_ROLES = { admin: 'Super Administrator', manager: 'General Manager', receptionist: 'Front Desk Lead' };

/* ─── Record Payment Modal ────────────────────────────────────────────────── */
const RecordPaymentModal = ({ invoice, onClose, onSave }) => {
  const [form, setForm] = useState({
    amount: (invoice.grandTotal - invoice.amountPaid).toFixed(2),
    method: 'Credit Card',
    note: '',
  });

  const balance = invoice.grandTotal - invoice.amountPaid;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Record Payment</h3>
              <p className="text-xs text-gray-400">{invoice.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance Due Banner */}
        <div className="mx-6 mt-4 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-700 font-semibold uppercase tracking-wider">Balance Due</p>
            <p className="text-2xl font-bold text-amber-800">${balance.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-sm font-semibold text-gray-700">${invoice.grandTotal.toFixed(2)}</p>
            <p className="text-xs text-green-600">Paid ${invoice.amountPaid.toFixed(2)}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Payment Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold">$</span>
              <input
                type="number"
                step="0.01"
                max={balance}
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
                className="w-full pl-7 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100 transition-colors font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Payment Method</label>
            <select
              value={form.method}
              onChange={(e) => setForm({ ...form, method: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100 bg-white text-gray-700"
            >
              <option>Credit Card</option>
              <option>Debit Card</option>
              <option>Cash</option>
              <option>Online Transfer</option>
              <option>Cheque</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Note (optional)</label>
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              rows={2}
              placeholder="Any additional notes..."
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100 transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-sm font-semibold text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 py-2.5 bg-navy-900 text-white text-sm font-semibold rounded-lg hover:bg-navy-800 transition-colors flex items-center justify-center gap-2">
              <CreditCard className="w-4 h-4" />
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
const InvoiceDetail = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const role         = useRole();

  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentSaved, setPaymentSaved] = useState(false);

  const basePath = role === 'admin' ? '/admin' : role === 'manager' ? '/manager' : '/receptionist';
  const invoice  = INVOICES.find((inv) => inv.id === id) || INVOICES[0];
  const balance  = invoice.grandTotal - invoice.amountPaid;

  const handleSavePayment = (form) => {
    // In production this would call an API
    setShowPayModal(false);
    setPaymentSaved(true);
  };

  const statusCfg = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.Pending;

  return (
    <DashboardLayout
      role={role}
      userName={USER_NAMES[role]}
      userRole={USER_ROLES[role]}
      notificationCount={3}
      searchPlaceholder="Search for guest, room or booking ID..."
    >
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
        <Link to={`${basePath}/billing`} className="hover:text-amber-600 font-medium transition-colors">
          Billing &amp; Payments
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-600 font-medium">Invoice Details</span>
      </div>

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Invoice Details – {invoice.id}</h1>
        <div className="flex flex-wrap gap-2">
          {canBilling(role, 'printInvoice') && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Invoice
            </button>
          )}
          <button
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Email Invoice
          </button>
          {canBilling(role, 'exportBillingReports') && (
            <button
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          )}
          {canBilling(role, 'recordPayment') && balance > 0 && (
            <button
              onClick={() => setShowPayModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-navy-900 text-white text-sm font-semibold rounded-lg hover:bg-navy-800 transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Record Payment
            </button>
          )}
        </div>
      </div>

      {paymentSaved && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-2 text-sm text-green-700 font-medium">
          <CheckCircle2 className="w-4 h-4" />
          Payment recorded successfully!
        </div>
      )}

      {/* ── Invoice Card ── */}
      <div className="card p-6 mb-4">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
          {/* Hotel branding */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-navy-900 rounded-xl flex items-center justify-center">
              <BedDouble className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Hotel Grande Resort</h2>
              <p className="text-xs text-gray-400">123 Azure Coast Blvd, Sapphire Bay, Luxury</p>
              <p className="text-xs text-gray-400">Isles 45012</p>
            </div>
          </div>

          {/* Invoice meta */}
          <div className="text-right">
            <Badge variant={statusCfg.variant} size="md">
              {invoice.status.toUpperCase()}
            </Badge>
            <p className="text-xs text-gray-400 mt-2 uppercase tracking-wider font-semibold">Invoice No.</p>
            <p className="text-sm font-bold text-navy-900">{invoice.id}-2023</p>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Date</p>
            <p className="text-sm text-gray-700 font-medium">{invoice.date}</p>
          </div>
        </div>

        {/* Guest + Stay Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-100">
          {/* Guest */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Guest Details</p>
            <p className="font-bold text-gray-900 text-base mb-1">{invoice.guest.name}</p>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <Phone className="w-3.5 h-3.5" />
              {invoice.guest.phone}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
              <Mail className="w-3.5 h-3.5" />
              {invoice.guest.email}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Reservation ID</p>
                <p className="text-sm font-bold text-amber-700 mt-0.5">{invoice.reservationId}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Room</p>
                <p className="text-sm font-bold text-amber-700 mt-0.5">{invoice.room.number} – {invoice.room.type}</p>
              </div>
            </div>
          </div>

          {/* Stay */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Stay Information</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Check-In
                </p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{invoice.checkIn}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Check-Out
                </p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{invoice.checkOut}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                  <Moon className="w-3 h-3" /> Duration
                </p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{invoice.nights} Night{invoice.nights !== 1 ? 's' : ''}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                  <BedDouble className="w-3 h-3" /> Room Type
                </p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{invoice.room.type}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="border-b border-gray-200">
              {['Description', 'Qty', 'Unit Price', 'Amount'].map((h) => (
                <th
                  key={h}
                  className={`py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider ${
                    h === 'Description' ? 'text-left' : 'text-right'
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((item, i) => (
              <tr key={i} className="border-b border-gray-50">
                <td className="py-3 text-gray-700">{item.description}</td>
                <td className="py-3 text-right text-gray-600">{item.qty}</td>
                <td className="py-3 text-right text-gray-600">${item.unitPrice.toFixed(2)}</td>
                <td className="py-3 text-right font-semibold text-amber-700">${item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium">${invoice.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tax (10%)</span>
              <span className="font-medium">${invoice.tax.toFixed(2)}</span>
            </div>
            {invoice.discount !== 0 && (
              <div className="flex justify-between text-sm text-red-500 font-medium">
                <span>Discount (Special Offer)</span>
                <span>-${Math.abs(invoice.discount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-bold text-gray-900 text-base">Grand Total</span>
              <span className="font-bold text-navy-900 text-lg">${invoice.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Terms &amp; Notes</p>
          <p className="text-xs text-gray-500 leading-relaxed">{invoice.notes}</p>
        </div>
      </div>

      {/* ── Bottom: Payment Summary + Payment History ── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Payment Summary (dark card) */}
        <div className="md:col-span-2 bg-navy-900 text-white rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold">Payment Summary</h3>
            <Badge variant={statusCfg.variant} size="sm">{invoice.status}</Badge>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Total Amount</p>
              <p className="text-2xl font-bold">${invoice.grandTotal.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Amount Paid</p>
              <p className="text-xl font-bold text-green-400">${invoice.amountPaid.toFixed(2)}</p>
            </div>
            <div className="pt-3 border-t border-white/10">
              <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Balance Due</p>
              <p className={`text-xl font-bold ${balance > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                ${balance.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="md:col-span-3 card p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Payment History</h3>
          {invoice.payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400">
              <CreditCard className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm font-medium">No payments recorded yet.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Payment ID', 'Method', 'Date', 'Processed By', 'Amount'].map((h) => (
                    <th key={h} className={`pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider ${h === 'Amount' ? 'text-right' : 'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoice.payments.map((pay) => (
                  <tr key={pay.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 text-xs font-bold text-navy-900">{pay.id}</td>
                    <td className="py-2.5 text-xs text-gray-600 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-gray-400" /> {pay.method}
                    </td>
                    <td className="py-2.5 text-xs text-gray-500">{pay.date}</td>
                    <td className="py-2.5 text-xs text-gray-600">{pay.processedBy}</td>
                    <td className={`py-2.5 text-xs font-bold text-right ${pay.amount < 0 ? 'text-red-500' : 'text-green-600'}`}>
                      {pay.amount < 0 ? '-' : ''}${Math.abs(pay.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Record Payment Modal */}
      {showPayModal && (
        <RecordPaymentModal
          invoice={invoice}
          onClose={() => setShowPayModal(false)}
          onSave={handleSavePayment}
        />
      )}
    </DashboardLayout>
  );
};

export default InvoiceDetail;
