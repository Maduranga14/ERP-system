import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Button atom
 * @param {string} variant - 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
 * @param {string} size    - 'sm' | 'md' | 'lg'
 * @param {boolean} loading
 * @param {boolean} fullWidth
 * @param {React.ReactNode} icon - optional leading icon element
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 select-none';

  const variants = {
    primary:
      'bg-gold-500 text-white hover:bg-gold-600 active:bg-gold-700 focus:ring-gold-400 shadow-sm',
    secondary:
      'bg-navy-900 text-white hover:bg-navy-800 active:bg-navy-950 focus:ring-navy-700 shadow-sm',
    outline:
      'bg-transparent border border-navy-900 text-navy-900 hover:bg-navy-50 focus:ring-navy-400',
    ghost:
      'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-300',
    danger:
      'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400 shadow-sm',
  };

  const sizes = {
    sm:  'text-xs px-3 py-1.5',
    md:  'text-sm px-4 py-2.5',
    lg:  'text-base px-6 py-3',
  };

  return (
    <button
      className={[
        base,
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        (disabled || loading) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
        className,
      ].join(' ')}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
};

export default Button;
