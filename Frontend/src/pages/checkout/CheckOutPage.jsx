import React, { useState, useMemo } from 'react';
import {
  Search, LogOut, BedDouble, Calendar, Clock,
  Users, CheckCircle2, X, CreditCard, DollarSign,
  ArrowLeft, Sparkles, FileText, AlertCircle,
} from 'lucide-react';

import DashboardLayout from '../../components/templates/DashboardLayout';
import Badge           from '../../components/atoms/Badge';
import { useRole }     from '../../hooks/useRole';
import { CURRENT_STAYS } from '../../data/checkinout';

/* ── Constants ─────────────────────────────────────────────── */
const USER_NAMES = { admin: 'Admin User', manager: 'Alex Sterling', receptionist: 'Sarah Mitchell' };
const USER_ROLES = { admin: 'Super Administrator', manager: 'General Manager', receptionist: 'Front Desk Lead' };
const PAYMENT_METHODS = ['Cash', 'Card', 'Bank Transfer'];

/* ── Sub-components ─────────────────────────────────────────── */
const SectionCard = ({ title, icon, children, accent = false, className = '' }) => (
  <div className={`bg-white rounded-xl border ${accent ? 'border-blue-200' : 'border-gray-100'} shadow-sm p-5 ${className}`}>
    <div className={`flex items-center gap-2 mb-4 pb-3 border-b ${accent ? 'border-blue-100' : 'border-gray-100'}`}>
      <span className={accent ? 'text-blue-500' : 'text-gray-500'}>{icon}</span>
      <h3 className="text-sm font-bold text-gray-800">{title}</h3>
    </div>
    {children}
  </div>
);

const InfoRow = ({ label, value, highlight = false }) => (
  <div>
    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
    <p className={`text-sm font-semibold mt-0.5 ${highlight ? 'text-amber-700' : 'text-gray-800'}`}>{value || '—'}</p>
  </div>
);

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all placeholder-gray-300 bg-white";

