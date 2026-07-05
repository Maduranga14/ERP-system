import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Pencil, Wrench, CheckCircle,
  History, Plus, ChevronRight,
} from 'lucide-react';

import DashboardLayout from '../../components/templates/DashboardLayout';
import { useRole }     from '../../hooks/useRole';
import { canRoom, canEditStatus, STATUS_OPTIONS_FOR_ROLE } from '../../utils/roomPermissions';
import { ROOMS, STATUS_STYLE, AMENITY_ICONS } from '../../data/rooms';

/* ─── Sub-components ────────────────────────────────────── */
const StatusBadge = ({ status, size = 'sm' }) => {
  const s = STATUS_STYLE[status] || STATUS_STYLE.Available;
  return (
    <span className={[
      'inline-flex items-center gap-1.5 font-semibold rounded-full border',
      size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
      s.bg, s.text, s.border,
    ].join(' ')}>
      <span className={['w-1.5 h-1.5 rounded-full', s.dot].join(' ')} />
      {status}
    </span>
  );
};

const InfoChip = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
    <p className="text-sm font-bold text-gray-900">{value}</p>
  </div>
);

const MaintenanceBadge = ({ status }) => {
  const map = {
    'Resolved':    { bg:'bg-green-100', text:'text-green-700' },
    'In Progress': { bg:'bg-amber-100', text:'text-amber-700' },
    'Pending':     { bg:'bg-red-100',   text:'text-red-700'   },
  };
  const s = map[status] || map.Pending;
  return (
    <span className={['px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide', s.bg, s.text].join(' ')}>
      {status}
    </span>
  );
};

const userNames = { admin:'Admin User', manager:'James Miller', receptionist:'Sarah Mitchell', housekeeper:'Sarah' };
const userRoles = { admin:'Super Administrator', manager:'General Manager', receptionist:'Front Desk Lead', housekeeper:'Supervisor' };

