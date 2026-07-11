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
  userName: propUserName = '',
  userRole: propUserRole = '',
  userAvatar,
  notificationCount = 0,
  searchPlaceholder,
  topBarActions,
  children,
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  // Load real user data if available in localStorage
  let userName = propUserName;
  let userRole = propUserRole;

  try {
    const savedUserInfo = localStorage.getItem('userInfo');
    if (savedUserInfo) {
      const userInfo = JSON.parse(savedUserInfo);
      if (userInfo.fullName) {
        userName = userInfo.fullName;
      }
      if (userInfo.role) {
        const roleMapping = {
          'ADMIN': 'Super Administrator',
          'MANAGER': 'General Manager',
          'RECEPTIONIST': 'Front Desk Lead',
          'HOUSEKEEPER': 'Housekeeper'
        };
        userRole = roleMapping[userInfo.role] || userInfo.role;
      }
    }
  } catch (e) {
    console.error('Error loading user info from localStorage', e);
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-page)' }}>
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
        <main className="flex-1 overflow-y-auto p-5" style={{ backgroundColor: 'var(--bg-page)' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
