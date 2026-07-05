import React from 'react';
import { ChevronRight } from 'lucide-react';
import Badge from '../atoms/Badge';

/**
 * MaintenanceItem molecule — a maintenance request row
 * @param {string} room     - e.g. "Room 308 - AC"
 * @param {string} status   - e.g. "Open Request"
 * @param {string} priority - 'HIGH'|'MEDIUM'|'LOW'
 * @param {function} onClick
 */
const priorityMap = {
  HIGH:   'red',
  MEDIUM: 'amber',
  LOW:    'blue',
};

const MaintenanceItem = ({ room, status, priority = 'MEDIUM', onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={[
        'w-full flex items-center justify-between p-3 rounded-lg',
        'hover:bg-gray-50 transition-colors duration-150 text-left',
        className,
      ].join(' ')}
    >
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-semibold text-gray-800">{room}</p>
        <p className="text-xs text-gray-400">{status}</p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={priorityMap[priority] || 'gray'} size="sm">
          {priority}
        </Badge>
        <ChevronRight className="w-4 h-4 text-gray-300" />
      </div>
    </button>
  );
};

export default MaintenanceItem;
