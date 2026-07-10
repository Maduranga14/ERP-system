import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BedDouble, User, Calendar, ArrowRight, Loader2,
  AlertCircle, Clock, CheckCircle2, CreditCard, Minus, Plus,
} from 'lucide-react';

import DashboardLayout from '../../components/templates/DashboardLayout';
import { useRole }     from '../../hooks/useRole';
import { getRooms, apiPost, getCustomers } from '../../utils/api';

/* ── Helpers ───────────────────────────────────────── */
const userNames = { admin: 'Admin User', manager: 'Alex Sterling', receptionist: 'Sarah Mitchell' };
const userRoles = { admin: 'Super Administrator', manager: 'General Manager', receptionist: 'Front Desk Lead' };
const PAYMENT_METHODS = ['Credit Card (Pre-auth)', 'Cash', 'Debit Card', 'Online Transfer', 'Bank Transfer'];

/* ── Reusable Field wrapper ────────────────────────── */
const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</label>
    {children}
  </div>
);

/* ── Input style ───────────────────────────────────── */
const inp =
  'w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 ' +
  'placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 ' +
  'transition-all bg-white';

/* ── Section header ────────────────────────────────── */
const SectionHead = ({ icon: Icon, title, extra }) => (
  <div className="flex items-center justify-between mb-5">
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
    </div>
    {extra}
  </div>
);

