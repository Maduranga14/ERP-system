import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Pencil, Wrench, CheckCircle,
  History, Plus, ChevronRight, Loader2, Trash2, X, Save,
} from 'lucide-react';

import DashboardLayout from '../../components/templates/DashboardLayout';
import { useRole }     from '../../hooks/useRole';
import { canRoom, canEditStatus, canEditFull, STATUS_OPTIONS_FOR_ROLE } from '../../utils/roomPermissions';
import { STATUS_STYLE, AMENITY_ICONS, AMENITY_OPTIONS, BED_TYPES, FLOOR_LABELS, ROOM_STATUSES } from '../../data/rooms';
import { getRoomById, updateRoom, deleteRoom, updateRoomStatus, getHousekeepingTasks } from '../../utils/api';

/* ─── helpers ───────────────────────────────────────────── */
const inputCls = 'w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gold-400 bg-white';

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

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

const userNames = { admin:'Admin User', manager:'James Miller', receptionist:'Sarah Mitchell', housekeeper:'Sarah' };
const userRoles = { admin:'Super Administrator', manager:'General Manager', receptionist:'Front Desk Lead', housekeeper:'Supervisor' };

const FLOOR_MAP = { 'Ground Floor':0, '1st Floor':1, '2nd Floor':2, '3rd Floor':3, '4th Floor':4, '5th Floor':5 };
const FLOOR_LABEL_MAP = Object.fromEntries(Object.entries(FLOOR_MAP).map(([k,v])=>[v,k]));

