import React, { useState, useMemo } from 'react';
import {
  Search, CheckCircle2, Clock, Users, Sparkles,
  ChevronLeft, ChevronRight, X, Eye, Filter,
  RefreshCw, BedDouble, Calendar, User, FileText,
} from 'lucide-react';

import DashboardLayout from '../../components/templates/DashboardLayout';
import Badge           from '../../components/atoms/Badge';
import { useRole }     from '../../hooks/useRole';
import {
  CLEANING_RECORDS, CLEANING_STATS,
  STAFF_OPTIONS, DATE_OPTIONS,
} from '../../data/maintenance';

/* ── Helpers ───────────────────────────────────────────────── */
const USER_NAMES = {
  admin: 'Admin User', manager: 'Alex Sterling',
  receptionist: 'Sarah Mitchell', housekeeper: 'Sarah Jenkins',
};
const USER_ROLES = {
  admin: 'Super Administrator', manager: 'General Manager',
  receptionist: 'Front Desk Lead', housekeeper: 'Senior Housekeeper',
};

const ITEMS_PER_PAGE = 8;

/* ── Stat Card ─────────────────────────────────────────────── */
const StatCard = ({ icon, iconBg, label, value, valueColor = 'text-gray-900', sub }) => (
  <div className="card p-4 flex flex-col gap-1.5 hover:shadow-md transition-shadow">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
      {icon}
    </div>
    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">{label}</p>
    <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
    {sub && <p className="text-[11px] text-gray-400 font-medium">{sub}</p>}
  </div>
);

/* ── Filter Select ─────────────────────────────────────────── */
const FilterSelect = ({ label, value, onChange, options }) => (
  <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-3 py-2 bg-white hover:border-gray-300 transition-colors">
    <span className="text-xs text-gray-500 font-medium">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-xs text-gray-700 bg-transparent outline-none cursor-pointer font-medium"
    >
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  </div>
);

/* ── Checklist row ─────────────────────────────────────────── */
const ChecklistItem = ({ label, done }) => (
  <div className="flex items-center gap-2.5">
    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-500' : 'bg-gray-200'}`}>
      {done && <CheckCircle2 className="w-3 h-3 text-white" />}
    </div>
    <span className={`text-xs ${done ? 'text-gray-700 font-medium' : 'text-gray-400 line-through'}`}>{label}</span>
    {done && <span className="ml-auto text-[10px] text-green-600 font-bold">✔</span>}
  </div>
);

