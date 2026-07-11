import React from 'react';
import { Bell, Settings, Search } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Avatar from '../atoms/Avatar';
import IconButton from '../atoms/IconButton';

/**
 * TopBar organism — top navigation bar
 * @param {string} searchPlaceholder
 * @param {string} userName
 * @param {string} userRole
 * @param {string} userAvatar - image src (optional)
 * @param {number} notificationCount
 * @param {React.ReactNode} actions - extra action buttons (right of search)
 */
const TopBar = ({
  searchPlaceholder = 'Search...',
  userName = '',
  userRole = '',
  userAvatar,
  notificationCount = 0,
  actions,
  className = '',
}) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Derive settings path from current role prefix
  const rolePrefix = pathname.startsWith('/manager')      ? '/manager'
                   : pathname.startsWith('/receptionist') ? '/receptionist'
                   : pathname.startsWith('/housekeeper')  ? '/housekeeper'
                   : '/admin';

  const goToSettings = () => navigate(`${rolePrefix}/settings`);
  return (
    <header
      className={[
        'h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-3 flex-shrink-0 sticky top-0 z-20',
        className,
      ].join(' ')}
    >
      {/* Search */}
      <div className="flex-1 relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="search"
          placeholder={searchPlaceholder}
          className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400 placeholder-gray-400 transition-all"
        />
      </div>

      <div className="flex-1" />

      {/* Extra actions slot */}
      {actions && <div className="flex items-center gap-2">{actions}</div>}

      {/* Notification bell */}
      <IconButton variant="ghost" badgeCount={notificationCount} aria-label="Notifications">
        <Bell className="w-5 h-5" />
      </IconButton>

      {/* Settings */}
      <IconButton variant="ghost" aria-label="Settings" onClick={goToSettings}>
        <Settings className="w-5 h-5" />
      </IconButton>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200" />

      {/* User profile */}
      <div className="flex items-center gap-2.5 cursor-pointer group" onClick={goToSettings}>
        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold text-gray-800 leading-tight">{userName}</p>
          <p className="text-[11px] text-gray-400 leading-tight">{userRole}</p>
        </div>
        <Avatar name={userName} src={userAvatar} size="sm" online />
      </div>
    </header>
  );
};

export default TopBar;
