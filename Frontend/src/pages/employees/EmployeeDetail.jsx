import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, User, Phone, Mail, MapPin, Briefcase,
  Clock, Calendar, ShieldCheck, Key, UserX, UserCheck,
  Monitor, Activity, AlertCircle, Lock,
} from 'lucide-react';

import DashboardLayout from '../../components/templates/DashboardLayout';
import Badge           from '../../components/atoms/Badge';
import { useRole }     from '../../hooks/useRole';
import { canEmployee } from '../../utils/employeePermissions';
import { EMPLOYEES }   from '../../data/employees';

/* ── Helpers ───────────────────────────────────────────────── */
const STATUS_VARIANT = {
  Active:    'green',
  'On Leave':'amber',
  Inactive:  'gray',
  Probation: 'blue',
};
const ACCOUNT_VARIANT = { Active: 'green', Disabled: 'red' };
const SYSTEM_ROLE_LABEL = {
  admin:        'Administrator',
  manager:      'Manager',
  receptionist: 'Receptionist',
  housekeeper:  'Housekeeper',
  none:         'No Access',
};
const SYSTEM_ROLE_VARIANT = {
  admin:        'purple',
  manager:      'blue',
  receptionist: 'amber',
  housekeeper:  'green',
  none:         'gray',
};

const userNames = {
  admin: 'Admin User', manager: 'Alex Sterling', receptionist: 'Sarah Mitchell',
};
const userRoles = {
  admin: 'Super Administrator', manager: 'General Manager', receptionist: 'Front Desk Lead',
};

/* ── Section Card ──────────────────────────────────────────── */
const SectionCard = ({ title, icon, children, className = '', action, accent }) => (
  <div className={`card p-5 ${className}`}>
    <div className={`flex items-center justify-between mb-4 pb-3 border-b ${accent ? 'border-amber-100' : 'border-gray-100'}`}>
      <div className="flex items-center gap-2">
        <span className={accent ? 'text-amber-500' : 'text-gray-500'}>{icon}</span>
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
        {accent && (
          <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
            ⭐ System
          </span>
        )}
      </div>
      {action}
    </div>
    {children}
  </div>
);

/* ── Info Row ──────────────────────────────────────────────── */
const InfoRow = ({ label, value, icon }) => (
  <div className="flex items-start gap-3">
    {icon && (
      <span className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-gray-400">
        {icon}
      </span>
    )}
    <div className="min-w-0">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm text-gray-800 font-medium mt-0.5 break-words">{value || '—'}</p>
    </div>
  </div>
);