/* ── Detail Slide Panel ────────────────────────────────────── */
const DetailPanel = ({ record, onClose }) => {
  const completedItems = record.checklist.filter((c) => c.done).length;
  const totalItems     = record.checklist.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/30 backdrop-blur-sm"
      onClick={onClose}>
      <div
        className="h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-xs text-gray-400 font-medium">{record.id}</p>
            <h3 className="text-base font-bold text-gray-900">Cleaning Record — Room {record.room}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Status */}
          <Badge variant="green" dot>Completed</Badge>

          {/* Room Info */}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Room Information</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Room Number', value: `Room ${record.room}` },
                { label: 'Room Type',   value: record.roomType },
                { label: 'Floor',       value: record.floor },
                { label: 'Date',        value: record.date },
              ].map((r) => (
                <div key={r.label}>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{r.label}</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{r.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cleaning Info */}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Cleaning Information</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Assigned Staff', value: record.staff },
                { label: 'Duration',       value: record.duration },
                { label: 'Start Time',     value: record.startTime },
                { label: 'Finish Time',    value: record.endTime },
              ].map((r) => (
                <div key={r.label}>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{r.label}</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{r.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cleaning Checklist</p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${completedItems === totalItems ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {completedItems}/{totalItems} done
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
              <div
                className="bg-green-500 h-1.5 rounded-full transition-all"
                style={{ width: `${(completedItems / totalItems) * 100}%` }}
              />
            </div>
            <div className="space-y-2.5">
              {record.checklist.map((item, i) => (
                <ChecklistItem key={i} label={item.label} done={item.done} />
              ))}
            </div>
          </div>

          {/* Notes */}
          {record.notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-2">Staff Notes</p>
              <p className="text-sm text-amber-800 leading-relaxed">{record.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
const CleaningHistoryPage = () => {
  const role = useRole();

  const [search,       setSearch]       = useState('');
  const [staffFilter,  setStaffFilter]  = useState('All Staff');
  const [dateFilter,   setDateFilter]   = useState('All Dates');
  const [currentPage,  setCurrentPage]  = useState(1);
  const [selectedRec,  setSelectedRec]  = useState(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return CLEANING_RECORDS.filter((r) => {
      if (q && !(r.room.includes(q) || r.staff.toLowerCase().includes(q) || r.roomType.toLowerCase().includes(q))) return false;
      if (staffFilter !== 'All Staff' && r.staff !== staffFilter) return false;
      if (dateFilter  !== 'All Dates' && r.date  !== dateFilter)  return false;
      return true;
    });
  }, [search, staffFilter, dateFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const resetFilters = () => { setSearch(''); setStaffFilter('All Staff'); setDateFilter('All Dates'); setCurrentPage(1); };

  return (
    <DashboardLayout
      role={role}
      userName={USER_NAMES[role]}
      userRole={USER_ROLES[role]}
      notificationCount={3}
      searchPlaceholder="Search rooms or staff..."
    >
      {/* Breadcrumb */}
      <p className="text-xs text-gray-400 mb-1">
        Dashboard &rsaquo; <span className="text-gray-600 font-medium">Cleaning History</span>
      </p>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cleaning History</h1>
          <p className="text-xs text-gray-400 mt-0.5">Full audit log of all completed cleaning tasks</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-green-50 border border-green-100 px-3 py-1.5 rounded-lg">
          <Sparkles className="w-3.5 h-3.5 text-green-500" />
          Today: <span className="font-semibold text-green-700 ml-1">{CLEANING_STATS.cleanedToday} rooms cleaned</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatCard
          icon={<BedDouble className="w-4 h-4 text-teal-600" />}
          iconBg="bg-teal-100"
          label="Rooms Cleaned Today"
          value={CLEANING_STATS.cleanedToday}
          valueColor="text-teal-700"
          sub="↑ 2 from yesterday"
        />
        <StatCard
          icon={<CheckCircle2 className="w-4 h-4 text-green-600" />}
          iconBg="bg-green-100"
          label="Completed Tasks"
          value={CLEANING_STATS.completedTotal}
          valueColor="text-green-700"
        />
        <StatCard
          icon={<Clock className="w-4 h-4 text-blue-600" />}
          iconBg="bg-blue-100"
          label="Avg Cleaning Time"
          value={CLEANING_STATS.avgDuration}
          valueColor="text-blue-700"
        />
        <StatCard
          icon={<Users className="w-4 h-4 text-purple-600" />}
          iconBg="bg-purple-100"
          label="My Completed Tasks"
          value={role === 'housekeeper' ? CLEANING_STATS.myCompleted : '—'}
          valueColor="text-purple-700"
          sub={role === 'housekeeper' ? 'Today' : 'Housekeeper view only'}
        />
      </div>

      {/* Search + Filters */}
      <div className="card p-3 mb-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white flex-1 min-w-[220px] focus-within:border-teal-400 transition-colors">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            id="cleaning-history-search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search by Room Number, Staff or Room Type…"
            className="text-xs text-gray-700 bg-transparent outline-none w-full placeholder-gray-400"
          />
          {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-gray-400" /></button>}
        </div>
        <FilterSelect
          label="Date: "
          value={dateFilter}
          onChange={(v) => { setDateFilter(v); setCurrentPage(1); }}
          options={DATE_OPTIONS}
        />
        <FilterSelect
          label="Staff: "
          value={staffFilter}
          onChange={(v) => { setStaffFilter(v); setCurrentPage(1); }}
          options={STAFF_OPTIONS}
        />
        <button
          onClick={resetFilters}
          className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-400"
          title="Reset filters"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/60 border-b border-gray-100">
              {['Date', 'Room', 'Staff', 'Start Time', 'End Time', 'Duration', 'Checklist', 'Status', 'Notes', 'Actions'].map((h) => (
                <th key={h} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-12 text-gray-400 text-sm">
                  No cleaning records match your filters.
                </td>
              </tr>
            ) : paginated.map((rec) => {
              const done  = rec.checklist.filter((c) => c.done).length;
              const total = rec.checklist.length;
              const allDone = done === total;
              return (
                <tr
                  key={rec.id}
                  className="border-b border-gray-50 hover:bg-slate-50/70 transition-colors cursor-pointer"
                  onClick={() => setSelectedRec(rec)}
                >
                  {/* Date */}
                  <td className="px-4 py-3 align-middle">
                    <span className="text-xs font-medium text-gray-700">{rec.date}</span>
                  </td>

                  {/* Room */}
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-2">
                      <span className="w-9 h-9 rounded-xl bg-navy-900 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                        {rec.room}
                      </span>
                      <span className="text-[11px] text-gray-400">{rec.floor}</span>
                    </div>
                  </td>

                  {/* Staff */}
                  <td className="px-4 py-3 align-middle">
                    <span className="text-xs font-medium text-gray-800">{rec.staff}</span>
                  </td>

                  {/* Start */}
                  <td className="px-4 py-3 align-middle">
                    <span className="text-xs text-gray-600">{rec.startTime}</span>
                  </td>

                  {/* End */}
                  <td className="px-4 py-3 align-middle">
                    <span className="text-xs text-gray-600">{rec.endTime}</span>
                  </td>

                  {/* Duration */}
                  <td className="px-4 py-3 align-middle">
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">{rec.duration}</span>
                  </td>

                  {/* Checklist progress */}
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-2 min-w-[80px]">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${allDone ? 'bg-green-500' : 'bg-amber-400'}`}
                          style={{ width: `${(done / total) * 100}%` }}
                        />
                      </div>
                      <span className={`text-[11px] font-bold ${allDone ? 'text-green-600' : 'text-amber-600'}`}>
                        {done}/{total}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 align-middle">
                    <Badge variant="green" dot size="sm">Completed</Badge>
                  </td>

                  {/* Notes */}
                  <td className="px-4 py-3 align-middle max-w-[160px]">
                    <p className="text-[11px] text-gray-500 truncate">{rec.notes || '—'}</p>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 align-middle" onClick={(e) => e.stopPropagation()}>
                    <button
                      id={`view-record-${rec.id}`}
                      onClick={() => setSelectedRec(rec)}
                      className="text-gray-400 hover:text-navy-700 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Showing <span className="font-semibold text-gray-700">{paginated.length}</span> of{' '}
            <span className="font-semibold text-gray-700">{filtered.length}</span> records
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: Math.min(totalPages || 1, 4) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={['w-7 h-7 rounded-lg text-xs font-semibold transition-colors', currentPage === p ? 'bg-navy-900 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'].join(' ')}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Slide Panel */}
      {selectedRec && <DetailPanel record={selectedRec} onClose={() => setSelectedRec(null)} />}
    </DashboardLayout>
  );
};

export default CleaningHistoryPage;
