import React from 'react';
import { AlertTriangle, Info, Bell } from 'lucide-react';

/**
 * AlertCard molecule — contextual alert/notification card
 * @param {string} variant - 'danger'|'warning'|'info'|'success'
 * @param {string} title
 * @param {string} message
 * @param {React.ReactNode} icon - override default icon
 */
const AlertCard = ({ variant = 'info', title, message, icon, className = '' }) => {
  const styles = {
    danger: {
      wrapper: 'bg-red-50   border-l-4 border-red-400',
      title:   'text-red-700',
      msg:     'text-red-600',
      iconEl:  <AlertTriangle className="w-4 h-4 text-red-500" />,
    },
    warning: {
      wrapper: 'bg-amber-50  border-l-4 border-amber-400',
      title:   'text-amber-800',
      msg:     'text-amber-700',
      iconEl:  <AlertTriangle className="w-4 h-4 text-amber-500" />,
    },
    info: {
      wrapper: 'bg-blue-50   border-l-4 border-blue-400',
      title:   'text-blue-800',
      msg:     'text-blue-700',
      iconEl:  <Info className="w-4 h-4 text-blue-500" />,
    },
    success: {
      wrapper: 'bg-green-50  border-l-4 border-green-400',
      title:   'text-green-800',
      msg:     'text-green-700',
      iconEl:  <Bell className="w-4 h-4 text-green-500" />,
    },
  };

  const s = styles[variant] || styles.info;

  return (
    <div className={['rounded-lg p-3', s.wrapper, className].join(' ')}>
      <div className="flex items-start gap-2">
        <div className="mt-0.5 flex-shrink-0">{icon || s.iconEl}</div>
        <div>
          {title && <p className={['text-xs font-bold', s.title].join(' ')}>{title}</p>}
          {message && <p className={['text-xs mt-0.5 leading-relaxed', s.msg].join(' ')}>{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default AlertCard;