/* ─── Component ─────────────────────────────────────────── */
const RoomDetail = () => {
  const navigate = useNavigate();
  const { id }   = useParams();
  const role     = useRole();
  const basePath = `/${role}`;

  const room = ROOMS.find((r) => r.id === id) || ROOMS[1]; // fallback to room 205

  const statusOptions  = STATUS_OPTIONS_FOR_ROLE(role);
  const [status, setStatus] = useState(room.status);

  return (
    <DashboardLayout role={role} userName={userNames[role]} userRole={userRoles[role]} notificationCount={4}
      searchPlaceholder="Search rooms, guests, or staff...">

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
        <span className="hover:text-navy-700 cursor-pointer" onClick={() => navigate(`${basePath}`)}>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span className="hover:text-navy-700 cursor-pointer" onClick={() => navigate(`${basePath}/rooms`)}>Room Management</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-navy-700 font-semibold">Room {room.number}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <button onClick={() => navigate(`${basePath}/rooms`)}
              className="text-gray-400 hover:text-navy-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Room {room.number}</h1>
            <StatusBadge status={status} size="md" />
          </div>
          <p className="text-gray-500 ml-9">{room.type} • {room.wing}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Status changer for eligible roles */}
          {statusOptions.length > 0 && (
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 text-gray-700 bg-white outline-none focus:ring-2 focus:ring-gold-400 cursor-pointer"
            >
              {statusOptions.map((s) => <option key={s}>{s}</option>)}
            </select>
          )}
          {canRoom(role, 'edit') && (
            <button className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Pencil className="w-4 h-4" /> Edit Room
            </button>
          )}
          {canEditStatus(role) && (
            <button
              onClick={() => setStatus('Cleaning')}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <CheckCircle className="w-4 h-4" /> Mark for Cleaning
            </button>
          )}
          {canRoom(role, 'edit') && (
            <button className="flex items-center gap-1.5 px-4 py-2 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors">
              <Wrench className="w-4 h-4" /> Schedule Maintenance
            </button>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {/* LEFT — room details (3/5) */}
        <div className="xl:col-span-3 flex flex-col gap-5">

          {/* Room image */}
          <div className="card overflow-hidden">
            <div className="relative h-64 bg-gray-200 overflow-hidden">
              {/* Gradient overlay at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />
              <img
                src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&auto=format&fit=crop"
                alt={`Room ${room.number}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback */}
              <div className="absolute inset-0 bg-gray-100 hidden items-center justify-center text-6xl">🏨</div>
              {/* Category badges */}
              <div className="absolute bottom-4 left-4 z-20 flex gap-2">
                <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full font-medium">
                  Room Category: {room.type.split(' ')[0]} {room.type.split(' ')[1] || ''}
                </span>
                <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full font-medium">
                  View Type: {room.viewType}
                </span>
              </div>
            </div>

            {/* Specs */}
            <div className="p-5 border-b border-gray-100">
              <div className="grid grid-cols-4 gap-4">
                <InfoChip label="Floor"    value={`${room.floor}${['st','nd','rd'][room.floor-1]||'th'} Floor`} />
                <InfoChip label="Capacity" value={`${room.capacity} Persons`} />
                <InfoChip label="Bed Type" value={room.bedType} />
                <InfoChip label="Rate"     value={<span className="text-gold-600 text-lg">${room.pricePerNight}<span className="text-xs text-gray-400 font-normal">/night</span></span>} />
              </div>
            </div>

            {/* Description */}
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{room.description}</p>
            </div>

            {/* Amenities */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">In-Room Amenities</h3>
                {canRoom(role, 'edit') && (
                  <button className="text-xs text-gold-600 hover:underline font-medium">Manage Amenities</button>
                )}
              </div>
              <div className="grid grid-cols-4 gap-3">
                {room.amenities.map((a) => (
                  <div key={a} className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-xl text-center">
                    <span className="text-2xl">{AMENITY_ICONS[a] || '⭐'}</span>
                    <span className="text-[11px] text-gray-600 font-medium leading-tight">{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — reservation + history (2/5) */}
        <div className="xl:col-span-2 flex flex-col gap-4">

          {/* Current Reservation */}
          <div className="rounded-xl bg-navy-900 text-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">Current Reservation</h3>
              {room.currentReservation && (
                <span className="bg-gold-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Guest In-House
                </span>
              )}
            </div>

            {room.currentReservation ? (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-full bg-gold-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {room.currentReservation.guestName.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-bold text-base">{room.currentReservation.guestName}</p>
                    <p className="text-white/60 text-xs">Booking ID: {room.currentReservation.bookingId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-[10px] text-white/50 uppercase font-semibold mb-1">Check-In</p>
                    <p className="text-sm font-bold">{room.currentReservation.checkIn}</p>
                    <p className="text-[11px] text-white/60">{room.currentReservation.checkInTime}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-[10px] text-white/50 uppercase font-semibold mb-1">Check-Out</p>
                    <p className="text-sm font-bold text-gold-400">{room.currentReservation.checkOut}</p>
                    <p className="text-[11px] text-white/60">{room.currentReservation.checkOutTime}</p>
                  </div>
                </div>

                <button className="w-full flex items-center justify-center gap-2 bg-white/15 hover:bg-white/20 transition-colors rounded-xl py-3 text-sm font-semibold">
                  View Reservation Details <ChevronRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center py-6 text-center">
                <span className="text-4xl mb-3">🛏</span>
                <p className="text-white/70 text-sm">No active reservation</p>
                <p className="text-white/40 text-xs mt-1">Room is {status.toLowerCase()}</p>
              </div>
            )}
          </div>

          {/* Cleaning History */}
          {canRoom(role, 'viewMaintenance') && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">Cleaning History</h3>
                <History className="w-4 h-4 text-gray-400" />
              </div>

              {room.cleaningHistory.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {room.cleaningHistory.map((c, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold flex-shrink-0">
                          {c.staff.split(' ').map(n=>n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{c.staff}</p>
                          <p className="text-[11px] text-gray-400">{c.task}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-gray-500">{c.date}</p>
                        <span className="text-[10px] font-bold text-green-600 uppercase">{c.status}</span>
                      </div>
                    </div>
                  ))}
                  <button className="text-xs text-gold-600 hover:underline font-medium mt-1">View All Housekeeping Logs</button>
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">No cleaning records yet.</p>
              )}
            </div>
          )}

          {/* Maintenance History */}
          {canRoom(role, 'viewMaintenance') && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">Maintenance History</h3>
                {canRoom(role, 'edit') && (
                  <button className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {room.maintenanceHistory.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {room.maintenanceHistory.map((m, i) => (
                    <div key={i} className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 text-base">🔧</div>
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{m.issue}</p>
                          <p className="text-[11px] text-gray-400">{m.date} • Tech: {m.tech}</p>
                        </div>
                      </div>
                      <MaintenanceBadge status={m.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">No maintenance records.</p>
              )}
            </div>
          )}

          {/* Delete button — admin only */}
          {canRoom(role, 'delete') && (
            <button className="w-full py-2.5 text-sm font-semibold text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
              Delete Room
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RoomDetail;
