import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, Download, Filter, ChevronLeft, ChevronRight,
  Play, CheckCircle2, Eye, Pencil, AlertTriangle, Radio,
  BedDouble, RefreshCw, Layers, Clock,
} from 'lucide-react';

import DashboardLayout    from '../../components/templates/DashboardLayout';
import Badge              from '../../components/atoms/Badge';
import Avatar             from '../../components/atoms/Avatar';
import { useRole }        from '../../hooks/useRole';
import { canHousekeeping } from '../../utils/permissions';
import {
  TASKS, HOUSEKEEPING_STATS,
  PRIORITY_OPTIONS, STATUS_OPTIONS, FLOOR_OPTIONS,
} from '../../data/housekeeping';

/* ── Variant maps ─────────────────────────────────────────── */
const PRIORITY_VARIANT = { High: 'red', Medium: 'amber', Low: 'green' };
const STATUS_VARIANT   = {
  Pending: 'amber', 'In Progress': 'blue',
  Completed: 'green', Delayed: 'red',
};

const ITEMS_PER_PAGE = 8;

const userNames = {
  admin: 'Admin User', manager: 'Alex Sterling',
  receptionist: 'Sarah Mitchell', housekeeper: 'Sarah Jenkins',
};
const userRoles = {
  admin: 'Super Administrator', manager: 'General Manager',
  receptionist: 'Front Desk Lead', housekeeper: 'Senior Housekeeper',
};

/* ── Stat Card ─────────────────────────────────────────────── */
const StatCard = ({ label, value, icon, iconBg, valueColor = 'text-gray-900', badge }) => (
  <div className="card p-4 flex flex-col gap-2 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>
      {badge && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.cls}`}>
          {badge.text}
        </span>
      )}
    </div>
    <div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold mt-0.5 ${valueColor}`}>{value}</p>
    </div>
  </div>
);

/* ── Room Number Badge ─────────────────────────────────────── */
const RoomBadge = ({ room, floor }) => (
  <div className="flex items-center gap-2">
    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-navy-900 text-white text-sm font-bold flex-shrink-0">
      {room}
    </span>
    <span className="text-xs text-gray-400">{floor}</span>
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

/* ── Action Button ─────────────────────────────────────────── */
const ActionBtn = ({ icon, title, onClick, color = 'text-gray-400 hover:text-navy-700' }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onClick?.(); }}
    className={`transition-colors ${color}`}
    title={title}
  >
    {icon}
  </button>
);

