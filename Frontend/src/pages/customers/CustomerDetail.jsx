import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Camera, Shield, BadgeCheck,
  Phone, Mail, MapPin, CreditCard, Globe, Calendar,
  BedDouble, Heart, FileText, Star, AlertTriangle,
  CheckCircle2, ChevronRight, Download, Loader2,
} from 'lucide-react';

import DashboardLayout  from '../../components/templates/DashboardLayout';
import Badge            from '../../components/atoms/Badge';
import Avatar           from '../../components/atoms/Avatar';
import { useRole }      from '../../hooks/useRole';
import { canCustomer }  from '../../utils/permissions';
import { getCustomerById } from '../../utils/api';

/* ── Helpers ───────────────────────────────────────────────── */
const STATUS_VARIANT = { Active: 'green', Inactive: 'gray', New: 'amber' };
const BOOKING_STATUS_VARIANT = { Completed: 'green', Active: 'blue', Cancelled: 'red', Pending: 'amber' };
const INVOICE_STATUS_VARIANT = { Paid: 'green', Pending: 'amber', Overdue: 'red', Refunded: 'purple' };

const TIER_STYLES = {
  'Regular Member':   'bg-gray-100 text-gray-700',
  'VIP Guest':        'bg-purple-100 text-purple-700',
  'Business Traveler':'bg-blue-100 text-blue-700',
  'Platinum Member':  'bg-yellow-100 text-yellow-800',
};

const userNames = {
  admin: 'Admin User', manager: 'Alex Sterling', receptionist: 'Sarah Mitchell',
};
const userRoles = {
  admin: 'Super Administrator', manager: 'General Manager', receptionist: 'Front Desk Lead',
};

/* ── Section Card ──────────────────────────────────────────── */
const SectionCard = ({ title, icon, children, className = '', action }) => (
  <div className={`card p-4 ${className}`}>
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className="text-gray-500">{icon}</span>
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
      </div>
      {action}
    </div>
    {children}
  </div>
);

/* ── Info Row ──────────────────────────────────────────────── */
const InfoRow = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
    <p className="text-sm text-gray-800 font-medium mt-0.5">{value || '—'}</p>
  </div>
);

