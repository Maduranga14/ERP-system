import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  BedDouble, Users, CalendarCheck, DollarSign,
  Sparkles, Eye, Pencil, Plus, Loader2,
} from 'lucide-react';

import DashboardLayout from '../components/templates/DashboardLayout';
import StatCard        from '../components/molecules/StatCard';
import ChartCard       from '../components/organisms/ChartCard';
import DataTable       from '../components/organisms/DataTable';
import ActivityFeed    from '../components/organisms/ActivityFeed';
import RoomInventory   from '../components/organisms/RoomInventory';
import Badge           from '../components/atoms/Badge';
import Button          from '../components/atoms/Button';
import Avatar          from '../components/atoms/Avatar';
import { getRooms, getReservations, getInvoices, getHousekeepingTasks, getEmployees, getMaintenanceRequests } from '../utils/api';

/* ─── Constant Palette ─────────────────────────────────────────── */
const PIE_COLORS = ['#0D2137', '#B8943F', '#94a3b8', '#38bdf8', '#f43f5e'];

const columns = [
  { key: 'id',       label: 'ID'       },
  { key: 'guest',    label: 'Guest',
    render: (v) => (
      <div className="flex items-center gap-2">
        <Avatar name={v} size="xs" />
        <span className="font-medium text-xs">{v}</span>
      </div>
    )
  },
  { key: 'room',     label: 'Room'     },
  { key: 'checkIn',  label: 'Check-In' },
  { key: 'checkOut', label: 'Check-Out'},
  {
    key: 'status', label: 'Status',
    render: (v) => (
      <Badge variant={v === 'Confirmed' ? 'green' : v === 'Checked In' ? 'blue' : 'amber'} dot size="sm">{v}</Badge>
    ),
  }
];

