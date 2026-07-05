import React from 'react';
import {
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  DollarSign, BedDouble, Users, Wrench,
  AlertTriangle, Download, Plus, Pencil,
} from 'lucide-react';

import DashboardLayout from '../components/templates/DashboardLayout';
import StatCard        from '../components/molecules/StatCard';
import ChartCard       from '../components/organisms/ChartCard';
import DataTable       from '../components/organisms/DataTable';
import ActivityFeed    from '../components/organisms/ActivityFeed';
import StaffOnDuty     from '../components/organisms/StaffOnDuty';
import RoomStatusGrid  from '../components/organisms/RoomStatusGrid';
import AlertCard       from '../components/molecules/AlertCard';
import Badge           from '../components/atoms/Badge';
import Button          from '../components/atoms/Button';
import ProgressBar     from '../components/atoms/ProgressBar';

/* ─── Mock data ─────────────────────────────────────────── */
const revenueData = [
  { day: 'Mon', value: 8000 }, { day: 'Tue', value: 9500 }, { day: 'Wed', value: 11000 },
  { day: 'Thu', value: 12450, highlight: true }, { day: 'Fri', value: 10200 },
  { day: 'Sat', value: 9800 }, { day: 'Sun', value: 8700 },
];

// 10 cols × 4 rows = 40 rooms
const generateRooms = () => {
  const statuses = ['available','available','available','available','occupied','occupied','occupied','reserved','cleaning','maintenance'];
  return Array.from({ length: 40 }, (_, i) => ({
    number: 101 + Math.floor(i / 10) * 10 + (i % 10),
    status: statuses[Math.floor(Math.random() * statuses.length)],
  }));
};
const rooms = generateRooms();

const reservations = [
  { id: 1, guest: 'John Doe',   room: 'Deluxe #201',   checkIn: 'Jul 3, 2026', checkOut: 'Jul 6, 2026', status: 'CHECKED IN'   },
  { id: 2, guest: 'Sarah Smith',room: 'Executive #405', checkIn: 'Jul 3, 2026', checkOut: 'Jul 8, 2026', status: 'RESERVED'     },
  { id: 3, guest: 'Mark Ross',  room: 'Standard #102',  checkIn: 'Jun 30, 2026',checkOut: 'Jul 3, 2026', status: 'CHECKING OUT' },
];

const statusVariant = { 'CHECKED IN': 'green', 'RESERVED': 'blue', 'CHECKING OUT': 'amber' };

const columns = [
  { key: 'guest',    label: 'Guest',    render: (v) => <span className="font-medium">{v}</span> },
  { key: 'room',     label: 'Room'      },
  { key: 'checkIn',  label: 'Check-In'  },
  { key: 'checkOut', label: 'Check-Out' },
  { key: 'status',   label: 'Status',   render: (v) => <Badge variant={statusVariant[v] || 'gray'} size="sm">{v}</Badge> },
  { key: 'id', label: 'Actions',        render: () => <button className="text-gray-400 hover:text-gold-600"><Pencil className="w-4 h-4" /></button> },
];

const activity = [
  { message: 'New reservation created — Room 301', time: '2 mins ago',  dotColor: 'blue'  },
  { message: 'Guest checked in — Room 104',         time: '15 mins ago', dotColor: 'green' },
  { message: 'Room marked clean — Suite 505',       time: '45 mins ago', dotColor: 'gold'  },
  { message: 'Invoice #832 paid — $1,200',          time: '1 hour ago',  dotColor: 'navy'  },
];

