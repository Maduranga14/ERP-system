import React from 'react';

/**
 * ProgressBar atom
 * @param {number} value    - 0–100
 * @param {string} color    - 'gold'|'green'|'blue'|'red'|'navy'
 * @param {string} size     - 'xs'|'sm'|'md'
 * @param {boolean} showLabel
 * @param {string} label    - custom label (defaults to `${value}%`)
 */
const ProgressBar = ({
  value = 0,
  color = 'gold',
  size = 'sm',
  showLabel = false,
  label,
  className = '',
}) => {
  const pct = Math.min(100, Math.max(0, value));

  const trackColors = {
    gold:  'bg-gray-200',
    green: 'bg-green-100',
    blue:  'bg-blue-100',
    red:   'bg-red-100',
    navy:  'bg-navy-100',
  };

  const fillColors = {
    gold:  'bg-gold-500',
    green: 'bg-green-500',
    blue:  'bg-blue-500',
    red:   'bg-red-500',
    navy:  'bg-navy-800',
  };

  const heights = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2.5',
  };

  return (
    <div className={['flex flex-col gap-1', className].join(' ')}>
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-500">
          <span>{label ?? `${pct}%`}</span>
          <span>{pct}%</span>
        </div>
      )}
      <div className={['w-full rounded-full overflow-hidden', heights[size], trackColors[color] || 'bg-gray-200'].join(' ')}>
        <div
          className={['h-full rounded-full transition-all duration-500', fillColors[color] || 'bg-gold-500'].join(' ')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
