import React from 'react';

/**
 * IconButton atom — icon-only button
 * @param {React.ReactNode} children - icon element
 * @param {string} variant - 'ghost'|'outline'|'filled'
 * @param {string} size    - 'sm'|'md'|'lg'
 * @param {number} badgeCount - shows red notification badge
 */
const IconButton = ({
  children,
  variant = 'ghost',
  size = 'md',
  badgeCount,
  className = '',
  ...props
}) => {
  const variants = {
    ghost:   'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
    outline: 'border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300',
    filled:  'bg-navy-900 text-white hover:bg-navy-800',
  };

  const sizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  return (
    <div className="relative inline-flex">
      <button
        className={[
          'relative inline-flex items-center justify-center rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gold-400',
          variants[variant],
          sizes[size],
          className,
        ].join(' ')}
        {...props}
      >
        {children}
      </button>
      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center pointer-events-none">
          {badgeCount > 9 ? '9+' : badgeCount}
        </span>
      )}
    </div>
  );
};

export default IconButton;
