import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, Wrench, AlertTriangle, CheckCircle2,
  Clock, Plus, X, Eye, ChevronLeft, ChevronRight,
  RefreshCw, Filter, BedDouble, User, Calendar,
  FileText, ArrowLeft, Upload, AlertCircle, Loader2,
} from 'lucide-react';

import DashboardLayout from '../../components/templates/DashboardLayout';
import Badge           from '../../components/atoms/Badge';
import { useRole }     from '../../hooks/useRole';
import { ISSUE_CATEGORIES, MR_STATUSES, MR_PRIORITIES } from '../../data/maintenance';
import { getMaintenanceRequests, createMaintenance } from '../../utils/api';


const USER_NAMES = {
  admin: 'Admin User', manager: 'Alex Sterling',
  receptionist: 'Sarah Mitchell', housekeeper: 'Sarah Jenkins',
};
const USER_ROLES = {
  admin: 'Super Administrator', manager: 'General Manager',
  receptionist: 'Front Desk Lead', housekeeper: 'Senior Housekeeper',
};

const STATUS_VARIANT = {
  Open: 'red', 'In Progress': 'amber', Resolved: 'green', Closed: 'gray',
};
const PRIORITY_CONFIG = {
  High:   { cls: 'bg-red-100 text-red-700',    dot: 'bg-red-500'    },
  Medium: { cls: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500'  },
  Low:    { cls: 'bg-green-100 text-green-700', dot: 'bg-green-500'  },
};

const ITEMS_PER_PAGE = 6;
const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-50 transition-all placeholder-gray-300 bg-white";


const StatCard = ({ icon, iconBg, label, value, valueColor = 'text-gray-900', badge, badgeCls }) => (
  <div className="card p-4 flex flex-col gap-1.5 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      {badge && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeCls}`}>{badge}</span>
      )}
    </div>
    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">{label}</p>
    <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
  </div>
);


const PriorityBadge = ({ priority }) => {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Low;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-md ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {priority}
    </span>
  );
};


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


const DetailPanel = ({ req, onClose }) => {
  const reqId = `MR-${String(req.id).padStart(3, '0')}`;
  return (
  <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/30 backdrop-blur-sm"
    onClick={onClose}>
    <div
      className="h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
     
      <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
        <div>
          <p className="text-xs text-gray-400 font-medium">{reqId}</p>
          <h3 className="text-base font-bold text-gray-900">{req.category}</h3>
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-5">
       
        <div className="flex items-center gap-2">
          <Badge variant={STATUS_VARIANT[req.status] || 'gray'} dot>{req.status}</Badge>
          <PriorityBadge priority={req.priority} />
        </div>

        
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Room Information</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Room Number', value: `Room ${req.room?.number || ''}` },
              { label: 'Room Type',   value: req.room?.type || '' },
              { label: 'Floor',       value: req.room?.floor ? `Floor ${req.room.floor}` : '' },
              { label: 'Category',    value: req.category },
            ].map((r) => (
              <div key={r.label}>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{r.label}</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{r.value}</p>
              </div>
            ))}
          </div>
        </div>

       
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Description</p>
          <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-3">{req.description}</p>
        </div>

       
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Reported By',   value: req.reportedBy },
            { label: 'Date Reported', value: req.reportedDate },
            { label: 'Time',          value: req.reportedTime },
            { label: 'Assigned To',   value: req.assignedTo || 'Unassigned' },
          ].map((r) => (
            <div key={r.label}>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{r.label}</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{r.value}</p>
            </div>
          ))}
        </div>

        
        {req.resolutionNotes && (
          <div className="bg-green-50 border border-green-100 rounded-xl p-4">
            <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-2">Resolution Notes</p>
            <p className="text-sm text-green-800">{req.resolutionNotes}</p>
            {req.resolvedDate && (
              <p className="text-[11px] text-green-600 mt-2 font-medium">Resolved on {req.resolvedDate}</p>
            )}
          </div>
        )}

      
        {req.status !== 'Resolved' && req.status !== 'Closed' && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 font-medium">
              This request is currently <strong>{req.status}</strong>.
              {req.assignedTo === 'Unassigned' ? ' No technician assigned yet.' : ` Assigned to ${req.assignedTo}.`}
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
  );
};


