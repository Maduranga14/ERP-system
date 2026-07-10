import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarCheck, ArrowDownToLine, ArrowUpFromLine,
  BedDouble, CreditCard, Clock,
  Printer, RefreshCw, UserCheck, Search,
  FileText, UserPlus, Loader2,
} from 'lucide-react';

import DashboardLayout from '../components/templates/DashboardLayout';
import StatCard from '../components/molecules/StatCard';
import AlertCard from '../components/molecules/AlertCard';
import QuickActionCard from '../components/molecules/QuickActionCard';
import DataTable from '../components/organisms/DataTable';
import ActivityFeed from '../components/organisms/ActivityFeed';
import RoomInventory from '../components/organisms/RoomInventory';
import Badge from '../components/atoms/Badge';
import Button from '../components/atoms/Button';
import Avatar from '../components/atoms/Avatar';
import { getRooms, getReservations, getInvoices, getHousekeepingTasks } from '../utils/api';

const resvStatusVariant = { Confirmed: 'green', 'Checked In': 'blue', Pending: 'amber', Completed: 'green' };

const ReceptionistDashboard = () => {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      getRooms(),
      getReservations(),
      getInvoices(),
      getHousekeepingTasks()
    ]).then(([roomData, resData, invData, taskData]) => {
      setRooms(roomData || []);
      setReservations(resData || []);
      setInvoices(invData || []);
      setTasks(taskData || []);
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' • ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }, []);

  const stats = useMemo(() => {
    const todayResCount = reservations.filter(r => r.checkIn === todayStr || r.checkOut === todayStr).length;
    const todayCheckInCount = reservations.filter(r => r.status === 'Checked In' && r.checkIn === todayStr).length;
    const todayCheckOutCount = reservations.filter(r => r.status === 'Checked Out' && r.checkOut === todayStr).length;
    const availableRooms = rooms.filter(r => r.status === 'Available').length;
    const pendingCheckIns = reservations.filter(r => (r.status === 'Confirmed' || r.status === 'Pending') && r.checkIn === todayStr).length;
    const pendingPayments = invoices.filter(i => i.status !== 'Paid').length;

    return { todayResCount, todayCheckInCount, todayCheckOutCount, availableRooms, pendingCheckIns, pendingPayments };
  }, [rooms, reservations, invoices, todayStr]);

  const resvColumns = [
    { key: 'guest', label: 'Guest', render: (v) => <span className="font-medium text-xs">{v}</span> },
    { key: 'room', label: 'Room' },
    { key: 'checkIn', label: 'Check In' },
    { key: 'nights', label: 'Nights' },
    {
      key: 'status', label: 'Status',
      render: (v) => <Badge variant={resvStatusVariant[v] || 'gray'} dot size="sm">{v}</Badge>,
    },
    {
      key: 'id', label: 'Actions',
      render: (id, row) => (
        <div className="flex gap-1.5">
          {row.status !== 'Checked In' && row.status !== 'Checked Out' && (
            <Button onClick={() => navigate('/receptionist/check-in')} variant="primary" size="sm">Check In</Button>
          )}
          <button onClick={() => navigate(`/receptionist/billing`)} className="text-gray-400 hover:text-gold-600"><FileText className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  const checkoutColumns = [
    { key: 'guest', label: 'Guest Name', render: (v) => <span className="font-medium text-xs">{v}</span> },
    { key: 'room', label: 'Room' },
    { key: 'checkOut', label: 'Check Out' },
    {
      key: 'payment', label: 'Payment',
      render: (v) => <Badge variant={v === 'Paid' ? 'green' : 'amber'} size="sm">{v}</Badge>,
    },
    {
      key: 'id', label: 'Action',
      render: () => <Button onClick={() => navigate('/receptionist/check-out')} variant="secondary" size="sm">Check Out</Button>,
    },
  ];

  const arrivingSoon = useMemo(() => {
    return reservations
      .filter(r => (r.status === 'Confirmed' || r.status === 'Pending') && r.checkIn === todayStr)
      .slice(0, 3)
      .map(r => ({
        name: r.customer?.name || 'Guest',
        room: r.room ? `Room ${r.room.number}` : 'TBD',
        time: `Check-in: ${r.checkIn}`
      }));
  }, [reservations, todayStr]);

  const activityLogs = useMemo(() => {
    const logs = [];
    reservations.filter(r => r.status === 'Checked In').slice(-2).forEach(r => {
      logs.push({
        message: `Guest checked in — ${r.customer?.name || 'Guest'} (Room ${r.room?.number || 'TBD'}).`,
        time: 'Today',
        dotColor: 'green'
      });
    });
    reservations.filter(r => r.status === 'Confirmed').slice(-1).forEach(r => {
      logs.push({
        message: `Reservation confirmed — ${r.customer?.name || 'Guest'}, Room ${r.room?.number || 'TBD'}.`,
        time: 'Today',
        dotColor: 'blue'
      });
    });
    invoices.filter(i => i.status === 'Paid').slice(-1).forEach(i => {
      logs.push({
        message: `Payment completed — $${i.amountPaid.toFixed(2)} processed for Room ${i.roomNumber}.`,
        time: 'Today',
        dotColor: 'gold'
      });
    });
    if (logs.length === 0) {
      return [{ message: 'Receptionist desk active and synced.', time: 'Just now', dotColor: 'blue' }];
    }
    return logs;
  }, [reservations, invoices]);

  const todaysReservations = useMemo(() => {
    return reservations
      .filter(r => r.checkIn === todayStr)
      .slice(0, 5)
      .map(r => ({
        id: r.id,
        guest: r.customer?.name || 'Guest',
        room: r.room ? `Room ${r.room.number}` : 'TBD',
        checkIn: r.checkIn,
        nights: r.nights || 1,
        status: r.status
      }));
  }, [reservations, todayStr]);

  const todaysCheckouts = useMemo(() => {
    return reservations
      .filter(r => r.status === 'Checked In')
      .slice(0, 5)
      .map(r => {
        const inv = invoices.find(i => i.reservation?.id === r.id);
        return {
          id: r.id,
          guest: r.customer?.name || 'Guest',
          room: r.room ? `Room ${r.room.number}` : 'TBD',
          checkOut: r.checkOut,
          payment: inv ? inv.status : 'Pending'
        };
      });
  }, [reservations, invoices]);

  if (loading) return (
    <DashboardLayout role="receptionist" userName="Sarah Mitchell" userRole="Front Desk Lead">
      <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin" /> Loading receptionist dashboard...
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout
      role="receptionist"
      userName="Sarah Mitchell"
      userRole="Front Desk Lead"
      notificationCount={7}
      searchPlaceholder="Search guests, rooms, or reservations..."
      topBarActions={
        <div className="flex gap-2">
          <Button onClick={() => window.print()} variant="outline" size="sm" icon={<Printer className="w-3.5 h-3.5" />}>Print Daily Report</Button>
          <Button onClick={fetchData} variant="primary" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />}>Refresh Stats</Button>
        </div>
      }
    >
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Good Morning, Sarah 👋</h1>
        <p className="text-sm text-gray-400 mt-0.5">{todayFormatted}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        <StatCard label="Today's Reservations" value={stats.todayResCount} sublabel="Bookings" borderColor="gold" icon={<CalendarCheck className="w-4 h-4 text-gold-600" />} iconBg="bg-gold-100" />
        <StatCard label="Today's Check-ins" value={stats.todayCheckInCount} sublabel="Arrived" borderColor="green" icon={<ArrowDownToLine className="w-4 h-4 text-green-600" />} iconBg="bg-green-100" />
        <StatCard label="Today's Check-outs" value={stats.todayCheckOutCount} sublabel="Departed" borderColor="blue" icon={<ArrowUpFromLine className="w-4 h-4 text-blue-600" />} iconBg="bg-blue-100" />
        <StatCard label="Available Rooms" value={stats.availableRooms} sublabel={`${stats.availableRooms}/${rooms.length}`} borderColor="navy" icon={<BedDouble className="w-4 h-4 text-navy-700" />} iconBg="bg-navy-100" />
        <StatCard label="Pending Check-ins" value={stats.pendingCheckIns} sublabel="Remaining" borderColor="amber" icon={<Clock className="w-4 h-4 text-amber-600" />} iconBg="bg-amber-100" />
        <StatCard label="Pending Payments" value={stats.pendingPayments} sublabel="Unpaid Bills" borderColor="red" icon={<CreditCard className="w-4 h-4 text-red-500" />} iconBg="bg-red-100" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            <QuickActionCard onClick={() => navigate('/receptionist/check-in')} icon={<UserCheck className="w-5 h-5" />} label="Check In Guest" />
            <QuickActionCard onClick={() => navigate('/receptionist/check-out')} icon={<ArrowUpFromLine className="w-5 h-5" />} label="Check Out Guest" />
            <QuickActionCard onClick={() => navigate('/receptionist/reservations/new')} icon={<UserPlus className="w-5 h-5" />} label="New Booking" />
            <QuickActionCard onClick={() => navigate('/receptionist/reservations')} icon={<Search className="w-5 h-5" />} label="Search Booking" />
            <QuickActionCard onClick={() => navigate('/receptionist/billing/new')} icon={<FileText className="w-5 h-5" />} label="Generate Invoice" />
          </div>

          <div className="card">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">Today's Arrivals</h3>
            </div>
            <DataTable columns={resvColumns} rows={todaysReservations} />
          </div>

          <div className="card">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">Today's Check-outs</h3>
            </div>
            <DataTable columns={checkoutColumns} rows={todaysCheckouts} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800">Alerts & VIPs</h3>
            </div>
            <div className="flex flex-col gap-2">
              {stats.pendingCheckIns > 0 ? (
                <AlertCard variant="warning" title="Pending Check-ins" message={`You have ${stats.pendingCheckIns} guests scheduled to arrive today.`} />
              ) : (
                <AlertCard variant="info" title="No Pending Check-ins" message="All scheduled arrivals for today have checked in." />
              )}
              {rooms.filter(r => r.status === 'Cleaning').length > 0 && (
                <AlertCard variant="warning" title="Rooms Cleaning" message={`${rooms.filter(r => r.status === 'Cleaning').length} rooms are currently being prepared by housekeeping.`} />
              )}
            </div>
          </div>

          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Arriving Soon</h3>
            <div className="flex flex-col gap-2">
              {arrivingSoon.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No additional arrivals scheduled for today.</p>
              ) : arrivingSoon.map((g, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <Avatar name={g.name} size="sm" />
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{g.name}</p>
                      <p className="text-[10px] text-gray-400">{g.room} • {g.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <RoomInventory
            title="Room Availability"
            items={[
              { label: 'Available', count: stats.availableRooms, total: rooms.length || 1, color: 'green', dot: 'bg-green-500' },
              { label: 'Occupied', count: rooms.filter(r => r.status === 'Occupied' || r.status === 'Checked In').length, total: rooms.length || 1, color: 'navy', dot: 'bg-navy-700' },
            ]}
          />

          <div className="card p-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'Reserved', count: rooms.filter(r => r.status === 'Reserved').length, color: 'text-blue-600' },
                { label: 'Cleaning', count: rooms.filter(r => r.status === 'Cleaning').length, color: 'text-amber-500' },
                { label: 'Maint.', count: rooms.filter(r => r.status === 'Maintenance').length, color: 'text-red-500' },
              ].map((s) => (
                <div key={s.label} className="bg-gray-50 rounded-lg py-2">
                  <p className={['text-lg font-bold', s.color].join(' ')}>{s.count}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <ActivityFeed items={activityLogs} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReceptionistDashboard;
