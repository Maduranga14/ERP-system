import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Phone, MapPin, Briefcase,
  Clock, Calendar, Monitor, Key, Save, X, Eye, EyeOff,
  ShieldCheck, Loader2, AlertCircle
} from 'lucide-react';

import DashboardLayout from '../../components/templates/DashboardLayout';
import { useRole }     from '../../hooks/useRole';
import { canEmployee } from '../../utils/employeePermissions';
import { getEmployeeById, updateEmployee } from '../../utils/api';
import {
  DEPARTMENTS, ROLES_BY_DEPT, SHIFTS, SYSTEM_ROLES,
} from '../../data/employees';


const userNames = {
  admin: 'Admin User', manager: 'Alex Sterling', receptionist: 'Sarah Mitchell',
};
const userRoles = {
  admin: 'Super Administrator', manager: 'General Manager', receptionist: 'Front Desk Lead',
};


const SectionHeader = ({ icon, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-9 h-9 rounded-xl bg-navy-50 flex items-center justify-center flex-shrink-0">
      <span className="text-navy-700">{icon}</span>
    </div>
    <div>
      <h3 className="text-sm font-bold text-gray-800">{title}</h3>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

const FormField = ({ label, icon, required, error, children }) => (
  <div>
    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
      {icon && <span className="text-gray-400">{icon}</span>}
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 transition-all placeholder-gray-400 bg-white disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed";
const errCls   = "border-red-400 focus:ring-red-100";


const EditEmployee = () => {
  const navigate = useNavigate();
  const { id }   = useParams();
  const role     = useRole();
  const basePath = `/${role}`;
  const isManager = role === 'manager';

 
  if (!canEmployee(role, 'edit')) {
    return (
      <DashboardLayout role={role} userName={userNames[role]} userRole={userRoles[role]}>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <p className="text-gray-500 font-medium">You don&apos;t have permission to edit employees.</p>
          <button onClick={() => navigate(-1)} className="text-sm text-navy-700 hover:underline">Go back</button>
        </div>
      </DashboardLayout>
    );
  }

  const [form, setForm] = useState({
    fullName:    '',
    phone:       '',
    email:       '',
    address:     '',
    department:  'Reception',
    empRole:     'Receptionist',
    shift:       SHIFTS[0],
    joinDate:    '',
    username:    '',
    password:    '',
    systemRole:  'none',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    getEmployeeById(id)
      .then((data) => {
        setForm({
          fullName:    data.fullName || '',
          phone:       data.phone || '',
          email:       data.email || '',
          address:     data.address || '',
          department:  data.department || 'Reception',
          empRole:     data.role || 'Receptionist', // maps backend role to empRole job title
          shift:       data.shift || SHIFTS[0],
          joinDate:    data.joinDate || '',
          username:    data.username || '',
          password:    '', 
          systemRole:  data.systemRole || 'none',
        });
        setError('');
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load employee details for editing.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const set = (field, value) => {
    setForm((f) => {
      const next = { ...f, [field]: value };
      // Auto-reset role when department changes
      if (field === 'department') {
        const roles = ROLES_BY_DEPT[value] || [];
        next.empRole = roles[0] || '';
      }
      return next;
    });
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    if (isManager) return {}; 
    const e = {};
    if (!form.fullName.trim())  e.fullName  = 'Full name is required';
    if (!form.phone.trim())     e.phone     = 'Phone number is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      e.email = 'Valid email is required';
    if (!form.department)       e.department = 'Department is required';
    if (!form.empRole)          e.empRole    = 'Role is required';
    if (!form.shift)            e.shift      = 'Shift is required';
    
    if (form.systemRole !== 'none') {
      if (!form.username.trim()) e.username = 'Username is required for system access';
      if (form.password && form.password.length < 8) e.password = 'Password must be at least 8 characters';
    }
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSaving(true);
    try {
      const payload = isManager ? {
        shift: form.shift 
      } : {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        address: form.address,
        department: form.department,
        role: form.empRole,
        shift: form.shift,
        joinDate: form.joinDate,
        username: form.username,
        systemRole: form.systemRole,
        password: form.password || null, // only send password if modified
        enabled: true
      };

      await updateEmployee(id, payload);
      alert(`Employee updated successfully.`);
      navigate(`${basePath}/employees/${id}`);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to update employee details.');
    } finally {
      setSaving(false);
    }
  };

  const availableRoles = ROLES_BY_DEPT[form.department] || [];

  if (loading) {
    return (
      <DashboardLayout role={role} userName={userNames[role]} userRole={userRoles[role]}>
        <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" /> Loading employee profile...
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role={role} userName={userNames[role]} userRole={userRoles[role]}>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <p className="text-red-500 font-medium">{error}</p>
          <button onClick={() => navigate(-1)} className="text-sm text-navy-700 hover:underline">Go back</button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role={role}
      userName={userNames[role]}
      userRole={userRoles[role]}
      notificationCount={3}
      searchPlaceholder="Search employees, roles or ID..."
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
            <h1 className="text-xl font-bold text-gray-900">Edit Employee Profile</h1>
            <p className="text-xs text-gray-400 mt-0.5">Modify details and update shift assignments</p>
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
            id="save-employee-btn"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      
      {isManager && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-700 font-medium">
            You are editing as a General Manager. You only have permission to change this employee's shift assignment. All other details are read-only.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        
        <div className="lg:col-span-2 flex flex-col gap-4">

          
          <div className="card p-5 bg-white">
            <SectionHeader
              icon={<User className="w-4 h-4" />}
              title="Personal Details"
              subtitle="Basic personal information of the employee"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <FormField label="Full Name" required icon={<User className="w-3 h-3" />} error={errors.fullName}>
                  <input
                    disabled={isManager}
                    value={form.fullName}
                    onChange={(e) => set('fullName', e.target.value)}
                    placeholder="e.g. John Silva"
                    className={`${inputCls} ${errors.fullName ? errCls : ''}`}
                  />
                </FormField>
              </div>
              <FormField label="Phone Number" required icon={<Phone className="w-3 h-3" />} error={errors.phone}>
                <input
                  disabled={isManager}
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="+94 71 234 5678"
                  className={`${inputCls} ${errors.phone ? errCls : ''}`}
                />
              </FormField>
              <FormField label="Email Address" required icon={<Mail className="w-3 h-3" />} error={errors.email}>
                <input
                  disabled={isManager}
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="name@hotelgrande.com"
                  className={`${inputCls} ${errors.email ? errCls : ''}`}
                />
              </FormField>
              <div className="sm:col-span-2">
                <FormField label="Address" icon={<MapPin className="w-3 h-3" />}>
                  <textarea
                    disabled={isManager}
                    value={form.address}
                    onChange={(e) => set('address', e.target.value)}
                    placeholder="Street, City, Province, Sri Lanka"
                    rows={2}
                    className={`${inputCls} resize-none`}
                  />
                </FormField>
              </div>
            </div>
          </div>

          <div className="card p-5 bg-white">
            <SectionHeader
              icon={<Briefcase className="w-4 h-4" />}
              title="Employment Details"
              subtitle="Job role, department and shift assignment"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Department" required icon={<Briefcase className="w-3 h-3" />} error={errors.department}>
                <select
                  disabled={isManager}
                  value={form.department}
                  onChange={(e) => set('department', e.target.value)}
                  className={`${inputCls} ${errors.department ? errCls : ''}`}
                >
                  {DEPARTMENTS.filter((d) => d !== 'All').map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Role / Position" required icon={<User className="w-3 h-3" />} error={errors.empRole}>
                <select
                  disabled={isManager}
                  value={form.empRole}
                  onChange={(e) => set('empRole', e.target.value)}
                  className={`${inputCls} ${errors.empRole ? errCls : ''}`}
                >
                  {availableRoles.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Shift" required icon={<Clock className="w-3 h-3" />} error={errors.shift}>
                <select
                  value={form.shift}
                  onChange={(e) => set('shift', e.target.value)}
                  className={`${inputCls} ${errors.shift ? errCls : ''}`}
                >
                  {SHIFTS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </FormField>

              <FormField label="Join Date" icon={<Calendar className="w-3 h-3" />}>
                <input
                  disabled={isManager}
                  type="date"
                  value={form.joinDate}
                  onChange={(e) => set('joinDate', e.target.value)}
                  className={inputCls}
                />
              </FormField>
            </div>
          </div>
        </div>


        <div className="flex flex-col gap-4">
          <div className="card p-5 border-2 border-slate-100 bg-white">
            <SectionHeader
              icon={<Monitor className="w-4 h-4" />}
              title="System Access"
              subtitle="Portal login credentials and role"
            />

            
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">System Role</p>
              <div className="flex flex-col gap-2">
                {[
                  { value: 'none',         label: 'No Access',    sub: 'Cannot log into system',       color: 'gray' },
                  { value: 'housekeeper',  label: 'Housekeeper',  sub: 'Cleaning tasks & room status',  color: 'green' },
                  { value: 'receptionist', label: 'Receptionist', sub: 'Front desk, billing, guests',   color: 'amber' },
                  { value: 'manager',      label: 'Manager',      sub: 'Reports, staff overview',        color: 'blue' },
                  { value: 'admin',        label: 'Administrator',sub: 'Full system access',             color: 'purple' },
                ].map(({ value, label, sub, color }) => {
                  const colorMap = {
                    gray:   { dot: 'bg-gray-400',   border: 'border-gray-300',   text: 'text-gray-700'   },
                    green:  { dot: 'bg-green-500',  border: 'border-green-300',  text: 'text-green-700'  },
                    amber:  { dot: 'bg-amber-500',  border: 'border-amber-300',  text: 'text-amber-700'  },
                    blue:   { dot: 'bg-blue-500',   border: 'border-blue-300',   text: 'text-blue-700'   },
                    purple: { dot: 'bg-purple-500', border: 'border-purple-300', text: 'text-purple-700' },
                  };
                  const s = colorMap[color];
                  const active = form.systemRole === value;
                  return (
                    <button
                      key={value}
                      disabled={isManager}
                      onClick={() => set('systemRole', value)}
                      className={[
                        'flex items-start gap-3 p-2.5 rounded-xl border text-left transition-all w-full disabled:opacity-75 disabled:cursor-not-allowed',
                        active ? `${s.border} bg-slate-50` : 'border-gray-100 hover:border-gray-200',
                      ].join(' ')}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${s.dot}`} />
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold ${active ? s.text : 'text-gray-700'}`}>{label}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
                      </div>
                      {active && (
                        <span className="ml-auto text-[10px] font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full self-center flex-shrink-0">
                          Selected
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            
            <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
              <FormField 
                label="Username" 
                required={form.systemRole !== 'none'} 
                icon={<Monitor className="w-3 h-3" />} 
                error={errors.username}
              >
                <input
                  disabled={isManager || form.systemRole === 'none'}
                  value={form.username}
                  onChange={(e) => set('username', e.target.value)}
                  placeholder={form.systemRole === 'none' ? "Select a system role to enable" : "john.silva"}
                  className={`${inputCls} ${errors.username ? errCls : ''}`}
                />
              </FormField>

              <FormField 
                label="Update Password (Optional)" 
                icon={<Key className="w-3 h-3" />} 
                error={errors.password}
              >
                <div className="relative">
                  <input
                    disabled={isManager || form.systemRole === 'none'}
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => set('password', e.target.value)}
                    placeholder={form.systemRole === 'none' ? "Select a system role to enable" : "Leave blank to keep current password"}
                    className={`${inputCls} pr-9 ${errors.password ? errCls : ''}`}
                  />
                  <button
                    type="button"
                    disabled={isManager || form.systemRole === 'none'}
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-0"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </FormField>
            </div>

            
            {form.systemRole === 'none' && (
              <div className="flex items-start gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3 mt-1">
                <ShieldCheck className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-500">
                  This employee has no portal access.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditEmployee;
