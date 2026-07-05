import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  BedDouble, Users, CalendarCheck, DollarSign,
  Sparkles, Eye, Pencil, Plus,
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

/* ─── Mock data ─────────────────────────────────────────── */
const occupancyData = [
  { day: 'Mon', value: 72 }, { day: 'Tue', value: 68 }, { day: 'Wed', value: 80 },
  { day: 'Thu', value: 75 }, { day: 'Fri', value: 90 }, { day: 'Sat', value: 88 },
  { day: 'Sun', value: 65 },
];
const revenueData = [
  { month: 'Jan', value: 3200 }, { month: 'Feb', value: 4100 }, { month: 'Mar', value: 3800 },
  { month: 'Apr', value: 5200 }, { month: 'May', value: 4700 }, { month: 'Jun', value: 6300 },
];
const trendData = [
  { week: 'W1', value: 20 }, { week: 'W2', value: 35 },
  { week: 'W3', value: 28 }, { week: 'W4', value: 45 },
];
const distData = [
  { name: 'Standard', value: 40 },
  { name: 'Deluxe',   value: 35 },
  { name: 'Suite',    value: 25 },
];
const PIE_COLORS = ['#0D2137', '#B8943F', '#94a3b8'];

const reservations = [
  { id: 'R001', guest: 'John Doe',   room: 201, checkIn: 'Jul 3, 2024', checkOut: 'Jul 6, 2024', status: 'Confirmed' },
  { id: 'R002', guest: 'Jane Smith', room: 305, checkIn: 'Jul 3, 2024', checkOut: 'Jul 5, 2024', status: 'Checked In' },
];

const activity = [
  { message: 'New Reservation created by Admin for Room 104.', time: '2 mins ago',  dotColor: 'blue'  },
  { message: 'Guest Checked In: John Doe - Room 201.',          time: '15 mins ago', dotColor: 'green' },
  { message: 'Cleaning Required: Room 305 marked as dirty.',    time: '1 hour ago',  dotColor: 'amber' },
  { message: 'Payment Received: $1,200 for R009.',              time: '3 hours ago', dotColor: 'gold'  },
];

const columns = [
  { key: 'id',       label: 'ID'       },
  { key: 'guest',    label: 'Guest',
    render: (v) => (
      <div className="flex items-center gap-2">
        <Avatar name={v} size="xs" />
        <span className="font-medium">{v}</span>
      </div>
    )
  },
  { key: 'room',     label: 'Room'     },
  { key: 'checkIn',  label: 'Check-In' },
  { key: 'checkOut', label: 'Check-Out'},
  {
    key: 'status', label: 'Status',
    render: (v) => (
      <Badge variant={v === 'Confirmed' ? 'green' : 'blue'} dot>{v}</Badge>
    ),
  },
  {
    key: 'id', label: 'Action',
    render: (_, row) => (
      <div className="flex gap-1">
        <button className="text-gray-400 hover:text-blue-600 transition-colors"><Eye className="w-4 h-4" /></button>
        <button className="text-gray-400 hover:text-gold-600 transition-colors"><Pencil className="w-4 h-4" /></button>
      </div>
    ),
  },
];

/* ─── Component ─────────────────────────────────────────── */
const AdminDashboard = () => (
  <DashboardLayout
    role="admin"
    userName="Admin User"
    userRole="Super Administrator"
    notificationCount={3}
    searchPlaceholder="Search guests, rooms, invoices..."
  >
    {/* Stat row */}
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
      <StatCard label="Total Rooms"      value={100} sublabel="+2%"    borderColor="navy"  icon={<BedDouble className="w-5 h-5 text-navy-700" />}  iconBg="bg-navy-100" />
      <StatCard label="Available"        value={42}  sublabel="High"   borderColor="gold"  icon={<BedDouble className="w-5 h-5 text-gold-600" />}  iconBg="bg-gold-100" />
      <StatCard label="Active Guests"    value={35}  sublabel="Active" borderColor="blue"  icon={<Users className="w-5 h-5 text-blue-600" />}       iconBg="bg-blue-100" />
      <StatCard label="Reservations"     value={12}  sublabel="Today"  borderColor="amber" icon={<CalendarCheck className="w-5 h-5 text-amber-600" />} iconBg="bg-amber-100" />
      <StatCard label="Today's Revenue"  value="$4,500" sublabel="Today" variant="featured" icon={<DollarSign className="w-5 h-5" />} className="col-span-1" />
      <StatCard label="Need Cleaning"    value={5}   sublabel="Urgent" borderColor="red"   icon={<Sparkles className="w-5 h-5 text-red-500" />}    iconBg="bg-red-100" />
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
                    {distData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2">
                {distData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: PIE_COLORS[i] }} />
                    <span className="text-gray-500">{d.name}</span>
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
            <button className="text-xs text-gold-600 font-medium hover:underline">View All</button>
          </div>
          <DataTable columns={columns} rows={reservations} />
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-gold-500" />
              <span className="text-sm font-semibold text-gray-700">Housekeeping</span>
            </div>
            <div className="flex gap-6">
              <div><p className="text-[11px] text-gray-400 uppercase">Awaiting</p><p className="text-2xl font-bold text-gray-900">8</p></div>
              <div><p className="text-[11px] text-gray-400 uppercase">In Progress</p><p className="text-2xl font-bold text-gray-900">3</p></div>
            </div>
          </div>
          <div className="card p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Financial Summary</p>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs"><span className="text-gray-500">Pending Invoices</span><span className="text-red-500 font-semibold">$12,450</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-500">Paid Today</span><span className="text-green-600 font-semibold">$3,200</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-500">Refunds</span><span className="text-amber-500 font-semibold">$450</span></div>
            </div>
          </div>
          <div className="card p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Staffing</p>
            <div className="flex gap-6">
              <div><p className="text-[11px] text-gray-400 uppercase">On Duty</p><p className="text-2xl font-bold text-gray-900">24</p></div>
              <div><p className="text-[11px] text-gray-400 uppercase">On Leave</p><p className="text-2xl font-bold text-amber-500">2</p></div>
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
              { icon: <CalendarCheck className="w-4 h-4" />, label: 'New Booking' },
              { icon: <BedDouble className="w-4 h-4" />,     label: 'Add Room' },
              { icon: <Users className="w-4 h-4" />,          label: 'Guest Entry' },
              { icon: <DollarSign className="w-4 h-4" />,     label: 'Invoice' },
              { icon: <Plus className="w-4 h-4" />,           label: 'Add Staff' },
              { icon: <Eye className="w-4 h-4" />,            label: 'Reports' },
            ].map((a, i) => (
              <button
                key={i}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-gray-100 hover:border-gold-300 hover:bg-gold-50 transition-all duration-150 group"
              >
                <span className="text-navy-700 group-hover:text-gold-600">{a.icon}</span>
                <span className="text-[11px] text-gray-600 font-medium">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        <RoomInventory
          items={[
            { label: 'Available',   count: 42, total: 100, color: 'green', dot: 'bg-green-500' },
            { label: 'Occupied',    count: 35, total: 100, color: 'navy',  dot: 'bg-navy-700'  },
            { label: 'Reserved',    count: 10, total: 100, color: 'gold',  dot: 'bg-gold-500'  },
            { label: 'Maintenance', count: 2,  total: 100, color: 'red',   dot: 'bg-red-500'   },
          ]}
        />

        <ActivityFeed items={activity} />
      </div>
    </div>

</DashboardLayout>
);

export default AdminDashboard;
