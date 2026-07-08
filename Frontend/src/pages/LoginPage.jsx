import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hotel, User, Lock, ArrowRight } from 'lucide-react';
import AuthLayout from '../components/templates/AuthLayout';
import InputField from '../components/atoms/InputField';
import Checkbox from '../components/atoms/Checkbox';
import Button from '../components/atoms/Button';

/**
 * LoginPage — authenticates users against the Spring Boot backend.
 *
 * Flow:
 *  1. User submits email + password via the form.
 *  2. POST /api/auth/login → { token, role, redirectUrl, fullName, email }
 *  3. JWT is stored in localStorage under the key "jwtToken".
 *  4. User info is stored in localStorage under "userInfo" for dashboard use.
 *  5. React Router navigates to the role-specific dashboard path.
 *
 * Error handling:
 *  - 401: display "Invalid email or password."
 *  - Network/server error: display a connectivity message.
 *  - Validation error (400): display the server's message.
 */

/** Base URL of the Spring Boot API. Adjust port if you changed server.port. */
const API_BASE_URL = 'http://localhost:8080';

const LoginPage = () => {
  const navigate = useNavigate();

  // ── Form State ──────────────────────────────────────────────────────────────
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  // ── Form Submit Handler ─────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // ── Step 1: Call the backend login endpoint ─────────────────────────────
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });

      const data = await response.json();

      // ── Step 2: Handle non-2xx responses ───────────────────────────────────
      if (!response.ok) {
        // Server returned 401 or 400 with a { message: "..." } body
        setError(data.message || 'Invalid email or password.');
        return;
      }

      // ── Step 3: Persist the JWT and user info in localStorage ──────────────
      // The JWT is sent as "Authorization: Bearer <token>" on subsequent
      // API calls (rooms, reservations, billing, etc.).
      localStorage.setItem('jwtToken', data.token);
      localStorage.setItem('userInfo', JSON.stringify({
        fullName:    data.fullName,
        email:       data.email,
        role:        data.role,
        redirectUrl: data.redirectUrl,
        rememberMe:  remember,
      }));

      // ── Step 4: Navigate to the role-based dashboard ────────────────────────
      // data.redirectUrl is one of: /admin, /manager, /receptionist, /housekeeper
      navigate(data.redirectUrl);

    } catch (networkError) {
      // Handles cases where fetch itself throws (e.g., backend is down)
      console.error('Login network error:', networkError);
      setError('Cannot connect to the server. Please ensure the backend is running.');
    } finally {
      // Always stop the loading spinner, whether success or failure
      setLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <AuthLayout>
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">

        {/* ── Logo ── */}
        <div className="flex flex-col items-center mb-7">
          <div className="w-16 h-16 rounded-full bg-navy-900 flex items-center justify-center mb-3 shadow-lg">
            <Hotel className="w-8 h-8 text-gold-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Hotel Grande</h1>
          <p className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase mt-0.5">
            Management Portal
          </p>
        </div>

        {/* ── Heading ── */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-sm text-gray-500 mt-1">
            Please enter your credentials to access the ERP.
          </p>
        </div>

        {/* ── Login Form ── */}
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

        {/* ── Footer Help Link ── */}
        <div className="mt-6 text-center">
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
