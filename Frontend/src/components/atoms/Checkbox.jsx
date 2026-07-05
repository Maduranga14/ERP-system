import React from 'react';
import { Check } from 'lucide-react';

/**
 * Checkbox atom
 * @param {string} id
 * @param {string} label
 * @param {boolean} checked
 * @param {function} onChange
 */
const Checkbox = ({ id, label, checked, onChange, className = '', ...props }) => {
  return (
    <label
      htmlFor={id}
      className={['flex items-center gap-2.5 cursor-pointer select-none group', className].join(' ')}
    >
      <div className="relative w-4 h-4 flex-shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
          {...props}
        />
        <div
          className={[
            'w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-150',
            checked
              ? 'bg-gold-500 border-gold-500'
              : 'bg-white border-gray-300 group-hover:border-gold-400',
          ].join(' ')}
        >
          {checked && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
        </div>
      </div>
      {label && (
        <span className="text-sm text-gray-600">{label}</span>
      )}
    </label>
  );
};

export default Checkbox;
