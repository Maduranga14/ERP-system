import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BedDouble, User, Clock, ArrowRight } from 'lucide-react';

import DashboardLayout from '../../components/templates/DashboardLayout';
import Button          from '../../components/atoms/Button';
import { useRole }     from '../../hooks/useRole';
import { ROOM_TYPES, AVAILABLE_ROOMS, PAYMENT_METHODS } from '../../data/reservations';

const SectionHeader = ({ icon, title }) => (
  <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
    <span className="text-navy-700">{icon}</span>
    <h2 className="text-base font-bold text-gray-900">{title}</h2>
  </div>
);

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-all bg-white';

const userNames = { admin:'Admin User', receptionist:'Sarah Mitchell' };
const userRoles = { admin:'Super Administrator', receptionist:'Front Desk Lead' };

const NewReservation = () => {
  const navigate = useNavigate();
  const role = useRole();
  const basePath = role === 'admin' ? '/admin' : '/receptionist';

  const [guest,        setGuest]        = useState({ name:'', phone:'', email:'', nationalId:'' });
  const [checkIn,      setCheckIn]      = useState('');
  const [checkOut,     setCheckOut]     = useState('');
  const [guests,       setGuests]       = useState(2);
  const [rooms,        setRooms]        = useState('1 Room');
  const [special,      setSpecial]      = useState('');
  const [roomType,     setRoomType]     = useState(ROOM_TYPES[0]);
  const [availRoom,    setAvailRoom]    = useState(AVAILABLE_ROOMS[0].value);
  const [method,       setMethod]       = useState(PAYMENT_METHODS[0]);
  const [deposit,      setDeposit]      = useState(200);
  const [promoCode,    setPromoCode]    = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [bookingStatus,setBookingStatus]= useState('Confirmed');

  const nights   = (() => { if (!checkIn||!checkOut) return 3; const d=(new Date(checkOut)-new Date(checkIn))/86400000; return d>0?d:3; })();
  const subtotal = roomType.rate * nights;
  const tax      = Math.round(subtotal * 0.12);
  const discount = promoApplied ? 50 : 0;
  const total    = subtotal + tax - discount;

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Reservation created! Status: ${bookingStatus}`);
    navigate(`${basePath}/reservations`);
  };

  return (
    <DashboardLayout role={role} userName={userNames[role]} userRole={userRoles[role]}
      notificationCount={3} searchPlaceholder="Search guests, rooms...">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Reservation</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Main form (2/3) */}
          <div className="xl:col-span-2 flex flex-col gap-5">
            {/* Guest Information */}
            <div className="card p-6">
              <SectionHeader icon={<User className="w-5 h-5" />} title="Guest Information" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Full Guest Name">
                  <input className={inputCls} placeholder="e.g. Alexander Hamilton"
                    value={guest.name} onChange={(e)=>setGuest({...guest,name:e.target.value})} required />
                </Field>
                <Field label="Phone Number">
                  <input className={inputCls} placeholder="+1 (555) 000-0000"
                    value={guest.phone} onChange={(e)=>setGuest({...guest,phone:e.target.value})} required />
                </Field>
                <Field label="Email Address">
                  <input className={inputCls} type="email" placeholder="guest@luxury.com"
                    value={guest.email} onChange={(e)=>setGuest({...guest,email:e.target.value})} required />
                </Field>
                <Field label="National ID / Passport">
                  <input className={inputCls} placeholder="ID Number"
                    value={guest.nationalId} onChange={(e)=>setGuest({...guest,nationalId:e.target.value})} />
                </Field>
              </div>
            </div>

            {/* Reservation Details */}
            <div className="card p-6">
              <SectionHeader icon={<Clock className="w-5 h-5" />} title="Reservation Details" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Check-in Date">
                  <input className={inputCls} type="date" value={checkIn}
                    onChange={(e)=>setCheckIn(e.target.value)} required />
                </Field>
                <Field label="Check-out Date">
                  <input className={inputCls} type="date" value={checkOut}
                    onChange={(e)=>setCheckOut(e.target.value)} required />
                </Field>
                <Field label="Number of Guests">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden w-fit">
                    <button type="button" onClick={()=>setGuests(Math.max(1,guests-1))}
                      className="w-9 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 border-r border-gray-200 font-bold text-gray-600">−</button>
                    <span className="px-5 text-sm font-semibold text-gray-800">{guests}</span>
                    <button type="button" onClick={()=>setGuests(guests+1)}
                      className="w-9 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 border-l border-gray-200 font-bold text-gray-600">+</button>
                  </div>
                </Field>
                <Field label="Number of Rooms">
                  <select className={inputCls} value={rooms} onChange={(e)=>setRooms(e.target.value)}>
                    {['1 Room','2 Rooms','3 Rooms'].map((o)=><option key={o}>{o}</option>)}
                  </select>
                </Field>
                <div className="col-span-2">
                  <Field label="Special Requests">
                    <textarea className={[inputCls,'resize-none h-24'].join(' ')}
                      placeholder="e.g. High floor, allergies, anniversary setup..."
                      value={special} onChange={(e)=>setSpecial(e.target.value)} />
                  </Field>
                </div>
              </div>
            </div>

            {/* Room Selection */}
            <div className="card p-6">
              <div className="flex items-start justify-between mb-5 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <BedDouble className="w-5 h-5 text-navy-700" />
                  <h2 className="text-base font-bold text-gray-900">Room Selection</h2>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider">Rate Per Night</p>
                  <p className="text-lg font-bold text-gray-900">${roomType.rate.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex gap-3 mb-5">
                {ROOM_TYPES.map((rt)=>(
                  <button key={rt.id} type="button" onClick={()=>setRoomType(rt)}
                    className={['flex-1 rounded-xl border-2 p-3 text-left transition-all duration-150',
                      roomType.id===rt.id ? 'border-navy-900 bg-navy-900 text-white' : 'border-gray-200 hover:border-gold-400 text-gray-800',
                    ].join(' ')}>
                    <p className="text-sm font-bold">{rt.name}</p>
                    <p className={['text-[11px] mt-0.5', roomType.id===rt.id?'text-white/70':'text-gray-400'].join(' ')}>{rt.desc}</p>
                  </button>
                ))}
              </div>
              <Field label="Available Rooms">
                <select className={[inputCls,'w-64'].join(' ')} value={availRoom} onChange={(e)=>setAvailRoom(e.target.value)}>
                  {AVAILABLE_ROOMS.map((r)=><option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </Field>
            </div>
          </div>

          {/* Payment & Billing sidebar (1/3) */}
          <div>
            <div className="card p-5 sticky top-20">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                <span className="text-navy-700">💳</span>
                <h2 className="text-base font-bold text-gray-900">Payment &amp; Billing</h2>
              </div>
              <div className="flex flex-col gap-4">
                <Field label="Payment Method">
                  <select className={inputCls} value={method} onChange={(e)=>setMethod(e.target.value)}>
                    {PAYMENT_METHODS.map((m)=><option key={m}>{m}</option>)}
                  </select>
                </Field>
                <Field label="Deposit Amount">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <span className="px-3 py-2.5 text-sm text-gray-400 bg-gray-50 border-r border-gray-200">$</span>
                    <input className="flex-1 px-3 py-2.5 text-sm text-gray-800 outline-none" type="number"
                      value={deposit} onChange={(e)=>setDeposit(Number(e.target.value))} />
                  </div>
                </Field>
                <Field label="Discount (Fixed/%)">
                  <div className="flex gap-2">
                    <input className={[inputCls,'flex-1'].join(' ')} placeholder="PROMO20"
                      value={promoCode} onChange={(e)=>setPromoCode(e.target.value)} />
                    <button type="button" onClick={()=>setPromoApplied(promoCode.length>0)}
                      className="px-3 py-2.5 bg-navy-900 text-white text-xs font-bold rounded-lg hover:bg-navy-800 transition-colors">
                      APPLY
                    </button>
                  </div>
                </Field>
                {/* Bill breakdown */}
                <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Subtotal ({nights} Night{nights!==1?'s':''})</span><span>${subtotal.toLocaleString()}.00</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Tax (12%)</span><span>${tax.toLocaleString()}.00</span>
                  </div>
                  {discount>0&&(
                    <div className="flex justify-between text-xs">
                      <span className="text-gold-600 font-medium">Discount</span>
                      <span className="text-red-500 font-medium">−${discount}.00</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2 mt-1">
                    <span className="text-sm">Total</span>
                    <span className="text-lg">${total.toLocaleString()}.00</span>
                  </div>
                </div>
                {/* Booking Status */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm">🔄</span>
                    <h3 className="text-sm font-bold text-gray-800">Booking Status</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {['Pending','Confirmed'].map((s)=>(
                      <button key={s} type="button" onClick={()=>setBookingStatus(s)}
                        className={['flex items-center justify-center gap-1.5 py-2 rounded-lg border-2 text-xs font-semibold transition-all',
                          bookingStatus===s ? 'border-navy-900 bg-navy-50 text-navy-900' : 'border-gray-200 text-gray-500 hover:border-gray-300',
                        ].join(' ')}>
                        {s==='Pending'&&<Clock className="w-3.5 h-3.5"/>}
                        {s==='Confirmed'&&<span className="text-green-500">✓</span>}
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <Button type="submit" variant="primary" size="lg" fullWidth
                  icon={<ArrowRight className="w-4 h-4"/>} className="mt-1">
                  Create Reservation
                </Button>
                <Button type="button" variant="ghost" size="md" fullWidth
                  onClick={()=>navigate(`${basePath}/reservations`)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default NewReservation;
