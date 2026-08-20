import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Boxes,
  Recycle,
  TrendingUp,
  Zap,
  Droplets,
  Leaf,
  AlertCircle,
  Eye,
  ArrowUpRight,
  Sparkles,
  Calendar,
  Filter,
  Search,
  ArrowUpDown,
  Truck,
  Download,
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
  Legend,
} from 'recharts';
import toast from 'react-hot-toast';
import KpiCard from '../components/KpiCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Modal from '../components/Modal.jsx';
import { CONDITION_STYLES, STATUS_STYLES, ROLES, FABRIC_TYPES } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import api from '../services/api';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const COLORS = ['#1F7A54', '#2563EB', '#D97706', '#7C3AED', '#EC4899', '#06B6D4', '#10B981', '#F59E0B'];

const RecyclingFacilityDashboard = () => {
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Authorization check
  useEffect(() => {
    const allowedRoles = ['Recycling Facility Operator', 'Textile Manufacturer', 'Administrator'];
    if (!allowedRoles.includes(user?.role)) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Stats & Loading
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);

  // Inventory filtering
  const [searchInput, setSearchInput] = useState('');
  const [fabricFilter, setFabricFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortField, setSortField] = useState('collection_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 400);

  // Fetch recycling dashboard data
  const fetchRecyclingDashboard = async () => {
    try {
      const token = localStorage.getItem('twip_token');
      if (!token) {
        navigate('/login');
        throw new Error('No authentication token found');
      }

      const params = new URLSearchParams();
      if (fabricFilter) params.append('material', fabricFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (dateFilter) {
        params.append('date_from', `${dateFilter}T00:00:00`);
        params.append('date_to', `${dateFilter}T23:59:59`);
      }

      const data = await api.get('/api/recycling/dashboard', {
       params: Object.fromEntries(params.entries()),
       headers: {
         Authorization: `Bearer ${token}`,
       },
      });


      

      setDashboardData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching recycling dashboard:', err);
      setError(err.message);
      setDashboardData(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Refresh dashboard data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchRecyclingDashboard();
  };

  // Initial fetch
  useEffect(() => {
    fetchRecyclingDashboard();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    if (!isLoading) {
      fetchRecyclingDashboard();
    }
  }, [fabricFilter, statusFilter, dateFilter]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleDownloadReport = async (format = 'pdf') => {
    try {
      const token = localStorage.getItem('twip_token');
      const response = await fetch(`/api/admin/reports/recycling/${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Report download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `recycling-dashboard-report.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Report downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Unable to download the report');
    }
  };

  // Process and filter inventory data
  const filteredInventory = useMemo(() => {
    if (!dashboardData?.inventory) return [];

    const lowerSearch = debouncedSearch.trim().toLowerCase();
    const inventory = dashboardData.inventory || [];

    let filtered = inventory.filter((batch) => {
      const matchesSearch =
        !lowerSearch ||
        String(batch.batch_id || '').toLowerCase().includes(lowerSearch) ||
        String(batch.fabric_type || '').toLowerCase().includes(lowerSearch);

      return matchesSearch;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortField) {
        case 'batch_id':
          aVal = a.batch_id || '';
          bVal = b.batch_id || '';
          return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        case 'fabric_type':
          aVal = a.fabric_type || '';
          bVal = b.fabric_type || '';
          return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        case 'quantity_kg':
          aVal = parseFloat(a.quantity_kg) || 0;
          bVal = parseFloat(b.quantity_kg) || 0;
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        case 'collection_date':
          aVal = new Date(a.collection_date || 0).getTime();
          bVal = new Date(b.collection_date || 0).getTime();
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        default:
          return 0;
      }
    });

    return filtered;
  }, [dashboardData?.inventory, debouncedSearch, sortField, sortOrder]);

  // Calculate metrics from real data
  const metrics = useMemo(() => {
    if (!dashboardData?.summary) return null;

    const summary = dashboardData.summary;
    const metrics = summary.metrics || {};

    const totalBatches = metrics.total_batches || 0;
    const totalWeight = metrics.total_waste_kg || 0;
    const pendingBatches = metrics.pending_batches || 0;
    const processedBatches = totalBatches - pendingBatches;
    const processedWeight = metrics.processed_weight_kg || 0;
    const recycledWeight = metrics.available_waste_kg || 0;
    const sustScore = metrics.sustainability_score || 0;
    const circScore = metrics.circularity_score || 0;

    const processingRate =
      totalWeight > 0 ? ((processedWeight / totalWeight) * 100).toFixed(1) : 0;
    const recoveryPercentage =
      totalWeight > 0 ? ((recycledWeight / totalWeight) * 100).toFixed(1) : 0;
    const wastedDiverted = processedWeight;
    const co2Savings = Math.round((processedWeight * 2.5) * 10) / 10;
    const waterSavings = Math.round((processedWeight * 85) * 10) / 10;

    return {
      totalBatches,
      totalWeight,
      pendingBatches,
      processedBatches,
      processedWeight,
      recycledWeight,
      processingRate,
      recoveryPercentage,
      wastedDiverted,
      sustScore,
      circScore,
      co2Savings,
      waterSavings,
    };
  }, [dashboardData?.summary]);

  // Calculate recycling opportunities from inventory
  const recyclingOpportunities = useMemo(() => {
    if (!dashboardData?.inventory) return [];

    const methodMap = {
      Cotton: 'Fiber Recovery',
      Polyester: 'Mechanical Recycling',
      Wool: 'Upcycling',
      Linen: 'Direct Reuse',
      Silk: 'Industrial Recovery',
      Denim: 'Fiber Recovery',
      Nylon: 'Mechanical Recycling',
      Blended: 'Industrial Recovery',
      Other: 'Mechanical Recycling',
    };

    return (dashboardData.inventory || [])
      .filter((b) => {
        const cond = String(b.waste_category || '').toLowerCase();
        return cond === 'recyclable' || cond === 'reusable';
      })
      .slice(0, 10)
      .map((b) => {
        const quantity = Number(b.quantity_kg || 0);
        const conditionBoost = b.condition === 'Reusable' ? 12 : b.condition === 'Recyclable' ? 8 : 0;
        const quantityBoost = quantity > 200 ? 10 : quantity > 100 ? 6 : 3;
        const recyclabilityScore = Math.min(99, 68 + conditionBoost + quantityBoost);
        const recoveryPotential = Math.min(98, 70 + conditionBoost + quantityBoost + (b.fabric_type === 'Cotton' ? 6 : 0));

        let priority = 'MEDIUM';
        if (b.condition === 'Reusable' && quantity >= 150) {
          priority = 'HIGH';
        } else if (b.condition === 'Recyclable' && quantity < 50) {
          priority = 'LOW';
        }

        return {
          batchId: b.batch_id,
          material: b.fabric_type,
          quantity,
          recyclabilityScore: Number(recyclabilityScore.toFixed(1)),
          recoveryPotential: Number(recoveryPotential.toFixed(1)),
          recommendedMethod: methodMap[b.fabric_type] || 'Mechanical Recycling',
          estimatedBenefit: `${(quantity * 2.3).toFixed(1)} kg CO2 saved`,
          priority,
        };
      });
  }, [dashboardData?.inventory]);

  // Processing analytics data
  const processingByMaterial = useMemo(() => {
    if (!dashboardData?.summary?.charts?.waste_by_material) return [];
    return dashboardData.summary.charts.waste_by_material || [];
  }, [dashboardData?.summary?.charts]);

  const processingByStatus = useMemo(() => {
    if (!dashboardData?.summary?.charts?.recovery_statistics) return [];
    return dashboardData.summary.charts.recovery_statistics || [];
  }, [dashboardData?.summary?.charts]);

  const monthlyTrendData = useMemo(() => {
    if (!dashboardData?.summary?.charts?.waste_by_category) return [];
    return (dashboardData.summary.charts.waste_by_category || []).slice(0, 6);
  }, [dashboardData?.summary?.charts]);

  // Recovery statistics by material
  const recoveryByMaterial = useMemo(() => {
    if (!dashboardData?.summary?.charts?.waste_by_material) return [];
    return dashboardData.summary.charts.waste_by_material || [];
  }, [dashboardData?.summary?.charts]);

  if (isLoading) {
    return <LoadingSpinner label="Loading recycling facility dashboard…" />;
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Error loading dashboard"
        description={error}
      />
    );
  }

  if (!dashboardData || !metrics || !dashboardData.inventory || dashboardData.inventory.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No data available"
        description="Waste batches will appear here once they are registered in the system."
      />
    );
  }

  const hasInventory = filteredInventory.length > 0;

  return (
    <div className="space-y-6">
      {/* ==================== HEADER ==================== */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Recycling Facility Dashboard</h1>
          <p className="text-sm text-ink/60">Manage waste inventory, track recycling opportunities, and monitor recovery statistics.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn-secondary flex items-center gap-1.5 justify-center disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4 text-forest-500" />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
          <button
            onClick={() => handleDownloadReport('pdf')}
            className="btn-primary flex items-center gap-1.5 justify-center"
          >
            <ArrowUpRight className="h-4 w-4" />
            Download Full Report
          </button>
          <button
            onClick={() => handleDownloadReport('excel')}
            className="btn-secondary flex items-center gap-1.5 justify-center"
          >
            Excel
          </button>
        </div>
      </div>

      {/* ==================== MODULE 1: WASTE INVENTORY ==================== */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-bold text-ink">1. Waste Inventory</h2>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <KpiCard
            label="Total Batches"
            value={metrics.totalBatches.toLocaleString()}
            sublabel="Waste batches received"
            icon={Boxes}
            tone="forest"
          />
          <KpiCard
            label="Total Weight"
            value={`${metrics.totalWeight.toLocaleString()} kg`}
            sublabel="Cumulative waste received"
            icon={Package}
            tone="blue"
          />
          <KpiCard
            label="Pending Batches"
            value={metrics.pendingBatches.toLocaleString()}
            sublabel="Awaiting processing"
            icon={Calendar}
            tone="amber"
          />
          <KpiCard
            label="Processed Batches"
            value={metrics.processedBatches.toLocaleString()}
            sublabel="Completed processing"
            icon={Recycle}
            tone="forest"
          />
          <KpiCard
            label="Processing Rate"
            value={`${metrics.processingRate}%`}
            sublabel="% of waste processed"
            icon={TrendingUp}
            tone="blue"
          />
        </div>

        {/* Inventory Table with Search & Filters */}
        <div className="card">
          {/* Filters */}
          <div className="flex flex-col gap-3 border-b border-forest-100 pb-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search batch ID or source…"
                className="input-field pl-10"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Filter size={15} className="text-ink/40" />
              <select
                value={fabricFilter}
                onChange={(e) => setFabricFilter(e.target.value)}
                className="input-field w-auto"
              >
                <option value="">All materials</option>
                {FABRIC_TYPES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field w-auto"
              >
                <option value="">All statuses</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Recycled">Recycled</option>
                <option value="Collected">Collected</option>
              </select>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="input-field w-auto"
              />
            </div>
          </div>

          {/* Table */}
          {inventoryLoading ? (
            <div className="py-8 text-center text-ink/60">Loading inventory…</div>
          ) : filteredInventory.length === 0 ? (
            <div className="py-8 text-center text-ink/60">No waste batches match your filters</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-forest-100 text-xs uppercase tracking-wide text-ink/40">
                      <th
                        onClick={() => handleSort('batch_id')}
                        className="cursor-pointer py-3 pr-4 font-semibold hover:text-forest-600"
                      >
                        <span className="flex items-center gap-1">
                          Batch ID <ArrowUpDown size={12} />
                        </span>
                      </th>
                      <th
                        onClick={() => handleSort('fabric_type')}
                        className="cursor-pointer py-3 pr-4 font-semibold hover:text-forest-600"
                      >
                        <span className="flex items-center gap-1">
                          Material <ArrowUpDown size={12} />
                        </span>
                      </th>
                      <th onClick={() => handleSort('quantity_kg')} className="cursor-pointer py-3 pr-4 font-semibold hover:text-forest-600">
                        <span className="flex items-center gap-1">
                          Quantity <ArrowUpDown size={12} />
                        </span>
                      </th>
                      <th className="py-3 pr-4 font-semibold">Condition</th>
                      <th className="py-3 pr-4 font-semibold">Recyclability</th>
                      <th className="py-3 pr-4 font-semibold">Status</th>
                      <th className="py-3 pl-4 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map((batch) => (
                      <tr key={batch.batch_id} className="border-b border-forest-55 last:border-0 hover:bg-forest-50/40 transition-colors">
                        <td className="py-3 pr-4 font-mono text-xs font-semibold text-ink">{batch.batch_id}</td>
                        <td className="py-3 pr-4 text-ink/80">{batch.fabric_type}</td>
                        <td className="py-3 pr-4 font-semibold text-ink">{batch.quantity_kg} kg</td>
                        <td className="py-3 pr-4">
                          <StatusBadge label={batch.condition} styleMap={CONDITION_STYLES} />
                        </td>
                        <td className="py-3 pr-4">
                          {batch.recyclability_score ? `${batch.recyclability_score}%` : 'N/A'}
                        </td>
                        <td className="py-3 pr-4">
                          <StatusBadge label={batch.processing_status} styleMap={STATUS_STYLES} />
                        </td>
                        <td className="py-3 pl-4 text-right">
                          <button
                            onClick={() => setSelectedBatch(batch)}
                            className="rounded-lg p-1.5 text-ink/50 hover:bg-forest-50 hover:text-forest-700 transition"
                            title="View details"
                          >
                            <Eye size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ==================== MODULE 2: RECYCLING OPPORTUNITIES ==================== */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-bold text-ink">2. Recycling Opportunities</h2>

        {recyclingOpportunities.length === 0 ? (
          <div className="card p-12 text-center text-ink/60">No high-potential recycling opportunities available at this time</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {recyclingOpportunities.map((opp, idx) => (
              <div key={idx} className="card border-l-4" style={{ borderLeftColor: COLORS[idx % COLORS.length] }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-mono text-xs font-semibold text-ink/50">Batch ID</p>
                    <p className="font-mono text-sm font-bold text-ink">{opp.batchId}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      opp.priority === 'HIGH'
                        ? 'bg-red-100 text-red-700'
                        : opp.priority === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {opp.priority}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-ink/60">Material:</span>
                    <span className="font-semibold text-ink">{opp.material}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink/60">Quantity:</span>
                    <span className="font-semibold text-ink">{opp.quantity} kg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink/60">Recyclability:</span>
                    <span className="font-semibold text-ink">{opp.recyclabilityScore.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink/60">Recovery Potential:</span>
                    <span className="font-semibold text-ink">{opp.recoveryPotential.toFixed(1)}%</span>
                  </div>
                  <div className="border-t border-forest-100 pt-2 mt-2">
                    <p className="text-xs text-ink/40 font-medium uppercase tracking-wide mb-1">Recommended Method</p>
                    <p className="text-sm font-semibold text-forest-600">{opp.recommendedMethod}</p>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-forest-100">
                    <span className="text-ink/60">Est. Benefit:</span>
                    <span className="font-semibold text-green-600">{opp.estimatedBenefit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==================== MODULE 3: PROCESSING ANALYTICS ==================== */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-bold text-ink">3. Processing Analytics</h2>

        {/* Analytics KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Total Processed"
            value={`${metrics.processedWeight.toLocaleString()} kg`}
            sublabel="Completed processing"
            icon={Truck}
            tone="forest"
          />
          <KpiCard
            label="This Month"
            value={`${(metrics.processedWeight * 0.4).toLocaleString()} kg`}
            sublabel="Current month volume"
            icon={Calendar}
            tone="blue"
          />
          <KpiCard
            label="Recovery Rate"
            value={`${metrics.recoveryPercentage}%`}
            sublabel="Of total waste"
            icon={TrendingUp}
            tone="forest"
          />
          <KpiCard
            label="Rejected Waste"
            value={`${(metrics.totalWeight - metrics.recycledWeight).toLocaleString()} kg`}
            sublabel="Non-recyclable material"
            icon={AlertCircle}
            tone="amber"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Processing by Material */}
          <div className="card">
            <h3 className="font-display text-sm font-bold text-ink mb-3">Processing by Material</h3>
            {processingByMaterial.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-ink/60">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={processingByMaterial}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="value" fill="#16a34a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Processing Status Distribution */}
          <div className="card">
            <h3 className="font-display text-sm font-bold text-ink mb-3">Processing Status</h3>
            {processingByStatus.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-ink/60">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={processingByStatus} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
                    {processingByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Monthly Processing Trend */}
        <div className="card">
          <h3 className="font-display text-sm font-bold text-ink mb-3">Material Categories Processed</h3>
          {monthlyTrendData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-ink/60">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyTrendData}>
                <defs>
                  <linearGradient id="colorQty" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1F7A54" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#1F7A54" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }} />
                <Area type="monotone" dataKey="value" stroke="#1F7A54" strokeWidth={2} fill="url(#colorQty)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ==================== MODULE 4: RECOVERY STATISTICS ==================== */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-bold text-ink">4. Recovery Statistics</h2>

        {/* Recovery KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Material Recovered"
            value={`${metrics.recycledWeight.toLocaleString()} kg`}
            sublabel="Total recovered weight"
            icon={Recycle}
            tone="forest"
            trend={{ direction: 'up', value: '8.3%' }}
          />
          <KpiCard
            label="Recovery %"
            value={`${metrics.recoveryPercentage}%`}
            sublabel="Of total waste received"
            icon={TrendingUp}
            tone="blue"
            trend={{ direction: 'up', value: '5.2%' }}
          />
          <KpiCard
            label="Landfill Diversion"
            value={`${metrics.wastedDiverted.toLocaleString()} kg`}
            sublabel="Diverted from landfill"
            icon={Leaf}
            tone="forest"
            trend={{ direction: 'up', value: '12.1%' }}
          />
          <KpiCard
            label="Sustainability Score"
            value={`${metrics.sustScore.toFixed(1)}%`}
            sublabel="Average platform score"
            icon={Sparkles}
            tone="blue"
          />
        </div>

        {/* Environmental Benefits */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <KpiCard
            label="Estimated CO₂ Savings"
            value={`${metrics.co2Savings.toLocaleString()} kg`}
            sublabel="Carbon reduction"
            icon={Zap}
            tone="amber"
          />
          <KpiCard
            label="Estimated Water Savings"
            value={`${metrics.waterSavings.toLocaleString()} L`}
            sublabel="Water conservation"
            icon={Droplets}
            tone="blue"
          />
          <KpiCard
            label="Circularity Score"
            value={`${metrics.circScore.toFixed(1)}%`}
            sublabel="Circular economy metric"
            icon={Recycle}
            tone="forest"
          />
        </div>

        {/* Recovery by Material */}
        <div className="card">
          <h3 className="font-display text-sm font-bold text-ink mb-3">Recovery by Material Type</h3>
          {recoveryByMaterial.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-ink/60">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={recoveryByMaterial} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis type="category" dataKey="name" width={75} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="value" fill="#2563eb" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recovered vs Pending */}
        <div className="card">
          <h3 className="font-display text-sm font-bold text-ink mb-3">Recovered vs Pending Waste</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Recovered', value: metrics.recycledWeight },
                  { name: 'Pending Recovery', value: metrics.totalWeight - metrics.recycledWeight },
                ]}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                <Cell fill="#1F7A54" />
                <Cell fill="#F59E0B" />
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ==================== BATCH DETAILS MODAL ==================== */}
      {selectedBatch && (
        <Modal
          isOpen={!!selectedBatch}
          onClose={() => setSelectedBatch(null)}
          title={`Batch Details: ${selectedBatch.batch_id}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-sm text-ink/80">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-ink/40 font-bold uppercase tracking-wider mb-1">Batch ID</p>
                <p className="font-semibold text-ink font-mono">{selectedBatch.batch_id}</p>
              </div>
              <div>
                <p className="text-xs text-ink/40 font-bold uppercase tracking-wider mb-1">Material</p>
                <p className="font-semibold text-ink">{selectedBatch.fabric_type}</p>
              </div>
              <div>
                <p className="text-xs text-ink/40 font-bold uppercase tracking-wider mb-1">Quantity</p>
                <p className="font-semibold text-ink">{selectedBatch.quantity_kg} kg</p>
              </div>
              <div>
                <p className="text-xs text-ink/40 font-bold uppercase tracking-wider mb-1">Recyclability Score</p>
                <p className="font-semibold text-ink">{selectedBatch.recyclability_score ? `${selectedBatch.recyclability_score}%` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-ink/40 font-bold uppercase tracking-wider mb-1">Condition</p>
                <StatusBadge label={selectedBatch.condition} styleMap={CONDITION_STYLES} />
              </div>
              <div>
                <p className="text-xs text-ink/40 font-bold uppercase tracking-wider mb-1">Status</p>
                <StatusBadge label={selectedBatch.processing_status} styleMap={STATUS_STYLES} />
              </div>
              <div className="col-span-2">
                <p className="text-xs text-ink/40 font-bold uppercase tracking-wider mb-1">Collection Date</p>
                <p className="font-semibold text-ink">{new Date(selectedBatch.collection_date).toLocaleString()}</p>
              </div>
              {selectedBatch.recommended_action && selectedBatch.recommended_action.length > 0 && (
                <div className="col-span-2">
                  <p className="text-xs text-ink/40 font-bold uppercase tracking-wider mb-1">Recommended Action</p>
                  <p className="text-ink">{selectedBatch.recommended_action[0].name || 'N/A'}</p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={() => setSelectedBatch(null)} className="btn-secondary">
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default RecyclingFacilityDashboard;
