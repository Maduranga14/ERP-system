import React, { useState, useEffect, useCallback } from 'react';
import {
  X, Save, BedDouble, Calendar, DollarSign, Tag,
  AlertCircle, Loader2, CheckCircle2, Clock, XCircle,
  User, FileText, RefreshCw,
} from 'lucide-react';
import { getRooms, updateReservation } from '../../utils/api';

/* ─── Constants ───────────────────────────────────────────── */
const STATUS_OPTIONS  = ['Confirmed', 'Pending', 'Cancelled'];
const PAYMENT_OPTIONS = ['Pending', 'Partial', 'Paid', 'Refunded'];

const inp =
  'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 ' +
  'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 ' +
  'focus:border-blue-400 transition-all bg-white disabled:bg-gray-50 disabled:text-gray-400';

/* ─── Sub-components ──────────────────────────────────────── */
const Field = ({ label, children, error }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
      {label}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
  </div>
);

const SectionTitle = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
    <div className="w-6 h-6 rounded-md bg-navy-50 flex items-center justify-center">
      <Icon className="w-3.5 h-3.5 text-navy-700" />
    </div>
    <h3 className="text-sm font-bold text-gray-800">{title}</h3>
  </div>
);

/* ─── Billing helpers ─────────────────────────────────────── */
const calcNights = (ci, co) => {
  if (!ci || !co) return 0;
  const d = (new Date(co) - new Date(ci)) / 86_400_000;
  return d > 0 ? Math.round(d) : 0;
};

