import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Printer, Send, Pencil, ArrowLeft, CheckCircle, Clock, Shield, Activity } from 'lucide-react';

import DashboardLayout from '../../components/templates/DashboardLayout';
import Badge           from '../../components/atoms/Badge';
import Button          from '../../components/atoms/Button';
import { useRole }     from '../../hooks/useRole';
import { can }         from '../../utils/permissions';
import { RESERVATIONS } from '../../data/reservations';

const STATUS_VARIANT = { 'Confirmed':'green','Checked In':'blue','Pending':'amber','Checked Out':'gray','Cancelled':'red' };

const Field = ({ label, value }) => (
  <div>
    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
    <p className="text-sm font-semibold text-gray-800">{value}</p>
  </div>
);

const userNames = { admin:'Admin User', manager:'Alex Sterling', receptionist:'Sarah Mitchell' };
const userRoles = { admin:'Super Administrator', manager:'General Manager', receptionist:'Front Desk Lead' };

const ReservationDetail = () => {
  const navigate = useNavigate();
  const { id }   = useParams();
  const role     = useRole();
  const basePath = role==='admin' ? '/admin' : role==='manager' ? '/manager' : '/receptionist';
  const reservation = RESERVATIONS.find((r) => r.id === id) || RESERVATIONS[0];

  return (
    <DashboardLayout role={role} userName={userNames[role]} userRole={userRoles[role]}
      notificationCount={3} searchPlaceholder="Search guests, rooms...">

      {/* Header */}
      <div className="mb-6">
        <button onClick={()=>navigate(`${basePath}/reservations`)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-navy-700 mb-3 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Reservations
        </button>
        <h1 className="text-lg font-semibold text-gray-500 mb-1">Reservation Details</h1>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-gray-900">{reservation.id}</h2>
              <Badge variant={STATUS_VARIANT[reservation.status]||'gray'} size="md" dot>{reservation.status}</Badge>
            </div>
            <p className="text-sm text-gray-400 mt-1">Reservation details and management for the upcoming stay.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon={<Printer className="w-3.5 h-3.5"/>}>Print Folio</Button>
            <Button variant="outline" size="sm" icon={<Send className="w-3.5 h-3.5"/>}>Send Confirmation</Button>
            {can(role,'edit') && (
              <Button variant="primary" size="sm" icon={<Pencil className="w-3.5 h-3.5"/>}>Edit Reservation</Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {/* Guest Details */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="text-navy-700">👤</span>
              <h3 className="text-base font-bold text-gray-900">Guest Details</h3>
            </div>
            <button className="text-sm text-gold-600 hover:underline font-medium">View Profile</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <Field label="Full Name"     value={reservation.guest.name}      />
            <Field label="National ID"   value={reservation.guest.nationalId} />
            <Field label="Email Address" value={reservation.guest.email}      />
            <Field label="Phone Number"  value={reservation.guest.phone}      />
          </div>
        </div>

        {/* Billing Summary (dark) */}
        <div className="rounded-xl bg-navy-900 text-white p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold">Billing Summary</h3>
            <div className="w-14 h-14 rounded-full border-4 border-white/10 flex items-center justify-center opacity-30">
              <div className="w-8 h-8 rounded-full border-2 border-white/40" />
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Room Charges</span>
              <span className="font-semibold">${reservation.roomCharges.toLocaleString()}.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Additional Services</span>
              <span className="font-semibold">${reservation.additionalServices.toLocaleString()}.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Taxes (12%)</span>
              <span className="font-semibold">${reservation.tax.toLocaleString()}.00</span>
            </div>
            {reservation.discount>0&&(
              <div className="flex justify-between text-sm">
                <span className="text-gold-400 font-medium">Discounts ({reservation.discountCode})</span>
                <span className="text-red-400 font-medium">−${reservation.discount.toLocaleString()}.00</span>
              </div>
            )}
          </div>
          <div className="border-t border-white/10 mt-4 pt-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold">Total Amount</p>
              <p className="text-3xl font-bold mt-0.5">${reservation.total.toLocaleString()}.00</p>
            </div>
            {reservation.payment==='Paid'&&(
              <div className="flex items-center gap-1.5 bg-green-500/20 border border-green-500/30 rounded-full px-3 py-1.5">
                <CheckCircle className="w-4 h-4 text-green-400"/>
                <span className="text-xs font-bold text-green-400">PAID</span>
              </div>
            )}
            {reservation.payment==='Partial'&&(
              <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1.5">
                <span className="text-xs font-bold text-amber-400">PARTIAL</span>
              </div>
            )}
            {reservation.payment==='Pending'&&(
              <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/30 rounded-full px-3 py-1.5">
                <span className="text-xs font-bold text-red-400">PENDING</span>
              </div>
            )}
          </div>
        </div>

        {/* Stay Details */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-navy-700">🛏</span>
            <h3 className="text-base font-bold text-gray-900">Stay Details</h3>
          </div>
          <div className="flex items-center gap-4 mb-5 p-3 bg-gray-50 rounded-xl">
            <div className="w-16 h-14 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0 text-2xl">🏨</div>
            <div>
              <p className="font-bold text-gray-900">Room {reservation.room.number}</p>
              <p className="text-sm text-gray-500">{reservation.room.type} • {reservation.room.guests} Guest{reservation.room.guests>1?'s':''}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 rounded-xl border border-gray-100">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Check-In</p>
              <p className="text-base font-bold text-gray-900">{reservation.checkIn}</p>
              <p className="text-xs text-gray-400 mt-0.5">After 03:00 PM</p>
            </div>
            <div className="p-4 rounded-xl border border-gray-100">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Check-Out</p>
              <p className="text-base font-bold text-gray-900">{reservation.checkOut}</p>
              <p className="text-xs text-gray-400 mt-0.5">Before 11:00 AM</p>
            </div>
          </div>
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <span className="text-sm text-gray-500 font-medium">Duration of Stay</span>
            <span className="text-sm font-bold text-navy-900">{reservation.nights} Nights</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-navy-700">〰</span>
            <h3 className="text-base font-bold text-gray-900">Reservation Timeline</h3>
          </div>
          <div className="flex flex-col">
            {reservation.timeline.map((step,i)=>(
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={['w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 z-10',
                    step.done ? 'bg-gold-500 border-gold-500 text-white' : 'bg-white border-gray-200 text-gray-300'].join(' ')}>
                    {step.done ? <CheckCircle className="w-4 h-4"/> : <Clock className="w-4 h-4"/>}
                  </div>
                  {i<reservation.timeline.length-1&&(
                    <div className={['w-0.5 flex-1 my-1', step.done?'bg-gold-300':'bg-gray-100'].join(' ')} style={{minHeight:'32px'}}/>
                  )}
                </div>
                <div className={['flex-1 pb-5', i===reservation.timeline.length-1?'pb-0':''].join(' ')}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={['text-sm font-bold', step.done?'text-gray-900':'text-gray-400'].join(' ')}>{step.event}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
                    </div>
                    <span className={['text-xs flex-shrink-0 ml-4', step.done?'text-gray-500':'text-gray-300 italic'].join(' ')}>{step.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Check In/Out actions */}
        {can(role,'checkInOut')&&(
          <div className="card p-4 flex items-center gap-3">
            {reservation.status==='Confirmed'&&(
              <Button variant="primary" size="md" icon={<CheckCircle className="w-4 h-4"/>}>Check In Guest</Button>
            )}
            {reservation.status==='Checked In'&&(
              <Button variant="secondary" size="md" icon={<CheckCircle className="w-4 h-4"/>}>Check Out Guest</Button>
            )}
            {can(role,'cancel')&&reservation.status!=='Cancelled'&&reservation.status!=='Checked Out'&&(
              <Button variant="danger" size="md">Cancel Reservation</Button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-4 text-[11px] text-gray-400">
          <div className="flex items-center gap-1.5"><Shield className="w-3 h-3"/><span>ENCRYPTED BOOKING</span></div>
          <div className="flex items-center gap-1.5"><Activity className="w-3 h-3"/><span>ACTIVITY LOGGED</span></div>
        </div>
        <div className="text-[11px] text-gray-400">LuxeHMS v4.2.0 • Last synchronized: 2 mins ago</div>
      </div>
    </DashboardLayout>
  );
};

export default ReservationDetail;
