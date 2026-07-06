import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Phone, MapPin,
  CreditCard, Globe, Calendar, Star, Save, X,
} from 'lucide-react';

import DashboardLayout from '../../components/templates/DashboardLayout';
import { useRole }     from '../../hooks/useRole';
import { canCustomer } from '../../utils/permissions';

/* ── Helpers ───────────────────────────────────────────────── */
const userNames = {
  admin: 'Admin User', manager: 'Alex Sterling', receptionist: 'Sarah Mitchell',
};
const userRoles = {
  admin: 'Super Administrator', manager: 'General Manager', receptionist: 'Front Desk Lead',
};

const MEMBER_TIERS  = ['Regular Member', 'VIP Guest', 'Business Traveler', 'Platinum Member'];
const COUNTRIES     = ['United Kingdom', 'USA', 'UAE', 'France', 'Germany', 'Australia', 'India', 'Canada', 'Other'];
const ALL_PREFERENCES = [
  'Bed: Single', 'Bed: Double', 'Bed: Queen', 'Bed: King',
  'Suite', 'High Floor', 'Low Floor', 'Non-smoking',
  'Smoking', 'City View', 'Sea View', 'Pool View',
  'Workspace', 'Late checkout', 'Early check-in',
  'Executive Floor', 'Vegetarian meals',
];

/* ── Form Field ────────────────────────────────────────────── */
const FormField = ({ label, icon, required, children }) => (
  <div>
    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
      {icon && <span className="text-gray-400">{icon}</span>}
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 transition-all placeholder-gray-400 bg-white";

/* ── Main Component ────────────────────────────────────────── */
const AddCustomer = () => {
  const navigate = useNavigate();
  const role     = useRole();
  const basePath = `/${role}`;

  // Redirect if no permission (shouldn't happen with proper routing, but defensive)
  if (!canCustomer(role, 'create')) {
    return (
      <DashboardLayout role={role} userName={userNames[role]} userRole={userRoles[role]}>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <p className="text-gray-500 font-medium">You don't have permission to add customers.</p>
          <button onClick={() => navigate(-1)} className="text-sm text-navy-700 hover:underline">Go back</button>
        </div>
      </DashboardLayout>
    );
  }

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    dob: '', nationalId: '', address: '', country: 'USA',
    memberTier: 'Regular Member', notes: '',
    preferences: [],
  });
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  };

  const togglePref = (pref) => {
    setForm((f) => ({
      ...f,
      preferences: f.preferences.includes(pref)
        ? f.preferences.filter((p) => p !== pref)
        : [...f.preferences, pref],
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim())  e.lastName  = 'Last name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.phone.trim())     e.phone     = 'Phone number is required';
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSaving(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    alert(`Customer ${form.firstName} ${form.lastName} created (mock).`);
    navigate(`${basePath}/customers`);
  };

  return (
    <DashboardLayout
      role={role}
      userName={userNames[role]}
      userRole={userRoles[role]}
      notificationCount={3}
      searchPlaceholder="Search guests, rooms or booking ID..."
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Add New Guest</h1>
            <p className="text-xs text-gray-400 mt-0.5">Fill in the details to register a new customer</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : 'Save Customer'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── Left: Personal Info ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Basic Info */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-bold text-gray-800">Personal Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <FormField label="First Name" required icon={<User className="w-3 h-3" />}>
                <input
                  value={form.firstName}
                  onChange={(e) => set('firstName', e.target.value)}
                  placeholder="John"
                  className={`${inputCls} ${errors.firstName ? 'border-red-400 focus:ring-red-100' : ''}`}
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </FormField>
              <FormField label="Last Name" required>
                <input
                  value={form.lastName}
                  onChange={(e) => set('lastName', e.target.value)}
                  placeholder="Doe"
                  className={`${inputCls} ${errors.lastName ? 'border-red-400 focus:ring-red-100' : ''}`}
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <FormField label="Email Address" required icon={<Mail className="w-3 h-3" />}>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="john@example.com"
                  className={`${inputCls} ${errors.email ? 'border-red-400 focus:ring-red-100' : ''}`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </FormField>
              <FormField label="Phone Number" required icon={<Phone className="w-3 h-3" />}>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="+1 555 000 0000"
                  className={`${inputCls} ${errors.phone ? 'border-red-400 focus:ring-red-100' : ''}`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <FormField label="Date of Birth" icon={<Calendar className="w-3 h-3" />}>
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => set('dob', e.target.value)}
                  className={inputCls}
                />
              </FormField>
              <FormField label="National ID" icon={<CreditCard className="w-3 h-3" />}>
                <input
                  value={form.nationalId}
                  onChange={(e) => set('nationalId', e.target.value)}
                  placeholder="ID-000000"
                  className={inputCls}
                />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Address" icon={<MapPin className="w-3 h-3" />}>
                <textarea
                  value={form.address}
                  onChange={(e) => set('address', e.target.value)}
                  placeholder="123 Main St, City, State, ZIP"
                  rows={2}
                  className={`${inputCls} resize-none`}
                />
              </FormField>
              <FormField label="Country" icon={<Globe className="w-3 h-3" />}>
                <select
                  value={form.country}
                  onChange={(e) => set('country', e.target.value)}
                  className={inputCls}
                >
                  {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </FormField>
            </div>
          </div>

          {/* Notes */}
          <div className="card p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Internal Notes / VIP Notes</h3>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Add any special notes, allergies, or preferences for hotel staff…"
              rows={4}
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>

        {/* ── Right: Tier & Preferences ── */}
        <div className="flex flex-col gap-4">

          {/* Member Tier */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-bold text-gray-800">Guest Tier</h3>
            </div>
            <div className="flex flex-col gap-2">
              {MEMBER_TIERS.map((tier) => {
                const tierStyles = {
                  'Regular Member':   { dot: 'bg-gray-400',   border: 'border-gray-300',   text: 'text-gray-700'   },
                  'VIP Guest':        { dot: 'bg-purple-500', border: 'border-purple-300', text: 'text-purple-700' },
                  'Business Traveler':{ dot: 'bg-blue-500',   border: 'border-blue-300',   text: 'text-blue-700'   },
                  'Platinum Member':  { dot: 'bg-yellow-500', border: 'border-yellow-300', text: 'text-yellow-700' },
                };
                const s = tierStyles[tier];
                const active = form.memberTier === tier;
                return (
                  <button
                    key={tier}
                    onClick={() => set('memberTier', tier)}
                    className={[
                      'flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                      active ? `${s.border} bg-slate-50` : 'border-gray-100 hover:border-gray-200',
                    ].join(' ')}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.dot}`} />
                    <span className={`text-sm font-medium ${active ? s.text : 'text-gray-600'}`}>{tier}</span>
                    {active && (
                      <span className="ml-auto text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferences */}
          <div className="card p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Room Preferences</h3>
            <div className="flex flex-wrap gap-1.5">
              {ALL_PREFERENCES.map((pref) => {
                const active = form.preferences.includes(pref);
                return (
                  <button
                    key={pref}
                    onClick={() => togglePref(pref)}
                    className={[
                      'text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all',
                      active
                        ? 'bg-navy-900 text-white border-navy-900'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-navy-300 hover:text-navy-700',
                    ].join(' ')}
                  >
                    {pref}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddCustomer;