/* ─── Edit Modal ─────────────────────────────────────────── */
const EditModal = ({ room, onClose, onSaved }) => {
  const [form, setForm] = useState({
    number:        room.number,
    type:          room.type,
    floor:         FLOOR_LABEL_MAP[room.floor] || '1st Floor',
    capacity:      String(room.capacity),
    pricePerNight: String(room.pricePerNight),
    bedType:       room.bedType || 'King Size',
    status:        room.status,
    viewType:      room.viewType || '',
    wing:          room.wing || '',
    description:   room.description || '',
  });
  const [amenities, setAmenities] = useState(room.amenities || []);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  const toggleAmenity = (a) =>
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

  const ROOM_TYPES = ['Standard King','Deluxe Ocean View','Deluxe Suite','Deluxe Sea View Suite','Presidential Suite','Executive Suite','Deluxe Twin'];

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...room,
        number:        form.number,
        type:          form.type,
        floor:         FLOOR_MAP[form.floor] ?? 1,
        capacity:      parseInt(form.capacity, 10),
        pricePerNight: parseFloat(form.pricePerNight),
        bedType:       form.bedType,
        status:        form.status,
        viewType:      form.viewType,
        wing:          form.wing,
        description:   form.description,
        amenities,
      };
      const updated = await updateRoom(room.id, payload);
      onSaved(updated);
    } catch {
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Edit Room {room.number}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Update room details and save changes to the database.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-6 flex flex-col gap-5">

          {/* Basic Information */}
          <div className="border border-gray-100 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
              <span>ℹ️</span>
              <h3 className="text-sm font-bold text-gray-900">Basic Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Room Number">
                <input className={inputCls} value={form.number} onChange={set('number')} />
              </Field>
              <Field label="Room Type">
                <select className={inputCls} value={form.type} onChange={set('type')}>
                  {ROOM_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Floor">
                <select className={inputCls} value={form.floor} onChange={set('floor')}>
                  {FLOOR_LABELS.map(f => <option key={f}>{f}</option>)}
                </select>
              </Field>
              <Field label="Price Per Night (USD)">
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-gold-400">
                  <span className="px-3 py-2.5 text-sm text-gray-400 bg-gray-50 border-r border-gray-200">$</span>
                  <input className="flex-1 px-3 py-2.5 text-sm text-gray-800 outline-none bg-white"
                    type="number" step="0.01" value={form.pricePerNight} onChange={set('pricePerNight')} />
                </div>
              </Field>
              <Field label="Capacity">
                <input className={inputCls} type="number" value={form.capacity} onChange={set('capacity')} />
              </Field>
              <Field label="Bed Type">
                <select className={inputCls} value={form.bedType} onChange={set('bedType')}>
                  {BED_TYPES.map(b => <option key={b}>{b}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select className={inputCls} value={form.status} onChange={set('status')}>
                  {ROOM_STATUSES.filter(s => s !== 'All Status').map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="View Type">
                <input className={inputCls} placeholder="e.g. Ocean Front" value={form.viewType} onChange={set('viewType')} />
              </Field>
              <Field label="Wing">
                <input className={inputCls} placeholder="e.g. East Wing" value={form.wing} onChange={set('wing')} />
              </Field>
              <Field label="Description">
                <textarea className={`${inputCls} resize-none h-20 col-span-2`} value={form.description} onChange={set('description')} />
              </Field>
            </div>
          </div>

          {/* Amenities */}
          <div className="border border-gray-100 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
              <span>⭐</span>
              <h3 className="text-sm font-bold text-gray-900">Amenities &amp; Services</h3>
            </div>
            <div className="grid grid-cols-4 gap-y-4 gap-x-3">
              {AMENITY_OPTIONS.map(a => (
                <label key={a} className="flex items-center gap-2.5 cursor-pointer group">
                  <div
                    onClick={() => toggleAmenity(a)}
                    className={[
                      'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer',
                      amenities.includes(a)
                        ? 'bg-navy-900 border-navy-900'
                        : 'border-gray-300 group-hover:border-gold-400',
                    ].join(' ')}
                  >
                    {amenities.includes(a) && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm text-gray-700 select-none">{a}</span>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose}
            className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-navy-900 hover:bg-navy-800 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Delete Confirm Modal ───────────────────────────────── */
const DeleteConfirm = ({ room, onClose, onDeleted }) => {
  const [deleting, setDeleting] = useState(false);
  const [error,    setError]    = useState('');

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteRoom(room.id);
      onDeleted();
    } catch {
      setError('Failed to delete room. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 className="w-7 h-7 text-red-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Delete Room {room.number}?</h2>
            <p className="text-sm text-gray-500">This will permanently remove the room from the database. This action cannot be undone.</p>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3 w-full">
            <button onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleDelete} disabled={deleting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors">
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────── */
const RoomDetail = () => {
  const navigate = useNavigate();
  const { id }   = useParams();
  const role     = useRole();
  const basePath = `/${role}`;

  const [room,            setRoom]            = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState('');
  const [status,          setStatus]          = useState('');
  const [showEdit,        setShowEdit]        = useState(false);
  const [showDelete,      setShowDelete]      = useState(false);
  const [cleaningRecords, setCleaningRecords] = useState([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getRoomById(id),
      getHousekeepingTasks()
    ])
      .then(([roomData, tasksData]) => {
        setRoom(roomData);
        setStatus(roomData.status);

        const roomTasks = tasksData.filter(t => t.room?.id === Number(id) && t.status === 'Completed');
        const mapped = roomTasks.map(t => {
          let recDate = new Date().toISOString().split('T')[0];
          if (t.assignedTime && t.assignedTime.includes('-')) {
            recDate = t.assignedTime.split(' ')[0];
          }
          return {
            id: t.id,
            date: recDate,
            startTime: t.assignedTime || '09:00 AM',
            endTime: t.dueTime || '10:00 AM',
            staff: t.housekeeper?.fullName || 'Unassigned',
            notes: t.notes || '',
            checklist: t.checklist || []
          };
        });
        setCleaningRecords(mapped);
      })
      .catch(() => setError('Room not found or backend is unavailable.'))
      .finally(() => setLoading(false));
  }, [id]);

  const statusOptions = STATUS_OPTIONS_FOR_ROLE(role);

  const handleStatusChange = async (newStatus) => {
    if (!room) return;
    try {
      setStatus(newStatus);
      await updateRoomStatus(room.id, newStatus);
    } catch (err) {
      console.error(err);
      alert(`Failed to update status: ${err.message || err}`);
      setStatus(room.status);
    }
  };

  if (loading) return (
    <DashboardLayout role={role} userName={userNames[role]} userRole={userRoles[role]}>
      <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin" /> Loading room...
      </div>
    </DashboardLayout>
  );

  if (error || !room) return (
    <DashboardLayout role={role} userName={userNames[role]} userRole={userRoles[role]}>
      <div className="flex items-center justify-center h-64 text-red-500 text-sm">
        {error || 'Room not found.'}
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout role={role} userName={userNames[role]} userRole={userRoles[role]} notificationCount={4}
      searchPlaceholder="Search rooms, guests, or staff...">

      {/* Edit Modal */}
      {showEdit && (
        <EditModal
          room={room}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => { setRoom(updated); setStatus(updated.status); setShowEdit(false); }}
        />
      )}

      {/* Delete Confirm */}
      {showDelete && (
        <DeleteConfirm
          room={room}
          onClose={() => setShowDelete(false)}
          onDeleted={() => navigate(`${basePath}/rooms`)}
        />
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
        <span className="hover:text-navy-700 cursor-pointer" onClick={() => navigate(basePath)}>Dashboard</span>
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
          {statusOptions.length > 0 && (
            <select value={status} onChange={(e) => handleStatusChange(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 text-gray-700 bg-white outline-none focus:ring-2 focus:ring-gold-400 cursor-pointer">
              {statusOptions.map(s => <option key={s}>{s}</option>)}
            </select>
          )}
          {canEditFull(role) && (
            <button onClick={() => setShowEdit(true)}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Pencil className="w-4 h-4" /> Edit Room
            </button>
          )}
          {canEditStatus(role) && (
            <button onClick={() => handleStatusChange('Cleaning')}
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
        {/* LEFT */}
        <div className="xl:col-span-3 flex flex-col gap-5">
          <div className="card overflow-hidden">
            <div className="relative h-64 bg-gray-200 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />
              <img
                src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&auto=format&fit=crop"
                alt={`Room ${room.number}`}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
              />
              <div className="absolute inset-0 bg-gray-100 hidden items-center justify-center text-6xl">🏨</div>
              <div className="absolute bottom-4 left-4 z-20 flex gap-2">
                <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full font-medium">
                  {room.type}
                </span>
                {room.viewType && (
                  <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full font-medium">
                    {room.viewType}
                  </span>
                )}
              </div>
            </div>

            <div className="p-5 border-b border-gray-100">
              <div className="grid grid-cols-4 gap-4">
                <InfoChip label="Floor"    value={`Floor ${room.floor}`} />
                <InfoChip label="Capacity" value={`${room.capacity} Persons`} />
                <InfoChip label="Bed Type" value={room.bedType} />
                <InfoChip label="Rate"     value={<span className="text-gold-600 text-lg">${room.pricePerNight}<span className="text-xs text-gray-400 font-normal">/night</span></span>} />
              </div>
            </div>

            {room.description && (
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-2">Description</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{room.description}</p>
              </div>
            )}

            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">In-Room Amenities</h3>
              </div>
              {(room.amenities || []).length > 0 ? (
                <div className="grid grid-cols-4 gap-3">
                  {room.amenities.map(a => (
                    <div key={a} className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-xl text-center">
                      <span className="text-2xl">{AMENITY_ICONS[a] || '⭐'}</span>
                      <span className="text-[11px] text-gray-600 font-medium leading-tight">{a}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No amenities listed.</p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="xl:col-span-2 flex flex-col gap-4">

          {/* Current Reservation */}
          <div className="rounded-xl bg-navy-900 text-white p-5">
            <h3 className="text-sm font-bold mb-4">Current Reservation</h3>
            <div className="flex flex-col items-center py-6 text-center">
              <span className="text-4xl mb-3">🛏</span>
              <p className="text-white/70 text-sm">No active reservation</p>
              <p className="text-white/40 text-xs mt-1">Room is {status.toLowerCase()}</p>
            </div>
          </div>

          {/* Cleaning History */}
          {canRoom(role, 'viewMaintenance') && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">Cleaning History</h3>
                <History className="w-4 h-4 text-gray-400" />
              </div>
              {cleaningRecords.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cleaningRecords.map(rec => (
                    <div key={rec.id} className="flex justify-between items-start border-b border-gray-100 pb-2 text-xs">
                      <div>
                        <p className="font-semibold text-gray-800">{rec.date} • {rec.startTime} - {rec.endTime}</p>
                        <p className="text-gray-500">By: {rec.staff}</p>
                        {rec.notes && <p className="text-amber-600 italic">"{rec.notes}"</p>}
                      </div>
                      <span className="bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded font-bold">
                        {rec.checklist.filter(c => c.done).length}/{rec.checklist.length} Done
                      </span>
                    </div>
                  ))}
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
              <p className="text-xs text-gray-400 text-center py-4">No maintenance records.</p>
            </div>
          )}

          {/* Delete — admin only */}
          <button onClick={() => setShowDelete(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
            <Trash2 className="w-4 h-4" /> Delete Room
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RoomDetail;
