import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hotel, User, Lock, ArrowRight } from 'lucide-react';
import AuthLayout from '../components/templates/AuthLayout';
import InputField from '../components/atoms/InputField';
import Checkbox from '../components/atoms/Checkbox';
import Button from '../components/atoms/Button';

const DEMO_USERS = [
  { email: 'admin@hotelgrande.com',        password: 'admin123',    role: 'admin',        path: '/admin',        label: 'Admin' },
  { email: 'manager@hotelgrande.com',      password: 'manager123',  role: 'manager',      path: '/manager',      label: 'Manager' },
  { email: 'receptionist@hotelgrande.com', password: 'front123',    role: 'receptionist', path: '/receptionist', label: 'Receptionist' },
  { email: 'housekeeper@hotelgrande.com',  password: 'house123',    role: 'housekeeper',  path: '/housekeeper',  label: 'Housekeeper' },
];

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [remember, setRemember]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    const user = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (user) {
      navigate(user.path);
    } else {
      setError('Invalid email or password. Check the demo credentials below.');
    }
    setLoading(false);
  };

  const quickLogin = (user) => {
    setEmail(user.email);
    setPassword(user.password);
  };

  return (
    <AuthLayout>
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-7">
          <div className="w-16 h-16 rounded-full bg-navy-900 flex items-center justify-center mb-3 shadow-lg">
            <Hotel className="w-8 h-8 text-gold-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Hotel Grande</h1>
          <p className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase mt-0.5">
            Management Portal
          </p>
        </div>

        {/* Heading */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-sm text-gray-500 mt-1">
            Please enter your credentials to access the ERP.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <InputField
            id="email"
            label="Email or Username"
            type="email"
            placeholder="e.g. manager@hotelgrande.com"
            leadingIcon={<User className="w-4 h-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error ? ' ' : ''}
            required
          />

          <InputField
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            leadingIcon={<Lock className="w-4 h-4" />}
            labelRight={
              <button type="button" className="text-xs text-gold-600 hover:text-gold-700 font-medium">
                Forgot Password?
              </button>
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error || ''}
            required
          />

          <Checkbox
            id="remember"
            label="Remember this device"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            icon={<ArrowRight className="w-4 h-4" />}
            className="mt-1"
          >
            Sign In
          </Button>
        </form>

        <div className="my-5 border-t border-gray-100" />

        {/* Demo quick-login chips */}
        <div>
          <p className="text-[11px] text-gray-400 text-center mb-3 uppercase tracking-wider font-medium">
            Demo Quick Login
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_USERS.map((u) => (
              <button
                key={u.role}
                type="button"
                onClick={() => quickLogin(u)}
                className="text-xs font-medium text-navy-800 border border-gray-200 rounded-lg py-1.5 px-2 hover:border-gold-400 hover:text-gold-700 hover:bg-gold-50 transition-all duration-150"
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 text-center">
          <p className="text-xs text-gray-400">
            Need help?{' '}
            <a href="#" className="text-gold-600 font-medium hover:underline">
              Contact System Administrator
            </a>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
