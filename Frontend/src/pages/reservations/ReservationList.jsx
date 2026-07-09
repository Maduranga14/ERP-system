import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Download, Filter, ChevronLeft, ChevronRight,
  Calendar, Eye, LogIn, LogOut, Users, Loader2,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

import DashboardLayout from '../../components/templates/DashboardLayout';
import Badge           from '../../components/atoms/Badge';
import Button          from '../../components/atoms/Button';
import Avatar          from '../../components/atoms/Avatar';
import ActivityItem    from '../../components/molecules/ActivityItem';
import { useRole }     from '../../hooks/useRole';
import { can }         from '../../utils/permissions';
import { STATUS_OPTIONS, ROOM_TYPE_OPTIONS, PAYMENT_OPTIONS } from '../../data/reservations';
import { getReservations } from '../../utils/api';

const STATUS_VARIANT  = { 'Confirmed':'green','Checked In':'blue','Pending':'amber','Checked Out':'gray','Cancelled':'red' };
const PAYMENT_VARIANT = { 'Paid':'green','Partial':'amber','Pending':'red','Refunded':'purple' };

const occupancyData   = [{ value: 82 }, { value: 18 }];
const OCCUPANCY_COLORS = ['#B8943F', '#e5e7eb'];

const recentActivity = [
  { message: 'Room 402 Cleaned',       time: '12 mins ago', by: 'Housekeeping', dotColor: 'green' },
  { message: '#RES-29405 Created',     time: '45 mins ago', by: 'Reception',    dotColor: 'blue'  },
  { message: 'Payment Failed #29381',  time: '1 hour ago',  by: 'System',       dotColor: 'red'   },
];

const userNames = { admin:'Admin User', manager:'Alex Sterling', receptionist:'Sarah Mitchell' };
const userRoles = { admin:'Super Administrator', manager:'General Manager', receptionist:'Front Desk Lead' };

