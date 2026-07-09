import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, RefreshCw, Eye, UserCog, Users,
  UserCheck, UserX, ChevronLeft, ChevronRight,
  Filter, Briefcase, Clock, ShieldCheck, Loader2,
} from 'lucide-react';

import DashboardLayout   from '../../components/templates/DashboardLayout';
import Badge             from '../../components/atoms/Badge';
import Avatar            from '../../components/atoms/Avatar';
import { useRole }       from '../../hooks/useRole';
import { canEmployee }   from '../../utils/employeePermissions';
import { DEPARTMENTS, EMP_STATUSES } from '../../data/employees';
import { getEmployees }  from '../../utils/api';


const STATUS_VARIANT = {
  Active:    'green',
  'On Leave':'amber',
  Inactive:  'gray',
  Probation: 'blue',
};
const ACCOUNT_VARIANT = { Active: 'green', Disabled: 'red' };

const ITEMS_PER_PAGE = 8;

const userNames = {
  admin: 'Admin User', manager: 'Alex Sterling', receptionist: 'Sarah Mitchell',
};
const userRoles = {
  admin: 'Super Administrator', manager: 'General Manager', receptionist: 'Front Desk Lead',
};


const StatCard = ({ icon, iconBg, label, value, badge, badgeVariant = 'green', sub }) => (
  <div className="card p-4 flex flex-col gap-1.5 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      {badge && (
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
          ${badgeVariant === 'green'  ? 'bg-green-100 text-green-700'   : ''}
          ${badgeVariant === 'blue'   ? 'bg-blue-100 text-blue-700'     : ''}
          ${badgeVariant === 'amber'  ? 'bg-amber-100 text-amber-700'   : ''}
          ${badgeVariant === 'red'    ? 'bg-red-100 text-red-700'       : ''}
        `}>{badge}</span>
      )}
    </div>
    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">{label}</p>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    {sub && <p className="text-[11px] font-medium text-gray-400">{sub}</p>}
  </div>
);


const FilterSelect = ({ icon, label, value, onChange, options }) => (
  <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2 bg-white hover:border-gray-300 transition-colors">
    {icon && <span className="text-gray-400">{icon}</span>}
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


const EmployeeList = () => {
  const navigate  = useNavigate();
  const role      = useRole();
  const basePath  = `/${role}`;

  const [employees,    setEmployees]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [search,       setSearch]      = useState('');
  const [deptFilter,   setDeptFilter]  = useState('All');
  const [statusFilter, setStatusFilter]= useState('All');
  const [currentPage,  setCurrentPage] = useState(1);

  useEffect(() => {
    getEmployees()
      .then(data => setEmployees(data))
      .catch(() => setError('Failed to load employees.'))
      .finally(() => setLoading(false));
  }, []);

 
  const filtered = useMemo(() => {
    return employees.filter((e) => {
      const q = search.toLowerCase();
      if (q && !(
        e.fullName?.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q) ||
        String(e.id).includes(q) ||
        e.role?.name?.toLowerCase().includes(q)
      )) return false;
      return true;
    });
  }, [employees, search, deptFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const resetFilters = () => {
    setSearch(''); setDeptFilter('All'); setStatusFilter('All'); setCurrentPage(1);
  };

  if (loading) return (
    <DashboardLayout role={role} userName={userNames[role]} userRole={userRoles[role]}>
      <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin" /> Loading employees...
      </div>
    </DashboardLayout>
  );

  if (error) return (
    <DashboardLayout role={role} userName={userNames[role]} userRole={userRoles[role]}>
      <div className="flex items-center justify-center h-64 text-red-500 text-sm">{error}</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout
      role={role}
      userName={userNames[role]}
      userRole={userRoles[role]}
      notificationCount={3}
      searchPlaceholder="Search employees, roles or ID..."
    >
     
      <p className="text-xs text-gray-400 mb-1">
        Dashboard &rsaquo; <span className="text-gray-600 font-medium">Employees</span>
      </p>

      
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
        {canEmployee(role, 'create') && (
          <button
            id="add-employee-btn"
            onClick={() => navigate(`${basePath}/employees/new`)}
            className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Employee
          </button>
        )}
      </div>

      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatCard
          icon={<Users className="w-4 h-4 text-white" />}
          iconBg="bg-navy-900"
          label="Total Employees"
          value={employees.length}
          badge="Hotel Staff"
          badgeVariant="blue"
        />
        <StatCard
          icon={<UserCheck className="w-4 h-4 text-green-600" />}
          iconBg="bg-green-100"
          label="Active Now"
          value={employees.filter(e=>e.enabled).length}
          sub="● On Duty"
        />
        <StatCard
          icon={<Clock className="w-4 h-4 text-amber-600" />}
          iconBg="bg-amber-100"
          label="On Leave"
          value={0}
          badge="Leave"
          badgeVariant="amber"
        />
        <StatCard
          icon={<UserCog className="w-4 h-4 text-blue-600" />}
          iconBg="bg-blue-100"
          label="System Roles"
          value={[...new Set(employees.map(e=>e.role))].length}
          badge="Roles"
          badgeVariant="green"
        />
      </div>

      
      <div className="card p-3 mb-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
         
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white flex-1 min-w-[220px] focus-within:border-navy-400 transition-colors">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              id="employee-search"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search by Name, ID, Role or Email..."
              className="text-xs text-gray-700 bg-transparent outline-none w-full placeholder-gray-400"
            />
          </div>

          <FilterSelect
            icon={<Filter className="w-3 h-3" />}
            label="Department"
            value={deptFilter}
            onChange={(v) => { setDeptFilter(v); setCurrentPage(1); }}
            options={DEPARTMENTS}
          />
          <FilterSelect
            icon={<ShieldCheck className="w-3 h-3" />}
            label="Status"
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
            options={EMP_STATUSES}
          />
          <button
            onClick={resetFilters}
            className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-400 hover:text-gray-600"
            title="Reset filters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {['Employee ID', 'Name', 'Department', 'Role', 'Shift', 'Status', 'Account', 'Actions'].map((h) => (
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
                <td colSpan={8} className="text-center py-12 text-gray-400 text-sm">
                  No employees match your filters.
                </td>
              </tr>
            ) : paginated.map((emp) => (
              <tr
                key={emp.id}
                className="border-b border-gray-50 hover:bg-slate-50/70 transition-colors cursor-pointer"
                onClick={() => navigate(`${basePath}/employees/${emp.id}`)}
              >
                
                <td className="px-4 py-3 align-middle">
                  <span className="font-bold text-navy-900 text-sm">EMP-{String(emp.id).padStart(3,'0')}</span>
                </td>

                
                <td className="px-4 py-3 align-middle">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={emp.fullName || '?'} size="sm" />
                    <div>
                      <p className="font-semibold text-gray-800 text-xs leading-tight">{emp.fullName}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{emp.email}</p>
                    </div>
                  </div>
                </td>

                
                <td className="px-4 py-3 align-middle">
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-700">{emp.department || emp.role?.toLowerCase?.() || '—'}</span>
                  </div>
                </td>

                
                <td className="px-4 py-3 align-middle">
                  <span className="text-xs text-gray-700 capitalize">{emp.role?.toLowerCase?.() || '—'}</span>
                </td>

                
                <td className="px-4 py-3 align-middle">
                  <span className="text-[11px] text-gray-500">{emp.shift ? emp.shift.split(' ')[0] : '—'}</span>
                </td>

                
                <td className="px-4 py-3 align-middle">
                  <Badge variant={emp.enabled ? 'green' : 'gray'} dot size="sm">
                    {emp.enabled ? 'Active' : 'Inactive'}
                  </Badge>
                </td>

               
                <td className="px-4 py-3 align-middle">
                  <Badge variant={emp.enabled ? 'green' : 'red'} size="sm">
                    {emp.enabled ? 'Active' : 'Disabled'}
                  </Badge>
                </td>

                
                <td className="px-4 py-3 align-middle" onClick={(e) => e.stopPropagation()}>
                  <button
                    id={`view-emp-${emp.id}`}
                    onClick={() => navigate(`${basePath}/employees/${emp.id}`)}
                    className="flex items-center gap-1 text-xs font-medium text-navy-700 bg-navy-50 hover:bg-navy-100 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Showing{' '}
            <span className="font-semibold text-gray-700">
              {filtered.length === 0 ? 0 : Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–
              {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
            </span>{' '}
            of <span className="font-semibold text-gray-700">{filtered.length}</span> employees
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
                className={[
                  'w-7 h-7 rounded-lg text-xs font-semibold transition-colors',
                  currentPage === p
                    ? 'bg-navy-900 text-white'
                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50',
                ].join(' ')}
              >
                {p}
              </button>
            ))}
            {totalPages > 4 && (
              <>
                <span className="text-gray-400 text-xs px-1">…</span>
                <button className="w-7 h-7 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50">
                  {totalPages}
                </button>
              </>
            )}
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
    </DashboardLayout>
  );
};

export default EmployeeList;
