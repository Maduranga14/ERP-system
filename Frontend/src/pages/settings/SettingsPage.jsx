import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sun, Moon, Shield, Bell, Laptop, Smartphone,
  Pencil, LogOut, ExternalLink, ChevronRight,
  X, Save, Eye, EyeOff,
} from 'lucide-react';

import DashboardLayout from '../../components/templates/DashboardLayout';
import { useRole }     from '../../hooks/useRole';

/* ── helpers ── */
const loadUser = () => {
  try { return JSON.parse(localStorage.getItem('userInfo') || '{}'); } catch { return {}; }
};

const USER_NAMES = {
  admin: 'Admin User', manager: 'Alex Sterling',
  receptionist: 'Sarah Mitchell', housekeeper: 'Sarah Jenkins',
};
const USER_ROLES = {
  admin: 'Super Administrator', manager: 'General Manager',
  receptionist: 'Front Desk Lead', housekeeper: 'Senior Housekeeper',
};

/* ── Toggle switch ── */
const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={[
      'relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0',
      checked ? 'bg-gold-500' : 'bg-gray-200',
    ].join(' ')}
  >
    <span className={[
      'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
      checked ? 'translate-x-5' : 'translate-x-0',
    ].join(' ')} />
  </button>
);

/* ── Change Password Modal ── */
const ChangePasswordModal = ({ onClose }) => {
  const [show, setShow]     = useState({ cur: false, nw: false, cf: false });
  const [form, setForm]     = useState({ current: '', newPass: '', confirm: '' });
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.newPass !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.newPass.length < 8)       { setError('Password must be at least 8 characters.'); return; }
    setError('');
    setSuccess(true);
    setTimeout(onClose, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">Change Password</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {success && <p className="text-xs text-green-600 font-semibold bg-green-50 border border-green-200 rounded-lg px-3 py-2">Password updated successfully!</p>}
          {error   && <p className="text-xs text-red-600   font-semibold bg-red-50   border border-red-200   rounded-lg px-3 py-2">{error}</p>}
          {[
            { key: 'current', label: 'Current Password', vis: show.cur, toggle: () => setShow(s => ({ ...s, cur: !s.cur })) },
            { key: 'newPass', label: 'New Password',     vis: show.nw,  toggle: () => setShow(s => ({ ...s, nw:  !s.nw  })) },
            { key: 'confirm', label: 'Confirm Password', vis: show.cf,  toggle: () => setShow(s => ({ ...s, cf:  !s.cf  })) },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label}</label>
              <div className="relative">
                <input
                  type={f.vis ? 'text' : 'password'}
                  value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  required
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-100 transition-colors"
                />
                <button type="button" onClick={f.toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {f.vis ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-sm font-semibold text-gray-600 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 bg-navy-900 text-white text-sm font-semibold rounded-lg hover:bg-navy-800 flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Edit Profile Modal ── */
const EditProfileModal = ({ profile, onClose, onSave }) => {
  const [form, setForm] = useState({ ...profile });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">Edit Profile</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-4">
          {[
            { key: 'fullName', label: 'Full Name',  type: 'text'  },
            { key: 'email',    label: 'Email',       type: 'email' },
            { key: 'phone',    label: 'Phone',       type: 'tel'   },
            { key: 'jobTitle', label: 'Job Title',   type: 'text'  },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label}</label>
              <input
                type={f.type}
                value={form[f.key] || ''}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-100 transition-colors"
              />
            </div>
          ))}
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-sm font-semibold text-gray-600 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={() => { onSave(form); onClose(); }} className="flex-1 py-2.5 bg-navy-900 text-white text-sm font-semibold rounded-lg hover:bg-navy-800 flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════ */
const SettingsPage = () => {
  const role     = useRole();
  const navigate = useNavigate();
  const stored   = loadUser();

  const [profile, setProfile] = useState({
    fullName: stored.fullName || USER_NAMES[role] || 'Alex Rivers',
    email:    stored.email    || 'alex.rivers@hospitalityelite.com',
    phone:    stored.phone    || '+1 (555) 098-4421',
    jobTitle: USER_ROLES[role] || 'General Manager',
    org:      'Hospitality Elite',
  });

  const [theme,    setTheme]    = useState('light');
  const [language, setLanguage] = useState('en-US');
  const [twoFA,    setTwoFA]    = useState(true);
  const [notif, setNotif] = useState({
    email: true,
    push:  true,
    sms:   false,
  });

  const [showEditProfile,    setShowEditProfile]    = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  const initials = (profile.fullName || '?')
    .split(' ').slice(0, 2).map(n => n[0]?.toUpperCase()).join('');

  const sessions = [
    { icon: <Laptop className="w-4 h-4 text-gray-500" />,     device: 'MacBook Pro – San Francisco, USA', time: 'Today, 09:42 AM'     },
    { icon: <Smartphone className="w-4 h-4 text-gray-500" />, device: 'iPhone 15 – San Francisco, USA',   time: 'Yesterday, 11:20 PM' },
  ];

  return (
    <DashboardLayout
      role={role}
      userName={USER_NAMES[role]}
      userRole={USER_ROLES[role]}
      notificationCount={0}
      searchPlaceholder="Search..."
    >
      {/* ── Page title ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings &amp; Preferences</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage your administrative profile, security protocols, and system appearance.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">

        {/* ══ LEFT COLUMN (2/3) ══ */}
        <div className="xl:col-span-2 flex flex-col gap-5">

          {/* ── Profile card ── */}
          <div className="card p-5">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-navy-900 flex items-center justify-center text-white text-xl font-bold">
                  {initials}
                </div>
                <span className="absolute bottom-0 right-0 w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center border-2 border-white">
                  <Pencil className="w-2.5 h-2.5 text-white" />
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">{profile.fullName}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{profile.jobTitle} • {profile.org}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-navy-100 text-navy-700 uppercase tracking-wider">Primary Admin</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 uppercase tracking-wider">Verified</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowEditProfile(true)}
                    className="flex items-center gap-1.5 bg-gold-500 hover:bg-gold-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit Profile
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Email Address</p>
                    <p className="text-sm text-gray-700 mt-0.5">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Phone Number</p>
                    <p className="text-sm text-gray-700 mt-0.5">{profile.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Account Security ── */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-gold-600" />
              <h3 className="text-sm font-bold text-gray-900">Account Security</h3>
            </div>

            {/* Password row */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="text-sm font-semibold text-gray-800">Password</p>
                <p className="text-xs text-gray-400 mt-0.5">Last updated 14 days ago</p>
              </div>
              <button
                onClick={() => setShowChangePassword(true)}
                className="text-xs font-semibold text-gold-700 border border-gold-300 px-3 py-1.5 rounded-lg hover:bg-gold-50 transition-colors"
              >
                Change Password
              </button>
            </div>

            {/* 2FA row */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="text-sm font-semibold text-gray-800">Two-Factor Authentication</p>
                <p className="text-xs text-gray-400 mt-0.5">Secure your account with a secondary verification method.</p>
              </div>
              <Toggle checked={twoFA} onChange={setTwoFA} />
            </div>

            {/* Login history */}
            <div className="pt-3">
              <p className="text-xs font-semibold text-gray-500 mb-3">Recent Login History</p>
              <div className="flex flex-col gap-2">
                {sessions.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-xl border border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center flex-shrink-0">
                      {s.icon}
                    </div>
                    <p className="flex-1 text-sm font-medium text-gray-700">{s.device}</p>
                    <p className="text-xs text-gray-400 flex-shrink-0">{s.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Communication Preferences ── */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-gold-600" />
              <h3 className="text-sm font-bold text-gray-900">Communication Preferences</h3>
            </div>

            {[
              { key: 'email', label: 'Email Alerts',           desc: 'Daily summaries and system health reports.'                         },
              { key: 'push',  label: 'Push Notifications',     desc: 'Browser notifications for new high-priority reservations.'           },
              { key: 'sms',   label: 'SMS Reservation Updates',desc: 'Receive SMS for VIP guest arrivals and urgent room changes.'         },
            ].map(n => (
              <div key={n.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{n.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{n.desc}</p>
                </div>
                <Toggle checked={notif[n.key]} onChange={v => setNotif(s => ({ ...s, [n.key]: v }))} />
              </div>
            ))}
          </div>
        </div>

        {/* ══ RIGHT COLUMN (1/3) ══ */}
        <div className="flex flex-col gap-5">

          {/* ── Appearance ── */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sun className="w-4 h-4 text-gold-600" />
              <h3 className="text-sm font-bold text-gray-900">Appearance</h3>
            </div>

            <p className="text-xs font-semibold text-gray-500 mb-2">Theme Mode</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { id: 'light', icon: <Sun className="w-4 h-4" />,  label: 'Light Mode' },
                { id: 'dark',  icon: <Moon className="w-4 h-4" />, label: 'Dark Mode'  },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={[
                    'flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-2 transition-all text-xs font-semibold',
                    theme === t.id
                      ? 'border-gold-400 bg-gold-50 text-gold-700'
                      : 'border-gray-100 text-gray-500 hover:border-gray-200',
                  ].join(' ')}
                >
                  <span className={theme === t.id ? 'text-gold-600' : 'text-gray-400'}>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>

            <p className="text-xs font-semibold text-gray-500 mb-2">Interface Language</p>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-100 bg-white text-gray-700 transition-colors"
            >
              <option value="en-US">English (United States)</option>
              <option value="en-GB">English (United Kingdom)</option>
              <option value="si">Sinhala</option>
              <option value="ta">Tamil</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ja">Japanese</option>
            </select>
          </div>

          {/* ── Support ── */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-gold-600 text-base">?</span>
              <h3 className="text-sm font-bold text-gray-900">Support</h3>
            </div>

            <a href="#" className="flex items-center gap-2.5 py-2.5 border-b border-gray-100 group">
              <span className="text-gray-400 text-sm">📖</span>
              <span className="flex-1 text-sm text-gray-700 group-hover:text-gold-700 transition-colors">Documentation &amp; Help Center</span>
              <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-gold-500" />
            </a>
            <a href="#" className="flex items-center gap-2.5 py-2.5 group">
              <span className="text-gray-400 text-sm">🎧</span>
              <span className="flex-1 text-sm text-gray-700 group-hover:text-gold-700 transition-colors">Contact Technical Support</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gold-500" />
            </a>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">System Version</p>
              <p className="text-sm font-bold text-gray-700 mt-0.5">v2.4.12-beta</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mt-0.5">Built for Luxury Hospitality Management</p>
            </div>
          </div>

          {/* ── Sign Out ── */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-red-200 text-red-500 font-semibold text-sm rounded-xl hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out Account
          </button>
        </div>
      </div>

      {/* Modals */}
      {showEditProfile    && <EditProfileModal    profile={profile} onClose={() => setShowEditProfile(false)}    onSave={p => setProfile(p)} />}
      {showChangePassword && <ChangePasswordModal                   onClose={() => setShowChangePassword(false)} />}
    </DashboardLayout>
  );
};

export default SettingsPage;