const ReservationList = () => {
  const navigate = useNavigate();
  const role = useRole();

  const [reservations,   setReservations]   = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState('');
  const [statusFilter,   setStatusFilter]   = useState('All');
  const [roomTypeFilter, setRoomTypeFilter]  = useState('All');
  const [paymentFilter,  setPaymentFilter]   = useState('All');
  const [currentPage,    setCurrentPage]     = useState(1);

  useEffect(() => {
    getReservations()
      .then(data => setReservations(data))
      .catch(() => setError('Failed to load reservations.'))
      .finally(() => setLoading(false));
  }, []);

  const basePath = role === 'admin' ? '/admin' : role === 'manager' ? '/manager' : '/receptionist';

  const filtered = reservations.filter((r) => {
    if (statusFilter  !== 'All' && r.status  !== statusFilter)  return false;
    if (paymentFilter !== 'All' && r.payment !== paymentFilter) return false;
    return true;
  });

  if (loading) return (
    <DashboardLayout role={role} userName={userNames[role]} userRole={userRoles[role]}>
      <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin" /> Loading reservations...
      </div>
    </DashboardLayout>
  );

  if (error) return (
    <DashboardLayout role={role} userName={userNames[role]} userRole={userRoles[role]}>
      <div className="flex items-center justify-center h-64 text-red-500 text-sm">{error}</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout
      role={role}
      userName={userNames[role]}
      userRole={userRoles[role]}
      notificationCount={3}
      searchPlaceholder="Search guests, rooms..."
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservation Management</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage guest bookings, room assignments, and payments.</p>
        </div>
        <div className="flex gap-2">
          {can(role, 'export') && (
            <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />}>Export</Button>
          )}
          {can(role, 'create') && (
            <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}
              onClick={() => navigate(`${basePath}/reservations/new`)}>
              New Reservation
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        {/* Main (3/4) */}
        <div className="xl:col-span-3 flex flex-col gap-4">

          {/* Stat Cards */}
          <div className="grid grid-cols-5 gap-3">
            {[
              { label:'Total',      value: reservations.length,                                              color:'text-gray-900' },
              { label:'Confirmed',  value: reservations.filter(r=>r.status==='Confirmed').length,            color:'text-green-600' },
              { label:'Pending',    value: reservations.filter(r=>r.status==='Pending').length,              color:'text-amber-500' },
              { label:'Checked In', value: reservations.filter(r=>r.status==='Checked In').length,           color:'text-blue-600' },
              { label:'Cancelled',  value: reservations.filter(r=>r.status==='Cancelled').length,            color:'text-red-500'  },
            ].map((s) => (
              <div key={s.label} className="card p-4">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
                <p className={['text-2xl font-bold mt-1', s.color].join(' ')}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="card p-3 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { label:'Status:',    value:statusFilter,   setter:setStatusFilter,   opts:STATUS_OPTIONS   },
                { label:'Room Type:', value:roomTypeFilter,  setter:setRoomTypeFilter, opts:ROOM_TYPE_OPTIONS },
                { label:'Payment:',   value:paymentFilter,   setter:setPaymentFilter,  opts:PAYMENT_OPTIONS  },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-1 border border-gray-200 rounded-lg px-2 py-1.5">
                  <span className="text-xs text-gray-500 font-medium">{f.label}</span>
                  <select value={f.value} onChange={(e) => f.setter(e.target.value)}
                    className="text-xs text-gray-700 bg-transparent outline-none cursor-pointer">
                    {f.opts.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-2 py-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-500">Dates</span>
              </div>
            </div>
            <button className="flex items-center gap-1.5 text-xs font-medium text-navy-800 border border-gray-200 rounded-lg px-3 py-1.5 w-fit hover:bg-gray-50 transition-colors">
              <Filter className="w-3.5 h-3.5" /> Advanced Filters
            </button>
          </div>

          {/* Table */}
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {['Reservation ID','Guest Details','Room','Dates','Status','Payment','Actions'].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors cursor-pointer"
                    onClick={() => navigate(`${basePath}/reservations/${r.id}`)}>
                    <td className="px-4 py-3 align-top">
                      <p className="font-bold text-navy-900 text-sm">RES-{10000 + r.id}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Booked: {r.bookedDate}</p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-start gap-2">
                        <Avatar name={r.customer?.name || '?'} size="sm" />
                        <div>
                          <p className="font-semibold text-gray-800 text-xs">{r.customer?.name}</p>
                          <p className="text-[11px] text-gray-400">{r.customer?.phone}</p>
                          <p className="text-[11px] text-gray-400">{r.customer?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p className="font-semibold text-gray-800 text-xs">Room {r.room?.number}</p>
                      <p className="text-[11px] text-gray-400">{r.room?.type}</p>
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-600">
                      <p>{r.checkIn}</p>
                      <p>— {r.checkOut}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{r.nights} Night{r.nights>1?'s':''}</p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Badge variant={STATUS_VARIANT[r.status]||'gray'} dot size="sm">{r.status}</Badge>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Badge variant={PAYMENT_VARIANT[r.payment]||'gray'} size="sm">{r.payment}</Badge>
                    </td>
                    <td className="px-4 py-3 align-top" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => navigate(`${basePath}/reservations/${r.id}`)}
                        className="text-gray-400 hover:text-navy-700 transition-colors" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">Showing 1 to {filtered.length} of 1,284 entries</p>
              <div className="flex items-center gap-1">
                <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {[1,2,3].map((p) => (
                  <button key={p} onClick={() => setCurrentPage(p)}
                    className={['w-7 h-7 rounded-lg text-xs font-semibold transition-colors',
                      currentPage===p ? 'bg-navy-900 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50',
                    ].join(' ')}>{p}</button>
                ))}
                <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar (1/4) */}
        <div className="flex flex-col gap-4">
          {/* Real-time Insights */}
          <div className="card bg-navy-900 text-white p-4 rounded-xl">
            <h3 className="text-sm font-semibold mb-4">Real-time Insights</h3>
            <div className="flex flex-col gap-2">
              {[
                { label:"Today's Check-ins",  count:18, icon:<LogIn  className="w-4 h-4"/> },
                { label:"Today's Check-outs", count:11, icon:<LogOut className="w-4 h-4"/> },
                { label:'Upcoming',            count:23, icon:<Calendar className="w-4 h-4"/> },
                { label:'Walk-ins',            count:3,  icon:<Users  className="w-4 h-4"/> },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between bg-white/10 rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-2 text-white/80">
                    {item.icon}
                    <span className="text-xs font-medium">{item.label}</span>
                  </div>
                  <span className="text-base font-bold text-white">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800">Recent Activity</h3>
              <button className="text-xs text-gold-600 hover:underline font-medium">View Audit Log</button>
            </div>
            <div className="flex flex-col">
              {recentActivity.map((a,i) => (
                <ActivityItem key={i} message={a.message} time={a.time} by={a.by} dotColor={a.dotColor} />
              ))}
            </div>
          </div>

          {/* Occupancy Donut */}
          <div className="card p-4 flex flex-col items-center">
            <div className="relative">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={occupancyData} innerRadius={42} outerRadius={56}
                    dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                    {occupancyData.map((_,i) => <Cell key={i} fill={OCCUPANCY_COLORS[i]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-lg font-bold text-gray-900">82%</p>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Occupancy</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">Currently peaking at mid-week capacity.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReservationList;
