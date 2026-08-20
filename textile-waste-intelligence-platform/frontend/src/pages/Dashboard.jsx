import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Boxes,
  Package,
  Truck,
  Recycle,
  Factory,
  Building2,
  Leaf,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  Calendar,
  Plus,
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
  Area,
} from 'recharts';
import toast from 'react-hot-toast';
import KpiCard from '../components/KpiCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { wasteService } from '../services/wasteService';
import { CONDITION_STYLES, STATUS_STYLES, ROLES } from '../constants';
import { useAuth } from '../hooks/useAuth';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const COLORS = ['#1F7A54', '#2563EB', '#D97706', '#7C3AED', '#EC4899', '#06B6D4'];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const is_admin = user?.role === 'Administrator' || user?.role === 'admin';
    if (is_admin && window.location.pathname === '/dashboard') {
      navigate('/admin/dashboard', { replace: true });
    } else if (!is_admin && window.location.pathname === '/admin/dashboard') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await wasteService.stats();
      setStats(res);
    } catch (err) {
      toast.error('Could not load dashboard metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const monthlyChartData = useMemo(() => {
    if (!stats?.byMonth) return [];
    return stats.byMonth.map((m) => ({
      label: `${MONTH_LABELS[m._id.month - 1]} ${m._id.year}`,
      quantity: m.quantity,
    }));
  }, [stats]);

  const hasData = stats && stats.totalBatches > 0;

  if (isLoading) {
    return <LoadingSpinner label="Loading enterprise dashboard…" />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-sm text-ink/60">Here is the real-time state of the textile waste platform.</p>
        </div>
        <div className="flex items-center gap-2">
          {user?.role === ROLES.MANUFACTURER && (
            <Link to="/inventory/add" className="btn-primary flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Add New Inventory
            </Link>
          )}
          <button
            onClick={fetchStats}
            className="btn-secondary flex items-center gap-1.5"
          >
            <Sparkles className="h-4 w-4 text-forest-500" />
            Refresh Stats
          </button>
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          icon={Package}
          title="No waste batches registered yet"
          description="Once batches are added to the inventory, KPIs and charts will populate here automatically."
          action={
            <Link to="/inventory/add" className="btn-primary mt-1">
              Register first batch
            </Link>
          }
        />
      ) : (
        <>
          {/* KPI Indicators Grid - 8 Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Total Waste"
              value={`${stats.totalQuantity.toLocaleString()} kg`}
              sublabel="Cumulative logged offcuts"
              icon={Package}
              tone="forest"
              trend={{ direction: 'up', value: '12.4%' }}
            />
            <KpiCard
              label="Waste Batches"
              value={stats.totalBatches.toLocaleString()}
              sublabel="Individually tracked records"
              icon={Boxes}
              tone="ledger"
              trend={{ direction: 'up', value: '8.2%' }}
            />
            <KpiCard
              label="Today's Collections"
              value={`${stats.todayCollections.toLocaleString()} kg`}
              sublabel="Collected in the last 24h"
              icon={Recycle}
              tone="amber"
              trend={{ direction: 'up', value: '15.2%' }}
            />
            <KpiCard
              label="Pending Processing"
              value={stats.pendingProcessing.toLocaleString()}
              sublabel="Batches waiting to recycle"
              icon={Truck}
              tone="ink"
              trend={{ direction: 'down', value: '5.1%' }}
            />
            <KpiCard
              label="Recycled Waste"
              value={`${stats.recycledWaste.toLocaleString()} kg`}
              sublabel="Total processed stream weight"
              icon={Recycle}
              tone="forest"
              trend={{ direction: 'up', value: '24.8%' }}
            />
            <KpiCard
              label="Active Manufacturers"
              value={stats.activeManufacturers.toLocaleString()}
              sublabel="Registered production nodes"
              icon={Factory}
              tone="ledger"
              trend={{ direction: 'up', value: '2.0%' }}
            />
            <KpiCard
              label="Recycling Facilities"
              value={stats.recyclingFacilities.toLocaleString()}
              sublabel="Integrated recycling points"
              icon={Building2}
              tone="amber"
              trend={{ direction: 'up', value: '1.0%' }}
            />
            <KpiCard
              label="Sustainability Score"
              value={`${stats.sustainabilityScore}%`}
              sublabel="Weighted recovery efficiency"
              icon={Leaf}
              tone="forest"
              trend={{ direction: 'up', value: '3.5%' }}
            />
          </div>

          {/* Interactive Recharts visualizations Grid - 6 Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            
            {/* 1. Monthly Collection Trend */}
            <div className="card lg:col-span-2">
              <div className="mb-4">
                <h3 className="font-display text-base font-bold text-ink">Monthly Collection Trend</h3>
                <p className="text-xs text-ink/50">Quantity collected by month (kg)</p>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EBF5EF" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#12211B99' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#12211B99' }} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #D2E8DC', fontSize: 12 }} />
                  <Line type="monotone" dataKey="quantity" stroke="#1F7A54" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 2. Fabric Type Distribution */}
            <div className="card">
              <div className="mb-4">
                <h3 className="font-display text-base font-bold text-ink">Fabric Type Distribution</h3>
                <p className="text-xs text-ink/50">Total weight by fabric category (kg)</p>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.byFabric}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EBF5EF" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#12211B99' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#12211B99' }} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #D2E8DC', fontSize: 12 }} />
                  <Bar dataKey="quantity" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 3. Waste Source Distribution */}
            <div className="card">
              <div className="mb-4">
                <h3 className="font-display text-base font-bold text-ink">Waste Source Distribution</h3>
                <p className="text-xs text-ink/50">Share of collections by generation source (kg)</p>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats.bySource}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {stats.bySource?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #D2E8DC', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-2xs text-ink/75">
                {stats.bySource?.map((entry, index) => (
                  <span key={entry.name} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    {entry.name}
                  </span>
                ))}
              </div>
            </div>

            {/* 4. Recycling Progress */}
            <div className="card lg:col-span-2">
              <div className="mb-4">
                <h3 className="font-display text-base font-bold text-ink">Recycling Progress</h3>
                <p className="text-xs text-ink/50">Cumulative recovery metrics by processing status (kg)</p>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={stats.recyclingProgress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EBF5EF" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#12211B99' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#12211B99' }} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #D2E8DC', fontSize: 12 }} />
                  <Area type="monotone" dataKey="quantity" stroke="#D97706" fill="#FEF3C7" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* 5. Material Composition */}
            <div className="card">
              <div className="mb-4">
                <h3 className="font-display text-base font-bold text-ink">Material Composition</h3>
                <p className="text-xs text-ink/50">Natural fibers vs. Synthetic fibers (kg)</p>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats.materialComposition}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    <Cell fill="#1F7A54" />
                    <Cell fill="#6B7280" />
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #D2E8DC', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* 6. Collection by Manufacturer */}
            <div className="card lg:col-span-2">
              <div className="mb-4">
                <h3 className="font-display text-base font-bold text-ink">Collection by Manufacturer</h3>
                <p className="text-xs text-ink/50">Total weight logged per manufacturer (kg)</p>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.byManufacturer}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EBF5EF" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#12211B99' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#12211B99' }} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #D2E8DC', fontSize: 12 }} />
                  <Bar dataKey="quantity" fill="#1F7A54" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Entries & Logs Section */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="card lg:col-span-3">
              <div className="mb-4 flex items-center justify-between border-b border-forest-50 pb-2">
                <h3 className="font-display text-base font-bold text-ink">Recent Waste Batches Log</h3>
                <Link
                  to="/inventory"
                  className="flex items-center gap-1 text-xs font-semibold text-forest-600 hover:text-forest-700"
                >
                  Go to Waste Inventory <ArrowUpRight size={13} />
                </Link>
              </div>
              <div className="space-y-4">
                {stats.recent.map((record) => (
                  <div
                    key={record._id}
                    className="flex flex-col justify-between gap-2 border-b border-forest-50 pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center"
                  >
                    <div>
                      <p className="font-mono text-xs font-semibold text-ink">{record.batchId}</p>
                      <p className="text-xs text-ink/50">
                        {record.fabricType} · {record.quantity} kg · Collected by {record.createdBy?.name || 'admin'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-2xs text-ink/40">
                        <Calendar size={12} />
                        {new Date(record.collectionDate).toLocaleDateString()}
                      </span>
                      <StatusBadge label={record.condition} styleMap={CONDITION_STYLES} />
                      <StatusBadge label={record.processingStatus} styleMap={STATUS_STYLES} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
