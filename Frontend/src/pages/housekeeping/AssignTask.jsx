import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, BedDouble, User, Clock, AlignLeft,
  Save, X, CheckSquare, AlertTriangle, Loader2,
  Wrench, AlertCircle,
} from 'lucide-react';

import DashboardLayout     from '../../components/templates/DashboardLayout';
import Avatar              from '../../components/atoms/Avatar';
import Badge               from '../../components/atoms/Badge';
import { useRole }         from '../../hooks/useRole';
import { canHousekeeping } from '../../utils/permissions';
import {
  getEmployees,
  getAvailableMaintenanceRequests,
  createHousekeepingTask,
  updateMaintenanceStatus,
  getRooms,
} from '../../utils/api';

/* ── Constants ─────────────────────────────────────────────── */
const userNames = {
  admin: 'Admin User', manager: 'Alex Sterling',
  receptionist: 'Sarah Mitchell', housekeeper: 'Sarah Jenkins',
};
const userRoles = {
  admin: 'Super Administrator', manager: 'General Manager',
  receptionist: 'Front Desk Lead', housekeeper: 'Senior Housekeeper',
};

const PRIORITIES = ['High', 'Medium', 'Low'];
const PRIORITY_STYLES = {
  High:   { dot: 'bg-red-500',   border: 'border-red-300',   bg: 'bg-red-50',   text: 'text-red-700'   },
  Medium: { dot: 'bg-amber-500', border: 'border-amber-300', bg: 'bg-amber-50', text: 'text-amber-700' },
  Low:    { dot: 'bg-green-500', border: 'border-green-300', bg: 'bg-green-50', text: 'text-green-700' },
};
const PRIORITY_BADGE = { High: 'red', Medium: 'amber', Low: 'green' };

const DEFAULT_CHECKLIST = [
  'Bed changed', 'Floor vacuumed', 'Toiletries restocked',
  'Trash removed', 'Bathroom cleaned', 'Towels replaced', 'Mini bar checked',
];

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 transition-all bg-white";