/* ── Main Component ────────────────────────────────────────── */
const HousekeepingList = () => {
  const navigate  = useNavigate();
  const role      = useRole();
  const basePath  = `/${role}`;

  const [search,         setSearch]         = useState('');
  const [statusFilter,   setStatusFilter]   = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [floorFilter,    setFloorFilter]    = useState('All');
  const [currentPage,    setCurrentPage]    = useState(1);
  const [showBroadcast,  setShowBroadcast]  = useState(false);

  const filtered = useMemo(() => {
    return TASKS.filter((t) => {
      const q = search.toLowerCase();
      if (q && !(
        t.room.includes(q) ||
        t.assignedTo.name.toLowerCase().includes(q) ||
        t.roomType.toLowerCase().includes(q)
      )) return false;
      if (statusFilter   !== 'All' && t.status   !== statusFilter)   return false;
      if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
      if (floorFilter    !== 'All' && t.floor    !== floorFilter)    return false;
      return true;
    });
  }, [search, statusFilter, priorityFilter, floorFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const isOverdue = (task) =>
    task.status === 'Delayed' || task.status === 'Pending';

  return (
    <DashboardLayout
      role={role}
      userName={userNames[role]}
      userRole={userRoles[role]}
      notificationCount={4}
      searchPlaceholder="Search guest, room or booking ID..."
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Housekeeping Management</h1>
          <p className="text-sm text-gray-400 mt-0.5">Real-time room status and staff task allocation.</p>
        </div>
        <div className="flex items-center gap-2">
          {canHousekeeping(role, 'exportList') && (
            <button className="flex items-center gap-2 border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Export List
            </button>
          )}
          {canHousekeeping(role, 'assignTasks') && (
            <button
              onClick={() => navigate(`${basePath}/housekeeping/assign`)}
              className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Assign Task
            </button>
          )}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
        <StatCard
          label="Rooms to Clean"
          value={String(HOUSEKEEPING_STATS.roomsToClean).padStart(2, '0')}
          icon={<BedDouble className="w-4 h-4 text-navy-700" />}
          iconBg="bg-navy-100"
        />
        <StatCard
          label="In Progress"
          value={String(HOUSEKEEPING_STATS.inProgress).padStart(2, '0')}
          icon={<RefreshCw className="w-4 h-4 text-blue-600" />}
          iconBg="bg-blue-100"
          valueColor="text-blue-700"
          badge={{ text: 'Active', cls: 'bg-blue-100 text-blue-700' }}
        />
        <StatCard
          label="Clean Rooms"
          value={HOUSEKEEPING_STATS.cleanRooms}
          icon={<CheckCircle2 className="w-4 h-4 text-green-600" />}
          iconBg="bg-green-100"
          valueColor="text-green-700"
        />
        <StatCard
          label="Maintenance"
          value={String(HOUSEKEEPING_STATS.maintenance).padStart(2, '0')}
          icon={<AlertTriangle className="w-4 h-4 text-red-500" />}
          iconBg="bg-red-100"
          valueColor="text-red-600"
          badge={{ text: 'Urgent', cls: 'bg-red-100 text-red-700' }}
        />
        <StatCard
          label="Staff on Duty"
          value={HOUSEKEEPING_STATS.staffOnDuty}
          icon={<Layers className="w-4 h-4 text-purple-600" />}
          iconBg="bg-purple-100"
        />
        <StatCard
          label="High Priority"
          value={String(HOUSEKEEPING_STATS.highPriority).padStart(2, '0')}
          icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
          iconBg="bg-amber-100"
          valueColor="text-amber-700"
          badge={{ text: '!', cls: 'bg-amber-100 text-amber-700 font-black' }}
        />
      </div>

      {/* ── Search + Filters ── */}
      <div className="card p-3 mb-4 flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white flex-1 min-w-[220px] focus-within:border-navy-400 transition-colors">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search Room Number or Staff Name..."
            className="text-xs text-gray-700 bg-transparent outline-none w-full placeholder-gray-400"
          />
        </div>
        <FilterSelect
          label="Status: "
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
          options={STATUS_OPTIONS}
        />
        <FilterSelect
          label="Priority: "
          value={priorityFilter}
          onChange={(v) => { setPriorityFilter(v); setCurrentPage(1); }}
          options={PRIORITY_OPTIONS}
        />
        <FilterSelect
          label="Floor: "
          value={floorFilter}
          onChange={(v) => { setFloorFilter(v); setCurrentPage(1); }}
          options={FLOOR_OPTIONS}
        />
        <button
          onClick={() => { setSearch(''); setStatusFilter('All'); setPriorityFilter('All'); setFloorFilter('All'); setCurrentPage(1); }}
          className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-400 hover:text-gray-600"
          title="Reset filters"
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* ── Task Table ── */}
      <div className="card overflow-hidden mb-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {['Room', 'Room Type', 'Assigned To', 'Priority', 'Status', 'Due Time', 'Actions'].map((h) => (
                <th
                  key={h}
                  className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                  No tasks match your filters.
                </td>
              </tr>
            ) : paginated.map((task) => {
              const overdue = task.status === 'Delayed';
              return (
                <tr
                  key={task.id}
                  className="border-b border-gray-50 hover:bg-slate-50/70 transition-colors cursor-pointer"
                  onClick={() => navigate(`${basePath}/housekeeping/${task.id}`)}
                >
                  {/* Room */}
                  <td className="px-4 py-3 align-middle">
                    <RoomBadge room={task.room} floor={task.floor} />
                  </td>

                  {/* Room Type */}
                  <td className="px-4 py-3 align-middle">
                    <span className="text-xs text-gray-700 font-medium">{task.roomType}</span>
                  </td>

                  {/* Assigned To */}
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-2">
                      <Avatar name={task.assignedTo.name} size="sm" />
                      <span className="text-xs font-medium text-gray-800">{task.assignedTo.name}</span>
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="px-4 py-3 align-middle">
                    <span className={[
                      'inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md',
                      task.priority === 'High'   ? 'bg-red-100 text-red-700'   : '',
                      task.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : '',
                      task.priority === 'Low'    ? 'bg-green-100 text-green-700' : '',
                    ].join(' ')}>
                      {task.priority === 'High' && '! '}
                      {task.priority}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 align-middle">
                    <Badge variant={STATUS_VARIANT[task.status] || 'gray'} size="sm">
                      {task.status}
                    </Badge>
                  </td>

                  {/* Due Time */}
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-1">
                      <Clock className={`w-3.5 h-3.5 ${overdue ? 'text-red-500' : 'text-gray-400'}`} />
                      <span className={`text-xs font-semibold ${overdue ? 'text-red-600' : 'text-gray-700'}`}>
                        {task.dueTime}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 align-middle" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      {task.status === 'Pending' && canHousekeeping(role, 'updateStatus') && (
                        <ActionBtn
                          icon={<Play className="w-4 h-4" />}
                          title="Start Cleaning"
                          color="text-gray-400 hover:text-blue-600"
                        />
                      )}
                      {task.status === 'In Progress' && canHousekeeping(role, 'updateStatus') && (
                        <ActionBtn
                          icon={<CheckCircle2 className="w-4 h-4" />}
                          title="Mark as Complete"
                          color="text-gray-400 hover:text-green-600"
                        />
                      )}
                      {overdue && canHousekeeping(role, 'manageStaff') && (
                        <ActionBtn
                          icon={<Pencil className="w-4 h-4" />}
                          title="Edit Task"
                          color="text-gray-400 hover:text-gold-600"
                          onClick={() => navigate(`${basePath}/housekeeping/assign`)}
                        />
                      )}
                      <ActionBtn
                        icon={<Eye className="w-4 h-4" />}
                        title="View Details"
                        onClick={() => navigate(`${basePath}/housekeeping/${task.id}`)}
                      />
                    </div>
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
            <span className="font-semibold text-gray-700">65</span> tasks
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={[
                  'w-8 h-8 rounded-lg text-xs font-semibold transition-colors',
                  currentPage === p
                    ? 'bg-navy-900 text-white'
                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50',
                ].join(' ')}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages || 1, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ── Emergency Broadcast (Admin/Manager only) ── */}
      {canHousekeeping(role, 'broadcastAlert') && (
        <div className="card p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Emergency?</h3>
              <p className="text-sm text-gray-500 mt-0.5 max-w-sm">
                Quickly broadcast an urgent housekeeping request to all on-duty staff.
              </p>
            </div>
            <button
              onClick={() => setShowBroadcast(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
            >
              <Radio className="w-4 h-4" />
              Broadcast Alert
            </button>
          </div>
        </div>
      )}

      {/* ── Broadcast Modal ── */}
      {showBroadcast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <Radio className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900 text-center mb-1">Broadcast Emergency Alert</h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              This will immediately notify all <span className="font-semibold text-gray-800">15 on-duty staff</span> members.
            </p>
            <textarea
              placeholder="Describe the emergency situation..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowBroadcast(false)}
                className="flex-1 border border-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { alert('Emergency alert broadcasted to all on-duty staff! (mock)'); setShowBroadcast(false); }}
                className="flex-1 bg-red-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-red-700 transition-colors"
              >
                Send Broadcast
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default HousekeepingList;
