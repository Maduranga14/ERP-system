import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Phone, MapPin,
  CreditCard, Globe, Calendar, Star, Save, X, Loader2,
} from 'lucide-react';

import DashboardLayout from '../../components/templates/DashboardLayout';
import { useRole }     from '../../hooks/useRole';
import { canCustomer } from '../../utils/permissions';
import { getCustomerById, updateCustomer } from '../../utils/api';

/* ── Helpers ───────────────────────────────────────────────── */
const userNames = {
  admin: 'Admin User', manager: 'Alex Sterling', receptionist: 'Sarah Mitchell',
};
const userRoles = {
  admin: 'Super Administrator', manager: 'General Manager', receptionist: 'Front Desk Lead',
};

const MEMBER_TIERS = ['Regular Member', 'VIP Guest', 'Business Traveler', 'Platinum Member'];
const COUNTRIES    = ['United Kingdom', 'USA', 'UAE', 'France', 'Germany', 'Australia', 'India', 'Canada', 'Other'];
const ALL_PREFERENCES = [
  'Bed: Single', 'Bed: Double', 'Bed: Queen', 'Bed: King',
  'Suite', 'High Floor', 'Low Floor', 'Non-smoking',
  'Smoking', 'City View', 'Sea View', 'Pool View',
  'Workspace', 'Late checkout', 'Early check-in',
  'Executive Floor', 'Vegetarian meals',
];

const TIER_STYLES = {
  'Regular Member':    { dot: 'bg-gray-400',   border: 'border-gray-300',   text: 'text-gray-700'   },
  'VIP Guest':         { dot: 'bg-purple-500', border: 'border-purple-300', text: 'text-purple-700' },
  'Business Traveler': { dot: 'bg-blue-500',   border: 'border-blue-300',   text: 'text-blue-700'   },
  'Platinum Member':   { dot: 'bg-yellow-500', border: 'border-yellow-300', text: 'text-yellow-700' },
};

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 transition-all placeholder-gray-400 bg-white";

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

/* ── Main Component ────────────────────────────────────────── */
const EditCustomer = () => {
  const navigate = useNavigate();
  const { id }   = useParams();
  const role     = useRole();
  const basePath = `/${role}`;

  const [customer, setCustomer] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [loadError, setLoadError] = useState('');
  const [form,     setForm]     = useState(null);
  const [errors,   setErrors]   = useState({});
  const [saving,   setSaving]   = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    getCustomerById(id)
      .then((data) => {
        setCustomer(data);
        // Build vipNotes text from array or plain string
        const notesText = Array.isArray(data.vipNotes)
          ? data.vipNotes.map((n) => (typeof n === 'object' ? n.text : n)).join('\n')
          : (data.vipNotes || '');

        setForm({
          firstName:   data.name?.split(' ')[0] || '',
          lastName:    data.name?.split(' ').slice(1).join(' ') || '',
          email:       data.email       || '',
          phone:       data.phone       || '',
          dob:         data.dob         || '',
          nationalId:  data.nationalId  || '',
          address:     data.address     || '',
          country:     data.country     || 'USA',
          memberTier:  data.memberTier  || 'Regular Member',
          status:      data.status      || 'Active',
          notes:       notesText,
          preferences: Array.isArray(data.preferences) ? [...data.preferences] : [],
        });
      })
      .catch(() => setLoadError('Failed to load customer details.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (!canCustomer(role, 'edit')) {
    return (
      <DashboardLayout role={role} userName={userNames[role]} userRole={userRoles[role]}>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <p className="text-gray-500 font-medium">You don't have permission to edit customers.</p>
          <button onClick={() => navigate(-1)} className="text-sm text-navy-700 hover:underline">Go back</button>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) return (
    <DashboardLayout role={role} userName={userNames[role]} userRole={userRoles[role]}>
      <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin" /> Loading customer...
      </div>
    </DashboardLayout>
  );

  if (loadError || !form) return (
    <DashboardLayout role={role} userName={userNames[role]} userRole={userRoles[role]}>
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy-800 mb-4 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <div className="flex items-center justify-center h-64 text-red-500 text-sm">
        {loadError || 'Customer not found.'}
      </div>
    </DashboardLayout>
  );

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
    if (form.email.trim() && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.phone.trim())     e.phone     = 'Phone number is required';
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setSaving(true);
    setSaveError('');

    // Reconstruct the payload merging form fields back into the customer shape
    const payload = {
      ...customer,
      name:        `${form.firstName.trim()} ${form.lastName.trim()}`,
      email:       form.email,
      phone:       form.phone,
      dob:         form.dob,
      nationalId:  form.nationalId,
      address:     form.address,
      country:     form.country,
      memberTier:  form.memberTier,
      status:      form.status,
      preferences: form.preferences,
      // Convert notes text back to vipNotes array format expected by backend
      vipNotes:    form.notes
        .split('\n')
        .map((t) => t.trim())
        .filter(Boolean)
        .map((text) => ({ type: 'info', text })),
    };

    try {
      await updateCustomer(id, payload);
      navigate(`${basePath}/customers/${id}`);
    } catch {
      setSaveError('Failed to save changes. Please try again.');
      setSaving(false);
    }
  };

  const fullName = `${form.firstName} ${form.lastName}`.trim() || customer?.name || '';

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
            <h1 className="text-xl font-bold text-gray-900">Edit Customer</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Editing: <span className="font-semibold text-gray-600">{fullName}</span>
              {customer?.id && <span className="text-gray-400"> (ID: {customer.id})</span>}
            </p>
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
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Change indicator */}
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-4">
        <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
        <p className="text-xs text-amber-700 font-medium">
          You are editing an existing customer profile. Changes will be saved to the database.
        </p>
      </div>

      {/* Save error banner */}
      {saveError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mb-4">
          <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
          <p className="text-xs text-red-700 font-medium">{saveError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── Left: Personal Info ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">

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
                  className={`${inputCls} ${errors.firstName ? 'border-red-400' : ''}`}
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </FormField>
              <FormField label="Last Name" required>
                <input
                  value={form.lastName}
                  onChange={(e) => set('lastName', e.target.value)}
                  className={`${inputCls} ${errors.lastName ? 'border-red-400' : ''}`}
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <FormField label="Email Address" icon={<Mail className="w-3 h-3" />}>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  className={`${inputCls} ${errors.email ? 'border-red-400' : ''}`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </FormField>
              <FormField label="Phone Number" required icon={<Phone className="w-3 h-3" />}>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  className={`${inputCls} ${errors.phone ? 'border-red-400' : ''}`}
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
                  className={inputCls}
                />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <FormField label="Address" icon={<MapPin className="w-3 h-3" />}>
                <textarea
                  value={form.address}
                  onChange={(e) => set('address', e.target.value)}
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
            <FormField label="Status">
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
                className={inputCls}
              >
                {['Active', 'Inactive', 'New'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </FormField>
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
            <p className="text-[11px] text-gray-400 mt-1.5">One note per line. Each line is saved as a separate VIP note.</p>
          </div>
        </div>

        {/* ── Right: Tier & Preferences ── */}
        <div className="flex flex-col gap-4">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-bold text-gray-800">Guest Tier</h3>
            </div>
            <div className="flex flex-col gap-2">
              {MEMBER_TIERS.map((tier) => {
                const s = TIER_STYLES[tier];
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

export default EditCustomer;
