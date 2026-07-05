import React from 'react';
import { MoreVertical } from 'lucide-react';

/**
 * ChartCard organism — wrapper card for any chart
 * @param {string} title
 * @param {React.ReactNode} children - the chart component
 * @param {React.ReactNode} headerRight - extra content in header (e.g. period selector)
 * @param {boolean} showMenu
 */
const ChartCard = ({ title, children, headerRight, showMenu = true, className = '' }) => {
  return (
    <div className={['card p-4', className].join(' ')}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        <div className="flex items-center gap-2">
          {headerRight}
          {showMenu && (
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
};

export default ChartCard;