/* ─── Component ─────────────────────────────────────────── */
const ManagerDashboard = () => (
  <DashboardLayout
    role="manager"
    userName="Alex Sterling"
    userRole="General Manager"
    notificationCount={5}
    searchPlaceholder="Search reservations, rooms..."
    topBarActions={
      <div className="flex gap-2">
        <Button variant="outline" size="sm" icon={<Download className="w-3.5 h-3.5" />}>Export Occupancy</Button>
        <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>Create Reservation</Button>
      </div>
    }
  >
    {/* Greeting */}
    <div className="mb-5">
      <h1 className="text-2xl font-bold text-gray-900">Welcome back, Hotel Manager 👋</h1>
      <p className="text-sm text-gray-400 mt-0.5">Friday, July 3, 2026</p>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      <StatCard label="Today's Revenue"       value="$12,450" sublabel="+12.5%" trendDir="up"  borderColor="gold"  icon={<DollarSign className="w-5 h-5 text-gold-600" />}    iconBg="bg-gold-100" />
      <StatCard label="Occupancy Rate"        value="82%"     sublabel="Target 85%"             borderColor="blue"  icon={<BedDouble className="w-5 h-5 text-blue-600" />}      iconBg="bg-blue-100" />
      <StatCard label="Current Guests"        value={156}     sublabel="Active"                  borderColor="green" icon={<Users className="w-5 h-5 text-green-600" />}         iconBg="bg-green-100" />
      <StatCard label="Maintenance Requests"  value={3}       sublabel="3 Urgent"                borderColor="red"   icon={<Wrench className="w-5 h-5 text-red-500" />}          iconBg="bg-red-100" />
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      {/* Left 2/3 */}
      <div className="xl:col-span-2 flex flex-col gap-4">
        {/* Revenue chart */}
        <ChartCard
          title="Revenue Analytics"
          headerRight={
            <button className="text-xs border border-gray-200 rounded-lg px-2.5 py-1 text-gray-500 hover:border-gold-300">
              Weekly View
            </button>
          }
        >
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={revenueData}>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v) => [`$${v.toLocaleString()}`, 'Revenue']} />
              <Bar
                dataKey="value"
                radius={[4, 4, 0, 0]}
                fill="#cbd5e1"
                label={false}
              >
                {revenueData.map((d, i) => (
                  <rect key={i} fill={d.highlight ? '#B8943F' : '#cbd5e1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Room grid */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Room Status Overview</h3>
            <div className="flex gap-3 text-[11px] text-gray-500">
              <span className="text-green-600 font-medium">● Available (35)</span>
              <span className="text-blue-600 font-medium">● Reserved (24)</span>
              <span className="text-orange-500 font-medium">● Occupied (158)</span>
              <span className="text-purple-600 font-medium">● Cleaning (12)</span>
              <span className="text-red-600 font-medium">● Maintenance (3)</span>
            </div>
          </div>
          <RoomStatusGrid rooms={rooms} className="shadow-none border-0 p-0" />
        </div>

        {/* Today's Reservations */}
        <div className="card">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Today's Reservations</h3>
            <div className="flex gap-1">
              <button className="text-gray-400 hover:text-gray-600 p-1"><AlertTriangle className="w-4 h-4" /></button>
            </div>
          </div>
          <DataTable columns={columns} rows={reservations} />
        </div>
      </div>

      {/* Right 1/3 */}
      <div className="flex flex-col gap-4">
        {/* Critical Alerts */}
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Critical Alerts
          </h3>
          <div className="flex flex-col gap-2">
            <AlertCard variant="warning" title="High Occupancy Warning"  message="Occupancy reached 92% for tomorrow. Adjust pricing or staffing." />
            <AlertCard variant="info"    title="VIP Arrival"             message="Ambassador Julian Vane arriving at 4:00 PM. Suite 402 ready." />
            <AlertCard variant="danger"  title="Overdue Maintenance"     message="Room 205 AC repair is 4 hours overdue." />
          </div>
        </div>

        <ActivityFeed items={activity} />

        <StaffOnDuty
          total={42}
          departments={[
            { dept: 'Reception',    count: 6,  total: 10, color: 'blue'  },
            { dept: 'Housekeeping', count: 28, total: 35, color: 'gold'  },
            { dept: 'Maintenance',  count: 8,  total: 10, color: 'navy'  },
          ]}
        />

        {/* Cleaning Status */}
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Cleaning Status</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Clean',    count: 55, color: 'text-green-600' },
              { label: 'Cleaning', count: 6,  color: 'text-blue-600'  },
              { label: 'Dirty',    count: 4,  color: 'text-amber-500' },
              { label: 'Issues',   count: 2,  color: 'text-red-500'   },
            ].map((c) => (
              <div key={c.label} className="text-center">
                <p className={['text-2xl font-bold', c.color].join(' ')}>{c.count}</p>
                <p className="text-xs text-gray-400">{c.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Footer */}
    <div className="flex items-center justify-between mt-6 text-[11px] text-gray-400 border-t border-gray-200 pt-3">
      <span>© 2026 Grand Horizon ERP v4.2.0 • Last Sync: 12:45:10 PM</span>
      <div className="flex gap-3">
        <span className="text-green-600 font-medium">● System Operational</span>
        <a href="#" className="hover:underline">Support Center</a>
      </div>
    </div>
  </DashboardLayout>
);

export default ManagerDashboard;