const FormField = ({ label, icon, required, children }) => (
  <div>
    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
      {icon && <span className="text-gray-400">{icon}</span>}
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

/* ── Main Component ────────────────────────────────────────── */
const AssignTask = () => {
  const navigate = useNavigate();
  const role     = useRole();
  const basePath = `/${role}`;

  // Only admin & manager can assign maintenance tasks; others see the standard form
  const canAssignMaintenance = role === 'admin' || role === 'manager';

  if (!canHousekeeping(role, 'assignTasks')) {
    return (
      <DashboardLayout role={role} userName={userNames[role]} userRole={userRoles[role]}>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
          <p className="text-gray-500 font-medium">You don't have permission to assign tasks.</p>
          <button onClick={() => navigate(-1)} className="text-sm text-navy-700 hover:underline">Go back</button>
        </div>
      </DashboardLayout>
    );
  }

  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [saveError,      setSaveError]      = useState('');
  const [staff,          setStaff]          = useState([]);
  const [rooms,          setRooms]          = useState([]);
  const [maintRequests,  setMaintRequests]  = useState([]);
  const [selectedMaint,  setSelectedMaint]  = useState(null); // chosen maintenance request

  const [form, setForm] = useState({
    // room fields — auto-filled when a maintenance request is selected
    roomNumber: '',
    roomType:   '',
    floor:      '',
    // assignment
    staffId:    '',
    priority:   'High',
    dueTime:    '',
    notes:      '',
    checklist:  [...DEFAULT_CHECKLIST],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const promises = canAssignMaintenance
      ? [getEmployees(), getAvailableMaintenanceRequests(), getRooms()]
      : [getEmployees(), Promise.resolve([]), getRooms()];

    Promise.all(promises)
      .then(([employees, maintData, roomsData]) => {
        // Include housekeepers and any employee in the Maintenance department
        const housekeepers = employees.filter(e =>
          e.systemRole === 'housekeeper' ||
          e.department?.toLowerCase() === 'maintenance'
        );
        setStaff(housekeepers);
        setMaintRequests(maintData);
        setRooms(roomsData);
        if (housekeepers.length > 0) {
          setForm(f => ({ ...f, staffId: String(housekeepers[0].id) }));
        }
      })
      .catch(() => setSaveError('Failed to load data. Please refresh.'))
      .finally(() => setLoading(false));
  }, []);

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  const toggleChecklist = (item) => {
    setForm(f => ({
      ...f,
      checklist: f.checklist.includes(item)
        ? f.checklist.filter(c => c !== item)
        : [...f.checklist, item],
    }));
  };

  // When a maintenance request is selected, pre-fill room info and notes
  const selectMaintenance = (req) => {
    setSelectedMaint(req);
    setForm(f => ({
      ...f,
      roomNumber: req.room?.number  || '',
      roomType:   req.room?.type    || '',
      floor:      req.room?.floor   ? `Floor ${req.room.floor}` : '',
      priority:   req.priority      || 'High',
      notes:      req.description   || '',
    }));
    setErrors({});
  };

  const validate = () => {
    const e = {};
    if (canAssignMaintenance && !selectedMaint) e.maint = 'Please select a maintenance request';
    if (!canAssignMaintenance && !form.roomNumber) e.roomNumber = 'Please select a room';
    if (!form.dueTime) e.dueTime = 'Due time is required';
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setSaving(true);
    setSaveError('');

    try {
      if (canAssignMaintenance && selectedMaint) {
        // Admin/Manager path — create housekeeping task linked to maintenance request,
        // then mark the maintenance request as In Progress
        const roomObj = rooms.find(r => r.id === selectedMaint.room?.id || r.number === selectedMaint.room?.number);
        const staffObj = staff.find(s => s.id === Number(form.staffId));
        await createHousekeepingTask({
          room: roomObj || selectedMaint.room,
          housekeeper: staffObj || null,
          priority: form.priority,
          status: 'Pending',
          dueTime: form.dueTime,
          assignedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          notes: form.notes,
          checklist: form.checklist.map(label => ({ label, done: false })),
          maintenanceRequestId: selectedMaint.id,
        });
        // Mark the maintenance request as In Progress — best effort, don't block on failure
        updateMaintenanceStatus(selectedMaint.id, 'In Progress').catch(() => {});
        // Remove from the assign-task list immediately and reset selection
        setMaintRequests(prev => prev.filter(r => r.id !== selectedMaint.id));
        setSelectedMaint(null);
        setForm(f => ({
          ...f,
          roomNumber: '', roomType: '', floor: '',
          dueTime: '', notes: '', checklist: [...DEFAULT_CHECKLIST],
        }));
      } else {
        // Standard path — plain housekeeping task
        const roomObj = rooms.find(r => r.number === form.roomNumber);
        if (!roomObj) { setErrors({ roomNumber: 'Room not found.' }); setSaving(false); return; }
        const staffObj = staff.find(s => s.id === Number(form.staffId));
        await createHousekeepingTask({
          room: roomObj,
          housekeeper: staffObj || null,
          priority: form.priority,
          status: 'Pending',
          dueTime: form.dueTime,
          assignedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          notes: form.notes,
          checklist: form.checklist.map(label => ({ label, done: false })),
        });
        navigate(`${basePath}/housekeeping`);
      }
    } catch (err) {
      setSaveError(err.message || 'Failed to assign task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const selectedStaff = staff.find(s => s.id === Number(form.staffId));

  if (loading) {
    return (
      <DashboardLayout role={role} userName={userNames[role]} userRole={userRoles[role]}>
        <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" /> Loading...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role={role}
      userName={userNames[role]}
      userRole={userRoles[role]}
      notificationCount={4}
      searchPlaceholder="Search guest, room or booking ID..."
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Assign Cleaning Task</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {canAssignMaintenance
                ? 'Select a maintenance request and assign to a housekeeper'
                : 'Create and assign a housekeeping task to staff'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Assigning…' : 'Assign Task'}
          </button>
        </div>
      </div>

      {/* Save error */}
      {saveError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mb-4">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-700 font-medium">{saveError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* ── Maintenance Requests Panel (admin/manager only) ── */}
          {canAssignMaintenance && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-1">
                <Wrench className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-bold text-gray-800">Available Maintenance Requests</h3>
                <span className="ml-auto text-[11px] font-semibold text-gray-400">
                  {maintRequests.length} open
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-4">Select a request to auto-fill room details</p>

              {errors.maint && (
                <p className="text-red-500 text-xs mb-3 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.maint}
                </p>
              )}

              {maintRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2 bg-slate-50 rounded-xl border border-dashed border-gray-200">
                  <Wrench className="w-6 h-6 text-gray-300" />
                  <p className="text-sm text-gray-400">No open maintenance requests</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {maintRequests.map((req) => {
                    const isSelected = selectedMaint?.id === req.id;
                    return (
                      <button
                        key={req.id}
                        onClick={() => selectMaintenance(req)}
                        className={[
                          'flex items-center gap-3 p-3 rounded-xl border text-left transition-all w-full',
                          isSelected
                            ? 'border-navy-400 bg-navy-50 ring-1 ring-navy-300'
                            : 'border-gray-100 hover:border-gray-300 hover:bg-slate-50',
                        ].join(' ')}
                      >
                        {/* Room badge */}
                        <span className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-navy-900 text-white text-sm font-bold">
                          {req.room?.number || '?'}
                        </span>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-xs font-bold text-gray-800 truncate">{req.category}</p>
                            <Badge variant={PRIORITY_BADGE[req.priority] || 'gray'} size="sm">
                              {req.priority}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-gray-400 truncate">{req.description}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Room {req.room?.number}{req.room?.floor ? ` · Floor ${req.room.floor}` : ''}{req.room?.type ? ` · ${req.room.type}` : ''}
                          </p>
                        </div>

                        {/* Reported date */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-[10px] text-gray-400">{req.reportedDate}</p>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-navy-700 bg-navy-100 px-1.5 py-0.5 rounded mt-1 inline-block">
                              Selected
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Room Details (pre-filled or manual) ── */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <BedDouble className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-bold text-gray-800">Room Details</h3>
              {canAssignMaintenance && selectedMaint && (
                <span className="ml-auto text-[11px] font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                  Auto-filled from request
                </span>
              )}
            </div>

            {canAssignMaintenance ? (
              /* Read-only fields for admin/manager — filled from selected request */
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Room Number">
                  <input
                    value={form.roomNumber || '—'}
                    disabled
                    className={`${inputCls} bg-gray-50 text-gray-500`}
                  />
                </FormField>
                <FormField label="Room Type">
                  <input
                    value={form.roomType || '—'}
                    disabled
                    className={`${inputCls} bg-gray-50 text-gray-500`}
                  />
                </FormField>
                <FormField label="Floor">
                  <input
                    value={form.floor || '—'}
                    disabled
                    className={`${inputCls} bg-gray-50 text-gray-500`}
                  />
                </FormField>
              </div>
            ) : (
              /* Editable for other roles */
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Room Number" required icon={<BedDouble className="w-3 h-3" />}>
                  <select
                    value={form.roomNumber}
                    onChange={(e) => {
                      const r = rooms.find(r => r.number === e.target.value);
                      setForm(f => ({
                        ...f,
                        roomNumber: e.target.value,
                        roomType: r?.type || '',
                        floor: r?.floor ? `Floor ${r.floor}` : '',
                      }));
                      if (errors.roomNumber) setErrors(e => ({ ...e, roomNumber: '' }));
                    }}
                    className={`${inputCls} ${errors.roomNumber ? 'border-red-400' : ''}`}
                  >
                    <option value="">Select room…</option>
                    {rooms.map(r => <option key={r.id} value={r.number}>{r.number}</option>)}
                  </select>
                  {errors.roomNumber && <p className="text-red-500 text-xs mt-1">{errors.roomNumber}</p>}
                </FormField>
                <FormField label="Room Type">
                  <input value={form.roomType} disabled className={`${inputCls} bg-gray-50 text-gray-500`} />
                </FormField>
                <FormField label="Floor">
                  <input value={form.floor} disabled className={`${inputCls} bg-gray-50 text-gray-500`} />
                </FormField>
              </div>
            )}
          </div>

          {/* ── Staff Assignment ── */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-bold text-gray-800">Staff Assignment</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <FormField label="Assign To">
                <select
                  value={form.staffId}
                  onChange={(e) => set('staffId', e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select staff…</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>{s.fullName}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Due Time" required icon={<Clock className="w-3 h-3" />}>
                <input
                  type="time"
                  value={form.dueTime}
                  onChange={(e) => set('dueTime', e.target.value)}
                  className={`${inputCls} ${errors.dueTime ? 'border-red-400' : ''}`}
                />
                {errors.dueTime && <p className="text-red-500 text-xs mt-1">{errors.dueTime}</p>}
              </FormField>
            </div>

            {selectedStaff && (
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
                <Avatar name={selectedStaff.fullName} size="md" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{selectedStaff.fullName}</p>
                  <p className="text-xs text-gray-400">{selectedStaff.role || 'Housekeeper'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Department</p>
                  <p className="text-sm font-bold text-gray-800">{selectedStaff.department || 'Housekeeping'}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${selectedStaff.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {selectedStaff.enabled ? 'On Duty' : 'Off Duty'}
                </span>
              </div>
            )}
          </div>

          {/* ── Special Instructions ── */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlignLeft className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-bold text-gray-800">Special Instructions</h3>
            </div>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Add any special instructions for the assigned staff member…"
              rows={4}
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="flex flex-col gap-4">

          {/* Priority */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-bold text-gray-800">Task Priority</h3>
            </div>
            <div className="flex flex-col gap-2">
              {PRIORITIES.map((priority) => {
                const s = PRIORITY_STYLES[priority];
                const active = form.priority === priority;
                return (
                  <button
                    key={priority}
                    onClick={() => set('priority', priority)}
                    className={[
                      'flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                      active ? `${s.border} ${s.bg}` : 'border-gray-100 hover:border-gray-200',
                    ].join(' ')}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.dot}`} />
                    <span className={`text-sm font-medium ${active ? s.text : 'text-gray-600'}`}>{priority}</span>
                    {active && (
                      <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
                        Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Checklist */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckSquare className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-bold text-gray-800">Cleaning Checklist</h3>
            </div>
            <p className="text-xs text-gray-400 mb-3">Select tasks to include</p>
            <div className="flex flex-col gap-2.5">
              {DEFAULT_CHECKLIST.map((item) => {
                const checked = form.checklist.includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => toggleChecklist(item)}
                    className="flex items-center gap-3 group text-left"
                  >
                    {checked ? (
                      <CheckSquare className="w-4 h-4 text-navy-900 flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-gray-300 rounded flex-shrink-0 group-hover:border-navy-400 transition-colors" />
                    )}
                    <span className={`text-sm ${checked ? 'text-gray-700' : 'text-gray-400'}`}>{item}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
              {form.checklist.length} / {DEFAULT_CHECKLIST.length} tasks selected
            </p>
          </div>

          {/* Info notice for non-admin/manager */}
          {!canAssignMaintenance && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 font-medium">
                Assigning from maintenance requests is restricted to Admin and Manager roles.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AssignTask;