/* ════════════════════════════════════════════════════════════
   EditReservationDrawer
   Props:
     reservation  – current reservation object from API
     onClose      – () => void
     onSaved      – () => void  (triggers detail refresh)
════════════════════════════════════════════════════════════ */
const EditReservationDrawer = ({ reservation, onClose, onSaved }) => {
  /* ── Rooms list ──────────────────────────────────────── */
  const [rooms, setRooms]           = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  useEffect(() => {
    getRooms()
      .then(data => setRooms(data))
      .catch(() => {})
      .finally(() => setLoadingRooms(false));
  }, []);

  /* ── Form state ──────────────────────────────────────── */
  const [form, setForm] = useState({
    checkIn:            reservation.checkIn            || '',
    checkOut:           reservation.checkOut           || '',
    roomId:             String(reservation.room?.id    || ''),
    status:             reservation.status             || 'Confirmed',
    payment:            reservation.payment            || 'Pending',
    additionalServices: reservation.additionalServices ?? 0,
    discount:           reservation.discount           ?? 0,
    discountCode:       reservation.discountCode       || '',
    specialRequests:    reservation.specialRequests    || '',
  });

  const [errors,   setErrors]   = useState({});
  const [saving,   setSaving]   = useState(false);
  const [saveError, setSaveError] = useState('');
  const [success,  setSuccess]  = useState(false);

  /* ── Derived billing ─────────────────────────────────── */
  const selectedRoom  = rooms.find(r => String(r.id) === form.roomId) || reservation.room;
  const rate          = selectedRoom?.pricePerNight || 0;
  const nights        = calcNights(form.checkIn, form.checkOut);
  const roomCharges   = rate * nights;
  const tax           = Math.round(roomCharges * 0.12 * 100) / 100;
  const additSvc      = parseFloat(form.additionalServices) || 0;
  const discountAmt   = parseFloat(form.discount) || 0;
  const total         = roomCharges + tax + additSvc - discountAmt;

  /* ── Field helper ────────────────────────────────────── */
  const set = useCallback((field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
    setSaveError('');
    setSuccess(false);
  }, []);

  /* ── Validate ────────────────────────────────────────── */
  const validate = () => {
    const e = {};
    if (!form.checkIn)  e.checkIn  = 'Check-in date is required';
    if (!form.checkOut) e.checkOut = 'Check-out date is required';
    if (nights <= 0)    e.checkOut = 'Check-out must be after check-in';
    if (!form.roomId)   e.roomId   = 'Please select a room';
    return e;
  };

  /* ── Submit ──────────────────────────────────────────── */
  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setSaving(true);
    setSaveError('');
    try {
      await updateReservation(reservation.id, {
        customerId:         reservation.customer?.id,
        roomId:             Number(form.roomId),
        checkIn:            form.checkIn,
        checkOut:           form.checkOut,
        status:             form.status,
        payment:            form.payment,
        additionalServices: additSvc,
        discount:           discountAmt,
        discountCode:       form.discountCode,
        specialRequests:    form.specialRequests,
        nights,
        roomCharges,
        tax,
        total,
      });
      setSuccess(true);
      setTimeout(() => {
        onSaved();
        onClose();
      }, 700);
    } catch (err) {
      setSaveError(err.message || 'Failed to update reservation. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  /* ── Available rooms for dropdown ────────────────────── */
  // Include current room even if Occupied/Reserved
  const roomOptions = rooms.filter(
    r => r.status === 'Available' || String(r.id) === String(reservation.room?.id)
  );

  /* ── Status badge colors ─────────────────────────────── */
  const statusColor = {
    Confirmed:  'text-green-700  bg-green-50  border-green-200',
    'Checked In': 'text-blue-700   bg-blue-50   border-blue-200',
    Pending:    'text-amber-700  bg-amber-50  border-amber-200',
    Cancelled:  'text-red-700    bg-red-50    border-red-200',
  };

  /* ═══════════════════ RENDER ════════════════════════════ */
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex">
        <div
          className="
            relative w-[560px] max-w-[95vw] h-full bg-white shadow-2xl
            flex flex-col overflow-hidden
            animate-[slideInRight_0.25s_ease-out]
          "
          style={{ animation: 'slideInRight 0.25s ease-out' }}
        >
          {/* ── Header ─────────────────────────────────── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
            <div>
              <h2 className="text-base font-bold text-gray-900">Edit Reservation</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                RES-{10000 + reservation.id} &bull; {reservation.customer?.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Body (scrollable) ───────────────────────── */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* Notice banner */}
            <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
              <p className="text-xs text-amber-700 font-medium">
                You are editing an existing reservation. Billing totals will be recalculated automatically.
              </p>
            </div>

            {/* ── Guest Info (read-only) ─────────────── */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <SectionTitle icon={User} title="Guest (Read-only)" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Full Name</p>
                  <p className="text-sm font-semibold text-gray-700">{reservation.customer?.name || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Phone</p>
                  <p className="text-sm font-semibold text-gray-700">{reservation.customer?.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Email</p>
                  <p className="text-sm font-semibold text-gray-700">{reservation.customer?.email || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">National ID</p>
                  <p className="text-sm font-semibold text-gray-700">{reservation.customer?.nationalId || '—'}</p>
                </div>
              </div>
            </div>

            {/* ── Stay Details ──────────────────────── */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <SectionTitle icon={Calendar} title="Stay Details" />
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Field label="Check-in Date" error={errors.checkIn}>
                  <input
                    type="date"
                    className={`${inp} ${errors.checkIn ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
                    value={form.checkIn}
                    onChange={e => set('checkIn', e.target.value)}
                  />
                </Field>
                <Field label="Check-out Date" error={errors.checkOut}>
                  <input
                    type="date"
                    className={`${inp} ${errors.checkOut ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
                    value={form.checkOut}
                    min={form.checkIn}
                    onChange={e => set('checkOut', e.target.value)}
                  />
                </Field>
              </div>

              {/* Duration pill */}
              {nights > 0 && (
                <div className="flex items-center justify-between bg-navy-900 text-white rounded-lg px-4 py-2.5 mb-4">
                  <span className="text-xs font-medium opacity-80">Duration of Stay</span>
                  <span className="text-sm font-bold">{nights} Night{nights !== 1 ? 's' : ''}</span>
                </div>
              )}

              {/* Room Selection */}
              <Field label="Room" error={errors.roomId}>
                {loadingRooms ? (
                  <div className="flex items-center gap-2 text-gray-400 text-xs py-2.5">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading rooms…
                  </div>
                ) : (
                  <select
                    className={`${inp} ${errors.roomId ? 'border-red-400' : ''}`}
                    value={form.roomId}
                    onChange={e => set('roomId', e.target.value)}
                  >
                    <option value="">— Select a room —</option>
                    {roomOptions.map(r => (
                      <option key={r.id} value={r.id}>
                        Room {r.number} — {r.type} (${r.pricePerNight}/night) [{r.status}]
                      </option>
                    ))}
                  </select>
                )}
              </Field>

              {/* Selected room summary */}
              {selectedRoom && (
                <div className="mt-3 flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="w-9 h-9 rounded-lg bg-navy-900 flex items-center justify-center flex-shrink-0">
                    <BedDouble className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900">Room {selectedRoom.number}</p>
                    <p className="text-xs text-gray-500">{selectedRoom.type} &bull; Capacity: {selectedRoom.capacity}</p>
                  </div>
                  <p className="text-sm font-bold text-amber-600 flex-shrink-0">${rate}/night</p>
                </div>
              )}
            </div>

            {/* ── Status & Payment ──────────────────── */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <SectionTitle icon={RefreshCw} title="Status & Payment" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Reservation Status">
                  <div className="grid grid-cols-1 gap-1.5">
                    {STATUS_OPTIONS.map(s => {
                      const icons = {
                        Confirmed: <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />,
                        Pending:   <Clock className="w-3.5 h-3.5 text-amber-500" />,
                        Cancelled: <XCircle className="w-3.5 h-3.5 text-red-500" />,
                      };
                      const active = form.status === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => set('status', s)}
                          className={[
                            'flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all text-left',
                            active
                              ? `${statusColor[s]} border-current`
                              : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white',
                          ].join(' ')}
                        >
                          {icons[s]}
                          {s}
                          {active && (
                            <span className="ml-auto text-[10px] font-bold uppercase tracking-wider opacity-60">
                              selected
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <Field label="Payment Status">
                  <div className="grid grid-cols-1 gap-1.5">
                    {PAYMENT_OPTIONS.map(p => {
                      const payColors = {
                        Paid:     'text-green-700 bg-green-50 border-green-200',
                        Partial:  'text-amber-700 bg-amber-50 border-amber-200',
                        Pending:  'text-red-700   bg-red-50   border-red-200',
                        Refunded: 'text-purple-700 bg-purple-50 border-purple-200',
                      };
                      const active = form.payment === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => set('payment', p)}
                          className={[
                            'flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all text-left',
                            active
                              ? `${payColors[p]} border-current`
                              : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white',
                          ].join(' ')}
                        >
                          <span className={[
                            'w-2 h-2 rounded-full flex-shrink-0',
                            p === 'Paid' ? 'bg-green-500' :
                              p === 'Partial' ? 'bg-amber-500' :
                                p === 'Pending' ? 'bg-red-500' : 'bg-purple-500',
                          ].join(' ')} />
                          {p}
                          {active && (
                            <span className="ml-auto text-[10px] font-bold uppercase tracking-wider opacity-60">
                              selected
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              </div>
            </div>

            {/* ── Billing Adjustments ───────────────── */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <SectionTitle icon={DollarSign} title="Billing Adjustments" />
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Field label="Additional Services ($)">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all bg-white">
                    <span className="px-3 py-2.5 text-sm text-gray-400 bg-gray-50 border-r border-gray-200 font-medium">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="flex-1 px-3 py-2.5 text-sm text-gray-800 outline-none bg-white"
                      value={form.additionalServices}
                      onChange={e => set('additionalServices', e.target.value)}
                    />
                  </div>
                </Field>
                <Field label="Discount Amount ($)">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all bg-white">
                    <span className="px-3 py-2.5 text-sm text-gray-400 bg-gray-50 border-r border-gray-200 font-medium">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="flex-1 px-3 py-2.5 text-sm text-gray-800 outline-none bg-white"
                      value={form.discount}
                      onChange={e => set('discount', e.target.value)}
                    />
                  </div>
                </Field>
              </div>
              <Field label="Discount / Promo Code">
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all bg-white">
                  <Tag className="w-4 h-4 text-gray-400 ml-3 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="e.g. PROMO20"
                    className="flex-1 px-3 py-2.5 text-sm text-gray-800 outline-none bg-white"
                    value={form.discountCode}
                    onChange={e => set('discountCode', e.target.value)}
                  />
                </div>
              </Field>

              {/* Live Billing Summary */}
              <div className="mt-4 rounded-xl bg-navy-900 text-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-3">
                  Updated Billing Summary
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Room Charges ({nights} night{nights !== 1 ? 's' : ''} × ${rate})</span>
                    <span className="font-semibold">${roomCharges.toFixed(2)}</span>
                  </div>
                  {additSvc > 0 && (
                    <div className="flex justify-between">
                      <span className="text-white/70">Additional Services</span>
                      <span className="font-semibold">${additSvc.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-white/70">Tax (12%)</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>
                  {discountAmt > 0 && (
                    <div className="flex justify-between">
                      <span className="text-amber-400 flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {form.discountCode || 'Discount'}
                      </span>
                      <span className="text-red-400 font-semibold">-${discountAmt.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-white/10 pt-2 flex justify-between items-center">
                    <span className="font-bold text-white">Total</span>
                    <span className="text-xl font-bold text-white">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Special Requests ─────────────────── */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <SectionTitle icon={FileText} title="Special Requests" />
              <textarea
                rows={3}
                className={`${inp} resize-none`}
                placeholder="e.g. High floor, early check-in, anniversary setup…"
                value={form.specialRequests}
                onChange={e => set('specialRequests', e.target.value)}
              />
            </div>

            {/* Extra bottom spacing */}
            <div className="h-4" />
          </div>

          {/* ── Footer (sticky) ────────────────────────── */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 space-y-3">
            {/* Error */}
            {saveError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-4 py-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {saveError}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg px-4 py-2.5">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                Reservation updated successfully! Refreshing…
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || success}
                className={[
                  'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all',
                  saving || success
                    ? 'bg-navy-400 cursor-not-allowed'
                    : 'bg-navy-900 hover:bg-navy-800 shadow-md hover:shadow-lg',
                ].join(' ')}
              >
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  : success
                    ? <><CheckCircle2 className="w-4 h-4" /> Saved!</>
                    : <><Save className="w-4 h-4" /> Save Changes</>
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-in keyframe */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default EditReservationDrawer;