/* ── Confirm Modal ─────────────────────────────────────────── */
const ConfirmModal = ({ title, message, icon, iconBg, confirmLabel, confirmClass, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-in fade-in zoom-in duration-200">
      <div className={`flex items-center justify-center w-12 h-12 rounded-full ${iconBg} mx-auto mb-4`}>
        {icon}
      </div>
      <h3 className="text-base font-bold text-gray-900 text-center mb-1">{title}</h3>
      <p className="text-sm text-gray-500 text-center mb-5">{message}</p>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 border border-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={`flex-1 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors ${confirmClass}`}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

/* ── Main Component ────────────────────────────────────────── */
const EmployeeDetail = () => {
  const navigate  = useNavigate();
  const { id }    = useParams();
  const role      = useRole();
  const basePath  = `/${role}`;

  const employee = EMPLOYEES.find((e) => e.id === id) || EMPLOYEES[0];

  const [modal, setModal] = useState(null); // 'reset'|'activate'|'deactivate'|null

  const handleModalAction = () => {
    if (modal === 'reset') {
      alert(`Password reset link sent to ${employee.email} (mock).`);
    } else if (modal === 'activate') {
      alert(`Account for ${employee.fullName} activated (mock).`);
    } else if (modal === 'deactivate') {
      alert(`Account for ${employee.fullName} deactivated (mock).`);
    }
    setModal(null);
  };

  const initials = employee.initials || employee.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <DashboardLayout
      role={role}
      userName={userNames[role]}
      userRole={userRoles[role]}
      notificationCount={3}
      searchPlaceholder="Search employees, roles or ID..."
    >
      {/* Back */}
      <button
        onClick={() => navigate(`${basePath}/employees`)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy-800 transition-colors mb-4 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Employees
      </button>

      {/* ── Profile Header Card ── */}
      <div className="card p-5 mb-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-gradient-to-bl from-slate-100 to-transparent pointer-events-none" />
        <div className="flex items-start gap-5 relative">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-white shadow-md bg-navy-900 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-white">{initials}</span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-gray-900">{employee.fullName}</h2>
              <Badge variant={STATUS_VARIANT[employee.status] || 'gray'} dot size="sm">
                {employee.status}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mb-2">
              {employee.role} &bull; {employee.department} &bull; {employee.id}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                {employee.shift}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <Calendar className="w-3.5 h-3.5 text-green-400" />
                Joined {employee.joinDate}
              </span>
            </div>
          </div>

          {/* Header actions */}
          {canEmployee(role, 'edit') && (
            <button
              onClick={() => navigate(`${basePath}/employees/${employee.id}/edit`)}
              className="border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* ── 2-Col Grid: Personal + Job ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

        {/* Personal Information */}
        <SectionCard
          title="Personal Information"
          icon={<User className="w-4 h-4" />}
        >
          <div className="flex flex-col gap-4">
            <InfoRow label="Employee ID"   value={employee.id}       icon={<ShieldCheck className="w-3.5 h-3.5" />} />
            <InfoRow label="Full Name"     value={employee.fullName}  icon={<User className="w-3.5 h-3.5" />} />
            <InfoRow label="Phone Number"  value={employee.phone}     icon={<Phone className="w-3.5 h-3.5" />} />
            <InfoRow label="Email Address" value={employee.email}     icon={<Mail className="w-3.5 h-3.5" />} />
            <InfoRow label="Address"       value={employee.address}   icon={<MapPin className="w-3.5 h-3.5" />} />
          </div>
        </SectionCard>

        {/* Job Information */}
        <SectionCard
          title="Job Information"
          icon={<Briefcase className="w-4 h-4" />}
        >
          <div className="flex flex-col gap-4">
            <InfoRow label="Department"         value={employee.department} icon={<Briefcase className="w-3.5 h-3.5" />} />
            <InfoRow label="Role / Position"    value={employee.role}       icon={<User className="w-3.5 h-3.5" />} />
            <InfoRow label="Shift"              value={employee.shift}      icon={<Clock className="w-3.5 h-3.5" />} />
            <InfoRow label="Join Date"          value={employee.joinDate}   icon={<Calendar className="w-3.5 h-3.5" />} />
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Employment Status</p>
              <Badge variant={STATUS_VARIANT[employee.status] || 'gray'} dot>
                {employee.status}
              </Badge>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ── System Account Card ── */}
      <SectionCard
        title="System Account"
        icon={<Monitor className="w-4 h-4" />}
        accent
        action={
          canEmployee(role, 'manageSystemAccount') ? (
            <div className="flex items-center gap-2">
              <button
                id="reset-password-btn"
                onClick={() => setModal('reset')}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Key className="w-3 h-3" />
                Reset Password
              </button>
              {employee.accountStatus === 'Disabled' ? (
                <button
                  id="activate-account-btn"
                  onClick={() => setModal('activate')}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <UserCheck className="w-3 h-3" />
                  Activate
                </button>
              ) : (
                <button
                  id="deactivate-account-btn"
                  onClick={() => setModal('deactivate')}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <UserX className="w-3 h-3" />
                  Deactivate
                </button>
              )}
            </div>
          ) : null
        }
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Username */}
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Username</p>
            <div className="flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
              <p className="text-sm font-bold text-gray-800 truncate">{employee.username || '—'}</p>
            </div>
          </div>

          {/* System Role */}
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">System Role</p>
            <Badge variant={SYSTEM_ROLE_VARIANT[employee.systemRole] || 'gray'}>
              {SYSTEM_ROLE_LABEL[employee.systemRole] || employee.systemRole}
            </Badge>
          </div>

          {/* Account Status */}
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Account Status</p>
            <Badge variant={ACCOUNT_VARIANT[employee.accountStatus] || 'gray'} dot>
              {employee.accountStatus}
            </Badge>
          </div>

          {/* Last Login */}
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Last Login</p>
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <p className="text-sm font-medium text-gray-700 truncate">
                {employee.lastLogin || 'Never'}
              </p>
            </div>
          </div>
        </div>

        {/* Access note for disabled */}
        {employee.accountStatus === 'Disabled' && (
          <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-600 font-medium">
              This account is disabled. The employee cannot log into the system.
              {canEmployee(role, 'manageSystemAccount') && ' Use "Activate" to restore access.'}
            </p>
          </div>
        )}

        {/* System role = none note */}
        {employee.systemRole === 'none' && employee.accountStatus !== 'Disabled' && (
          <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3">
            <Lock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 font-medium">
              This employee has no system role assigned and cannot access the ERP portal.
            </p>
          </div>
        )}
      </SectionCard>

      {/* ── Confirm Modals ── */}
      {modal === 'reset' && (
        <ConfirmModal
          title="Reset Password"
          message={`Send a password reset link to ${employee.email}?`}
          icon={<Key className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-100"
          confirmLabel="Send Reset Link"
          confirmClass="bg-blue-600 hover:bg-blue-700"
          onConfirm={handleModalAction}
          onCancel={() => setModal(null)}
        />
      )}
      {modal === 'activate' && (
        <ConfirmModal
          title="Activate Account"
          message={`Are you sure you want to activate the system account for ${employee.fullName}?`}
          icon={<UserCheck className="w-5 h-5 text-green-600" />}
          iconBg="bg-green-100"
          confirmLabel="Activate Account"
          confirmClass="bg-green-600 hover:bg-green-700"
          onConfirm={handleModalAction}
          onCancel={() => setModal(null)}
        />
      )}
      {modal === 'deactivate' && (
        <ConfirmModal
          title="Deactivate Account"
          message={`This will prevent ${employee.fullName} from logging into the system. Continue?`}
          icon={<UserX className="w-5 h-5 text-red-600" />}
          iconBg="bg-red-100"
          confirmLabel="Deactivate"
          confirmClass="bg-red-600 hover:bg-red-700"
          onConfirm={handleModalAction}
          onCancel={() => setModal(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default EmployeeDetail;
