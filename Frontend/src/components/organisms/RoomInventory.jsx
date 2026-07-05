import React from 'react';
import ProgressBar from '../atoms/ProgressBar';

/**
 * RoomInventory organism — shows availability stats with progress bars
 * @param {Array<{label, count, total, color}>} items
 */
const RoomInventory = ({ items = [], title = 'Room Inventory', className = '' }) => {
  return (
    <div className={['card p-4', className].join(' ')}>
      <h3 className="text-sm font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="flex flex-col gap-3">
        {items.map((item, i) => {
          const pct = item.total > 0 ? Math.round((item.count / item.total) * 100) : 0;
          return (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className={[
                      'w-2 h-2 rounded-full',
                      item.dot || 'bg-gray-400',
                    ].join(' ')}
                  />
                  <span className="text-xs text-gray-600">{item.label}</span>
                </div>
                <span className="text-xs font-semibold text-gray-800">{item.count}</span>
              </div>
              <ProgressBar value={pct} color={item.color || 'gold'} size="xs" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoomInventory;