/* ─── Component ─────────────────────────────────────────── */
const getLoggedInUser = () => {
  try {
    const info = JSON.parse(localStorage.getItem('userInfo') || '{}');
    return info.fullName || 'Admin';
  } catch { return 'Admin'; }
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const loggedInName = getLoggedInUser();

  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getRooms(),
      getReservations(),
      getInvoices(),
      getHousekeepingTasks(),
      getEmployees(),
      getMaintenanceRequests()
    ]).then(([roomData, resData, invData, taskData, empData, maintData]) => {
      setRooms(roomData || []);
      setReservations(resData || []);
      setInvoices(invData || []);
      setTasks(taskData || []);
      setEmployees(empData || []);
      setMaintenance(maintData || []);
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  /* ── Calculations ── */
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const stats = useMemo(() => {
    const total = rooms.length;
    const available = rooms.filter(r => r.status === 'Available').length;
    const activeGuests = reservations.filter(r => r.status === 'Checked In').length;
    const pendingReservations = reservations.filter(r => r.status === 'Confirmed' || r.status === 'Pending').length;

    let todayRev = 0;
    invoices.forEach(inv => {
      inv.payments?.forEach(p => {
        if (p.date === todayStr) {
          todayRev += p.amount;
        }
      });
    });

    const needCleaning = rooms.filter(r => r.status === 'Cleaning' || r.status === 'Dirty').length;

    return { total, available, activeGuests, pendingReservations, todayRev, needCleaning };
  }, [rooms, reservations, invoices, todayStr]);

  const distData = useMemo(() => {
    const counts = {};
    rooms.forEach(r => {
      counts[r.type] = (counts[r.type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).slice(0, 5);
  }, [rooms]);

  const recentReservations = useMemo(() => {
    return [...reservations]
      .sort((a, b) => b.id - a.id)
      .slice(0, 5)
      .map(r => ({
        id: `RES-${10000 + r.id}`,
        guest: r.customer?.name || 'Guest',
        room: r.room ? `Room ${r.room.number}` : 'TBD',
        checkIn: r.checkIn,
        checkOut: r.checkOut,
        status: r.status
      }));
  }, [reservations]);

  const activityLogs = useMemo(() => {
    const logs = [];
    reservations.slice(-2).forEach(r => {
      logs.push({
        message: `Reservation created for ${r.customer?.name || 'Guest'} (Room ${r.room?.number || 'TBD'}).`,
        time: 'Today',
        dotColor: 'blue'
      });
    });
    tasks.filter(t => t.status === 'Completed').slice(-1).forEach(t => {
      logs.push({
        message: `Housekeeping: Room ${t.room?.number || ''} completed cleaning.`,
        time: 'Today',
        dotColor: 'green'
      });
    });
    invoices.slice(-1).forEach(i => {
      logs.push({
        message: `Invoice generated for ${i.guestName} (${i.grandTotal ? `$${i.grandTotal.toFixed(2)}` : 'Pending'}).`,
        time: 'Today',
        dotColor: 'gold'
      });
    });
    if (logs.length === 0) {
      return [{ message: 'System fully loaded and operational.', time: 'Just now', dotColor: 'blue' }];
    }
    return logs;
  }, [reservations, tasks, invoices]);

  // Fallback charts mock data wrapped in actuals
  const occupancyData = [
    { day: 'Mon', value: 65 }, { day: 'Tue', value: 70 }, { day: 'Wed', value: 75 },
    { day: 'Thu', value: 80 }, { day: 'Fri', value: stats.total ? Math.round((rooms.filter(r => r.status === 'Occupied').length / stats.total) * 100) : 85 },
    { day: 'Sat', value: 90 }, { day: 'Sun', value: 88 },
  ];

  const revenueData = [
    { month: 'May', value: 3800 },
    { month: 'Jun', value: 4700 },
    { month: 'Jul', value: stats.todayRev || 1200 },
  ];

  const trendData = [
    { week: 'W1', value: 12 }, { week: 'W2', value: 18 },
    { week: 'W3', value: reservations.length }, { week: 'W4', value: reservations.length + 5 },
  ];

  const inventoryItems = [
    { label: 'Available',   count: stats.available, total: stats.total || 1, color: 'green', dot: 'bg-green-500' },
    { label: 'Occupied',    count: rooms.filter(r => r.status === 'Occupied').length, total: stats.total || 1, color: 'navy',  dot: 'bg-navy-700'  },
    { label: 'Reserved',    count: rooms.filter(r => r.status === 'Reserved').length, total: stats.total || 1, color: 'gold',  dot: 'bg-gold-500'  },
    { label: 'Maintenance', count: rooms.filter(r => r.status === 'Maintenance').length,  total: stats.total || 1, color: 'red',   dot: 'bg-red-500'   },
  ];

  if (loading) return (
    <DashboardLayout role="admin" userName={loggedInName} userRole="Super Administrator">
      <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin" /> Loading administrator metrics...
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout
      role="admin"
      userName={loggedInName}
      userRole="Super Administrator"
      notificationCount={3}
      searchPlaceholder="Search guests, rooms, invoices..."
    >
      {/* Greeting */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {loggedInName} 👋</h1>
        <p className="text-sm text-gray-400 mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
        <StatCard label="Total Rooms"      value={stats.total} sublabel="Operational" borderColor="navy"  icon={<BedDouble className="w-5 h-5 text-navy-700" />}  iconBg="bg-navy-100" />
        <StatCard label="Available"        value={stats.available}  sublabel="Ready"   borderColor="gold"  icon={<BedDouble className="w-5 h-5 text-gold-600" />}  iconBg="bg-gold-100" />
        <StatCard label="Active Guests"    value={stats.activeGuests}  sublabel="Staying" borderColor="blue"  icon={<Users className="w-5 h-5 text-blue-600" />}       iconBg="bg-blue-100" />
        <StatCard label="Reservations"     value={stats.pendingReservations}  sublabel="Booked"  borderColor="amber" icon={<CalendarCheck className="w-5 h-5 text-amber-600" />} iconBg="bg-amber-100" />
        <StatCard label="Today's Revenue"  value={`$${stats.todayRev.toFixed(2)}`} sublabel="Received" variant="featured" icon={<DollarSign className="w-5 h-5" />} className="col-span-1" />
        <StatCard label="Need Cleaning"    value={stats.needCleaning}   sublabel="Dirty Rooms" borderColor="red"   icon={<Sparkles className="w-5 h-5 text-red-500" />}    iconBg="bg-red-100" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        {/* Charts 2/3 width */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <ChartCard title="Occupancy Rate">
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={occupancyData}>
                  <defs>
                    <linearGradient id="occGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0D2137" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0D2137" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="value" stroke="#0D2137" strokeWidth={2} fill="url(#occGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Monthly Revenue">
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={revenueData}>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Bar dataKey="value" fill="#B8943F" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Reservation Trends">
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={trendData}>
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="value" stroke="#0D2137" strokeWidth={2} dot={{ r: 4, fill: '#0D2137' }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Room Distribution">
              <div className="flex items-center justify-center gap-4">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={distData} innerRadius={35} outerRadius={55} dataKey="value" stroke="none">
                      {distData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2">
                  {distData.map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[10px]">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-gray-500">{d.name} ({d.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            </ChartCard>
          </div>

          {/* Reservations table */}
          <div className="card">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">Recent Reservations</h3>
              <button onClick={() => navigate('/admin/reservations')} className="text-xs text-gold-600 font-medium hover:underline">View All</button>
            </div>
            <DataTable columns={columns} rows={recentReservations} />
          </div>

          {/* Summary row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-gold-500" />
                <span className="text-sm font-semibold text-gray-700">Housekeeping</span>
              </div>
              <div className="flex gap-6">
                <div><p className="text-[11px] text-gray-400 uppercase font-semibold">Awaiting</p><p className="text-2xl font-bold text-gray-900">{tasks.filter(t => t.status === 'Pending').length}</p></div>
                <div><p className="text-[11px] text-gray-400 uppercase font-semibold">In Progress</p><p className="text-2xl font-bold text-gray-900">{tasks.filter(t => t.status === 'In Progress').length}</p></div>
              </div>
            </div>
            <div className="card p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Financial Summary</p>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs"><span className="text-gray-500">Unpaid Invoices</span><span className="text-red-500 font-semibold">${invoices.filter(i => i.status !== 'Paid').reduce((a, b) => a + (b.grandTotal - b.amountPaid), 0).toFixed(2)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-500">Paid Today</span><span className="text-green-600 font-semibold">${stats.todayRev.toFixed(2)}</span></div>
              </div>
            </div>
            <div className="card p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Staffing</p>
              <div className="flex gap-6">
                <div><p className="text-[11px] text-gray-400 uppercase font-semibold">On Duty</p><p className="text-2xl font-bold text-gray-900">{employees.length}</p></div>
                <div><p className="text-[11px] text-gray-400 uppercase font-semibold">Issues Raised</p><p className="text-2xl font-bold text-amber-500">{maintenance.filter(m => m.status === 'Pending' || m.status === 'Open Request').length}</p></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar 1/3 */}
        <div className="flex flex-col gap-4">
          {/* Quick Actions */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: <CalendarCheck className="w-4 h-4" />, label: 'New Booking', path: '/admin/reservations/new' },
                { icon: <BedDouble className="w-4 h-4" />,     label: 'Rooms List', path: '/admin/rooms' },
                { icon: <Users className="w-4 h-4" />,          label: 'Guests', path: '/admin/customers' },
                { icon: <DollarSign className="w-4 h-4" />,     label: 'Invoices', path: '/admin/billing' },
                { icon: <Plus className="w-4 h-4" />,           label: 'Add Staff', path: '/admin/employees/new' },
                { icon: <Eye className="w-4 h-4" />,            label: 'Shift Cleanings', path: '/admin/housekeeping' },
              ].map((a, i) => (
                <button
                  key={i}
                  onClick={() => navigate(a.path)}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-gray-100 hover:border-gold-300 hover:bg-gold-50 transition-all duration-150 group"
                >
                  <span className="text-navy-700 group-hover:text-gold-600">{a.icon}</span>
                  <span className="text-[11px] text-gray-600 font-medium">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          <RoomInventory
            items={inventoryItems}
          />

          <ActivityFeed items={activityLogs} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
