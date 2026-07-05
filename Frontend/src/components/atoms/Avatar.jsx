import React from 'react';

/**
 * Avatar atom
 * @param {string} name  - full name, used to derive initials and bg color
 * @param {string} src   - image URL (optional)
 * @param {string} size  - 'xs'|'sm'|'md'|'lg'|'xl'
 * @param {boolean} online - show green online dot
 * @param {string} role  - sub-label displayed below name (for user header usage)
 */

const COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-rose-500',
  'bg-orange-500', 'bg-amber-500', 'bg-teal-500', 'bg-cyan-500',
  'bg-indigo-500', 'bg-emerald-500',
];

const getInitials = (name = '') =>
  name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('');

const getColor = (name = '') => COLORS[name.charCodeAt(0) % COLORS.length];

const sizes = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
  xl: 'w-14 h-14 text-lg',
};

const dotSizes = {
  xs: 'w-1.5 h-1.5', sm: 'w-2 h-2', md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3', xl: 'w-3.5 h-3.5',
};

const Avatar = ({
  name = '',
  src,
  size = 'md',
  online = false,
  className = '',
  ...props
}) => {
  return (
    <div className={['relative flex-shrink-0 inline-flex', className].join(' ')} {...props}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={['rounded-full object-cover', sizes[size]].join(' ')}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      ) : (
        <div
          className={[
            'rounded-full flex items-center justify-center font-bold text-white flex-shrink-0',
            sizes[size],
            getColor(name),
          ].join(' ')}
        >
          {getInitials(name)}
        </div>
      )}
      {online && (
        <span
          className={[
            'absolute bottom-0 right-0 rounded-full bg-green-400 border-2 border-white',
            dotSizes[size],
          ].join(' ')}
        />
      )}
    </div>
  );
};

export default Avatar;