/* ── Check-Out Success overlay ──────────────────────────────── */
const CheckOutSuccess = ({ stay, invoiceId, onDone }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 text-center">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-8 h-8 text-blue-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-1">Check-Out Complete!</h3>
      <p className="text-sm text-gray-500 mb-1">
        <span className="font-semibold text-gray-800">{stay.guest.name}</span> has been checked out.
      </p>
      <p className="text-xs text-gray-400 mb-5">{stay.id} &bull; Room {stay.room.number}</p>
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-5 text-left space-y-1.5">
        <p className="text-xs text-blue-700 flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> Reservation status → Completed</p>
        <p className="text-xs text-blue-700 flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> Room {stay.room.number} status → Dirty</p>
        <p className="text-xs text-blue-700 flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> Housekeeping task created</p>
        <p className="text-xs text-blue-700 flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> Final invoice generated — {invoiceId}</p>
      </div>
      <button
        onClick={onDone}
        className="w-full bg-navy-900 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-navy-800 transition-colors"
      >
        Back to Current Stays
      </button>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
const CheckOutPage = () => {
  const role     = useRole();

  /* ── State ── */
  const [search,        setSearch]        = useState('');
  const [selected,      setSelected]      = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentNote,   setPaymentNote]   = useState('');
  const [paymentSaved,  setPaymentSaved]  = useState(false);
  const [successData,   setSuccessData]   = useState(null);

  /* ── Derived ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return CURRENT_STAYS;
    return CURRENT_STAYS.filter((s) =>
      s.id.toLowerCase().includes(q) ||
      s.guest.name.toLowerCase().includes(q) ||
      s.room.number.includes(q)
    );
  }, [search]);

  const totalCharges = selected
    ? selected.charges.reduce((a, c) => a + c.amount, 0) + selected.tax + selected.discount
    : 0;
  const balance = selected ? totalCharges - selected.amountPaid : 0;

  /* ── Handlers ── */
  const handleSelectStay = (stay) => {
    setSelected(stay);
    setPaymentAmount(Math.max(0, stay.charges.reduce((a, c) => a + c.amount, 0) + stay.tax + stay.discount - stay.amountPaid).toFixed(2));
    setPaymentSaved(false);
  };

  const handleRecordPayment = () => {
    setPaymentSaved(true);
    alert(`Payment of $${paymentAmount} via ${paymentMethod} recorded (mock).`);
  };

  const handleCheckOut = () => {
    const invoiceId = `INV-${Math.floor(Math.random() * 9000 + 1000)}`;
    setSuccessData({ stay: selected, invoiceId });
  };

  const handleDone = () => {
    setSuccessData(null);
    setSelected(null);
    setSearch('');
  };

  /* ── CURRENT STAYS LIST ── */
  if (!selected) {
    return (
      <DashboardLayout
        role={role}
        userName={USER_NAMES[role]}
        userRole={USER_ROLES[role]}
        notificationCount={3}
        searchPlaceholder="Search reservations..."
      >
        {/* Breadcrumb */}
        <p className="text-xs text-gray-400 mb-1">
          Dashboard &rsaquo; <span className="text-gray-600 font-medium">Check Out</span>
        </p>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Guest Check-Out</h1>
            <p className="text-xs text-gray-400 mt-0.5">Finalize billing and complete guest departures</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            Check-out time: <span className="font-semibold text-blue-700 ml-1">by 11:00 AM</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Currently Staying', value: CURRENT_STAYS.length,     icon: <Users className="w-4 h-4 text-navy-600" />,  bg: 'bg-slate-100', val: 'text-navy-800' },
            { label: "Today's Departures", value: 2,                       icon: <LogOut className="w-4 h-4 text-blue-600" />,  bg: 'bg-blue-50',  val: 'text-blue-700' },
            { label: 'Late Check-Outs',    value: 1,                       icon: <AlertCircle className="w-4 h-4 text-red-500" />, bg: 'bg-red-50', val: 'text-red-600' },
          ].map((s) => (
            <div key={s.label} className="card p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                {s.icon}
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
                <p className={`text-2xl font-bold ${s.val}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="card p-3 mb-4">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-blue-400 transition-colors">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              id="checkout-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Guest Name, Room Number or Reservation ID…"
              className="text-sm text-gray-700 bg-transparent outline-none w-full placeholder-gray-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5 ml-1">
            Search by Guest Name &bull; Room Number &bull; Reservation ID
          </p>
        </div>

        {/* Current Stays Table */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-800">Current Stays</h2>
            <span className="text-[11px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {filtered.length} guest{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/60 border-b border-gray-100">
                {['Guest', 'Room', 'Check-in', 'Check-out', 'Nights', 'Balance', 'Action'].map((h) => (
                  <th key={h} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">No current stays match your search.</td>
                </tr>
              ) : filtered.map((stay) => {
                const total = stay.charges.reduce((a, c) => a + c.amount, 0) + stay.tax + stay.discount;
                const bal   = total - stay.amountPaid;
                return (
                  <tr key={stay.id} className="border-b border-gray-50 hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-navy-900 flex items-center justify-center flex-shrink-0">
                          <span className="text-[11px] font-bold text-white">{stay.guest.initials}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-xs">{stay.guest.name}</p>
                          <p className="text-[11px] text-gray-400">{stay.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <p className="text-sm font-bold text-navy-900">Room {stay.room.number}</p>
                      <p className="text-[11px] text-gray-400">{stay.room.type}</p>
                    </td>
                    <td className="px-4 py-3 align-middle text-xs text-gray-600">{stay.checkIn}</td>
                    <td className="px-4 py-3 align-middle">
                      <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">{stay.checkOut}</span>
                    </td>
                    <td className="px-4 py-3 align-middle text-xs text-gray-600">{stay.nights}N</td>
                    <td className="px-4 py-3 align-middle">
                      <span className={`text-sm font-bold ${bal > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                        ${bal.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <button
                        id={`checkout-btn-${stay.id}`}
                        onClick={() => handleSelectStay(stay)}
                        className="flex items-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <LogOut className="w-3 h-3" />
                        Check Out
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DashboardLayout>
    );
  }

  /* ── CHECK-OUT DETAIL FLOW ── */
  return (
    <DashboardLayout
      role={role}
      userName={USER_NAMES[role]}
      userRole={USER_ROLES[role]}
      notificationCount={3}
      searchPlaceholder="Search reservations..."
    >
      {/* Back */}
      <button
        onClick={() => setSelected(null)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy-800 transition-colors mb-4 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Current Stays
      </button>

      {/* Page Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Processing Check-Out</h1>
          <p className="text-xs text-gray-400 mt-0.5">{selected.id} &bull; {selected.guest.name} &bull; Room {selected.room.number}</p>
        </div>
        <Badge variant="blue" dot>Checked In</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── Left (2/3) ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* 1. Current Stay Summary */}
          <SectionCard title="Current Stay" icon={<BedDouble className="w-4 h-4" />}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <InfoRow label="Guest Name"    value={selected.guest.name} />
              <InfoRow label="Room Number"   value={`Room ${selected.room.number}`} highlight />
              <InfoRow label="Room Type"     value={selected.room.type} />
              <InfoRow label="Check-in Date" value={selected.checkIn} />
              <InfoRow label="Check-out Date" value={selected.checkOut} />
              <InfoRow label="No. of Nights" value={`${selected.nights} Night${selected.nights > 1 ? 's' : ''}`} />
            </div>
          </SectionCard>

          {/* 2. Billing Summary */}
          <SectionCard title="Billing Summary" icon={<FileText className="w-4 h-4" />}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-2">Charge</th>
                  <th className="text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {selected.charges.map((c, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-2.5 text-gray-700">{c.label}</td>
                    <td className="py-2.5 text-right font-medium text-gray-800">${c.amount.toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="border-b border-gray-50">
                  <td className="py-2.5 text-gray-600">Tax</td>
                  <td className="py-2.5 text-right text-gray-600">${selected.tax}</td>
                </tr>
                {selected.discount !== 0 && (
                  <tr className="border-b border-gray-50">
                    <td className="py-2.5 text-green-600 font-medium">Discount</td>
                    <td className="py-2.5 text-right text-green-600 font-medium">-${Math.abs(selected.discount)}</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200">
                  <td className="pt-3 font-bold text-gray-900">Total</td>
                  <td className="pt-3 text-right font-bold text-navy-900 text-base">${totalCharges.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </SectionCard>

          {/* 3. Payment */}
          <SectionCard title="Payment" icon={<CreditCard className="w-4 h-4" />} accent>
            {/* Already paid summary */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Total Bill</p>
                <p className="text-lg font-bold text-gray-900 mt-0.5">${totalCharges.toLocaleString()}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Amount Paid</p>
                <p className="text-lg font-bold text-green-700 mt-0.5">${selected.amountPaid.toLocaleString()}</p>
              </div>
              <div className={`rounded-xl p-3 text-center ${balance > 0 ? 'bg-amber-50' : 'bg-green-50'}`}>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Balance Due</p>
                <p className={`text-lg font-bold mt-0.5 ${balance > 0 ? 'text-amber-700' : 'text-green-700'}`}>
                  ${Math.max(0, balance).toLocaleString()}
                </p>
              </div>
            </div>

            {paymentSaved && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 mb-4 text-sm text-green-700 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Payment recorded successfully!
              </div>
            )}

            {/* Payment form */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">$</span>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className={`${inputCls} pl-7`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Payment Method</label>
                <div className="flex gap-1.5">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m}
                      onClick={() => setPaymentMethod(m)}
                      className={[
                        'flex-1 text-xs font-medium py-2.5 rounded-lg border transition-all',
                        paymentMethod === m
                          ? 'bg-navy-900 text-white border-navy-900'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300',
                      ].join(' ')}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-end">
                <button
                  id="record-payment-btn"
                  onClick={handleRecordPayment}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Record Payment
                </button>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ── Right (1/3): Actions panel ── */}
        <div className="flex flex-col gap-4">

          {/* What happens on checkout */}
          <div className="card p-5">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Upon Check-Out</h3>
            <div className="space-y-2.5">
              {[
                { icon: <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />,   text: 'Reservation → Completed',   bg: 'bg-blue-50'   },
                { icon: <BedDouble className="w-3.5 h-3.5 text-orange-500" />,    text: `Room ${selected.room.number} → Dirty`, bg: 'bg-orange-50' },
                { icon: <Sparkles className="w-3.5 h-3.5 text-purple-500" />,     text: 'Housekeeping task created', bg: 'bg-purple-50' },
                { icon: <FileText className="w-3.5 h-3.5 text-green-500" />,      text: 'Final invoice generated',   bg: 'bg-green-50'  },
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-2.5 ${item.bg} rounded-xl px-3 py-2.5`}>
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span className="text-xs font-medium text-gray-700">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Guest summary */}
          <div className="card p-5">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Guest Summary</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-navy-900 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-white">{selected.guest.initials}</span>
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{selected.guest.name}</p>
                <p className="text-xs text-gray-400">{selected.guests} Guest{selected.guests > 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="space-y-1.5 text-xs text-gray-500">
              <p className="flex justify-between"><span>Room:</span> <span className="font-semibold text-gray-700">Room {selected.room.number}</span></p>
              <p className="flex justify-between"><span>Check-in:</span> <span className="font-semibold text-gray-700">{selected.checkIn}</span></p>
              <p className="flex justify-between"><span>Check-out:</span> <span className="font-semibold text-gray-700">{selected.checkOut}</span></p>
              <p className="flex justify-between"><span>Duration:</span> <span className="font-semibold text-gray-700">{selected.nights} nights</span></p>
            </div>
          </div>

          {/* COMPLETE CHECK-OUT BUTTON */}
          <button
            id="complete-checkout-btn"
            onClick={handleCheckOut}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Complete Check-Out
          </button>
          <p className="text-[11px] text-center text-gray-400 -mt-2">
            This will finalize the stay and generate an invoice
          </p>
        </div>
      </div>

      {/* ── Success overlay ── */}
      {successData && (
        <CheckOutSuccess
          stay={successData.stay}
          invoiceId={successData.invoiceId}
          onDone={handleDone}
        />
      )}
    </DashboardLayout>
  );
};

export default CheckOutPage;
