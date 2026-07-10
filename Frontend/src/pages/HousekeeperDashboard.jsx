import React, { useState, useEffect, useMemo } from 'react';
import {
  BedDouble, Sparkles, CheckCircle, AlertTriangle,
  Wrench, Play, CheckCheck, Loader2,
} from 'lucide-react';

import DashboardLayout from '../components/templates/DashboardLayout';
import StatCard from '../components/molecules/StatCard';
import MaintenanceItem from '../components/molecules/MaintenanceItem';
import ActivityFeed from '../components/organisms/ActivityFeed';
import DataTable from '../components/organisms/DataTable';
import Badge from '../components/atoms/Badge';
import Button from '../components/atoms/Button';
import ProgressBar from '../components/atoms/ProgressBar';

import { getRooms, getHousekeepingTasks, getMaintenanceRequests, updateTaskStatus } from '../utils/api';

const HousekeeperDashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      getRooms(),
      getHousekeepingTasks(),
      getMaintenanceRequests()
    ]).then(([roomData, taskData, maintData]) => {
      setRooms(roomData || []);
      setTasks(taskData || []);
      setMaintenance(maintData || []);
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (taskId, nextStatus) => {
    setSubmitting(true);
    try {
      await updateTaskStatus(taskId, nextStatus);
      // reload data
      const [roomData, taskData, maintData] = await Promise.all([
        getRooms(),
        getHousekeepingTasks(),
        getMaintenanceRequests()
      ]);
      setRooms(roomData || []);
      setTasks(taskData || []);
      setMaintenance(maintData || []);
    } catch (err) {
      console.error(err);
      alert("Failed to update housekeeping task status.");
    } finally {
      setSubmitting(false);
    }
  };

  const metrics = useMemo(() => {
    const toClean = tasks.filter(t => t.status === 'Pending').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const maintCount = maintenance.filter(m => m.status === 'Pending' || m.status === 'Open Request').length;

    const totalToClean = toClean + inProgress + completed;
    const progressPercent = totalToClean > 0 ? Math.round((completed / totalToClean) * 100) : 100;

    return { toClean, inProgress, completed, maintCount, progressPercent, totalToClean };
  }, [tasks, maintenance]);

  const taskColumns = [
    { key: 'room', label: 'Room', render: (v) => <span className="font-bold text-gray-900">{v}</span> },
    { key: 'type', label: 'Type' },
    {
      key: 'priority', label: 'Priority',
      render: (v) => (
        <Badge variant={v === 'High' ? 'red' : 'amber'} size="sm">{v}</Badge>
      ),
    },
    {
      key: 'status', label: 'Status',
      render: (v) => (
        <div className="flex items-center gap-1.5">
          <span className={['w-1.5 h-1.5 rounded-full', v === 'In Progress' ? 'bg-blue-500' : v === 'Completed' ? 'bg-green-500' : 'bg-gray-400'].join(' ')} />
          <span className="text-xs">{v}</span>
        </div>
      ),
    },
    {
      key: 'action', label: 'Actions',
      render: (_, row) => {
        if (row.rawStatus === 'Pending') {
          return (
            <Button
              disabled={submitting}
              onClick={() => handleUpdateStatus(row.id, 'In Progress')}
              variant="primary"
              size="sm"
            >
              Start Cleaning
            </Button>
          );
        }
        if (row.rawStatus === 'In Progress') {
          return (
            <Button
              disabled={submitting}
              onClick={() => handleUpdateStatus(row.id, 'Completed')}
              variant="secondary"
              size="sm"
            >
              Mark clean
            </Button>
          );
        }
        return <span className="text-xs text-green-600 font-semibold">Done</span>;
      },
    },
  ];

  const formattedTasks = useMemo(() => {
    return tasks.slice(0, 5).map(t => ({
      id: t.id,
      room: t.room ? `Room ${t.room.number}` : 'TBD',
      type: t.room?.type || 'Standard',
      priority: t.priority || 'Medium',
      status: t.status,
      rawStatus: t.status
    }));
  }, [tasks]);

  const recentMaintenance = useMemo(() => {
    return maintenance.slice(0, 3).map(m => ({
      room: (m.room ? `Room ${m.room.number}` : 'Room') + ' - ' + (m.description || 'Repair'),
      status: m.status,
      priority: m.priority || 'Medium'
    }));
  }, [maintenance]);

  const activityLogs = useMemo(() => {
    const logs = [];
    tasks.filter(t => t.status === 'Completed').slice(-2).forEach(t => {
      logs.push({
        message: `Room ${t.room?.number || ''} marked clean.`,
        time: 'Today',
        dotColor: 'green'
      });
    });
    tasks.filter(t => t.status === 'In Progress').slice(-1).forEach(t => {
      logs.push({
        message: `Room ${t.room?.number || ''} cleaning started.`,
        time: 'Today',
        dotColor: 'gold'
      });
    });
    if (logs.length === 0) {
      return [{ message: 'Housekeeping shift started.', time: 'Just now', dotColor: 'blue' }];
    }
    return logs;
  }, [tasks]);

  if (loading) return (
    <DashboardLayout role="housekeeper" userName="Sarah" userRole="Supervisor">
      <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin" /> Loading housekeeper supervisor dashboard...
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout
      role="housekeeper"
      userName="Sarah"
      userRole="Supervisor"
      notificationCount={2}
      searchPlaceholder="Search rooms, tasks, or maintenance..."
      topBarActions={
        <Button onClick={fetchData} variant="secondary" size="sm">Refresh Shift</Button>
      }
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Good Morning, Sarah 👋</h1>
          <p className="text-sm text-gray-400 mt-0.5">Shift supervisor overview</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard label="Rooms to Clean" value={metrics.toClean} sublabel="Pending" borderColor="navy" icon={<BedDouble className="w-5 h-5 text-navy-700" />} iconBg="bg-navy-100" />
        <StatCard label="Cleaning in Progress" value={metrics.inProgress} sublabel="Active" borderColor="gold" icon={<Sparkles className="w-5 h-5 text-gold-600" />} iconBg="bg-gold-100" />
        <StatCard label="Completed Today" value={metrics.completed} sublabel="Cleaned" borderColor="green" icon={<CheckCircle className="w-5 h-5 text-green-600" />} iconBg="bg-green-100" />
        <StatCard label="Maintenance Requests" value={metrics.maintCount} sublabel="Urgent Issues" borderColor="red" icon={<AlertTriangle className="w-5 h-5 text-red-500" />} iconBg="bg-red-100" />
      </div>

      <div className="card p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-800">Daily Progress</h3>
          <span className="text-xs font-semibold text-gold-600">{metrics.progressPercent}% Target Reached</span>
        </div>
        <ProgressBar value={metrics.progressPercent} color="gold" size="md" />
        <p className="text-xs text-gray-400 mt-2">{metrics.completed} / {metrics.totalToClean} Rooms Completed. Excellent pace!</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="card">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">Assigned Cleaning Tasks</h3>
            </div>
            <DataTable columns={taskColumns} rows={formattedTasks} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Room Status Overview</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'CLEAN', count: rooms.filter(r => r.status === 'Available').length, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
                { label: 'DIRTY', count: rooms.filter(r => r.status === 'Cleaning' || r.status === 'Dirty').length, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
                { label: 'MAINT.', count: rooms.filter(r => r.status === 'Maintenance').length, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
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
              {metrics.maintCount > 0 && <Badge variant="red" size="sm">{metrics.maintCount} REQUESTS</Badge>}
            </div>
            {recentMaintenance.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No open maintenance issues.</p>
            ) : recentMaintenance.map((m, i) => (
              <MaintenanceItem key={i} room={m.room} status={m.status} priority={m.priority} />
            ))}
          </div>

          <ActivityFeed items={activityLogs} title="Recent Activity" />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HousekeeperDashboard;
