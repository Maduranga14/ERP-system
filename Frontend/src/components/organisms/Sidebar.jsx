import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, BedDouble, Users, UserCog,
  Sparkles, Receipt, BarChart3, Settings, LogOut,
  ChevronRight, Hotel, UserCheck, ClipboardList, History,
  Play, Wrench, Plus,
} from 'lucide-react';

/**
 * Sidebar organism
 * Renders the left navigation based on the user role.
 * @param {string} role - 'admin'|'manager'|'receptionist'|'housekeeper'
 * @param {string} deptLabel - subtitle under logo
 * @param {function} onLogout
 * @param {function} onStartShift - housekeeper only
 */

const navConfigs = {
  admin: [
    { label: 'Dashboard',      icon: <LayoutDashboard className="w-4 h-4" />, path: '/admin' },
    { label: 'Reservations',   icon: <CalendarDays className="w-4 h-4" />,    path: '/admin/reservations' },
    { label: 'Rooms',          icon: <BedDouble className="w-4 h-4" />,        path: '/admin/rooms' },
    { label: 'Customers',      icon: <Users className="w-4 h-4" />,            path: '/admin/customers' },
    { label: 'Employees',      icon: <UserCog className="w-4 h-4" />,          path: '/admin/employees' },
    { label: 'Housekeeping',   icon: <Sparkles className="w-4 h-4" />,         path: '/admin/housekeeping' },
    { label: 'Maintenance',    icon: <Wrench className="w-4 h-4" />,            path: '/admin/maintenance' },
    { label: 'Cleaning History',icon: <History className="w-4 h-4" />,           path: '/admin/cleaning-history' },
    { label: 'Billing',        icon: <Receipt className="w-4 h-4" />,          path: '/admin/billing' },
    { label: 'Settings',       icon: <Settings className="w-4 h-4" />,         path: '/admin/settings' },
  ],
  manager: [
    { label: 'Dashboard',    icon: <LayoutDashboard className="w-4 h-4" />, path: '/manager' },
    { label: 'Reservations', icon: <CalendarDays className="w-4 h-4" />,    path: '/manager/reservations' },
    { label: 'Rooms',        icon: <BedDouble className="w-4 h-4" />,        path: '/manager/rooms' },
    { label: 'Customers',    icon: <Users className="w-4 h-4" />,            path: '/manager/customers' },
    { label: 'Employees',    icon: <UserCog className="w-4 h-4" />,          path: '/manager/employees' },
    { label: 'Housekeeping', icon: <Sparkles className="w-4 h-4" />,         path: '/manager/housekeeping' },
    { label: 'Maintenance',  icon: <Wrench className="w-4 h-4" />,            path: '/manager/maintenance' },
    { label: 'Cleaning History', icon: <History className="w-4 h-4" />,       path: '/manager/cleaning-history' },
    { label: 'Billing',      icon: <Receipt className="w-4 h-4" />,          path: '/manager/billing' },
  ],
  receptionist: [
    { label: 'Dashboard',        icon: <LayoutDashboard className="w-4 h-4" />, path: '/receptionist' },
    { label: 'Reservations',     icon: <CalendarDays className="w-4 h-4" />,    path: '/receptionist/reservations' },
    { label: 'Customers',        icon: <Users className="w-4 h-4" />,            path: '/receptionist/customers' },
    { label: 'Housekeeping',     icon: <Sparkles className="w-4 h-4" />,         path: '/receptionist/housekeeping' },
    { label: 'Check In',         icon: <UserCheck className="w-4 h-4" />,        path: '/receptionist/check-in' },
    { label: 'Check Out',        icon: <LogOut className="w-4 h-4" />,           path: '/receptionist/check-out' },
    { label: 'Billing',          icon: <Receipt className="w-4 h-4" />,          path: '/receptionist/billing' },
    { label: 'Room Availability',icon: <BedDouble className="w-4 h-4" />,        path: '/receptionist/rooms' },
    { label: 'Profile',          icon: <UserCog className="w-4 h-4" />,          path: '/receptionist/profile' },
  ],
  housekeeper: [
    { label: 'Dashboard',           icon: <LayoutDashboard className="w-4 h-4" />, path: '/housekeeper' },
    { label: 'My Cleaning Tasks',   icon: <ClipboardList className="w-4 h-4" />,    path: '/housekeeper/housekeeping' },
    { label: 'Room Status',         icon: <BedDouble className="w-4 h-4" />,         path: '/housekeeper/rooms' },
    { label: 'Maintenance Requests',icon: <Wrench className="w-4 h-4" />,            path: '/housekeeper/maintenance' },
    { label: 'Cleaning History',    icon: <History className="w-4 h-4" />,           path: '/housekeeper/history' },
    { label: 'Profile',             icon: <UserCog className="w-4 h-4" />,           path: '/housekeeper/profile' },
  ],
};

const deptLabels = {
  admin:        'Management Portal',
  manager:      'Management Portal',
  receptionist: 'Reception Desk',
  housekeeper:  'Housekeeping Dept.',
};

const Sidebar = ({ role = 'admin', onLogout, onStartShift }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const navItems = navConfigs[role] || navConfigs.admin;
  const dept = deptLabels[role];

  return (
    <aside
      className={[
        'flex flex-col h-screen bg-navy-900 text-white flex-shrink-0 transition-all duration-300',
        collapsed ? 'w-16' : 'w-56',
      ].join(' ')}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center flex-shrink-0">
          <Hotel className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold text-white leading-tight">Hotel Grande</p>
            <p className="text-[10px] text-white/50 leading-tight">{dept}</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="ml-auto text-white/40 hover:text-white/80 transition-colors"
          aria-label="Toggle sidebar"
        >
          <ChevronRight
            className={['w-4 h-4 transition-transform duration-300', collapsed ? '' : 'rotate-180'].join(' ')}
          />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 flex flex-col gap-0.5">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : undefined}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 w-full text-left',
                active
                  ? 'bg-gold-500/20 text-gold-400'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white',
                collapsed ? 'justify-center' : '',
              ].join(' ')}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-2 py-4 border-t border-white/10 flex flex-col gap-1">
        {/* New Reservation — shown for admin & receptionist */}
        {(role === 'admin' || role === 'receptionist') && (
          <button
            onClick={() => navigate(
              role === 'admin' ? '/admin/reservations' : '/receptionist/reservations'
            )}
            title={collapsed ? 'New Reservation' : undefined}
            className={[
              'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold mb-1',
              'bg-gold-500 text-white hover:bg-gold-600 active:bg-gold-700 transition-colors w-full shadow-sm',
              collapsed ? 'justify-center' : '',
            ].join(' ')}
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            {!collapsed && 'New Reservation'}
          </button>
        )}

        {/* Start Shift — housekeeper only */}
        {role === 'housekeeper' && onStartShift && (
          <button
            onClick={onStartShift}
            className={[
              'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold',
              'bg-gold-500 text-white hover:bg-gold-600 transition-colors w-full',
              collapsed ? 'justify-center' : '',
            ].join(' ')}
          >
            <Play className="w-4 h-4 flex-shrink-0" />
            {!collapsed && 'Start Shift'}
          </button>
        )}

        <button
          onClick={onLogout}
          className={[
            'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium',
            'text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full',
            collapsed ? 'justify-center' : '',
          ].join(' ')}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
