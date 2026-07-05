import React from 'react';
import ActivityItem from '../molecules/ActivityItem';

/**
 * ActivityFeed organism — vertical timeline of recent activity
 * @param {Array<{message, time, by, dotColor}>} items
 * @param {string} title
 */
const ActivityFeed = ({ items = [], title = 'Recent Activity', className = '' }) => {
  return (
    <div className={['card p-4', className].join(' ')}>
      <h3 className="text-sm font-semibold text-gray-800 mb-4">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">No recent activity</p>
      ) : (
        <div className="flex flex-col">
          {items.map((item, i) => (
            <ActivityItem
              key={i}
              message={item.message}
              time={item.time}
              by={item.by}
              dotColor={item.dotColor}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