/* ── VIP Note Item ─────────────────────────────────────────── */
const VipNote = ({ type, text }) => {
  const Icon = type === 'warning' ? AlertTriangle : CheckCircle2;
  return (
    <div className={`flex items-start gap-2 text-xs ${type === 'warning' ? 'text-red-700 font-semibold' : 'text-gray-700'}`}>
      <Icon className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${type === 'warning' ? 'text-red-500' : 'text-green-500'}`} />
      <span>{text}</span>
    </div>
  );
};

/* ── Main Component ────────────────────────────────────────── */
const CustomerDetail = () => {
  const navigate  = useNavigate();
  const { id }    = useParams();
  const role      = useRole();
  const basePath  = `/${role}`;

  const [customer, setCustomer] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    setLoading(true);
    getCustomerById(id)
      .then(data => setCustomer(data))
      .catch(() => setError('Customer not found or failed to load.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <DashboardLayout role={role} userName={userNames[role]} userRole={userRoles[role]}>
      <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin" /> Loading customer...
      </div>
    </DashboardLayout>
  );

  if (error || !customer) return (
    <DashboardLayout role={role} userName={userNames[role]} userRole={userRoles[role]}>
      <button
        onClick={() => navigate(`${basePath}/customers`)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy-800 transition-colors mb-4 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Customers
      </button>
      <div className="flex items-center justify-center h-64 text-red-500 text-sm">
        {error || 'Customer not found.'}
      </div>
    </DashboardLayout>
  );

  const preferences  = customer.preferences  || [];
  const vipNotes     = customer.vipNotes     || [];
  const bookingHistory = customer.bookingHistory || [];
  const invoices     = customer.invoices     || [];

  return (
    <DashboardLayout
      role={role}
      userName={userNames[role]}
      userRole={userRoles[role]}
      notificationCount={3}
      searchPlaceholder="Search guests, rooms or booking ID..."
    >
      {/* Back button */}
      <button
        onClick={() => navigate(`${basePath}/customers`)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy-800 transition-colors mb-4 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Customers
      </button>

      {/* ── Profile Header Card ── */}
      <div className="card p-5 mb-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-32 bg-gradient-to-bl from-slate-100 to-transparent rounded-bl-3xl pointer-events-none" />

        <div className="flex items-start gap-5 relative">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-white shadow-md bg-navy-900 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{customer.initials}</span>
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
              <Camera className="w-3 h-3 text-gray-500" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-gray-900">{customer.name}</h2>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${TIER_STYLES[customer.memberTier] || 'bg-gray-100 text-gray-700'}`}>
                {customer.memberTier}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-2">
              {customer.memberTier === 'Platinum Member' || customer.memberTier === 'VIP Guest'
                ? `VIP Member since ${customer.joinedDate} • Frequent Guest`
                : `Member since ${customer.joinedDate} • ${customer.frequency} Guest`}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <Shield className="w-3.5 h-3.5 text-amber-500" />
                Tier Benefits Active
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <BadgeCheck className="w-3.5 h-3.5 text-green-500" />
                ID Verified
              </span>
              <Badge variant={STATUS_VARIANT[customer.status] || 'gray'} dot size="sm">
                {customer.status}
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {canCustomer(role, 'edit') && (
              <button
                onClick={() => navigate(`${basePath}/customers/${customer.id}/edit`)}
                className="border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Edit Profile
              </button>
            )}
            <button
              onClick={() => navigate(`${basePath}/reservations/new`)}
              className="bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              Book New Stay
            </button>
          </div>
        </div>
      </div>

      {/* ── Row 1: Personal Info | Stay Summary | Preferences ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

        {/* Personal Information */}
        <SectionCard title="Personal Information" icon={<CreditCard className="w-4 h-4" />}>
          <div className="flex flex-col gap-3">
            <InfoRow label="Full Name" value={customer.name} />
            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="Phone" value={customer.phone} />
              <InfoRow label="Date of Birth" value={customer.dob} />
            </div>
            <InfoRow label="Email Address" value={customer.email} />
            <InfoRow label="Address" value={customer.address} />
            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="National ID" value={customer.nationalId} />
              <InfoRow label="Country" value={customer.country} />
            </div>
          </div>
        </SectionCard>

        {/* Stay Summary */}
        <SectionCard title="Stay Summary" icon={<Calendar className="w-4 h-4" />}>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-3xl font-bold text-gray-900">{customer.totalStays ?? 0}</p>
              <p className="text-[11px] text-gray-400 uppercase font-semibold tracking-wide mt-0.5">Total Stays</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-gray-900 leading-tight">{customer.lastStay?.split(' ')[0]}</p>
              <p className="text-base font-bold text-gray-700">{customer.lastStay?.split(' ')[1]}</p>
              <p className="text-[11px] text-gray-400 uppercase font-semibold tracking-wide mt-0.5">Last Stay</p>
            </div>
          </div>

          {customer.currentBooking ? (
            <div className="bg-navy-900 text-white rounded-xl p-3 mb-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-semibold text-white/60 uppercase tracking-wider">Current Booking</p>
                <span className="text-[10px] font-bold bg-green-500 text-white px-2 py-0.5 rounded-full">LIVE</span>
              </div>
              <p className="text-base font-bold">{customer.currentBooking.room}</p>
              <p className="text-xs text-white/60 mt-0.5">{customer.currentBooking.dates}</p>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl p-3 mb-3 text-center">
              <p className="text-xs text-gray-400">No active booking</p>
            </div>
          )}

          <div className="flex items-center justify-between border border-gray-100 rounded-xl p-3">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Preferred Room</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{customer.preferredRoom || '—'}</p>
            </div>
            <Heart className="w-5 h-5" style={{ color: '#B8943F', fill: '#B8943F' }} />
          </div>
        </SectionCard>

        {/* Preferences + VIP Notes */}
        <div className="flex flex-col gap-4">
          <SectionCard title="Preferences" icon={<Star className="w-4 h-4" />}>
            <div className="flex flex-wrap gap-1.5">
              {preferences.map((pref) => (
                <span
                  key={pref}
                  className="inline-flex items-center gap-1 text-xs font-medium bg-slate-100 text-gray-700 px-2.5 py-1 rounded-lg"
                >
                  <BedDouble className="w-3 h-3 text-gray-400" />
                  {pref}
                </span>
              ))}
              {preferences.length === 0 && (
                <p className="text-xs text-gray-400">No preferences recorded.</p>
              )}
            </div>
          </SectionCard>

          {vipNotes.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-amber-800">VIP Notes</h3>
              </div>
              <div className="flex flex-col gap-2">
                {vipNotes.map((note, i) => (
                  <VipNote key={i} type={note.type} text={note.text} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Row 2: Booking History | Recent Invoices ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {canCustomer(role, 'viewBookingHistory') && (
          <SectionCard
            title="Booking History"
            icon={<Calendar className="w-4 h-4" />}
            action={<button className="text-xs font-medium text-gold-600 hover:underline">View All</button>}
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Booking ID', 'Room', 'Duration', 'Status'].map((h) => (
                    <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider py-2 pr-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookingHistory.map((b) => (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                    <td className="py-2.5 pr-3"><span className="text-xs font-bold text-navy-900">{b.id}</span></td>
                    <td className="py-2.5 pr-3"><span className="text-xs text-gray-700">{b.room}</span></td>
                    <td className="py-2.5 pr-3"><span className="text-xs text-gray-500">{b.duration}</span></td>
                    <td className="py-2.5">
                      <Badge variant={BOOKING_STATUS_VARIANT[b.status] || 'gray'} size="sm">{b.status}</Badge>
                    </td>
                  </tr>
                ))}
                {bookingHistory.length === 0 && (
                  <tr><td colSpan={4} className="py-6 text-center text-xs text-gray-400">No booking history.</td></tr>
                )}
              </tbody>
            </table>
          </SectionCard>
        )}

        {canCustomer(role, 'viewPaymentHistory') && (
          <SectionCard
            title="Recent Invoices"
            icon={<FileText className="w-4 h-4" />}
            action={
              <button className="flex items-center gap-1 text-xs font-medium text-navy-700 hover:underline">
                <Download className="w-3 h-3" />
                Download Statements
              </button>
            }
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Invoice', 'Amount', 'Status', 'Date'].map((h) => (
                    <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider py-2 pr-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                    <td className="py-2.5 pr-3"><span className="text-xs font-bold text-navy-900">{inv.id}</span></td>
                    <td className="py-2.5 pr-3"><span className="text-sm font-bold text-gray-800">{inv.amount}</span></td>
                    <td className="py-2.5 pr-3">
                      <Badge variant={INVOICE_STATUS_VARIANT[inv.status] || 'gray'} size="sm">{inv.status}</Badge>
                    </td>
                    <td className="py-2.5"><span className="text-xs text-gray-500">{inv.date}</span></td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr><td colSpan={4} className="py-6 text-center text-xs text-gray-400">No invoices found.</td></tr>
                )}
              </tbody>
            </table>
          </SectionCard>
        )}

        {role === 'receptionist' && (
          <div className="card p-5 flex flex-col items-center justify-center text-center gap-2 bg-slate-50 border-dashed">
            <FileText className="w-8 h-8 text-gray-300" />
            <p className="text-sm font-semibold text-gray-500">Payment History Restricted</p>
            <p className="text-xs text-gray-400">Full invoice access is available to Admin and Manager roles only.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CustomerDetail;
