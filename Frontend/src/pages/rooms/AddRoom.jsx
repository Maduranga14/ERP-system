import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Upload, CheckCircle, Loader2 } from 'lucide-react';

import DashboardLayout from '../../components/templates/DashboardLayout';
import { useRole }     from '../../hooks/useRole';
import { FLOOR_LABELS, BED_TYPES, AMENITY_OPTIONS } from '../../data/rooms';
import { createRoom }  from '../../utils/api';

/* ─── Reusable field wrapper ─────────────────────────────── */
const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

const inputCls = 'w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-all bg-white';

const ROOM_TYPES = ['Select Type', 'Standard King', 'Deluxe Ocean View', 'Deluxe Suite', 'Deluxe Sea View Suite', 'Presidential Suite'];

const userNames = { admin:'Admin User' };
const userRoles = { admin:'Super Administrator' };

/* ─── Component ─────────────────────────────────────────── */
const AddRoom = () => {
  const navigate = useNavigate();
  const role = useRole();

  const [form, setForm] = useState({
    number: '', type: 'Select Type', floor: 'Ground Floor',
    price: '', capacity: '', bedType: 'King Size',
  });
  const [amenities, setAmenities] = useState([]);
  const [statusLabel] = useState('Available');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const toggleAmenity = (a) =>
    setAmenities((prev) => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.type === 'Select Type') { setError('Please select a room type.'); return; }
    setError('');
    setSubmitting(true);

    // Map floor label to floor number
    const floorMap = { 'Ground Floor': 0, '1st Floor': 1, '2nd Floor': 2, '3rd Floor': 3, '4th Floor': 4, '5th Floor': 5 };

    const payload = {
      number:       form.number,
      type:         form.type,
      floor:        floorMap[form.floor] ?? 1,
      capacity:     parseInt(form.capacity, 10),
      pricePerNight: parseFloat(form.price),
      bedType:      form.bedType,
      status:       'Available',
      lastCleaned:  '-',
      viewType:     '',
      wing:         '',
      description:  '',
      amenities,
    };

    try {
      await createRoom(payload);
      navigate('/admin/rooms');
    } catch (err) {
      // Try to extract error message from response body
      const msg = err.message || '';
      if (msg.includes('400')) {
        setError('Room number already exists. Please use a unique room number.');
      } else {
        setError('Failed to create room. Please check the backend is running.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout role={role} userName={userNames[role] || 'Admin User'} userRole={userRoles[role] || 'Super Administrator'}
      notificationCount={4} searchPlaceholder="Search rooms, guests, or staff...">

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
        <span className="hover:text-navy-700 cursor-pointer" onClick={() => navigate('/admin')}>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span className="hover:text-navy-700 cursor-pointer" onClick={() => navigate('/admin/rooms')}>Room Management</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-navy-700 font-semibold">Add New Room</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Room</h1>
          <p className="text-sm text-gray-400 mt-0.5">Configure details for a new luxury accommodation unit.</p>
        </div>
        {/* Status pill */}
        <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs font-semibold text-green-700">Status: {statusLabel}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* LEFT — main form (2/3) */}
          <div className="xl:col-span-2 flex flex-col gap-5">

            {/* Basic Information */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
                <span className="text-navy-700">ℹ️</span>
                <h2 className="text-sm font-bold text-gray-900">Basic Information</h2>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <Field label="Room Number">
                  <input className={inputCls} placeholder="e.g. 402" value={form.number}
                    onChange={set('number')} required />
                </Field>
                <Field label="Room Type">
                  <select className={inputCls} value={form.type} onChange={set('type')}>
                    {ROOM_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Floor">
                  <select className={inputCls} value={form.floor} onChange={set('floor')}>
                    {FLOOR_LABELS.map((f) => <option key={f}>{f}</option>)}
                  </select>
                </Field>
                <Field label="Price Per Night (USD)">
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-gold-400">
                    <span className="px-3 py-2.5 text-sm text-gray-400 bg-gray-50 border-r border-gray-200">$</span>
                    <input className="flex-1 px-3 py-2.5 text-sm text-gray-800 outline-none bg-white"
                      type="number" step="0.01" placeholder="0.00"
                      value={form.price} onChange={set('price')} required />
                  </div>
                </Field>
                <Field label="Capacity">
                  <input className={inputCls} type="number" placeholder="Number of guests"
                    value={form.capacity} onChange={set('capacity')} required />
                </Field>
                <Field label="Bed Type">
                  <select className={inputCls} value={form.bedType} onChange={set('bedType')}>
                    {BED_TYPES.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </Field>
              </div>
            </div>

            {/* Amenities */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
                <span className="text-gold-500">⭐</span>
                <h2 className="text-sm font-bold text-gray-900">Amenities &amp; Services</h2>
              </div>
              <div className="grid grid-cols-4 gap-y-4 gap-x-3">
                {AMENITY_OPTIONS.map((a) => (
                  <label key={a} className="flex items-center gap-2.5 cursor-pointer group">
                    <div
                      onClick={() => toggleAmenity(a)}
                      className={[
                        'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer',
                        amenities.includes(a)
                          ? 'bg-navy-900 border-navy-900'
                          : 'border-gray-300 group-hover:border-gold-400',
                      ].join(' ')}
                    >
                      {amenities.includes(a) && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm text-gray-700 select-none">{a}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — Room Photos (1/3) */}
          <div className="flex flex-col gap-5">
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                <span className="text-navy-700">📷</span>
                <h2 className="text-sm font-bold text-gray-900">Room Photos</h2>
              </div>

              {/* Upload area */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center text-center hover:border-gold-400 transition-colors cursor-pointer group mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-gold-50 flex items-center justify-center mb-3 transition-colors">
                  <Upload className="w-6 h-6 text-gray-400 group-hover:text-gold-500 transition-colors" />
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Upload room photos</p>
                <p className="text-xs text-gray-400">Drag and drop images or click to browse files</p>
                <p className="text-[11px] text-gray-300 mt-2 font-semibold uppercase tracking-wide">Max 5MB per image</p>
              </div>

              {/* Thumbnail slots */}
              <div className="flex gap-2">
                <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-2xl overflow-hidden">
                  🏨
                </div>
                {[0, 1].map((i) => (
                  <button key={i} type="button"
                    className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 hover:border-gold-400 hover:text-gold-400 transition-colors text-xl font-bold">
                    +
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-gray-100">
          {error && <p className="text-sm text-red-500 mr-auto">{error}</p>}
          <button type="button" onClick={() => navigate('/admin/rooms')}
            className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-navy-900 hover:bg-navy-800 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {submitting ? 'Creating...' : 'Create Room'}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default AddRoom;
