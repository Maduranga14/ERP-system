import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, UserCheck, BedDouble, Clock, Calendar,
  Users, Phone, Mail, Shield, AlertCircle,
  CheckCircle2, ChevronRight, ArrowLeft, Home,
  X, CreditCard, DollarSign, MessageSquare,
  Star, Layers, Loader2,
} from 'lucide-react';

import DashboardLayout from '../../components/templates/DashboardLayout';
import Badge           from '../../components/atoms/Badge';
import { useRole }     from '../../hooks/useRole';
import { getReservations, getInvoices, getRooms, updateReservation, checkIn, createInvoice, addPayment } from '../../utils/api';

/* ── Constants ─────────────────────────────────────────────── */
const USER_NAMES = { admin: 'Admin User', manager: 'Alex Sterling', receptionist: 'Sarah Mitchell' };
const USER_ROLES = { admin: 'Super Administrator', manager: 'General Manager', receptionist: 'Front Desk Lead' };

const STATUS_VARIANT = { Confirmed: 'green', Pending: 'amber', 'Checked In': 'blue' };

/* ── Sub-components ─────────────────────────────────────────── */
const SectionCard = ({ title, icon, children, accent = false, className = '' }) => (
  <div className={`bg-white rounded-xl border ${accent ? 'border-amber-200 shadow-amber-50' : 'border-gray-100'} shadow-sm p-5 ${className}`}>
    <div className={`flex items-center gap-2 mb-4 pb-3 border-b ${accent ? 'border-amber-100' : 'border-gray-100'}`}>
      <span className={accent ? 'text-amber-500' : 'text-gray-500'}>{icon}</span>
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

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50 transition-all placeholder-gray-300 bg-white";

/* ── Success overlay after check-in ────────────────────────── */
const CheckInSuccess = ({ res, onDone }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-1">Check-In Complete!</h3>
      <p className="text-sm text-gray-500 mb-1">
        <span className="font-semibold text-gray-800">{res.guest.name}</span> has been checked in.
      </p>
      <p className="text-xs text-gray-400 mb-5">{res.id} &bull; Room {res.room.number}</p>
      <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-5 text-left space-y-1.5">
        <p className="text-xs text-green-700 flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> Reservation status → Checked In</p>
        <p className="text-xs text-green-700 flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> Room {res.room.number} status → Occupied</p>
        <p className="text-xs text-green-700 flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> Guest stay record created</p>
      </div>
      <button
        onClick={onDone}
        className="w-full bg-navy-900 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-navy-800 transition-colors"
      >
        Back to Arrivals
      </button>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
const CheckInPage = () => {
  const navigate = useNavigate();
  const role     = useRole();
  const basePath = `/${role}`;

  /* ── State ── */
  const [reservations,  setReservations]  = useState([]);
  const [invoices,      setInvoices]      = useState([]);
  const [rooms,         setRooms]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [submitting,    setSubmitting]    = useState(false);
  const [search,        setSearch]        = useState('');
  const [selectedId,    setSelectedId]    = useState(null);
  const [assignedRoom,  setAssignedRoom]  = useState(null);
  const [verification,  setVerification]  = useState({ nationalId: '', phone: '', email: '', emergency: '' });
  const [depositModal,  setDepositModal]  = useState(false);
  const [depositAmt,    setDepositAmt]    = useState('');
  const [depositMethod, setDepositMethod] = useState('Cash');
  const [successRes,    setSuccessRes]    = useState(null);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      getReservations(),
      getInvoices(),
      getRooms()
    ])
      .then(([resData, invData, roomData]) => {
        setReservations(resData.filter(r => r.status === 'Confirmed' || r.status === 'Pending'));
        setInvoices(invData);
        setRooms(roomData);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load check-in data.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stays = useMemo(() => {
    return reservations.map(r => {
      const inv = invoices.find(i => i.reservation?.id === r.id);
      const initials = r.customer?.name
        ? r.customer.name.split(' ').map(n => n[0]).join('').toUpperCase()
        : '?';

      const nights = r.nights || 1;
      const roomRate = r.room?.pricePerNight || 0;
      const roomCharges = r.roomCharges || (nights * roomRate);
      const subtotal = roomCharges;
      const tax = r.tax || (subtotal * 0.1);
      const discount = r.discount || 0;

      return {
        id: `RES-${10000 + r.id}`,
        rawId: r.id,
        guest: {
          name: r.customer?.name || 'Unknown',
          initials,
          phone: r.customer?.phone || '',
          email: r.customer?.email || '',
          nationalId: r.customer?.nationalId || '',
          emergencyContact: ''
        },
        room: {
          id: r.room?.id,
          number: r.room?.number || '',
          type: r.room?.type || 'Standard',
          floor: r.room?.floor || 1,
          pricePerNight: roomRate
        },
        guests: 1,
        checkIn: r.checkIn,
        checkOut: r.checkOut,
        nights,
        status: r.status,
        totalAmount: roomCharges,
        depositPaid: inv ? inv.amountPaid : 0.0,
        tax,
        discount: -Math.abs(discount),
        roomRate,
        invoiceId: inv ? inv.id : null,
        specialRequests: r.specialRequests || ''
      };
    });
  }, [reservations, invoices]);

  const selected = useMemo(() => {
    return stays.find(s => s.rawId === selectedId) || null;
  }, [stays, selectedId]);

  const availableRooms = useMemo(() => {
    if (!selected) return [];
    const sameType = rooms.filter(rm => rm.status === 'Available' && rm.type === selected.room.type);
    if (sameType.length > 0) return sameType;
    return rooms.filter(rm => rm.status === 'Available');
  }, [rooms, selected]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return stays;
    return stays.filter((s) =>
      s.id.toLowerCase().includes(q) ||
      s.guest.name.toLowerCase().includes(q) ||
      s.guest.phone.includes(q)
    );
  }, [search, stays]);

  const stats = useMemo(() => {
    return {
      total:     stays.length,
      confirmed: stays.filter((r) => r.status === 'Confirmed').length,
      pending:   stays.filter((r) => r.status === 'Pending').length,
    };
  }, [stays]);

  /* ── Handlers ── */
  const handleSelectReservation = (res) => {
    setSelectedId(res.rawId);
    setAssignedRoom(res.room.number || null);
    setVerification({
      nationalId: res.guest.nationalId || '',
      phone:      res.guest.phone      || '',
      email:      res.guest.email      || '',
      emergency:  res.guest.emergencyContact || '',
    });
  };

  const handleCheckIn = async () => {
    if (!assignedRoom) { alert('Please assign a room before checking in.'); return; }
    setSubmitting(true);
    setError('');

    try {
      const originalRes = reservations.find(r => r.id === selectedId);
      const chosenRoom = rooms.find(rm => rm.number === assignedRoom);

      if (originalRes.room?.id !== chosenRoom?.id) {
        const updatePayload = {
          ...originalRes,
          room: { id: chosenRoom.id }
        };
        await updateReservation(selectedId, updatePayload);
      }

      await checkIn(selectedId);
      
      const finalRes = {
        id: `RES-${10000 + selectedId}`,
        guest: { name: originalRes.customer?.name || 'Unknown' },
        room: { number: assignedRoom }
      };
      setSuccessRes(finalRes);
    } catch (err) {
      console.error(err);
      setError("Failed to complete check-in.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordDeposit = async () => {
    if (!selected) return;
    setSubmitting(true);
    setError('');

    try {
      let invId = selected.invoiceId;
      if (!invId) {
        const originalRes = reservations.find(r => r.id === selected.rawId);
        const invPayload = {
          guestName: selected.guest.name,
          email: originalRes?.customer?.email || null,
          phone: originalRes?.customer?.phone || '',
          reservation: { id: selected.rawId },
          checkIn: selected.checkIn,
          checkOut: selected.checkOut,
          nights: selected.nights,
          roomNumber: selected.room.number,
          roomType: selected.room.type,
          method: depositMethod,
          status: 'Pending',
          date: new Date().toISOString().split('T')[0],
          subtotal: selected.totalAmount,
          tax: selected.tax,
          discount: Math.abs(selected.discount),
          grandTotal: selected.totalAmount + selected.tax - Math.abs(selected.discount),
          amountPaid: 0.0,
          notes: 'Deposit paid during check-in.',
          lineItems: [
            { description: `Room Charges (Room ${selected.room.number})`, qty: selected.nights, unitPrice: selected.roomRate, amount: selected.totalAmount }
          ]
        };
        const createdInv = await createInvoice(invPayload);
        invId = createdInv.id;
      }

      const paymentPayload = {
        method: depositMethod,
        amount: Number(depositAmt),
        date: new Date().toISOString().split('T')[0],
        processedBy: USER_NAMES[role]
      };
      await addPayment(invId, paymentPayload);

      setDepositModal(false);
      setDepositAmt('');
      
      const [resData, invData] = await Promise.all([
        getReservations(),
        getInvoices()
      ]);
      setReservations(resData.filter(r => r.status === 'Confirmed' || r.status === 'Pending'));
      setInvoices(invData);
    } catch (err) {
      console.error(err);
      setError("Failed to record deposit.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDone = () => {
    setSuccessRes(null);
    setSelectedId(null);
    setSearch('');
    fetchData();
  };

  const grandTotal = selected ? (selected.totalAmount + selected.tax + selected.discount) : 0;
  const balance = selected ? (grandTotal - selected.depositPaid) : 0;

  if (loading) {
    return (
      <DashboardLayout role={role} userName={USER_NAMES[role]} userRole={USER_ROLES[role]}>
        <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" /> Loading check-in arrivals...
        </div>
      </DashboardLayout>
    );
  }

  /* ── ARRIVALS LIST VIEW ── */
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
          Dashboard &rsaquo; <span className="text-gray-600 font-medium">Check In</span>
        </p>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Guest Check-In</h1>
            <p className="text-xs text-gray-400 mt-0.5">Process guest arrivals and room assignments</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Check-in window: <span className="font-semibold text-amber-700 ml-1">2:00 PM – 11:59 PM</span>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Today's Arrivals", value: stats.total,     icon: <Users className="w-4 h-4 text-blue-600" />,  bg: 'bg-blue-50',  val: 'text-blue-700' },
            { label: 'Confirmed',        value: stats.confirmed, icon: <CheckCircle2 className="w-4 h-4 text-green-600" />, bg: 'bg-green-50', val: 'text-green-700' },
            { label: 'Pending',          value: stats.pending,   icon: <Clock className="w-4 h-4 text-amber-600" />, bg: 'bg-amber-50', val: 'text-amber-700' },
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
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-amber-400 transition-colors">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              id="checkin-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Reservation ID, Guest Name or Phone Number…"
              className="text-sm text-gray-700 bg-transparent outline-none w-full placeholder-gray-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5 ml-1">
            Search by Reservation ID &bull; Guest Name &bull; Phone Number
          </p>
        </div>

        {/* Arrivals Table */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-800">Today&apos;s Arrivals</h2>
            <span className="text-[11px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {filtered.length} reservation{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/60 border-b border-gray-100">
                {['Reservation', 'Guest', 'Room Type', 'Guests', 'Arrival', 'Status', 'Action'].map((h) => (
                  <th key={h} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                    No arrivals match your search.
                  </td>
                </tr>
              ) : filtered.map((res) => (
                <tr key={res.id} className="border-b border-gray-50 hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 align-middle">
                    <span className="font-bold text-navy-900 text-sm">{res.id}</span>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-navy-900 flex items-center justify-center flex-shrink-0">
                        <span className="text-[11px] font-bold text-white">{res.guest.initials}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-xs">{res.guest.name}</p>
                        <p className="text-[11px] text-gray-400">{res.guest.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <span className="text-xs text-gray-700">{res.room.type}</span>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <span className="text-xs text-gray-600">{res.guests}</span>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Today</span>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <Badge variant={STATUS_VARIANT[res.status] || 'gray'} dot size="sm">
                      {res.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <button
                      id={`checkin-btn-${res.id}`}
                      onClick={() => handleSelectReservation(res)}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-navy-900 hover:bg-navy-800 text-white px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <UserCheck className="w-3 h-3" />
                      Check In
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardLayout>
    );
  }

  /* ── CHECK-IN DETAIL FLOW ── */
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
        Back to Today&apos;s Arrivals
      </button>

      {/* Page Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Processing Check-In</h1>
          <p className="text-xs text-gray-400 mt-0.5">{selected.id} &bull; {selected.guest.name}</p>
        </div>
        <Badge variant={STATUS_VARIANT[selected.status] || 'gray'} dot>
          {selected.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── Left col (2/3): Reservation + Room + Verification ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* 1. Reservation Details */}
          <SectionCard title="Reservation Details" icon={<Calendar className="w-4 h-4" />}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <InfoRow label="Reservation ID"  value={selected.id}         highlight />
              <InfoRow label="Guest Name"       value={selected.guest.name} />
              <InfoRow label="No. of Guests"    value={`${selected.guests} Guest${selected.guests > 1 ? 's' : ''}`} />
              <InfoRow label="Check-in Date"    value={selected.checkIn} />
              <InfoRow label="Check-out Date"   value={selected.checkOut} />
              <InfoRow label="No. of Nights"    value={`${selected.nights} Night${selected.nights > 1 ? 's' : ''}`} />
            </div>
            {selected.specialRequests && (
              <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-0.5">Special Requests</p>
                  <p className="text-xs text-amber-800">{selected.specialRequests}</p>
                </div>
              </div>
            )}
          </SectionCard>

          {/* 2. Assigned Room */}
          <SectionCard title="Assigned Room" icon={<BedDouble className="w-4 h-4" />}>
            {assignedRoom ? (
              <div className="flex items-start justify-between">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
                  <InfoRow label="Room Number" value={`Room ${assignedRoom}`} highlight />
                  <InfoRow label="Room Type"   value={selected.room.type} />
                  <InfoRow label="Floor"       value={selected.room.floor ? `Floor ${selected.room.floor}` : '—'} />
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Room Status</p>
                    <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Available
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setAssignedRoom(null)}
                  className="text-xs text-amber-600 hover:underline flex-shrink-0 ml-4 font-medium"
                >
                  Change
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-3 text-amber-600 text-xs font-medium bg-amber-50 border border-amber-100 p-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  No room assigned. Please select an available room below.
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableRooms.map((room) => (
                    <button
                      key={room.number}
                      onClick={() => setAssignedRoom(room.number)}
                      className="flex items-center justify-between border border-gray-200 rounded-xl p-3 hover:border-navy-400 hover:bg-slate-50 transition-all text-left group"
                    >
                      <div>
                        <p className="text-sm font-bold text-gray-800 group-hover:text-navy-800">Room {room.number}</p>
                        <p className="text-xs text-gray-500">{room.type} &bull; Floor {room.floor}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-green-600">${room.pricePerNight}/night</p>
                        <span className="text-[10px] font-medium text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">Available</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>

          {/* 3. Guest Verification */}
          <SectionCard title="Guest Verification" icon={<Shield className="w-4 h-4" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Passport / National ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    value={verification.nationalId}
                    onChange={(e) => setVerification({ ...verification, nationalId: e.target.value })}
                    placeholder="Passport or National ID"
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    value={verification.phone}
                    onChange={(e) => setVerification({ ...verification, phone: e.target.value })}
                    placeholder="+1 555 000 0000"
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    value={verification.email}
                    onChange={(e) => setVerification({ ...verification, email: e.target.value })}
                    placeholder="guest@email.com"
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Emergency Contact <span className="text-gray-300 text-[9px] normal-case font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    value={verification.emergency}
                    onChange={(e) => setVerification({ ...verification, emergency: e.target.value })}
                    placeholder="Name — Phone Number"
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ── Right col (1/3): Payment + Check-In Button ── */}
        <div className="flex flex-col gap-4">

          {/* Payment Summary */}
          <div className="bg-navy-900 text-white rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold">Payment Summary</h3>
            </div>
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">Total Amount</span>
                <span className="text-sm font-bold">${grandTotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">Deposit Paid</span>
                <span className="text-sm font-bold text-green-400">${selected.depositPaid.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-semibold text-white/80">Balance Due</span>
                <span className={`text-lg font-bold ${balance > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                  ${balance.toLocaleString()}
                </span>
              </div>
            </div>
            <button
              id="record-deposit-btn"
              onClick={() => setDepositModal(true)}
              className="w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              + Record Deposit
            </button>
          </div>

          {/* Room summary (if assigned) */}
          {assignedRoom && (
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Home className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-bold text-gray-800">Room Assignment</h3>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-3xl font-black text-navy-900 mb-0.5">{assignedRoom}</p>
                <p className="text-xs text-gray-500">{selected.room.type}</p>
                <span className="text-[10px] font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                  Ready for Guest
                </span>
              </div>
            </div>
          )}

          {/* Checklist */}
          <div className="card p-4">
            <h3 className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">Pre Check-In Checklist</h3>
            <div className="space-y-2">
              {[
                { label: 'ID Verified',       done: !!verification.nationalId },
                { label: 'Contact Confirmed', done: !!verification.phone },
                { label: 'Room Assigned',     done: !!assignedRoom },
                { label: 'Payment Noted',     done: selected.depositPaid > 0 },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-green-500' : 'bg-gray-200'}`}>
                    {item.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-xs ${item.done ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CHECK-IN BUTTON */}
          <button
            id="complete-checkin-btn"
            onClick={handleCheckIn}
            disabled={submitting || !assignedRoom || !verification.nationalId || !verification.phone}
            className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-colors shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserCheck className="w-5 h-5" />}
            {submitting ? 'Checking In...' : 'Complete Check-In'}
          </button>
          {(submitting || !assignedRoom || !verification.nationalId || !verification.phone) && (
            <p className="text-[11px] text-center text-gray-400 -mt-2">
              {submitting ? 'Please wait...' : 'Assign a room, verify ID & contact to enable check-in'}
            </p>
          )}
        </div>
      </div>

      {/* ── Deposit Modal ── */}
      {depositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Record Deposit</h3>
              </div>
              <button onClick={() => setDepositModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {/* Payment Summary Stats */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-gray-100 rounded-xl p-3">
                <div className="text-center">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Total Amount</p>
                  <p className="text-xs font-bold text-gray-800 mt-0.5">${(selected.totalAmount + selected.tax + selected.discount).toFixed(2)}</p>
                </div>
                <div className="text-center border-l border-r border-gray-200 px-1">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Total Paid</p>
                  <p className="text-xs font-bold text-green-600 mt-0.5">${selected.depositPaid.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Balance</p>
                  <p className="text-xs font-bold text-amber-600 mt-0.5">${balance.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
                  <input
                    type="number"
                    value={depositAmt}
                    onChange={(e) => setDepositAmt(e.target.value)}
                    placeholder="0.00"
                    className={`${inputCls} pl-7`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Payment Method</label>
                <select
                  value={depositMethod}
                  onChange={(e) => setDepositMethod(e.target.value)}
                  className={inputCls}
                >
                  <option>Cash</option>
                  <option>Card</option>
                  <option>Bank Transfer</option>
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setDepositModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleRecordDeposit}
                  disabled={submitting || !depositAmt}
                  className="flex-1 py-2.5 bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Success Screen ── */}
      {successRes && <CheckInSuccess res={successRes} onDone={handleDone} />}
    </DashboardLayout>
  );
};

export default CheckInPage;
