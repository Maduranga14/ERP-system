import React from 'react';

/**
 * Badge atom — colored status chips
 * @param {string} variant - 'green'|'red'|'amber'|'blue'|'navy'|'gold'|'gray'|'purple'
 * @param {string} size    - 'sm' | 'md'
 * @param {boolean} dot    - show leading dot
 */
const Badge = ({
  children,
  variant = 'gray',
  size = 'sm',
  dot = false,
  className = '',
  ...props
}) => {
  const variantClasses = {
    green:  'bg-green-100  text-green-700  border-green-200',
    red:    'bg-red-100    text-red-700    border-red-200',
    amber:  'bg-amber-100  text-amber-700  border-amber-200',
    blue:   'bg-blue-100   text-blue-700   border-blue-200',
    navy:   'bg-navy-900   text-white       border-navy-800',
    gold:   'bg-gold-100   text-gold-700   border-gold-200',
    gray:   'bg-gray-100   text-gray-600   border-gray-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    teal:   'bg-teal-100   text-teal-700   border-teal-200',
  };

  const dotColors = {
    green: 'bg-green-500', red: 'bg-red-500', amber: 'bg-amber-500',
    blue: 'bg-blue-500', navy: 'bg-navy-400', gold: 'bg-gold-500',
    gray: 'bg-gray-400', purple: 'bg-purple-500', teal: 'bg-teal-500',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 font-semibold rounded-full border',
        variantClasses[variant] || variantClasses.gray,
        sizes[size],
        className,
      ].join(' ')}
      {...props}
    >
      {dot && (
        <span
          className={['w-1.5 h-1.5 rounded-full flex-shrink-0', dotColors[variant] || 'bg-gray-400'].join(' ')}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
