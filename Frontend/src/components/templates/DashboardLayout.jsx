import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../organisms/Sidebar';
import TopBar from '../organisms/TopBar';

/**
 * DashboardLayout template — shared layout for all 4 dashboard roles
 * @param {string} role           - 'admin'|'manager'|'receptionist'|'housekeeper'
 * @param {string} userName
 * @param {string} userRole       - display role label
 * @param {string} userAvatar
 * @param {number} notificationCount
 * @param {string} searchPlaceholder
 * @param {React.ReactNode} topBarActions - extra buttons shown in topbar
 * @param {React.ReactNode} children      - page content
 */
const DashboardLayout = ({
  role = 'admin',
  userName = '',
  userRole = '',
  userAvatar,
  notificationCount = 0,
  searchPlaceholder,
  topBarActions,
  children,
}) => {
  const navigate = useNavigate();

  const handleLogout = () => navigate('/');

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar
        role={role}
        onLogout={handleLogout}
        onStartShift={role === 'housekeeper' ? () => alert('Shift started!') : undefined}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          searchPlaceholder={searchPlaceholder}
          userName={userName}
          userRole={userRole}
          userAvatar={userAvatar}
          notificationCount={notificationCount}
          actions={topBarActions}
        />
        <main className="flex-1 overflow-y-auto p-5">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
