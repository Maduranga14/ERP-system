import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * InputField atom
 * @param {string} label
 * @param {string} id
 * @param {string} type       - 'text'|'email'|'password'|'number'|'search' etc.
 * @param {string} placeholder
 * @param {React.ReactNode} leadingIcon
 * @param {string} error      - error message
 * @param {string} hint       - hint/helper text
 */
const InputField = ({
  label,
  id,
  type = 'text',
  placeholder,
  leadingIcon,
  error,
  hint,
  className = '',
  labelRight,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={['flex flex-col gap-1', className].join(' ')}>
      {(label || labelRight) && (
        <div className="flex items-center justify-between">
          {label && (
            <label htmlFor={id} className="text-sm font-medium text-gray-700 select-none">
              {label}
            </label>
          )}
          {labelRight && <div className="text-sm">{labelRight}</div>}
        </div>
      )}
      <div className="relative flex items-center">
        {leadingIcon && (
          <div className="absolute left-3 text-gray-400 pointer-events-none">
            {leadingIcon}
          </div>
        )}
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          className={[
            'w-full rounded-lg border bg-white text-sm text-gray-800 placeholder-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400',
            'transition-all duration-150',
            leadingIcon ? 'pl-10' : 'pl-3.5',
            isPassword ? 'pr-10' : 'pr-3.5',
            'py-2.5',
            error ? 'border-red-400' : 'border-gray-200',
          ].join(' ')}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
    </div>
  );
};

export default InputField;
