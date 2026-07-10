import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  DollarSign, BedDouble, Users, Wrench,
  AlertTriangle, Download, Plus, Pencil, Loader2,
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

import { getRooms, getReservations, getInvoices, getMaintenanceRequests, getEmployees } from '../utils/api';

const statusVariant = { 'Checked In': 'green', Confirmed: 'blue', Pending: 'amber', Completed: 'green' };

const columns = [
  { key: 'guest',    label: 'Guest',    render: (v) => <span className="font-medium text-xs">{v}</span> },
  { key: 'room',     label: 'Room'      },
  { key: 'checkIn',  label: 'Check-In'  },
  { key: 'checkOut', label: 'Check-Out' },
  { key: 'status',   label: 'Status',   render: (v) => <Badge variant={statusVariant[v] || 'gray'} size="sm">{v}</Badge> }
];

const ManagerDashboard = () => {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      getRooms(),
      getReservations(),
      getInvoices(),
      getMaintenanceRequests(),
      getEmployees()
    ]).then(([roomData, resData, invData, maintData, empData]) => {
      setRooms(roomData || []);
      setReservations(resData || []);
      setInvoices(invData || []);
      setMaintenance(maintData || []);
      setEmployees(empData || []);
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }, []);

  const metrics = useMemo(() => {
    let todayRev = 0;
    invoices.forEach(inv => {
      inv.payments?.forEach(p => {
        if (p.date === todayStr) {
          todayRev += p.amount;
        }
      });
    });

    const totalRooms = rooms.length || 1;
    const occupiedCount = rooms.filter(r => r.status === 'Occupied' || r.status === 'Checked In').length;
    const occupancyPercent = Math.round((occupiedCount / totalRooms) * 100);

    const activeGuests = reservations.filter(r => r.status === 'Checked In').length;
    const pendingMaint = maintenance.filter(m => m.status === 'Pending' || m.status === 'Open Request').length;

    return { todayRev, occupancyPercent, activeGuests, pendingMaint };
  }, [rooms, reservations, invoices, maintenance, todayStr]);

  const recentReservations = useMemo(() => {
    return reservations
      .filter(r => r.checkIn === todayStr)
      .slice(0, 5)
      .map(r => ({
        guest: r.customer?.name || 'Guest',
        room: r.room ? `Room ${r.room.number}` : 'TBD',
        checkIn: r.checkIn,
        checkOut: r.checkOut,
        status: r.status
      }));
  }, [reservations, todayStr]);

  const activityLogs = useMemo(() => {
    const logs = [];
    reservations.slice(-2).forEach(r => {
      logs.push({
        message: `New reservation created — ${r.customer?.name || 'Guest'}`,
        time: 'Today',
        dotColor: 'blue'
      });
    });
    rooms.filter(r => r.status === 'Available').slice(-1).forEach(r => {
      logs.push({
        message: `Room marked clean — Room ${r.number}`,
        time: 'Today',
        dotColor: 'gold'
      });
    });
    invoices.filter(i => i.status === 'Paid').slice(-1).forEach(i => {
      logs.push({
        message: `Invoice #${i.id} paid — $${i.amountPaid.toFixed(2)}`,
        time: 'Today',
        dotColor: 'navy'
      });
    });
    if (logs.length === 0) {
      return [{ message: 'Hotel operations running smoothly.', time: 'Just now', dotColor: 'green' }];
    }
    return logs;
  }, [reservations, rooms, invoices]);

  // fallback revenue data mapping
  const revenueData = [
    { day: 'Mon', value: 8000 }, { day: 'Tue', value: 9500 }, { day: 'Wed', value: 11000 },
    { day: 'Thu', value: metrics.todayRev > 0 ? metrics.todayRev : 12450, highlight: true }, { day: 'Fri', value: 10200 },
    { day: 'Sat', value: 9800 }, { day: 'Sun', value: 8700 },
  ];

  if (loading) return (
    <DashboardLayout role="manager" userName="Alex Sterling" userRole="General Manager">
      <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin" /> Loading manager metrics...
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout
      role="manager"
      userName="Alex Sterling"
      userRole="General Manager"
      notificationCount={5}
      searchPlaceholder="Search reservations, rooms..."
      topBarActions={
        <div className="flex gap-2">
          <Button onClick={() => window.print()} variant="outline" size="sm" icon={<Download className="w-3.5 h-3.5" />}>Print PDF</Button>
          <Button onClick={() => navigate('/manager/reservations/new')} variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>Create Reservation</Button>
        </div>
      }
    >
      {/* Greeting */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, Hotel Manager 👋</h1>
        <p className="text-sm text-gray-400 mt-0.5">{todayFormatted}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard label="Today's Revenue"       value={`$${metrics.todayRev.toFixed(2)}`} sublabel="Received Today" borderColor="gold"  icon={<DollarSign className="w-5 h-5 text-gold-600" />}    iconBg="bg-gold-100" />
        <StatCard label="Occupancy Rate"        value={`${metrics.occupancyPercent}%`}     sublabel={`${rooms.filter(r => r.status === 'Occupied' || r.status === 'Checked In').length}/${rooms.length} Rooms`}             borderColor="blue"  icon={<BedDouble className="w-5 h-5 text-blue-600" />}      iconBg="bg-blue-100" />
        <StatCard label="Current Guests"        value={metrics.activeGuests}     sublabel="Checked In"                  borderColor="green" icon={<Users className="w-5 h-5 text-green-600" />}         iconBg="bg-green-100" />
        <StatCard label="Maintenance Requests"  value={metrics.pendingMaint}       sublabel="Pending Action"                borderColor="red"   icon={<Wrench className="w-5 h-5 text-red-500" />}          iconBg="bg-red-100" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left 2/3 */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          {/* Revenue chart */}
          <ChartCard
            title="Revenue Analytics"
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
              <div className="flex gap-3 text-[10px] text-gray-500">
                <span className="text-green-600 font-semibold">● Available ({rooms.filter(r => r.status === 'Available').length})</span>
                <span className="text-blue-600 font-semibold">● Reserved ({rooms.filter(r => r.status === 'Reserved').length})</span>
                <span className="text-orange-500 font-semibold">● Occupied ({rooms.filter(r => r.status === 'Occupied' || r.status === 'Checked In').length})</span>
                <span className="text-purple-600 font-semibold">● Cleaning ({rooms.filter(r => r.status === 'Cleaning').length})</span>
                <span className="text-red-600 font-semibold">● Maintenance ({rooms.filter(r => r.status === 'Maintenance').length})</span>
              </div>
            </div>
            <RoomStatusGrid rooms={rooms.slice(0, 40)} className="shadow-none border-0 p-0" />
          </div>

          {/* Today's Reservations */}
          <div className="card">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">Today's Reservations</h3>
            </div>
            <DataTable columns={columns} rows={recentReservations} />
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
              {metrics.occupancyPercent > 85 ? (
                <AlertCard variant="warning" title="High Occupancy Warning"  message={`Occupancy reached ${metrics.occupancyPercent}% for today. Adjust staffing.`} />
              ) : (
                <AlertCard variant="info" title="Stable Occupancy" message={`Current occupancy is at a stable ${metrics.occupancyPercent}%.`} />
              )}
              {metrics.pendingMaint > 0 && (
                <AlertCard variant="danger"  title="Overdue Maintenance"     message={`You have ${metrics.pendingMaint} pending maintenance request(s).`} />
              )}
            </div>
          </div>

          <ActivityFeed items={activityLogs} />

          <StaffOnDuty
            total={employees.length}
            departments={[
              { dept: 'Staff Total',    count: employees.length,  total: employees.length, color: 'blue'  }
            ]}
          />

          {/* Cleaning Status */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Cleaning Status</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Clean',    count: rooms.filter(r => r.status === 'Available').length, color: 'text-green-600' },
                { label: 'Cleaning', count: rooms.filter(r => r.status === 'Cleaning').length, color: 'text-blue-600'  },
                { label: 'Dirty',    count: rooms.filter(r => r.status === 'Dirty' || r.status === 'Cleaning').length,  color: 'text-amber-500' },
                { label: 'Issues',   count: rooms.filter(r => r.status === 'Maintenance').length,  color: 'text-red-500'   },
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
        <span>© 2026 Grand Horizon ERP v4.2.0 • Operational</span>
        <div className="flex gap-3">
          <span className="text-green-600 font-medium">● System Operational</span>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
