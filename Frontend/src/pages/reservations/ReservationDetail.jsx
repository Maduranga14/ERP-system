import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Printer, Send, Pencil, ArrowLeft, CheckCircle, Clock,
  Shield, Activity, Loader2, User, BedDouble, Calendar,
  DollarSign, Tag, CheckCircle2, XCircle
} from 'lucide-react';

import DashboardLayout from '../../components/templates/DashboardLayout';
import Badge from '../../components/atoms/Badge';
import Button from '../../components/atoms/Button';
import { useRole } from '../../hooks/useRole';
import { can } from '../../utils/permissions';
import { getReservationById, checkIn as apiCheckIn, checkOut as apiCheckOut, deleteReservation } from '../../utils/api';

const STATUS_VARIANT = {
  'Confirmed': 'green', 'Checked In': 'blue',
  'Pending': 'amber', 'Checked Out': 'gray', 'Cancelled': 'red'
};

const InfoField = ({ label, value }) => (
  <div>
    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
    <p className="text-sm font-semibold text-gray-800">{value || '—'}</p>
  </div>
);

const userNames = { admin: 'Admin User', manager: 'Alex Sterling', receptionist: 'Sarah Mitchell' };
const userRoles = { admin: 'Super Administrator', manager: 'General Manager', receptionist: 'Front Desk Lead' };

const ReservationDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const role = useRole();
  const basePath = role === 'admin' ? '/admin' : role === 'manager' ? '/manager' : '/receptionist';

  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReservation = () => {
    setLoading(true);
    getReservationById(id)
      .then(data => { setReservation(data); setError(''); })
      .catch(() => setError('Failed to load reservation details.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReservation(); }, [id]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try { await apiCheckIn(id); fetchReservation(); }
    catch (err) { alert('Check-in failed: ' + err.message); }
    finally { setActionLoading(false); }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try { await apiCheckOut(id); fetchReservation(); }
    catch (err) { alert('Check-out failed: ' + err.message); }
    finally { setActionLoading(false); }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    setActionLoading(true);
    try { await deleteReservation(id); navigate(`${basePath}/reservations`); }
    catch (err) { alert('Cancellation failed: ' + err.message); setActionLoading(false); }
  };

  if (loading) return (
    <DashboardLayout role={role} userName={userNames[role]} userRole={userRoles[role]}>
      <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin" /> Loading reservation details...
      </div>
    </DashboardLayout>
  );

  if (error || !reservation) return (
    <DashboardLayout role={role} userName={userNames[role]} userRole={userRoles[role]}>
      <div className="flex items-center justify-center h-64 text-red-500 text-sm">{error || 'Reservation not found'}</div>
    </DashboardLayout>
  );

  const timelineSteps = [
    { event: 'Created', desc: 'Reservation initiated via system portal.', date: reservation.bookedDate, done: true },
    { event: 'Confirmed', desc: 'Reservation locked in.', date: reservation.bookedDate, done: reservation.status !== 'Pending' },
    {
      event: 'Checked In', desc: 'Guest check-in processed.',
      date: (reservation.status === 'Checked In' || reservation.status === 'Checked Out') ? reservation.checkIn : 'Pending',
      done: reservation.status === 'Checked In' || reservation.status === 'Checked Out'
    },
    {
      event: 'Checked Out', desc: 'Guest check-out finalized.',
      date: reservation.status === 'Checked Out' ? reservation.checkOut : 'Pending',
      done: reservation.status === 'Checked Out'
    },
  ];

  return (
    <DashboardLayout role={role} userName={userNames[role]} userRole={userRoles[role]}
      notificationCount={3} searchPlaceholder="Search guests, rooms...">

      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate(`${basePath}/reservations`)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-navy-700 mb-3 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Reservations
        </button>
        <h1 className="text-lg font-semibold text-gray-500 mb-1">Reservation Details</h1>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-gray-900">RES-{10000 + reservation.id}</h2>
              <Badge variant={STATUS_VARIANT[reservation.status] || 'gray'} size="md" dot>
                {reservation.status}
              </Badge>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Booked on {reservation.bookedDate} &bull; {reservation.nights} Night{reservation.nights !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon={<Printer className="w-3.5 h-3.5" />}>Print Folio</Button>
            <Button variant="outline" size="sm" icon={<Send className="w-3.5 h-3.5" />}>Send Confirmation</Button>
            {can(role, 'edit') && (
              <Button variant="primary" size="sm" icon={<Pencil className="w-3.5 h-3.5" />}>Edit</Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left: Main Details */}
        <div className="xl:col-span-2 flex flex-col gap-5">

          {/* Guest Details */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
              <User className="w-5 h-5 text-navy-700" />
              <h3 className="text-base font-bold text-gray-900">Guest Details</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <InfoField label="Full Name" value={reservation.customer?.name} />
              <InfoField label="National ID" value={reservation.customer?.nationalId} />
              <InfoField label="Email Address" value={reservation.customer?.email} />
              <InfoField label="Phone Number" value={reservation.customer?.phone} />
            </div>
          </div>

          {/* Stay Details */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
              <BedDouble className="w-5 h-5 text-navy-700" />
              <h3 className="text-base font-bold text-gray-900">Room & Stay</h3>
            </div>
            <div className="flex items-center gap-4 mb-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-navy-900 flex items-center justify-center flex-shrink-0">
                <BedDouble className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Room {reservation.room?.number || '—'}</p>
                <p className="text-sm text-gray-500">{reservation.room?.type || '—'} &bull; Capacity: {reservation.room?.capacity || 0} Guest(s)</p>
                <p className="text-xs text-gold-600 font-medium mt-0.5">${reservation.room?.pricePerNight || 0}/night</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-1.5 mb-2">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Check-In</p>
                </div>
                <p className="text-base font-bold text-gray-900">{reservation.checkIn}</p>
                <p className="text-xs text-gray-400 mt-0.5">After 03:00 PM</p>
              </div>
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-1.5 mb-2">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Check-Out</p>
                </div>
                <p className="text-base font-bold text-gray-900">{reservation.checkOut}</p>
                <p className="text-xs text-gray-400 mt-0.5">Before 11:00 AM</p>
              </div>
            </div>
            <div className="flex items-center justify-between bg-navy-900 text-white rounded-xl px-4 py-3">
              <span className="text-sm font-medium">Duration of Stay</span>
              <span className="text-sm font-bold">{reservation.nights} Night{reservation.nights !== 1 ? 's' : ''}</span>
            </div>
            {reservation.specialRequests && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider mb-1">Special Requests</p>
                <p className="text-xs text-gray-700">{reservation.specialRequests}</p>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
              <Activity className="w-5 h-5 text-navy-700" />
              <h3 className="text-base font-bold text-gray-900">Reservation Timeline</h3>
            </div>
            <div className="flex flex-col">
              {timelineSteps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={[
                      'w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 z-10',
                      step.done ? 'bg-gold-500 border-gold-500 text-white' : 'bg-white border-gray-200 text-gray-300'
                    ].join(' ')}>
                      {step.done ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    {i < timelineSteps.length - 1 && (
                      <div className={['w-0.5 flex-1 my-1', step.done ? 'bg-gold-300' : 'bg-gray-100'].join(' ')}
                        style={{ minHeight: '32px' }} />
                    )}
                  </div>
                  <div className={['flex-1 pb-5', i === timelineSteps.length - 1 ? 'pb-0' : ''].join(' ')}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className={['text-sm font-bold', step.done ? 'text-gray-900' : 'text-gray-400'].join(' ')}>
                          {step.event}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
                      </div>
                      <span className={['text-xs flex-shrink-0 ml-4', step.done ? 'text-gray-500' : 'text-gray-300 italic'].join(' ')}>
                        {step.date}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Billing & Actions Sidebar */}
        <div className="flex flex-col gap-5">

          {/* Billing Summary */}
          <div className="rounded-xl bg-navy-900 text-white p-6">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-white/10">
              <DollarSign className="w-5 h-5 text-gold-400" />
              <h3 className="text-base font-bold">Billing Summary</h3>
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Room Charges</span>
                <span className="font-semibold">${(reservation.roomCharges || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Additional Services</span>
                <span className="font-semibold">${(reservation.additionalServices || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Taxes (12%)</span>
                <span className="font-semibold">${(reservation.tax || 0).toFixed(2)}</span>
              </div>
              {(reservation.discount || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gold-400 font-medium flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> {reservation.discountCode || 'Promo'}
                  </span>
                  <span className="text-red-400 font-medium">-${(reservation.discount || 0).toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="border-t border-white/10 mt-4 pt-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold">Total Amount</p>
                <p className="text-3xl font-bold mt-0.5">${(reservation.total || 0).toFixed(2)}</p>
              </div>
              <div className={[
                'flex items-center gap-1.5 rounded-full px-3 py-1.5',
                reservation.payment === 'Paid' ? 'bg-green-500/20 border border-green-500/30' :
                  reservation.payment === 'Partial' ? 'bg-amber-500/20 border border-amber-500/30' :
                    'bg-red-500/20 border border-red-500/30'
              ].join(' ')}>
                {reservation.payment === 'Paid' && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                {reservation.payment === 'Partial' && <Clock className="w-4 h-4 text-amber-400" />}
                {reservation.payment === 'Pending' && <XCircle className="w-4 h-4 text-red-400" />}
                <span className={[
                  'text-xs font-bold',
                  reservation.payment === 'Paid' ? 'text-green-400' :
                    reservation.payment === 'Partial' ? 'text-amber-400' : 'text-red-400'
                ].join(' ')}>
                  {(reservation.payment || 'PENDING').toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Check In/Out Actions */}
          {can(role, 'checkInOut') && (
            <div className="card p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Actions</h3>
              <div className="flex flex-col gap-2">
                {reservation.status === 'Confirmed' && (
                  <Button variant="primary" size="md" fullWidth
                    icon={<CheckCircle className="w-4 h-4" />}
                    onClick={handleCheckIn} disabled={actionLoading}>
                    {actionLoading ? 'Processing...' : 'Check In Guest'}
                  </Button>
                )}
                {reservation.status === 'Checked In' && (
                  <Button variant="secondary" size="md" fullWidth
                    icon={<CheckCircle className="w-4 h-4" />}
                    onClick={handleCheckOut} disabled={actionLoading}>
                    {actionLoading ? 'Processing...' : 'Check Out Guest'}
                  </Button>
                )}
                {can(role, 'cancel') && reservation.status !== 'Cancelled' && reservation.status !== 'Checked Out' && (
                  <Button variant="danger" size="md" fullWidth
                    onClick={handleCancel} disabled={actionLoading}>
                    Cancel Reservation
                  </Button>
                )}
                {(reservation.status === 'Cancelled' || reservation.status === 'Checked Out') && (
                  <div className="text-center text-xs text-gray-400 py-2">No actions available</div>
                )}
              </div>
            </div>
          )}

          {/* Security Footer */}
          <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3 h-3" /><span>Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Activity className="w-3 h-3" /><span>Activity Logged</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReservationDetail;
