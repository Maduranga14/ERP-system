import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, BedDouble, User, Clock, AlignLeft,
  Save, X, CheckSquare, AlertTriangle, Loader2
} from 'lucide-react';

import DashboardLayout     from '../../components/templates/DashboardLayout';
import Avatar              from '../../components/atoms/Avatar';
import { useRole }         from '../../hooks/useRole';
import { canHousekeeping } from '../../utils/permissions';
import { getRooms, getEmployees, createHousekeepingTask } from '../../utils/api';


const userNames = {
  admin: 'Admin User', manager: 'Alex Sterling',
  receptionist: 'Sarah Mitchell', housekeeper: 'Sarah Jenkins',
};
const userRoles = {
  admin: 'Super Administrator', manager: 'General Manager',
  receptionist: 'Front Desk Lead', housekeeper: 'Senior Housekeeper',
};

const ROOM_TYPES  = ['Standard', 'Deluxe', 'Suite', 'Penthouse', 'Executive'];
const FLOORS      = ['Floor 1', 'Floor 2', 'Floor 3', 'Floor 4', 'Floor 5'];
const PRIORITIES  = ['High', 'Medium', 'Low'];
const ROOMS       = ['101','102','103','112','201','205','214','308','319','402','428','501','515'];

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


const AssignTask = () => {
  const navigate = useNavigate();
  const role     = useRole();
  const basePath = `/${role}`;

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

  const [rooms,   setRooms]   = useState([]);
  const [staff,   setStaff]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    room:       '',
    roomType:   'Standard',
    floor:      'Floor 1',
    staffId:    '',
    priority:   'High',
    dueTime:    '',
    notes:      '',
    checklist:  [...DEFAULT_CHECKLIST],
  });
  const [errors,  setErrors]  = useState({});
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    Promise.all([getRooms(), getEmployees()])
      .then(([roomsData, employeesData]) => {
        setRooms(roomsData);
        const housekeepers = employeesData.filter(e => e.systemRole === 'housekeeper');
        setStaff(housekeepers);
        if (housekeepers.length > 0) {
          setForm(f => ({ ...f, staffId: String(housekeepers[0].id) }));
        }
      })
      .catch(err => {
        console.error(err);
        setErrors({ general: 'Failed to load rooms or staff details.' });
      })
      .finally(() => setLoading(false));
  }, []);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  };

  const toggleChecklist = (item) => {
    setForm((f) => ({
      ...f,
      checklist: f.checklist.includes(item)
        ? f.checklist.filter((c) => c !== item)
        : [...f.checklist, item],
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.room)    e.room    = 'Please select a room';
    if (!form.dueTime) e.dueTime = 'Due time is required';
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    const roomObj = rooms.find(r => r.number === form.room);
    const housekeeperObj = staff.find(s => s.id === Number(form.staffId));

    if (!roomObj) {
      setErrors({ room: 'Selected room not found.' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        room: roomObj,
        housekeeper: housekeeperObj || null,
        priority: form.priority,
        status: 'Pending',
        dueTime: form.dueTime,
        assignedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        notes: form.notes,
        checklist: form.checklist.map(label => ({ label, done: false }))
      };

      await createHousekeepingTask(payload);
      alert(`Task successfully assigned to ${housekeeperObj?.fullName || 'staff'} for Room ${form.room}!`);
      navigate(`${basePath}/housekeeping`);
    } catch (err) {
      console.error(err);
      alert(`Failed to save task: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  const selectedStaff = staff.find((s) => s.id === Number(form.staffId));

  const PRIORITY_STYLES = {
    High:   { dot: 'bg-red-500',    border: 'border-red-300',    bg: 'bg-red-50',    text: 'text-red-700'   },
    Medium: { dot: 'bg-amber-500',  border: 'border-amber-300',  bg: 'bg-amber-50',  text: 'text-amber-700' },
    Low:    { dot: 'bg-green-500',  border: 'border-green-300',  bg: 'bg-green-50',  text: 'text-green-700' },
  };

  if (loading) {
    return (
      <DashboardLayout role={role} userName={userNames[role]} userRole={userRoles[role]}>
        <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" /> Loading rooms and staff list...
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
            <p className="text-xs text-gray-400 mt-0.5">Create and assign a housekeeping task to staff</p>
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
            <Save className="w-4 h-4" />
            {saving ? 'Assigning…' : 'Assign Task'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        
        <div className="lg:col-span-2 flex flex-col gap-4">

          
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <BedDouble className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-bold text-gray-800">Room Details</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Room Number" required icon={<BedDouble className="w-3 h-3" />}>
                <select
                  value={form.room}
                  onChange={(e) => {
                    const r = rooms.find(room => room.number === e.target.value);
                    setForm(f => ({
                      ...f,
                      room: e.target.value,
                      roomType: r ? r.type : 'Standard',
                      floor: r ? `Floor ${r.floor}` : 'Floor 1'
                    }));
                    if (errors.room) setErrors(e => ({ ...e, room: '' }));
                  }}
                  className={`${inputCls} ${errors.room ? 'border-red-400' : ''}`}
                >
                  <option value="">Select room…</option>
                  {rooms.map((r) => <option key={r.id} value={r.number}>{r.number}</option>)}
                </select>
                {errors.room && <p className="text-red-500 text-xs mt-1">{errors.room}</p>}
              </FormField>
              <FormField label="Room Type">
                <input value={form.roomType} disabled className={`${inputCls} bg-gray-50 text-gray-500`} />
              </FormField>
              <FormField label="Floor">
                <input value={form.floor} disabled className={`${inputCls} bg-gray-50 text-gray-500`} />
              </FormField>
            </div>
          </div>

          
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-bold text-gray-800">Staff Assignment</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <FormField label="Assign To" required>
                <select
                  value={form.staffId}
                  onChange={(e) => set('staffId', e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select staff…</option>
                  {staff.map((s) => (
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

        
        <div className="flex flex-col gap-4">

          
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

          
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckSquare className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-bold text-gray-800">Cleaning Checklist</h3>
            </div>
            <p className="text-xs text-gray-400 mb-3">Select tasks to include for this assignment</p>
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
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AssignTask;
