import React from 'react';
import {
  CalendarCheck, ArrowDownToLine, ArrowUpFromLine,
  BedDouble, CreditCard, Clock,
  Printer, RefreshCw, UserCheck, Search,
  FileText, UserPlus,
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


const reservations = [
  { id: 1, guest: 'John Doe', room: 203, checkIn: '2:00 PM', nights: 3, status: 'CONFIRMED' },
  { id: 2, guest: 'Emma Lee', room: 401, checkIn: '1:00 PM', nights: 2, status: 'ARRIVED' },
  { id: 3, guest: 'David Tan', room: 105, checkIn: '4:00 PM', nights: 1, status: 'PENDING' },
];

const checkouts = [
  { id: 1, guest: 'Michael Scott', room: 305, departure: '11:00 AM', payment: 'Paid', canCheckout: true },
  { id: 2, guest: 'Pam Beasly', room: 212, departure: '10:30 AM', payment: 'Pending', canCheckout: true },
];

const arriving = [
  { name: 'John Doe', room: 'Room 205', time: 'Today, 2:00 PM' },
  { name: 'Emma Wilson', room: 'Room 108', time: 'Today, 3:30 PM' },
  { name: 'Alex Brown', room: 'Suite 401', time: 'Today, 5:00 PM' },
];

const activity = [
  { message: 'Guest checked in — Emma Lee (Room 401) marked as arrived.', time: 'JUST NOW', dotColor: 'green' },
  { message: 'Reservation confirmed — New booking for John Doe, Room 205.', time: '10 mins ago', dotColor: 'blue' },
  { message: 'Payment completed — $450.00 processed for Room 305.', time: '43 mins ago', dotColor: 'gold' },
  { message: 'Room service requested — Room 102 requested extra towels.', time: '1 HOUR AGO', dotColor: 'gray' },
];

const resvStatusVariant = { CONFIRMED: 'green', ARRIVED: 'blue', PENDING: 'amber' };
const resvColumns = [
  { key: 'guest', label: 'Guest', render: (v) => <span className="font-medium">{v}</span> },
  { key: 'room', label: 'Room' },
  { key: 'checkIn', label: 'Check In' },
  { key: 'nights', label: 'Nights' },
  {
    key: 'status', label: 'Status',
    render: (v) => <Badge variant={resvStatusVariant[v] || 'gray'} dot>{v}</Badge>,
  },
  {
    key: 'id', label: 'Actions',
    render: (_, row) => (
      <div className="flex gap-1.5">
        {row.status !== 'ARRIVED' && (
          <Button variant="primary" size="sm">Check In</Button>
        )}
        <button className="text-gray-400 hover:text-gold-600"><FileText className="w-4 h-4" /></button>
      </div>
    ),
  },
];

const checkoutColumns = [
  { key: 'guest', label: 'Guest Name', render: (v) => <span className="font-medium">{v}</span> },
  { key: 'room', label: 'Room' },
  { key: 'departure', label: 'Departure' },
  {
    key: 'payment', label: 'Payment',
    render: (v) => <Badge variant={v === 'Paid' ? 'green' : 'amber'}>{v}</Badge>,
  },
  {
    key: 'id', label: 'Action',
    render: () => <Button variant="secondary" size="sm">Check Out</Button>,
  },
];


const ReceptionistDashboard = () => (
  <DashboardLayout
    role="receptionist"
    userName="Sarah Mitchell"
    userRole="Front Desk Lead"
    notificationCount={7}
    searchPlaceholder="Search guests, rooms, or reservations..."
    topBarActions={
      <div className="flex gap-2">
        <Button variant="outline" size="sm" icon={<Printer className="w-3.5 h-3.5" />}>Print Daily Report</Button>
        <Button variant="primary" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />}>Refresh Stats</Button>
      </div>
    }
  >

    <div className="mb-5">
      <h1 className="text-2xl font-bold text-gray-900">Good Morning, Sarah 👋</h1>
      <p className="text-sm text-gray-400 mt-0.5">Friday, July 3, 2026 • 02:10 PM</p>
    </div>


    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
      <StatCard label="Today's Reservations" value={24} sublabel="+12%" borderColor="gold" icon={<CalendarCheck className="w-4 h-4 text-gold-600" />} iconBg="bg-gold-100" />
      <StatCard label="Today's Check-ins" value={18} sublabel="Today" borderColor="green" icon={<ArrowDownToLine className="w-4 h-4 text-green-600" />} iconBg="bg-green-100" />
      <StatCard label="Today's Check-outs" value={15} sublabel="Today" borderColor="blue" icon={<ArrowUpFromLine className="w-4 h-4 text-blue-600" />} iconBg="bg-blue-100" />
      <StatCard label="Available Rooms" value={35} sublabel="25/100" borderColor="navy" icon={<BedDouble className="w-4 h-4 text-navy-700" />} iconBg="bg-navy-100" />
      <StatCard label="Pending Check-ins" value={12} sublabel="Today" borderColor="amber" icon={<Clock className="w-4 h-4 text-amber-600" />} iconBg="bg-amber-100" />
      <StatCard label="Pending Payments" value="06" sublabel="Urgent" borderColor="red" icon={<CreditCard className="w-4 h-4 text-red-500" />} iconBg="bg-red-100" />
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

      <div className="xl:col-span-2 flex flex-col gap-4">

        <div className="grid grid-cols-3 gap-3">
          <QuickActionCard icon={<UserCheck className="w-5 h-5" />} label="Check In Guest" />
          <QuickActionCard icon={<ArrowUpFromLine className="w-5 h-5" />} label="Check Out Guest" />
          <QuickActionCard icon={<UserPlus className="w-5 h-5" />} label="Register Walk-in" />
          <QuickActionCard icon={<Search className="w-5 h-5" />} label="Search Reservation" />
          <QuickActionCard icon={<FileText className="w-5 h-5" />} label="Generate Invoice" />
        </div>


        <div className="card">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Today's Reservations</h3>
          </div>
          <DataTable columns={resvColumns} rows={reservations} />
        </div>


        <div className="card">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Today's Check-outs</h3>
          </div>
          <DataTable columns={checkoutColumns} rows={checkouts} />
        </div>
      </div>


      <div className="flex flex-col gap-4">

        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Alerts & VIPs</h3>
            <button className="text-xs text-gold-600 hover:underline font-medium">Clear All</button>
          </div>
          <div className="flex flex-col gap-2">
            <AlertCard variant="danger" title="VIP Arrival Soon" message="Mr. Anderson (Suite 505) is arriving in 15 mins. Ready welcome kit." />
            <AlertCard variant="warning" title="Room 203 Ready" message="The housekeeping has finished cleaning. Room is now available for check-in." />
            <AlertCard variant="info" title="Late Checkout Request" message="Room 108 requested a 2:00 PM checkout. Approval pending." />
          </div>
        </div>


        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Arriving Soon</h3>
          <div className="flex flex-col gap-2">
            {arriving.map((g, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <Avatar name={g.name} size="sm" />
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{g.name}</p>
                    <p className="text-[11px] text-gray-400">{g.room} • {g.time}</p>
                  </div>
                </div>
                <button className="text-gray-300 hover:text-gold-500 transition-colors">›</button>
              </div>
            ))}
          </div>
        </div>

        <RoomInventory
          title="Room Availability"
          items={[
            { label: 'Available', count: 35, total: 100, color: 'green', dot: 'bg-green-500' },
            { label: 'Occupied', count: 48, total: 100, color: 'navy', dot: 'bg-navy-700' },
          ]}
        />


        <div className="card p-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: 'Reserved', count: 12, color: 'text-blue-600' },
              { label: 'Cleaning', count: 5, color: 'text-amber-500' },
              { label: 'Maint.', count: 2, color: 'text-red-500' },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 rounded-lg py-2">
                <p className={['text-lg font-bold', s.color].join(' ')}>{s.count}</p>
                <p className="text-[10px] text-gray-400 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <ActivityFeed items={activity} />
      </div>
    </div>

  </DashboardLayout>
);

export default ReceptionistDashboard;
