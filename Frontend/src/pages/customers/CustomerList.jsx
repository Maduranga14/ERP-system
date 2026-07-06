import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, RefreshCw, Eye, Pencil, Trash2,
  Users, UserPlus, Activity, Repeat, AlertCircle,
  ChevronLeft, ChevronRight, Filter, Globe, Star,
} from 'lucide-react';

import DashboardLayout  from '../../components/templates/DashboardLayout';
import Badge            from '../../components/atoms/Badge';
import Avatar           from '../../components/atoms/Avatar';
import { useRole }      from '../../hooks/useRole';
import { canCustomer }  from '../../utils/permissions';
import {
  CUSTOMERS, CUSTOMER_STATS,
  MEMBER_TIERS, STATUS_OPTIONS, COUNTRY_OPTIONS, FREQUENCY_OPTIONS,
} from '../../data/customers';

/* ── Helpers ───────────────────────────────────────────────── */
const TIER_VARIANT = {
  'Regular Member':   'gray',
  'VIP Guest':        'purple',
  'Business Traveler':'blue',
  'Platinum Member':  'gold',
};
const STATUS_VARIANT = {
  Active:   'green',
  Inactive: 'gray',
  New:      'amber',
};

const ITEMS_PER_PAGE = 8;

const userNames = {
  admin: 'Admin User', manager: 'Alex Sterling', receptionist: 'Sarah Mitchell',
};
const userRoles = {
  admin: 'Super Administrator', manager: 'General Manager', receptionist: 'Front Desk Lead',
};

