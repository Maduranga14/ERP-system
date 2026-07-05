import React from 'react';
import {
  BedDouble, Sparkles, CheckCircle, AlertTriangle,
  Wrench, Play, CheckCheck,
} from 'lucide-react';

import DashboardLayout from '../components/templates/DashboardLayout';
import StatCard from '../components/molecules/StatCard';
import MaintenanceItem from '../components/molecules/MaintenanceItem';
import ActivityFeed from '../components/organisms/ActivityFeed';
import DataTable from '../components/organisms/DataTable';
import Badge from '../components/atoms/Badge';
import Button from '../components/atoms/Button';
import ProgressBar from '../components/atoms/ProgressBar';


const tasks = [
  { id: 1, room: 'Room 205', type: 'Deluxe', priority: 'HIGH', status: 'Pending', action: 'start' },
  { id: 2, room: 'Room 112', type: 'Standard', priority: 'MEDIUM', status: 'In Progress', action: 'update' },
  { id: 3, room: 'Room 401', type: 'Suite', priority: 'HIGH', status: 'Pending', action: 'view' },
];

const maintenance = [
  { room: 'Room 308 - AC', status: 'Open Request', priority: 'HIGH' },
  { room: 'Room 120 - Leak', status: 'Assigned', priority: 'HIGH' },
  { room: 'Room 415 - TV', status: 'Pending Review', priority: 'MEDIUM' },
];

const activity = [
  { message: 'Room 205 marked clean', time: '10 minutes ago', by: 'Sarah', dotColor: 'green' },
  { message: 'Room 112 cleaning started', time: '25 minutes ago', by: 'John D.', dotColor: 'gold' },
  { message: 'Maintenance reported Room 308', time: '1 hour ago', by: 'Auto-Log', dotColor: 'red' },
];

const taskColumns = [
  { key: 'room', label: 'Room', render: (v) => <span className="font-bold text-gray-900">{v}</span> },
  { key: 'type', label: 'Type' },
  {
    key: 'priority', label: 'Priority',
    render: (v) => (
      <Badge variant={v === 'HIGH' ? 'red' : 'amber'} size="sm">{v}</Badge>
    ),
  },
  {
    key: 'status', label: 'Status',
    render: (v) => (
      <div className="flex items-center gap-1.5">
        <span className={['w-1.5 h-1.5 rounded-full', v === 'In Progress' ? 'bg-blue-500' : 'bg-gray-400'].join(' ')} />
        <span className="text-xs">{v}</span>
      </div>
    ),
  },
  {
    key: 'action', label: 'Actions',
    render: (v, row) => {
      if (v === 'start') return <Button variant="primary" size="sm">Start Cleaning</Button>;
      if (v === 'update') return <Button variant="secondary" size="sm">Update Status</Button>;
      return <Button variant="outline" size="sm">View Details</Button>;
    },
  },
];


const HousekeeperDashboard = () => (
  <DashboardLayout
    role="housekeeper"
    userName="Sarah"
    userRole="Supervisor"
    notificationCount={2}
    searchPlaceholder="Search rooms, tasks, or maintenance..."
    topBarActions={
      <Button variant="secondary" size="sm">Shift Logs</Button>
    }
  >

    <div className="flex items-start justify-between mb-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Good Morning, Sarah 👋</h1>
        <p className="text-sm text-gray-400 mt-0.5">Morning Shift | Friday, July 3, 2026</p>
      </div>
      <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5">
        <span className="text-amber-500 text-sm">☀️</span>
        <span className="text-xs font-semibold text-amber-700">Active: 4h 12m</span>
      </div>
    </div>


    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      <StatCard label="Rooms to Clean" value={12} sublabel="Today" borderColor="navy" icon={<BedDouble className="w-5 h-5 text-navy-700" />} iconBg="bg-navy-100" />
      <StatCard label="Cleaning in Progress" value="05" sublabel="Active" borderColor="gold" icon={<Sparkles className="w-5 h-5 text-gold-600" />} iconBg="bg-gold-100" />
      <StatCard label="Completed Today" value={15} sublabel="Success" borderColor="green" icon={<CheckCircle className="w-5 h-5 text-green-600" />} iconBg="bg-green-100" />
      <StatCard label="Maintenance Requests" value="03" sublabel="Urgent" borderColor="red" icon={<AlertTriangle className="w-5 h-5 text-red-500" />} iconBg="bg-red-100" />
    </div>


    <div className="card p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-800">Daily Progress</h3>
        <span className="text-xs font-semibold text-gold-600">75% Target Reached</span>
      </div>
      <ProgressBar value={75} color="gold" size="md" />
      <p className="text-xs text-gray-400 mt-2">15 / 20 Rooms Completed. Excellent pace!</p>
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

      <div className="xl:col-span-2 flex flex-col gap-4">
        <div className="card">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Assigned Cleaning Tasks</h3>
            <button className="text-xs text-gold-600 font-medium hover:underline">View All Tasks</button>
          </div>
          <DataTable columns={taskColumns} rows={tasks} />
        </div>


        <div className="card p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { icon: <Play className="w-5 h-5" />, label: 'Start Cleaning' },
              { icon: <CheckCheck className="w-5 h-5" />, label: 'Mark as Clean' },
              { icon: <Wrench className="w-5 h-5" />, label: 'Report Issue' },
            ].map((a, i) => (
              <button
                key={i}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <span className="text-gray-500 group-hover:text-gold-600 transition-colors">{a.icon}</span>
                <span className="text-xs font-medium text-gray-600">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>


      <div className="flex flex-col gap-4">

        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Room Status Overview</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'CLEAN', count: 55, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
              { label: 'DIRTY', count: 12, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
              { label: 'CLEANING', count: 5, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
              { label: 'MAINT.', count: 3, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
            ].map((s) => (
              <div key={s.label} className={['rounded-xl border p-3 text-center', s.bg, s.border].join(' ')}>
                <p className={['text-xs font-semibold', s.color].join(' ')}>{s.label}</p>
                <p className={['text-2xl font-bold mt-0.5', s.color].join(' ')}>{s.count}</p>
              </div>
            ))}
          </div>
        </div>


        <div className="card p-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-gray-800">Maintenance</h3>
            <Badge variant="red" size="sm">3 NEW</Badge>
          </div>
          {maintenance.map((m, i) => (
            <MaintenanceItem key={i} room={m.room} status={m.status} priority={m.priority} />
          ))}
        </div>

        <ActivityFeed items={activity} title="Recent Activity" />
      </div>
    </div>
  </DashboardLayout>
);

export default HousekeeperDashboard;
