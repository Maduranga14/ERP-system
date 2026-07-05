import React from 'react';

/**
 * StatCard molecule — metric tile shown on all dashboards
 * @param {string} label       - e.g. "Today's Revenue"
 * @param {string|number} value
 * @param {string} sublabel    - e.g. "Today" | "Active"
 * @param {React.ReactNode} icon
 * @param {string} trend       - e.g. "+12.5%" (optional)
 * @param {string} trendDir    - 'up' | 'down' | 'neutral'
 * @param {string} borderColor - left accent border: 'gold'|'green'|'red'|'blue'|'navy'
 * @param {string} iconBg      - tailwind bg class for icon circle
 * @param {string} variant     - 'default'|'featured' (navy dark card)
 */
const StatCard = ({
  label,
  value,
  sublabel,
  icon,
  trend,
  trendDir = 'up',
  borderColor = 'gold',
  iconBg = 'bg-gold-100',
  variant = 'default',
  className = '',
}) => {
  const borders = {
    gold:  'border-l-gold-500',
    green: 'border-l-green-500',
    red:   'border-l-red-500',
    blue:  'border-l-blue-500',
    navy:  'border-l-navy-700',
    amber: 'border-l-amber-500',
  };

  const trendClasses = {
    up:      'text-green-600 bg-green-50',
    down:    'text-red-500   bg-red-50',
    neutral: 'text-gray-500  bg-gray-50',
  };

  if (variant === 'featured') {
    return (
      <div className={['card bg-navy-900 text-white p-4 flex flex-col justify-between min-h-[100px]', className].join(' ')}>
        <div className="flex items-start justify-between">
          {icon && (
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white">
              {icon}
            </div>
          )}
          {trend && (
            <span className={['text-xs font-semibold px-2 py-0.5 rounded-full', trendClasses[trendDir]].join(' ')}>
              {trend}
            </span>
          )}
        </div>
        {sublabel && <p className="text-xs text-white/60 mt-2">{sublabel}</p>}
        <p className="text-3xl font-bold mt-1">{value}</p>
        <p className="text-xs text-white/70 mt-1">{label}</p>
      </div>
    );
  }

  return (
    <div
      className={[
        'card p-4 border-l-4 flex flex-col gap-1 relative overflow-hidden',
        borders[borderColor] || 'border-l-gold-500',
        className,
      ].join(' ')}
    >
      <div className="flex items-start justify-between">
        <div>
          {sublabel && (
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{sublabel}</p>
          )}
          <p className="text-3xl font-bold text-gray-900 mt-0.5 leading-tight">{value}</p>
          <p className="text-sm text-gray-500 mt-0.5">{label}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {icon && (
            <div className={['w-10 h-10 rounded-xl flex items-center justify-center', iconBg].join(' ')}>
              {icon}
            </div>
          )}
          {trend && (
            <span className={['text-xs font-semibold px-1.5 py-0.5 rounded-full', trendClasses[trendDir]].join(' ')}>
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
