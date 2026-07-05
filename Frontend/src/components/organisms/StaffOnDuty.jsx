import React from 'react';
import ProgressBar from '../atoms/ProgressBar';

/**
 * StaffOnDuty organism — department breakdown with progress bars
 * @param {number} total - total staff on duty
 * @param {Array<{dept, count, total, color}>} departments
 */
const StaffOnDuty = ({ total, departments = [], className = '' }) => {
  return (
    <div className={['card p-4', className].join(' ')}>
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800">Staff on Duty</h3>
        <span className="text-2xl font-bold text-navy-900">{total}</span>
      </div>
      <div className="flex flex-col gap-3">
        {departments.map((d, i) => {
          const pct = d.total > 0 ? Math.round((d.count / d.total) * 100) : 0;
          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">{d.dept}</span>
                <span className="text-xs font-semibold text-gray-700">{d.count}</span>
              </div>
              <ProgressBar value={pct} color={d.color || 'navy'} size="sm" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StaffOnDuty;
