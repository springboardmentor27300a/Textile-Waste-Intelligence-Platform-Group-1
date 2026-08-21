import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Boxes, 
  Package, 
  Clock, 
  TrendingUp, 
  Recycle, 
  Factory, 
  Building2, 
  ShieldAlert, 
  Compass, 
  Activity, 
  Sparkles,
  ArrowUpRight,
  UserCheck,
  Cpu,
  RefreshCw,
  Terminal,
  Calendar,
  FileSpreadsheet
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import toast from 'react-hot-toast';
import KpiCard from '../components/KpiCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { adminService } from '../services/adminService';

const COLORS = ['#16a34a', '#2563eb', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#4f46e5'];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getStats();
      if (res.success) {
        setData(res);
      } else {
        toast.error('Failed to retrieve system status metrics');
      }
    } catch (err) {
      toast.error('Could not connect to administrator analytics endpoint');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (isLoading) {
    return <LoadingSpinner label="Compiling system status metrics..." />;
  }

  const stats = data?.stats || {};
  const charts = data?.charts || {};
  const recentRegistrations = data?.recent_registrations || [];
  const activityLogs = data?.activity_logs || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Administrator Control Panel</h1>
          <p className="text-sm text-ink/60">Real-time database metrics, registration trends, and activity logs.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/users" className="btn-primary flex items-center gap-1.5 text-xs py-2 shadow-emerald-100 shadow">
            <Users className="h-4 w-4" />
            Manage User Accounts
          </Link>
          <button 
            onClick={fetchDashboardStats}
            className="btn-secondary flex items-center gap-1.5 text-xs py-2 bg-white border"
          >
            <RefreshCw className="h-4 w-4 text-emerald-600" />
            Sync Database
          </button>
        </div>
      </div>

      {/* 12 KPI Dashboard Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Users"
          value={stats.totalUsers?.toLocaleString()}
          sublabel="All registered accounts"
          icon={Users}
          tone="blue"
          trend={{ direction: 'up', value: '4.8%' }}
        />
        <KpiCard
          label="Textile Waste Records"
          value={stats.totalRecords?.toLocaleString()}
          sublabel="Total batches uploaded"
          icon={Boxes}
          tone="forest"
          trend={{ direction: 'up', value: '12.2%' }}
        />
        <KpiCard
          label="Total Inventory Count"
          value={stats.totalInventory?.toLocaleString()}
          sublabel="Registered items"
          icon={Package}
          tone="amber"
          trend={{ direction: 'up', value: '8.5%' }}
        />
        <KpiCard
          label="Pending Waste"
          value={stats.pendingWaste?.toLocaleString()}
          sublabel="Awaiting processing"
          icon={Clock}
          tone="ink"
          trend={{ direction: 'down', value: '2.1%' }}
        />
        <KpiCard
          label="Processing Waste"
          value={stats.processingWaste?.toLocaleString()}
          sublabel="Currently in carding"
          icon={TrendingUp}
          tone="blue"
          trend={{ direction: 'up', value: '5.2%' }}
        />
        <KpiCard
          label="Recycled Waste weight"
          value={`${stats.recycledWaste?.toLocaleString()} kg`}
          sublabel="Processed circular fiber"
          icon={Recycle}
          tone="forest"
          trend={{ direction: 'up', value: '24.8%' }}
        />
        <KpiCard
          label="Textile Manufacturers"
          value={stats.totalManufacturers?.toLocaleString()}
          sublabel="Production facilities"
          icon={Factory}
          tone="amber"
          trend={{ direction: 'up', value: '2.0%' }}
        />
        <KpiCard
          label="Recycling Facilities"
          value={stats.recyclingFacilities?.toLocaleString()}
          sublabel="Processing operators"
          icon={Building2}
          tone="ink"
          trend={{ direction: 'up', value: '1.0%' }}
        />
        <KpiCard
          label="Sustainability Managers"
          value={stats.sustainabilityManagers?.toLocaleString()}
          sublabel="Compliance coordinators"
          icon={UserCheck}
          tone="blue"
          trend={{ direction: 'up', value: '3.5%' }}
        />
        <KpiCard
          label="Total Quantity Weight"
          value={`${stats.totalQuantity?.toLocaleString()} kg`}
          sublabel="Cumulative waste weight"
          icon={Package}
          tone="forest"
          trend={{ direction: 'up', value: '11.4%' }}
        />
        <KpiCard
          label="Today's Collections"
          value={`${stats.todayCollections?.toLocaleString()} kg`}
          sublabel="Logged past 24h"
          icon={Calendar}
          tone="amber"
          trend={{ direction: 'up', value: '15.0%' }}
        />
        <KpiCard
          label="AI Analyses Scans"
          value={stats.aiAnalyses?.toLocaleString()}
          sublabel="Scanned textile images"
          icon={Cpu}
          tone="ink"
          trend={{ direction: 'up', value: '45.2%' }}
        />
      </div>

      {/* Recharts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Waste Collection Trends */}
        <div className="card lg:col-span-2">
          <div className="mb-4">
            <h3 className="font-display text-sm font-bold text-ink">Waste Collection Trends</h3>
            <p className="text-2xs text-ink/50">Total weight processed per month (kg)</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.collection_trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 11 }} />
                <Area type="monotone" dataKey="value" stroke="#16a34a" fill="#dcfce7" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Users by Role */}
        <div className="card flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-display text-sm font-bold text-ink">Users by Role</h3>
            <p className="text-2xs text-ink/50">Account role segmentation counts</p>
          </div>
          <div className="relative h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.users_by_role}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={65}
                  paddingAngle={3}
                >
                  {charts.users_by_role?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-3xs font-semibold text-slate-500 uppercase tracking-wider mt-2 border-t pt-3">
            {charts.users_by_role?.map((entry, index) => (
              <span key={entry.name} className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                {entry.name} ({entry.value})
              </span>
            ))}
          </div>
        </div>

        {/* Monthly Registrations */}
        <div className="card">
          <div className="mb-4">
            <h3 className="font-display text-sm font-bold text-ink">Monthly Registrations</h3>
            <p className="text-2xs text-ink/50">New accounts registered per month</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.monthly_registrations}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 11 }} />
                <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Material Distribution */}
        <div className="card flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-display text-sm font-bold text-ink">Material Distribution</h3>
            <p className="text-2xs text-ink/50">Cumulative quantity weight per fabric (kg)</p>
          </div>
          <div className="relative h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.material_distribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                >
                  {charts.material_distribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-3xs font-semibold text-slate-500 uppercase tracking-wider mt-2 border-t pt-3">
            {charts.material_distribution?.map((entry, index) => (
              <span key={entry.name} className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                {entry.name} ({entry.value} kg)
              </span>
            ))}
          </div>
        </div>

        {/* Top Contributors */}
        <div className="card">
          <div className="mb-4">
            <h3 className="font-display text-sm font-bold text-ink">Top Contributors</h3>
            <p className="text-2xs text-ink/50">Total weight logged per manufacturer (kg)</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.inventory_by_user}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 11 }} />
                <Bar dataKey="value" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Double Column Widget Grid: Registrations and Activities */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Recent Registrations */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-display text-sm font-bold text-ink">Recent Registrations</h3>
            <Link to="/users" className="text-2xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5">
              Manage Users <ArrowUpRight size={13} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-3xs">
                  <th className="py-2">Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Registration Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700 font-light">
                {recentRegistrations.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/40 transition">
                    <td className="py-3 font-semibold text-slate-800">{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className="text-3xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {u.role}
                      </span>
                    </td>
                    <td>{new Date(u.registration_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`text-3xs font-bold px-2 py-0.5 rounded-full ${
                        u.status === 'Active' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-400 bg-slate-100'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Logs */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-display text-sm font-bold text-ink">Audit Trails (Live Activity Log)</h3>
            <Link to="/logs" className="text-2xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5">
              Full Logs <ArrowUpRight size={13} />
            </Link>
          </div>
          <div className="max-h-60 overflow-y-auto space-y-3.5 pr-2">
            {activityLogs.map((log) => (
              <div key={log.id} className="flex gap-3 text-xs border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                <div className="h-7 w-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0">
                  <Terminal size={14} />
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">{log.action}</span>
                    <span className="text-3xs text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-2xs text-slate-500 font-light leading-relaxed">{log.detail}</p>
                  <p className="text-3xs text-slate-400">Actor: <span className="font-mono font-medium">{log.username}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
