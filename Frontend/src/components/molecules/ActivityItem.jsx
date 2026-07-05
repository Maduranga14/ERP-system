import React from 'react';

/**
 * ActivityItem molecule — single row in the Recent Activity feed
 * @param {string} message
 * @param {string} time      - e.g. "10 mins ago"
 * @param {string} by        - e.g. "Sarah"
 * @param {string} dotColor  - 'green'|'red'|'amber'|'blue'|'gold'|'gray'
 */
const ActivityItem = ({ message, time, by, dotColor = 'green', className = '' }) => {
  const dotColors = {
    green: 'bg-green-500',
    red:   'bg-red-500',
    amber: 'bg-amber-500',
    blue:  'bg-blue-500',
    gold:  'bg-gold-500',
    gray:  'bg-gray-400',
    navy:  'bg-navy-700',
    purple: 'bg-purple-500',
  };

  return (
    <div className={['flex items-start gap-3 group', className].join(' ')}>
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={['w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ring-2 ring-white', dotColors[dotColor] || 'bg-gray-400'].join(' ')} />
        <div className="w-px flex-1 bg-gray-100 mt-1" />
      </div>
      {/* Content */}
      <div className="pb-3 flex-1">
        <p className="text-xs text-gray-700 font-medium leading-snug">{message}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[11px] text-gray-400">{time}</span>
          {by && (
            <>
              <span className="text-[11px] text-gray-300">•</span>
              <span className="text-[11px] text-gray-400">{by}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;
