import React from 'react';

/**
 * QuickActionCard molecule — icon + label grid button
 * (seen on receptionist dashboard quick actions panel)
 * @param {React.ReactNode} icon
 * @param {string} label
 * @param {function} onClick
 * @param {string} iconBg - tailwind class for icon background
 */
const QuickActionCard = ({ icon, label, onClick, iconBg = 'bg-navy-50', className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={[
        'card flex flex-col items-center justify-center gap-2.5 p-4',
        'hover:shadow-md hover:border-gold-200 hover:-translate-y-0.5',
        'transition-all duration-200 cursor-pointer group w-full',
        className,
      ].join(' ')}
    >
      <div
        className={[
          'w-11 h-11 rounded-xl flex items-center justify-center transition-colors duration-200',
          'group-hover:bg-gold-100',
          iconBg,
        ].join(' ')}
      >
        <span className="text-navy-800 group-hover:text-gold-600 transition-colors duration-200">
          {icon}
        </span>
      </div>
      <span className="text-xs font-medium text-gray-600 text-center leading-tight">
        {label}
      </span>
    </button>
  );
};

export default QuickActionCard;
