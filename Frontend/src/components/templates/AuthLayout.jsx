import React from 'react';
import { Shield } from 'lucide-react';

/**
 * AuthLayout template — centered card layout for login/auth pages
 */
const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center px-4">
      {children}
      {/* Footer */}
      <div className="flex items-center gap-4 mt-6 text-[11px] text-gray-400">
        <div className="flex items-center gap-1">
          <Shield className="w-3 h-3" />
          <span>SECURE 256-BIT ENCRYPTION</span>
        </div>
        <span>•</span>
        <span>V4.2.0 STABLE BUILD</span>
      </div>
    </div>
  );
};

export default AuthLayout;
