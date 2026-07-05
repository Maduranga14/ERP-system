import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, SlidersHorizontal, ChevronLeft,
  ChevronRight, BedDouble, X,
} from 'lucide-react';

import DashboardLayout from '../../components/templates/DashboardLayout';
import { useRole }     from '../../hooks/useRole';
import { canRoom }     from '../../utils/roomPermissions';
import {
  ROOMS, ROOM_TYPES, ROOM_STATUSES, FLOOR_OPTIONS, STATUS_STYLE,
} from '../../data/rooms';

/* ─── Stat card ─────────────────────────────────────────── */
const Stat = ({ icon, label, value, color, sub }) => (
  <div className="card p-4 flex flex-col gap-1 min-w-0">
    <div className="flex items-center gap-2">
      <span className="text-xl">{icon}</span>
      <span className={['text-xs font-semibold uppercase tracking-wide', color].join(' ')}>{label}</span>
    </div>
    <p className={['text-3xl font-bold', color].join(' ')}>{value}</p>
    <p className="text-[11px] text-gray-400">{sub}</p>
  </div>
);

/* ─── Status badge ───────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const s = STATUS_STYLE[status] || STATUS_STYLE.Available;
  return (
    <span className={['inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide border', s.bg, s.text, s.border].join(' ')}>
      <span className={['w-1.5 h-1.5 rounded-full', s.dot].join(' ')} />
      {status}
    </span>
  );
};

const userNames = { admin:'Admin User', manager:'Alex Thompson', receptionist:'Sarah Mitchell', housekeeper:'Sarah' };
const userRoles = { admin:'Super Administrator', manager:'Hotel Manager', receptionist:'Front Desk Lead', housekeeper:'Supervisor' };

/* ─── Component ─────────────────────────────────────────── */
const RoomList = () => {
  const navigate = useNavigate();
  const role = useRole();
  const basePath = `/${role}`;

  const [search,      setSearch]      = useState('');
  const [typeFilter,  setTypeFilter]  = useState('All Types');
  const [statusFilter,setStatusFilter]= useState('All Status');
  const [floorFilter, setFloorFilter] = useState('All Floors');
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = ROOMS.filter((r) => {
    const q = search.toLowerCase();
    if (q && !r.number.includes(q) && !r.type.toLowerCase().includes(q)) return false;
    if (typeFilter  !== 'All Types'  && r.type                 !== typeFilter)  return false;
    if (statusFilter!== 'All Status' && r.status               !== statusFilter) return false;
    if (floorFilter !== 'All Floors' && String(r.floor)        !== floorFilter)  return false;
    return true;
  });

  const clearAll = () => {
    setSearch(''); setTypeFilter('All Types');
    setStatusFilter('All Status'); setFloorFilter('All Floors');
  };

  const stats = [
    { icon:'🏢', label:'Total',     value: ROOMS.length,                                  color:'text-gray-800', sub:'Inventory Units'       },
    { icon:'✅', label:'Available', value: ROOMS.filter(r=>r.status==='Available').length,  color:'text-green-600',sub:'Ready for check-in'    },
    { icon:'🔴', label:'Occupied',  value: ROOMS.filter(r=>r.status==='Occupied').length,   color:'text-orange-600',sub:'Active stays'          },
    { icon:'📘', label:'Reserved',  value: ROOMS.filter(r=>r.status==='Reserved').length,   color:'text-blue-600', sub:'Future arrivals'       },
    { icon:'🧹', label:'Cleaning',  value: ROOMS.filter(r=>r.status==='Cleaning').length,   color:'text-purple-600',sub:'Turnover in progress'  },
    { icon:'🔧', label:'Down',      value: ROOMS.filter(r=>r.status==='Maintenance'||r.status==='Down').length, color:'text-red-600', sub:'Maintenance tickets' },
  ];

  return (
    <DashboardLayout role={role} userName={userNames[role]} userRole={userRoles[role]} notificationCount={4}
      searchPlaceholder="Search for rooms, guest names, or reservations...">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Room Management</h1>
        {canRoom(role, 'add') && (
          <button
            onClick={() => navigate(`${basePath}/rooms/new`)}
            className="flex items-center gap-2 px-4 py-2.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add New Room
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
        {stats.map((s) => <Stat key={s.label} {...s} />)}
      </div>

      {/* Search + Filters */}
      <div className="card p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Room # or Type..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400"
            />
          </div>
          {[
            { label: 'Room Type', value: typeFilter,   setter: setTypeFilter,   opts: ROOM_TYPES   },
            { label: 'Status',    value: statusFilter,  setter: setStatusFilter, opts: ROOM_STATUSES },
            { label: 'Floor',     value: floorFilter,   setter: setFloorFilter,  opts: FLOOR_OPTIONS },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-1 border border-gray-200 rounded-lg px-3 py-2">
              <span className="text-xs text-gray-500 font-medium">{f.label}</span>
              <select value={f.value} onChange={(e) => f.setter(e.target.value)}
                className="text-xs text-gray-700 bg-transparent outline-none cursor-pointer ml-1">
                {f.opts.map((o) => <option key={o}>{o}</option>)}
              </select>
              <ChevronRight className="w-3 h-3 text-gray-400 rotate-90" />
            </div>
          ))}
          <button onClick={clearAll}
            className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-navy-700 transition-colors px-2 py-2">
            <X className="w-3.5 h-3.5" /> Clear All
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden mb-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Room No.','Type','Floor','Capacity','Price/Night','Status','Last Cleaned',''].map((h) => (
                <th key={h} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3.5 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}
                onClick={() => navigate(`${basePath}/rooms/${r.id}`)}
                className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors cursor-pointer">
                <td className="px-5 py-4 font-bold text-navy-900">{r.number}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <BedDouble className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700">{r.type}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-600">{r.floor}</td>
                <td className="px-5 py-4 text-gray-600">{r.capacity}</td>
                <td className="px-5 py-4 font-semibold text-gray-800">${r.pricePerNight}</td>
                <td className="px-5 py-4"><StatusBadge status={r.status} /></td>
                <td className="px-5 py-4 text-gray-500 text-xs">{r.lastCleaned}</td>
                <td className="px-5 py-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`${basePath}/rooms/${r.id}`); }}
                    className="text-xs text-gold-600 hover:underline font-medium"
                  >
                    View →
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400 text-sm">No rooms match the current filters.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">Showing 1 to {filtered.length} of 200 rooms</p>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {[1, 2, 3].map((p) => (
              <button key={p} onClick={() => setCurrentPage(p)}
                className={['w-7 h-7 rounded-lg text-xs font-semibold transition-colors',
                  currentPage === p ? 'bg-navy-900 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'].join(' ')}>
                {p}
              </button>
            ))}
            <span className="text-gray-400 text-xs px-1">...</span>
            <button className="w-7 h-7 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50">50</button>
            <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-[11px] text-gray-400 mt-4">
        © 2024 Grand Horizon ERP Systems. Confidential Operating Data.
      </p>
    </DashboardLayout>
  );
};

export default RoomList;