/* ══════════════════════════════════════════════════════
   Page Component
══════════════════════════════════════════════════════ */
const NewReservation = () => {
  const navigate  = useNavigate();
  const role      = useRole();
  const basePath  = role === 'admin' ? '/admin' : role === 'manager' ? '/manager' : '/receptionist';

  /* rooms from API */
  const [rooms,       setRooms]       = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  /* guest info */
  const [guestName,   setGuestName]   = useState('');
  const [phone,       setPhone]       = useState('');
  const [email,       setEmail]       = useState('');
  const [nationalId,  setNationalId]  = useState('');

  /* reservation details */
  const [checkIn,     setCheckIn]     = useState('');
  const [checkOut,    setCheckOut]    = useState('');
  const [numGuests,   setNumGuests]   = useState(2);
  const [numRooms,    setNumRooms]    = useState('1 Room');
  const [special,     setSpecial]     = useState('');

  /* room selection */
  const [selectedType, setSelectedType] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');

  /* payment */
  const [method,      setMethod]      = useState(PAYMENT_METHODS[0]);
  const [deposit,     setDeposit]     = useState(200);
  const [promoCode,   setPromoCode]   = useState('');
  const [promoApplied,setPromoApplied]= useState(false);
  const [bookStatus,  setBookStatus]  = useState('Confirmed');

  /* form state */
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState('');

  /* ── Fetch rooms ──────────────────────────────── */
  useEffect(() => {
    getRooms()
      .then(data => {
        setRooms(data);
        const first = data.find(r => r.status === 'Available') || data[0];
        if (first) {
          setSelectedType(first.type);
          setSelectedRoomId(String(first.id));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, []);

  /* ── Derived ─────────────────────────────────── */
  // unique room types
  const roomTypes = [...new Map(rooms.map(r => [r.type, r])).values()];

  // rooms of the currently selected type
  const filteredRooms = rooms.filter(r => r.type === selectedType &&
    (r.status === 'Available' || r.status === 'Reserved'));

  const selectedRoom = rooms.find(r => String(r.id) === selectedRoomId);

  const nights = (() => {
    if (!checkIn || !checkOut) return 3; // preview default
    const d = (new Date(checkOut) - new Date(checkIn)) / 86400000;
    return d > 0 ? Math.round(d) : 0;
  })();

  const rate     = selectedRoom?.pricePerNight || 0;
  const subtotal = rate * nights;
  const tax      = Math.round(subtotal * 0.12 * 100) / 100;
  const discount = promoApplied ? 50 : 0;
  const total    = subtotal + tax - discount;

  /* ── Handle type card click ──────────────────── */
  const handleTypeSelect = (type) => {
    setSelectedType(type);
    const first = rooms.find(r => r.type === type && (r.status === 'Available' || r.status === 'Reserved'));
    if (first) setSelectedRoomId(String(first.id));
    else setSelectedRoomId('');
  };

  /* ── Submit ──────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!guestName || !phone) {
      setSubmitError('Please enter guest name and phone number.');
      return;
    }
    if (!selectedRoomId) {
      setSubmitError('Please select an available room.');
      return;
    }
    if (nights <= 0) {
      setSubmitError('Check-out date must be after check-in date.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      const today = new Date().toISOString().split('T')[0];

      // 1. Check if guest already exists by email or phone
      const customers = await getCustomers();
      let customer = null;
      if (email) {
        customer = customers.find(c => c.email === email);
      }
      if (!customer && phone) {
        customer = customers.find(c => c.phone === phone);
      }

      // If guest does not exist, create on the fly
      if (!customer) {
        customer = await apiPost('/api/customers', {
          name:       guestName,
          email:      email || null,
          phone,
          nationalId,
          status:     'Active',
          memberTier: 'Regular',
          country:    '',
          joinedDate: today,
        });
      }

      // 2. Create reservation
      const createdRes = await apiPost('/api/reservations', {
        customerId:      customer.id,
        roomId:          Number(selectedRoomId),
        checkIn:         checkIn || today,
        checkOut:        checkOut || today,
        status:          bookStatus,
        payment:         deposit >= total ? 'Paid' : (deposit > 0 ? 'Partial' : 'Pending'),
        roomCharges:     subtotal,
        tax:             tax,
        discount:        discount,
        total:           total,
        discountCode:    promoCode,
        specialRequests: special,
      });

      // 3. Create invoice and record payment if deposit > 0
      if (deposit > 0) {
        const invPayload = {
          guestName: customer.name,
          email: customer.email || null,
          phone: customer.phone || '',
          reservation: { id: createdRes.id },
          checkIn: createdRes.checkIn,
          checkOut: createdRes.checkOut,
          nights: nights,
          roomNumber: selectedRoom?.number || '',
          roomType: selectedRoom?.type || '',
          method: method,
          status: 'Pending',
          date: today,
          subtotal: subtotal,
          tax: tax,
          discount: discount,
          grandTotal: total,
          amountPaid: 0.0,
          notes: 'Invoice generated automatically upon reservation creation.',
          lineItems: [
            {
              description: `Room Charges (Room ${selectedRoom?.number})`,
              qty: nights,
              unitPrice: rate,
              amount: subtotal
            }
          ]
        };
        const createdInv = await apiPost('/api/billing', invPayload);

        // Record the deposit payment transaction
        const paymentPayload = {
          method: method,
          amount: Number(deposit),
          date: today,
          processedBy: userNames[role]
        };
        await apiPost(`/api/billing/${createdInv.id}/payments`, paymentPayload);
      }

      navigate(`${basePath}/reservations`);
    } catch (err) {
      setSubmitError(err.message || 'Failed to create reservation. Please try again.');
      setSubmitting(false);
    }
  };

  /* ── Loading ─────────────────────────────────── */
  if (loadingData) return (
    <DashboardLayout role={role} userName={userNames[role]} userRole={userRoles[role]}>
      <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin" /> Loading room data...
      </div>
    </DashboardLayout>
  );

  /* ── Render ──────────────────────────────────── */
  return (
    <DashboardLayout role={role} userName={userNames[role]} userRole={userRoles[role]}
      notificationCount={3} searchPlaceholder="Search guests, rooms...">

      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Reservation</h1>

      {submitError && (
        <div className="mb-5 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex gap-5 items-start">

          {/* ═══ LEFT: Main Form ═══════════════════════════════ */}
          <div className="flex-1 flex flex-col gap-5 min-w-0">

            {/* ── Guest Information ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <SectionHead icon={User} title="Guest Information" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Full Guest Name">
                  <input className={inp} placeholder="e.g. Alexander Hamilton"
                    value={guestName} onChange={e => setGuestName(e.target.value)} required />
                </Field>
                <Field label="Phone Number">
                  <input className={inp} placeholder="+1 (555) 000-0000"
                    value={phone} onChange={e => setPhone(e.target.value)} required />
                </Field>
                <Field label="Email Address (Optional)">
                  <input className={inp} type="email" placeholder="guest@luxury.com"
                    value={email} onChange={e => setEmail(e.target.value)} />
                </Field>
                <Field label="National ID / Passport">
                  <input className={inp} placeholder="ID Number"
                    value={nationalId} onChange={e => setNationalId(e.target.value)} />
                </Field>
              </div>
            </div>

            {/* ── Reservation Details ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <SectionHead icon={Calendar} title="Reservation Details" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Check-in Date">
                  <input className={inp} type="date" value={checkIn}
                    onChange={e => setCheckIn(e.target.value)} />
                </Field>
                <Field label="Check-out Date">
                  <input className={inp} type="date" value={checkOut}
                    min={checkIn} onChange={e => setCheckOut(e.target.value)} />
                </Field>

                {/* Number of Guests counter */}
                <Field label="Number of Guests">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden w-fit bg-white">
                    <button type="button"
                      onClick={() => setNumGuests(Math.max(1, numGuests - 1))}
                      className="w-9 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 border-r border-gray-200 text-gray-600 font-bold transition-colors">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-6 text-sm font-semibold text-gray-800">{numGuests}</span>
                    <button type="button"
                      onClick={() => setNumGuests(numGuests + 1)}
                      className="w-9 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 border-l border-gray-200 text-gray-600 font-bold transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Field>

                {/* Number of Rooms */}
                <Field label="Number of Rooms">
                  <select className={inp} value={numRooms} onChange={e => setNumRooms(e.target.value)}>
                    {['1 Room', '2 Rooms', '3 Rooms', '4 Rooms'].map(o => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </Field>

                {/* Special Requests */}
                <div className="col-span-2">
                  <Field label="Special Requests">
                    <textarea className={`${inp} resize-none h-24`}
                      placeholder="e.g. High floor, allergies, anniversary setup..."
                      value={special} onChange={e => setSpecial(e.target.value)} />
                  </Field>
                </div>
              </div>
            </div>

            {/* ── Room Selection ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <SectionHead
                icon={BedDouble}
                title="Room Selection"
                extra={
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rate Per Night</p>
                    <p className="text-xl font-bold text-gray-900">
                      ${rate > 0 ? rate.toFixed(2) : '0.00'}
                    </p>
                  </div>
                }
              />

              {/* Room Type Cards */}
              {roomTypes.length > 0 ? (
                <div className="flex gap-3 mb-5 flex-wrap">
                  {roomTypes.map(rt => (
                    <button key={rt.type} type="button"
                      onClick={() => handleTypeSelect(rt.type)}
                      className={[
                        'flex-1 min-w-[120px] rounded-xl border-2 p-3.5 text-left transition-all duration-150 cursor-pointer',
                        selectedType === rt.type
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 hover:border-blue-300 text-gray-800 bg-white',
                      ].join(' ')}>
                      <p className="text-sm font-bold leading-snug">{rt.type}</p>
                      <p className={['text-[11px] mt-1 leading-snug',
                        selectedType === rt.type ? 'text-white/60' : 'text-gray-400'].join(' ')}>
                        {rt.bedType}{rt.capacity ? `, ${rt.capacity} guests` : ''}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 mb-4">No rooms configured yet.</p>
              )}

              {/* Available Rooms dropdown */}
              <Field label="Available Rooms">
                <select
                  className={`${inp} w-64`}
                  value={selectedRoomId}
                  onChange={e => setSelectedRoomId(e.target.value)}>
                  {filteredRooms.length === 0
                    ? <option value="">No available rooms of this type</option>
                    : filteredRooms.map(r => (
                        <option key={r.id} value={r.id}>
                          Room {r.number} ({r.status})
                        </option>
                      ))
                  }
                </select>
              </Field>
            </div>
          </div>

          {/* ═══ RIGHT: Payment Sidebar ═══════════════════════ */}
          <div className="w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-20">

              {/* Sidebar header accent */}
              <div className="h-1 bg-gradient-to-r from-amber-400 to-yellow-300" />

              <div className="p-5">
                <div className="flex items-center gap-2 mb-5">
                  <CreditCard className="w-4.5 h-4.5 text-blue-600" />
                  <h2 className="text-sm font-bold text-gray-900">Payment &amp; Billing</h2>
                </div>

                <div className="flex flex-col gap-4">

                  {/* Payment Method */}
                  <Field label="Payment Method">
                    <select className={inp} value={method} onChange={e => setMethod(e.target.value)}>
                      {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </Field>

                  {/* Deposit Amount */}
                  <Field label="Deposit Amount">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
                      <span className="px-3 py-2.5 text-sm text-gray-400 bg-gray-50 border-r border-gray-200 font-medium">$</span>
                      <input type="number" className="flex-1 px-3 py-2.5 text-sm text-gray-800 outline-none bg-white"
                        value={deposit} onChange={e => setDeposit(Number(e.target.value))} />
                    </div>
                  </Field>

                  {/* Promo / Discount */}
                  <Field label="Discount (Fixed/%)">
                    <div className="flex gap-2">
                      <input className={`${inp} flex-1`} placeholder="PROMO20"
                        value={promoCode}
                        onChange={e => { setPromoCode(e.target.value); setPromoApplied(false); }} />
                      <button type="button"
                        onClick={() => setPromoApplied(promoCode.length > 0)}
                        className="px-3.5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-lg transition-colors">
                        APPLY
                      </button>
                    </div>
                  </Field>

                  {/* Bill Breakdown */}
                  <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Subtotal ({nights} Night{nights !== 1 ? 's' : ''})</span>
                      <span>${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Tax (12%)</span>
                      <span>${tax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-amber-600 font-medium">Discount</span>
                        <span className="text-red-500 font-medium">
                          -${discount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2 mt-1">
                      <span className="text-sm">Total</span>
                      <span className="text-base">
                        ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Booking Status */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-3">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest">Booking Status</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {['Pending', 'Confirmed'].map(s => (
                        <button key={s} type="button"
                          onClick={() => setBookStatus(s)}
                          className={[
                            'flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 text-xs font-bold transition-all',
                            bookStatus === s
                              ? 'border-gray-900 bg-gray-50 text-gray-900'
                              : 'border-gray-200 text-gray-400 hover:border-gray-300 bg-white',
                          ].join(' ')}>
                          {s === 'Pending'
                            ? <Clock className="w-3.5 h-3.5" />
                            : <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          }
                          {s.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit */}
                  <button type="submit" disabled={submitting}
                    className={[
                      'w-full flex items-center justify-center gap-2 py-3.5 rounded-xl',
                      'text-sm font-bold text-white transition-all',
                      submitting
                        ? 'bg-amber-300 cursor-not-allowed'
                        : 'bg-amber-500 hover:bg-amber-400 shadow-md hover:shadow-lg',
                    ].join(' ')}>
                    {submitting
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                      : <><ArrowRight className="w-4 h-4" /> Create Reservation</>
                    }
                  </button>

                  {/* Cancel */}
                  <button type="button"
                    onClick={() => navigate(`${basePath}/reservations`)}
                    disabled={submitting}
                    className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </form>
    </DashboardLayout>
  );
};

export default NewReservation;