/* ── Stat Card ─────────────────────────────────────────────── */
const StatCard = ({ icon, label, value, badge, badgeVariant = 'green', sub, subVariant = 'green' }) => (
  <div className="card p-4 flex flex-col gap-1.5 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      {badge && (
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
          ${badgeVariant === 'green'  ? 'bg-green-100 text-green-700'   : ''}
          ${badgeVariant === 'blue'   ? 'bg-blue-100 text-blue-700'     : ''}
          ${badgeVariant === 'amber'  ? 'bg-amber-100 text-amber-700'   : ''}
          ${badgeVariant === 'gold'   ? 'bg-yellow-100 text-yellow-700' : ''}
          ${badgeVariant === 'red'    ? 'bg-red-100 text-red-700'       : ''}
        `}>{badge}</span>
      )}
    </div>
    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">{label}</p>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    {sub && (
      <p className={`text-[11px] font-medium
        ${subVariant === 'green'  ? 'text-green-600' : ''}
        ${subVariant === 'amber'  ? 'text-amber-600' : ''}
        ${subVariant === 'red'    ? 'text-red-600'   : ''}
        ${subVariant === 'gray'   ? 'text-gray-400'  : ''}
        ${subVariant === 'gold'   ? 'text-yellow-600': ''}
      `}>{sub}</p>
    )}
  </div>
);

/* ── Filter Select ─────────────────────────────────────────── */
const FilterSelect = ({ icon, label, value, onChange, options }) => (
  <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2 bg-white hover:border-gray-300 transition-colors">
    {icon && <span className="text-gray-400">{icon}</span>}
    <span className="text-xs text-gray-500 font-medium">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-xs text-gray-700 bg-transparent outline-none cursor-pointer font-medium"
    >
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  </div>
);

/* ── Main Component ────────────────────────────────────────── */
const CustomerList = () => {
  const navigate   = useNavigate();
  const role       = useRole();
  const basePath   = `/${role}`;

  const [search,        setSearch]        = useState('');
  const [tierFilter,    setTierFilter]    = useState('All');
  const [statusFilter,  setStatusFilter]  = useState('All');
  const [countryFilter, setCountryFilter] = useState('All');
  const [freqFilter,    setFreqFilter]    = useState('All');
  const [currentPage,   setCurrentPage]   = useState(1);
  const [deleteTarget,  setDeleteTarget]  = useState(null); // confirmation

  /* filtering */
  const filtered = useMemo(() => {
    return CUSTOMERS.filter((c) => {
      const q = search.toLowerCase();
      if (q && !(
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.id.toLowerCase().includes(q)
      )) return false;
      if (tierFilter    !== 'All' && c.memberTier !== tierFilter)    return false;
      if (statusFilter  !== 'All' && c.status     !== statusFilter)  return false;
      if (countryFilter !== 'All' && c.country    !== countryFilter) return false;
      if (freqFilter    !== 'All' && c.frequency  !== freqFilter)    return false;
      return true;
    });
  }, [search, tierFilter, statusFilter, countryFilter, freqFilter]);

  const totalPages  = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated   = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const resetFilters = () => {
    setSearch(''); setTierFilter('All'); setStatusFilter('All');
    setCountryFilter('All'); setFreqFilter('All'); setCurrentPage(1);
  };

  const handleDelete = (id) => {
    // In a real app, call API then refetch
    alert(`Customer ${id} deleted (mock).`);
    setDeleteTarget(null);
  };

  return (
    <DashboardLayout
      role={role}
      userName={userNames[role]}
      userRole={userRoles[role]}
      notificationCount={3}
      searchPlaceholder="Search guests, rooms or booking ID..."
    >
      {/* Breadcrumb */}
      <p className="text-xs text-gray-400 mb-1">
        Dashboard &rsaquo; <span className="text-gray-600 font-medium">Customers</span>
      </p>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
        {canCustomer(role, 'create') && (
          <button
            onClick={() => navigate(`${basePath}/customers/new`)}
            className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            + Add New Guest
          </button>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 mb-5">
        <StatCard
          icon={<Users className="w-4 h-4 text-slate-600" />}
          label="Total Customers"
          value={CUSTOMER_STATS.totalCustomers.toLocaleString()}
          badge="+12% ↑"
          badgeVariant="green"
        />
        <StatCard
          icon={<UserPlus className="w-4 h-4 text-blue-600" />}
          label="New Customers"
          value={CUSTOMER_STATS.newCustomers}
          badge="New"
          badgeVariant="blue"
        />
        <StatCard
          icon={<Activity className="w-4 h-4 text-green-600" />}
          label="Active Guests"
          value={CUSTOMER_STATS.activeGuests}
          sub="● Online Now"
          subVariant="green"
        />
        <StatCard
          icon={<Repeat className="w-4 h-4 text-yellow-600" />}
          label="Repeat Guests"
          value={`${CUSTOMER_STATS.repeatGuestsPercent}%`}
          badge="Gold Tier"
          badgeVariant="gold"
        />
        <StatCard
          icon={<AlertCircle className="w-4 h-4 text-red-500" />}
          label="Pending Payments"
          value={CUSTOMER_STATS.pendingPayments}
          badge="Critical"
          badgeVariant="red"
        />
      </div>

      {/* Search + Filters */}
      <div className="card p-3 mb-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white flex-1 min-w-[220px] focus-within:border-navy-400 transition-colors">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search by Name, Phone, Email, or ID..."
              className="text-xs text-gray-700 bg-transparent outline-none w-full placeholder-gray-400"
            />
          </div>

          <FilterSelect
            icon={<Filter className="w-3 h-3" />}
            label="Guest Type"
            value={tierFilter}
            onChange={(v) => { setTierFilter(v); setCurrentPage(1); }}
            options={MEMBER_TIERS}
          />
          <FilterSelect
            label="Status"
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
            options={STATUS_OPTIONS}
          />
          <FilterSelect
            icon={<Globe className="w-3 h-3" />}
            label="Country"
            value={countryFilter}
            onChange={(v) => { setCountryFilter(v); setCurrentPage(1); }}
            options={COUNTRY_OPTIONS}
          />
          <FilterSelect
            icon={<Star className="w-3 h-3" />}
            label="Frequency"
            value={freqFilter}
            onChange={(v) => { setFreqFilter(v); setCurrentPage(1); }}
            options={FREQUENCY_OPTIONS}
          />
          <button
            onClick={resetFilters}
            className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-400 hover:text-gray-600"
            title="Reset filters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {['Customer ID', 'Guest Name', 'Contact Info', 'Country', 'Bookings', 'Status', 'Actions'].map((h) => (
                <th
                  key={h}
                  className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                  No customers match your filters.
                </td>
              </tr>
            ) : paginated.map((c) => (
              <tr
                key={c.id}
                className="border-b border-gray-50 hover:bg-slate-50/70 transition-colors cursor-pointer"
                onClick={() => navigate(`${basePath}/customers/${c.id}`)}
              >
                {/* Customer ID */}
                <td className="px-4 py-3 align-middle">
                  <span className="font-bold text-navy-900 text-sm">{c.id}</span>
                </td>

                {/* Guest Name + Tier */}
                <td className="px-4 py-3 align-middle">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={c.name} size="sm" />
                    <div>
                      <p className="font-semibold text-gray-800 text-xs leading-tight">{c.name}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{c.memberTier}</p>
                    </div>
                  </div>
                </td>

                {/* Contact Info */}
                <td className="px-4 py-3 align-middle">
                  <p className="text-xs text-gray-700">{c.email}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{c.phone}</p>
                </td>

                {/* Country */}
                <td className="px-4 py-3 align-middle">
                  <p className="text-xs text-gray-700">{c.country}</p>
                </td>

                {/* Bookings */}
                <td className="px-4 py-3 align-middle">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-navy-900 text-white text-xs font-bold">
                    {c.bookingCount}
                  </span>
                </td>

                {/* Status */}
                <td className="px-4 py-3 align-middle">
                  <Badge variant={STATUS_VARIANT[c.status] || 'gray'} dot size="sm">
                    {c.status}
                  </Badge>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 align-middle" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`${basePath}/customers/${c.id}`)}
                      className="text-gray-400 hover:text-navy-700 transition-colors"
                      title="View Profile"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {canCustomer(role, 'edit') && (
                      <button
                        onClick={() => navigate(`${basePath}/customers/${c.id}/edit`)}
                        className="text-gray-400 hover:text-gold-600 transition-colors"
                        title="Edit Customer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                    {canCustomer(role, 'delete') && (
                      <button
                        onClick={() => setDeleteTarget(c)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete Customer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Showing{' '}
            <span className="font-semibold text-gray-700">
              {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–
              {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
            </span>{' '}
            of <span className="font-semibold text-gray-700">{CUSTOMER_STATS.totalCustomers.toLocaleString()}</span> customers
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: Math.min(totalPages, 4) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={[
                  'w-7 h-7 rounded-lg text-xs font-semibold transition-colors',
                  currentPage === p
                    ? 'bg-navy-900 text-white'
                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50',
                ].join(' ')}
              >
                {p}
              </button>
            ))}
            {totalPages > 4 && (
              <>
                <span className="text-gray-400 text-xs px-1">…</span>
                <button className="w-7 h-7 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50">
                  {totalPages}
                </button>
              </>
            )}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900 text-center mb-1">Delete Customer</h3>
            <p className="text-sm text-gray-500 text-center mb-5">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-gray-800">{deleteTarget.name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 border border-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTarget.id)}
                className="flex-1 bg-red-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CustomerList;