const ReportIssueModal = ({ onClose, onSubmit }) => {
  const [form, setForm] = useState({
    room: '', category: ISSUE_CATEGORIES[0], priority: 'Medium', description: '',
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
              <Wrench className="w-4 h-4 text-orange-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Report New Issue</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Room Number <span className="text-red-500">*</span>
              </label>
              <input
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
                placeholder="e.g. 205"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Issue Category <span className="text-red-500">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={inputCls}
              >
                {ISSUE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

        
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Priority <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {['High', 'Medium', 'Low'].map((p) => {
                const cfg = PRIORITY_CONFIG[p];
                const active = form.priority === p;
                return (
                  <button
                    key={p}
                    onClick={() => setForm({ ...form, priority: p })}
                    className={[
                      'flex-1 py-2 rounded-xl text-xs font-bold border transition-all',
                      active ? cfg.cls + ' border-current' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300',
                    ].join(' ')}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

         
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              placeholder="Describe the issue in detail — what is wrong, when it started, how severe it is…"
              className={`${inputCls} resize-none`}
            />
          </div>

          
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center gap-1.5 hover:border-gray-300 transition-colors cursor-pointer text-center">
            <Upload className="w-5 h-5 text-gray-400" />
            <p className="text-xs font-medium text-gray-500">Upload Photo <span className="text-gray-400 font-normal">(optional)</span></p>
            <p className="text-[10px] text-gray-400">PNG, JPG up to 5MB</p>
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              id="submit-issue-btn"
              onClick={() => {
                if (!form.room || !form.description) { alert('Please fill in all required fields.'); return; }
                onSubmit(form);
              }}
              className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Wrench className="w-4 h-4" />
              Submit Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
const MaintenancePage = () => {
  const role = useRole();

  const [requests,       setRequests]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState('');
  const [search,         setSearch]         = useState('');
  const [statusFilter,   setStatusFilter]   = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [currentPage,    setCurrentPage]    = useState(1);
  const [selectedReq,    setSelectedReq]    = useState(null);
  const [showForm,       setShowForm]       = useState(false);
  const [submitted,      setSubmitted]      = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = () => {
    getMaintenanceRequests()
      .then(data => setRequests(data))
      .catch(() => setError('Failed to load maintenance requests.'))
      .finally(() => setLoading(false));
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return requests.filter((r) => {
      const roomNum = r.room?.number || '';
      const reqId = `MR-${String(r.id).padStart(3, '0')}`;
      if (q && !(reqId.toLowerCase().includes(q) || roomNum.includes(q) || r.category?.toLowerCase().includes(q))) return false;
      if (statusFilter   !== 'All' && r.status   !== statusFilter)   return false;
      if (priorityFilter !== 'All' && r.priority !== priorityFilter) return false;
      return true;
    });
  }, [requests, search, statusFilter, priorityFilter]);

  const MAINTENANCE_STATS = {
    open: requests.filter(r => r.status === 'Open').length,
    inProgress: requests.filter(r => r.status === 'In Progress').length,
    resolved: requests.filter(r => r.status === 'Resolved' || r.status === 'Closed').length,
    highPriority: requests.filter(r => r.priority === 'High' && r.status !== 'Resolved' && r.status !== 'Closed').length,
  };

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const resetFilters = () => { setSearch(''); setStatusFilter('All'); setPriorityFilter('All'); setCurrentPage(1); };

  const handleReportIssue = async (form) => {
    setLoading(true);
    try {
      await createMaintenance({
        room: { number: form.room },
        category: form.category,
        priority: form.priority,
        description: form.description,
        reportedBy: USER_NAMES[role] || 'Staff',
        reportedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        reportedTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      });
      setSubmitted(true);
      setShowForm(false);
      fetchRequests();
    } catch (e) {
      alert('Failed to report issue: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <DashboardLayout role={role} userName={USER_NAMES[role]} userRole={USER_ROLES[role]}>
      <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin" /> Loading requests...
      </div>
    </DashboardLayout>
  );

  if (error) return (
    <DashboardLayout role={role} userName={USER_NAMES[role]} userRole={USER_ROLES[role]}>
      <div className="flex items-center justify-center h-64 text-red-500 text-sm">{error}</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout
      role={role}
      userName={USER_NAMES[role]}
      userRole={USER_ROLES[role]}
      notificationCount={3}
      searchPlaceholder="Search rooms or issues..."
    >
      
      <p className="text-xs text-gray-400 mb-1">
        Dashboard &rsaquo; <span className="text-gray-600 font-medium">Maintenance Requests</span>
      </p>

      
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Requests</h1>
          <p className="text-xs text-gray-400 mt-0.5">Track and manage room maintenance issues</p>
        </div>
        <button
          id="report-issue-btn"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Report Issue
        </button>
      </div>

      
      {submitted && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4 text-sm text-green-700 font-medium">
          <CheckCircle2 className="w-4 h-4" />
          Maintenance request submitted successfully! The team has been notified.
          <button onClick={() => setSubmitted(false)} className="ml-auto text-green-600 hover:text-green-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatCard icon={<Wrench className="w-4 h-4 text-orange-600" />}    iconBg="bg-orange-100" label="Open Requests"  value={MAINTENANCE_STATS.open}        valueColor="text-orange-700" badge="Pending" badgeCls="bg-orange-100 text-orange-700" />
        <StatCard icon={<Clock className="w-4 h-4 text-blue-600" />}       iconBg="bg-blue-100"   label="In Progress"    value={MAINTENANCE_STATS.inProgress}   valueColor="text-blue-700"   badge="Active"  badgeCls="bg-blue-100 text-blue-700" />
        <StatCard icon={<CheckCircle2 className="w-4 h-4 text-green-600" />} iconBg="bg-green-100" label="Completed"     value={MAINTENANCE_STATS.resolved}     valueColor="text-green-700" />
        <StatCard icon={<AlertTriangle className="w-4 h-4 text-red-500" />}  iconBg="bg-red-100"  label="High Priority"  value={MAINTENANCE_STATS.highPriority} valueColor="text-red-600"   badge="Urgent" badgeCls="bg-red-100 text-red-700" />
      </div>

      
      <div className="card p-3 mb-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white flex-1 min-w-[220px] focus-within:border-orange-400 transition-colors">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            id="maintenance-search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search by Room Number or Issue ID…"
            className="text-xs text-gray-700 bg-transparent outline-none w-full placeholder-gray-400"
          />
          {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-gray-400" /></button>}
        </div>
        <FilterSelect label="Status: "   value={statusFilter}   onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}   options={MR_STATUSES} />
        <FilterSelect label="Priority: " value={priorityFilter} onChange={(v) => { setPriorityFilter(v); setCurrentPage(1); }} options={MR_PRIORITIES} />
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
              {['Request ID', 'Room', 'Issue Category', 'Priority', 'Status', 'Reported By', 'Date', 'Actions'].map((h) => (
                <th key={h} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400 text-sm">
                  No maintenance requests match your filters.
                </td>
              </tr>
            ) : paginated.map((req) => {
              const reqId = `MR-${String(req.id).padStart(3, '0')}`;
              return (
              <tr
                key={req.id}
                className="border-b border-gray-50 hover:bg-slate-50/70 transition-colors cursor-pointer"
                onClick={() => setSelectedReq(req)}
              >
                <td className="px-4 py-3 align-middle">
                  <span className="font-bold text-orange-700 text-sm">{reqId}</span>
                </td>
                <td className="px-4 py-3 align-middle">
                  <div className="flex items-center gap-2">
                    <span className="w-9 h-9 rounded-xl bg-navy-900 text-white text-sm font-bold flex items-center justify-center">{req.room?.number || '?'}</span>
                    <span className="text-[11px] text-gray-400">{req.room?.floor ? `Floor ${req.room.floor}` : ''}</span>
                  </div>
                </td>
                <td className="px-4 py-3 align-middle">
                  <span className="text-xs font-medium text-gray-800">{req.category}</span>
                </td>
                <td className="px-4 py-3 align-middle">
                  <PriorityBadge priority={req.priority} />
                </td>
                <td className="px-4 py-3 align-middle">
                  <Badge variant={STATUS_VARIANT[req.status] || 'gray'} dot size="sm">{req.status}</Badge>
                </td>
                <td className="px-4 py-3 align-middle">
                  <span className="text-xs text-gray-600">{req.reportedBy}</span>
                </td>
                <td className="px-4 py-3 align-middle">
                  <span className="text-xs text-gray-500">{req.reportedDate}</span>
                </td>
                <td className="px-4 py-3 align-middle" onClick={(e) => e.stopPropagation()}>
                  <button
                    id={`view-req-${req.id}`}
                    onClick={() => setSelectedReq(req)}
                    className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-navy-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>

        
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Showing <span className="font-semibold text-gray-700">{paginated.length}</span> of{' '}
            <span className="font-semibold text-gray-700">{filtered.length}</span> requests
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: Math.min(totalPages, 4) }, (_, i) => i + 1).map((p) => (
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

      
      {selectedReq && <DetailPanel req={selectedReq} onClose={() => setSelectedReq(null)} />}

      
      {showForm && (
        <ReportIssueModal
          onClose={() => setShowForm(false)}
          onSubmit={handleReportIssue}
        />
      )}
    </DashboardLayout>
  );
};

export default MaintenancePage;
