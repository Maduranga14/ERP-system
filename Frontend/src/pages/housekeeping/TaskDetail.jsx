import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Printer, Pencil, BedDouble, User,
  Clock, CheckSquare, Square, Play, CheckCircle2,
  Wrench, RefreshCw, AlertTriangle, Plus, Download,
} from 'lucide-react';

import DashboardLayout     from '../../components/templates/DashboardLayout';
import Badge               from '../../components/atoms/Badge';
import Avatar              from '../../components/atoms/Avatar';
import ProgressBar         from '../../components/atoms/ProgressBar';
import { useRole }         from '../../hooks/useRole';
import { canHousekeeping } from '../../utils/permissions';
import { TASKS, MAINTENANCE, HOUSEKEEPING_STATS } from '../../data/housekeeping';

/* ── Helpers ────────────────────────────────────────────────── */
const PRIORITY_VARIANT        = { High: 'red', Medium: 'amber', Low: 'green' };
const MAINT_STATUS_VARIANT    = { Open: 'red', 'In Progress': 'blue', Resolved: 'green' };
const BOOKING_STATUS_VARIANT  = { Completed: 'green', Active: 'blue', Pending: 'amber' };

const userNames = {
  admin: 'Admin User', manager: 'Alex Sterling',
  receptionist: 'Sarah Mitchell', housekeeper: 'Sarah Jenkins',
};
const userRoles = {
  admin: 'Super Administrator', manager: 'General Manager',
  receptionist: 'Front Desk Lead', housekeeper: 'Senior Housekeeper',
};

/* ── Info Row ────────────────────────────────────────────────── */
const InfoRow = ({ label, value, valueClass = 'text-gray-800' }) => (
  <div>
    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
    <p className={`text-sm font-semibold mt-0.5 ${valueClass}`}>{value || '—'}</p>
  </div>
);

/* ── Room Status Mini Grid ───────────────────────────────────── */
const StatusGrid = () => (
  <div className="grid grid-cols-2 gap-0 rounded-xl overflow-hidden border border-gray-100">
    {[
      { label: 'CLEAN',    count: 55, color: 'text-navy-900', bg: 'bg-white' },
      { label: 'DIRTY',    count: 8,  color: 'text-red-600',  bg: 'bg-white' },
      { label: 'CLEANING', count: 6,  color: 'text-blue-600', bg: 'bg-white' },
      { label: 'MAINT.',   count: 3,  color: 'text-amber-600',bg: 'bg-white' },
    ].map((s, i) => (
      <div
        key={s.label}
        className={[
          'p-4 text-center',
          s.bg,
          i === 0 ? 'border-b border-r border-gray-100' : '',
          i === 1 ? 'border-b border-gray-100' : '',
          i === 2 ? 'border-r border-gray-100' : '',
        ].join(' ')}
      >
        <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">{s.label}</p>
      </div>
    ))}
  </div>
);

/* ── Main Component ──────────────────────────────────────────── */
const TaskDetail = () => {
  const navigate  = useNavigate();
  const { id }    = useParams();
  const role      = useRole();
  const basePath  = `/${role}`;

  const task = TASKS.find((t) => t.id === id) || TASKS[1]; // default Room 308

  const taskMaintenance = MAINTENANCE.filter((m) =>
    task.maintenanceIds?.includes(m.id)
  );

  const [checklist,  setChecklist]  = useState(task.checklist.map((c) => ({ ...c })));
  const [notes,      setNotes]      = useState(task.notes || '');
  const [taskStatus, setTaskStatus] = useState(task.status);
  const [showMaintModal, setShowMaintModal] = useState(false);

  const completedCount  = checklist.filter((c) => c.done).length;
  const totalCount      = checklist.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const todayProgress = 80; // mock
  const isOverdue = taskStatus === 'Delayed';

  const toggleCheck = (checkId) => {
    if (!canHousekeeping(role, 'updateStatus')) return;
    setChecklist((prev) =>
      prev.map((c) => c.id === checkId ? { ...c, done: !c.done } : c)
    );
  };

  const handleStart = () => {
    if (!canHousekeeping(role, 'updateStatus')) return;
    setTaskStatus('In Progress');
    alert('Cleaning started! (mock)');
  };

  const handleComplete = () => {
    if (!canHousekeeping(role, 'updateStatus')) return;
    setTaskStatus('Completed');
    alert('Room marked as clean! (mock)');
  };

  return (
    <DashboardLayout
      role={role}
      userName={userNames[role]}
      userRole={userRoles[role]}
      notificationCount={4}
      searchPlaceholder="Search guest, room or booking ID..."
    >
      {/* ── Breadcrumb ── */}
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
        Housekeeping{' '}
        <span className="text-gray-300 mx-1">›</span>
        <span className="text-gray-500">Task List</span>
      </p>

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`${basePath}/housekeeping`)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            Housekeeping Task Details — Room {task.room}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
            <Printer className="w-4 h-4" />
            Print Worksheet
          </button>
          {canHousekeeping(role, 'manageStaff') && (
            <button
              onClick={() => navigate(`${basePath}/housekeeping/assign`)}
              className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
            >
              <Pencil className="w-4 h-4" />
              Edit Details
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* ── Left & Centre (2/3) ── */}
        <div className="xl:col-span-2 flex flex-col gap-4">

          {/* Row: Room Info + Assignment */}
          <div className="grid grid-cols-2 gap-4">

            {/* Room Information */}
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <BedDouble className="w-4 h-4 text-gray-400" />
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Room Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InfoRow label="Room Number" value={task.room} />
                <InfoRow label="Room Type"   value={task.roomType} />
              </div>
              <div className="mt-3">
                <InfoRow label="Floor" value={task.floor} />
              </div>
            </div>

            {/* Assignment */}
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-gray-400" />
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Assignment</h3>
              </div>
              <div className="flex items-center gap-2.5 mb-3">
                <Avatar name={task.assignedTo.name} size="md" />
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned Staff</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{task.assignedTo.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InfoRow label="Assigned" value={task.assignedTime} />
                <InfoRow
                  label="Due Time"
                  value={task.dueTime}
                  valueClass={isOverdue ? 'text-red-600' : 'text-gray-800'}
                />
              </div>
            </div>
          </div>

          {/* Cleaning Checklist */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-bold text-gray-800">Cleaning Checklist</h3>
              </div>
              <span className={[
                'text-xs font-semibold px-2.5 py-1 rounded-full',
                completedCount === totalCount
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-100 text-amber-700',
              ].join(' ')}>
                {completedCount}/{totalCount} Completed
              </span>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <ProgressBar value={progressPercent} color="gold" size="sm" />
            </div>

            {/* Checklist grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-5">
              {checklist.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  disabled={!canHousekeeping(role, 'updateStatus')}
                  className="flex items-center gap-3 group text-left disabled:cursor-not-allowed"
                >
                  {item.done ? (
                    <CheckSquare className="w-5 h-5 text-navy-900 flex-shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-300 group-hover:text-gray-400 flex-shrink-0 transition-colors" />
                  )}
                  <span className={[
                    'text-sm transition-colors',
                    item.done ? 'text-gray-500 line-through' : 'text-gray-700',
                  ].join(' ')}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Notes */}
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Completion Notes &amp; Observations
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any details about room condition or guest items found..."
                rows={4}
                disabled={!canHousekeeping(role, 'updateStatus')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 resize-none transition-all placeholder-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Maintenance Requests */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-bold text-gray-800">Maintenance Requests</h3>
              </div>
              {canHousekeeping(role, 'reportMaintenance') && (
                <button
                  onClick={() => setShowMaintModal(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-navy-700 border border-navy-200 bg-navy-50 hover:bg-navy-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Report New Issue
                </button>
              )}
            </div>

            {taskMaintenance.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                No maintenance requests for this room.
              </p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Asset / Issue', 'Priority', 'Status', 'Reported By', 'Date'].map((h) => (
                      <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider py-2 pr-4">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {taskMaintenance.map((m) => (
                    <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 pr-4 align-top">
                        <p className="text-sm font-bold text-navy-900">{m.asset}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{m.description}</p>
                      </td>
                      <td className="py-3 pr-4 align-top">
                        <Badge variant={PRIORITY_VARIANT[m.priority] || 'gray'} size="sm">
                          {m.priority}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 align-top">
                        <Badge variant={MAINT_STATUS_VARIANT[m.status] || 'gray'} size="sm">
                          {m.status}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 align-top">
                        <span className="text-xs text-gray-600">{m.reportedBy}</span>
                      </td>
                      <td className="py-3 align-top">
                        <span className="text-xs text-gray-500">{m.date}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── Right Sidebar (1/3) ── */}
        <div className="flex flex-col gap-4">

          {/* Today's Progress */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-800">Today's Progress</h3>
              <span className="text-sm font-bold text-gray-900">{todayProgress}%</span>
            </div>
            <ProgressBar value={todayProgress} color="gold" size="md" />
            <p className="text-xs text-gray-400 mt-2 text-center">16/20 Rooms Completed</p>
          </div>

          {/* Room Status Overview */}
          <div className="card p-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Room Status Overview
            </h3>
            <StatusGrid />
          </div>

          {/* Action Buttons */}
          {canHousekeeping(role, 'updateStatus') && (
            <div className="flex flex-col gap-2">
              {taskStatus !== 'In Progress' && taskStatus !== 'Completed' && (
                <button
                  onClick={handleStart}
                  className="w-full flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white text-sm font-bold py-3 rounded-xl transition-colors shadow-sm"
                >
                  <Play className="w-4 h-4" />
                  Start Cleaning
                </button>
              )}
              {taskStatus !== 'Completed' && (
                <button
                  onClick={handleComplete}
                  className="w-full flex items-center justify-center gap-2 text-white text-sm font-bold py-3 rounded-xl transition-colors shadow-sm"
                  style={{ backgroundColor: '#7C6A2E' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6B5B28'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7C6A2E'}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark as Clean
                </button>
              )}
              {taskStatus === 'Completed' && (
                <div className="w-full flex items-center justify-center gap-2 bg-green-100 text-green-700 text-sm font-bold py-3 rounded-xl">
                  <CheckCircle2 className="w-4 h-4" />
                  Room Marked Clean
                </div>
              )}
            </div>
          )}

          {/* Report Maint + Reassign */}
          <div className="grid grid-cols-2 gap-2">
            {canHousekeeping(role, 'reportMaintenance') && (
              <button
                onClick={() => setShowMaintModal(true)}
                className="flex flex-col items-center gap-1.5 border border-gray-200 rounded-xl p-3 text-xs font-semibold text-gray-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 transition-all"
              >
                <Wrench className="w-4 h-4" />
                Report Maint.
              </button>
            )}
            {canHousekeeping(role, 'manageStaff') && (
              <button
                onClick={() => navigate(`${basePath}/housekeeping/assign`)}
                className="flex flex-col items-center gap-1.5 border border-gray-200 rounded-xl p-3 text-xs font-semibold text-gray-600 hover:border-navy-300 hover:bg-navy-50 hover:text-navy-700 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Reassign
              </button>
            )}
          </div>

          {/* Task summary card */}
          <div className="card p-4 bg-slate-50">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Task Summary</h3>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Task ID',    value: task.id },
                { label: 'Priority',   value: task.priority },
                { label: 'Status',     value: taskStatus },
                { label: 'Assigned',   value: task.assignedTime },
                { label: 'Due',        value: task.dueTime },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{label}</span>
                  <span className="text-xs font-semibold text-gray-700">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Report Maintenance Modal ── */}
      {showMaintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mx-auto mb-4">
              <Wrench className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900 text-center mb-1">Report New Issue</h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              Room <span className="font-semibold text-gray-800">{task.room}</span>
            </p>
            <div className="flex flex-col gap-3 mb-4">
              <input
                placeholder="Asset / Area (e.g. Air Conditioner, Bathroom)"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />
              <textarea
                placeholder="Describe the issue in detail..."
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 resize-none"
              />
              <div className="flex gap-2">
                <select className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-400">
                  <option>Priority: High</option>
                  <option>Priority: Medium</option>
                  <option>Priority: Low</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowMaintModal(false)}
                className="flex-1 border border-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { alert('Maintenance request submitted! (mock)'); setShowMaintModal(false); }}
                className="flex-1 bg-amber-500 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-amber-600 transition-colors"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TaskDetail;
