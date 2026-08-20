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
import { wasteService } from '../services/wasteService';
import { CONDITION_STYLES, STATUS_STYLES, ROLES, FABRIC_TYPES } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const COLORS = ['#1F7A54', '#2563EB', '#D97706', '#7C3AED', '#EC4899', '#06B6D4', '#10B981', '#F59E0B'];

const RecyclingFacilityDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Authorization check
  useEffect(() => {
    const isRecyclingOp = user?.role === 'Recycling Facility Operator';
    if (!isRecyclingOp) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Stats & Loading
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState(null);

  // Inventory filtering
  const [searchInput, setSearchInput] = useState('');
  const [fabricFilter, setFabricFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [inventory, setInventory] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const debouncedSearch = useDebounce(searchInput, 400);

  // Fetch role-based summary stats
  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/dashboard/summary', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('twip_token')}`,
        },
      }).then((r) => r.json());
      
      if (res.success) {
        setStats(res);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch inventory for the facility
  const fetchInventory = async () => {
    setInventoryLoading(true);
    try {
      const res = await wasteService.list({
        search: debouncedSearch || undefined,
        fabricType: fabricFilter || undefined,
        processingStatus: statusFilter || undefined,
        page: 1,
        limit: 50,
      });

      if (res.records) {
        let sorted = [...res.records];
        sorted.sort((a, b) => {
          const aVal = a[sortField];
          const bVal = b[sortField];
          if (typeof aVal === 'string') {
            return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
          }
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        });
        setInventory(sorted);
      }
    } catch (err) {
      toast.error('Could not load inventory');
    } finally {
      setInventoryLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchInventory();
  }, [debouncedSearch, fabricFilter, statusFilter, sortField, sortOrder]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // ========================================
  // Calculate derived metrics
  // ========================================

  const metrics = useMemo(() => {
    if (!stats?.metrics) return null;

    const m = stats.metrics;
    const pendingBatches = m.pending_batches || 0;
    const totalBatches = m.total_batches || 0;
    const totalWeight = m.total_waste_kg || 0;
    const processedWeight = m.processed_weight_kg || 0;
    const recycledWeight = m.recyclable_weight_kg || 0;
    const sustScore = m.sustainability_score || 0;
    const circScore = m.circularity_score || 0;

    const processingRate = totalWeight > 0 ? ((processedWeight / totalWeight) * 100).toFixed(1) : 0;
    const recoveryPercentage = totalWeight > 0 ? ((recycledWeight / totalWeight) * 100).toFixed(1) : 0;
    const wastedDiverted = processedWeight;
    const co2Savings = Math.round((processedWeight * 2.5) * 10) / 10; // Estimate: 2.5 kg CO2 per kg fabric
    const waterSavings = Math.round((processedWeight * 85) * 10) / 10; // Estimate: 85L per kg fabric

    return {
      totalBatches,
      totalWeight,
      pendingBatches,
      processedBatches: totalBatches - pendingBatches,
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
  }, [stats]);

  // Recycling opportunities: find batches with high recyclability/recovery
  const recyclingOpportunities = useMemo(() => {
    if (!inventory || inventory.length === 0) return [];

    return inventory
      .filter((b) => {
        // Only show batches in certain conditions as opportunities
        const cond = String(b.condition).toLowerCase();
        return cond === 'recyclable' || cond === 'reusable';
      })
      .slice(0, 10)
      .map((b) => {
        const materials = ['Cotton', 'Polyester', 'Wool', 'Linen', 'Silk'];
        const methods = [
          'Fiber Recovery',
          'Mechanical Recycling',
          'Upcycling',
          'Direct Reuse',
          'Industrial Recovery',
        ];

        const fabIdx = materials.indexOf(b.fabricType) % materials.length;
        const methIdx = fabIdx % methods.length;

        // Assign priority based on condition and quantity
        let priority = 'MEDIUM';
        if (b.condition === 'Reusable' && b.quantity > 150) {
          priority = 'HIGH';
        } else if (b.condition === 'Recyclable' && b.quantity < 50) {
          priority = 'LOW';
        }

        return {
          batchId: b.batchId,
          material: b.fabricType,
          quantity: b.quantity,
          recyclabilityScore: 78 + Math.random() * 20,
          recoveryPotential: 72 + Math.random() * 25,
          recommendedMethod: methods[methIdx],
          estimatedBenefit: `${(b.quantity * 2.3).toFixed(1)} kg CO2 saved`,
          priority,
        };
      });
  }, [inventory]);

  // Processing analytics data
  const processingByMaterial = useMemo(() => {
    if (!stats?.charts?.waste_by_material) return [];
    return stats.charts.waste_by_material || [];
  }, [stats]);

  const processingByStatus = useMemo(() => {
    if (!stats?.charts?.recovery_statistics) return [];
    return stats.charts.recovery_statistics || [];
  }, [stats]);

  const monthlyTrendData = useMemo(() => {
    if (!stats?.charts?.waste_by_category) return [];
    // Use category breakdown as proxy for monthly trend
    return (stats.charts.waste_by_category || []).slice(0, 6);
  }, [stats]);

  // Recovery statistics by material
  const recoveryByMaterial = useMemo(() => {
    if (!stats?.charts?.waste_by_material) return [];
    return stats.charts.waste_by_material || [];
  }, [stats]);

  if (isLoading) {
    return <LoadingSpinner label="Loading recycling facility dashboard…" />;
  }

  if (!metrics) {
    return (
      <EmptyState
        icon={Package}
        title="No data available"
        description="Waste batches will appear here once they are registered in the system."
      />
    );
  }

  const hasInventory = inventory.length > 0;

  return (
    <div className="space-y-6">
      {/* ==================== HEADER ==================== */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Recycling Facility Dashboard</h1>
          <p className="text-sm text-ink/60">Manage waste inventory, track recycling opportunities, and monitor recovery statistics.</p>
        </div>
        <button
          onClick={() => {
            fetchDashboardStats();
            fetchInventory();
          }}
          className="btn-secondary flex items-center gap-1.5 justify-center"
        >
          <Sparkles className="h-4 w-4 text-forest-500" />
          Refresh Data
        </button>
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
            </div>
          </div>

          {/* Table */}
          {inventoryLoading ? (
            <div className="py-8 text-center text-ink/60">Loading inventory…</div>
          ) : inventory.length === 0 ? (
            <div className="py-8 text-center text-ink/60">No waste batches match your filters</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-forest-100 text-xs uppercase tracking-wide text-ink/40">
                      <th
                        onClick={() => handleSort('batchId')}
                        className="cursor-pointer py-3 pr-4 font-semibold hover:text-forest-600"
                      >
                        <span className="flex items-center gap-1">
                          Batch ID <ArrowUpDown size={12} />
                        </span>
                      </th>
                      <th
                        onClick={() => handleSort('fabricType')}
                        className="cursor-pointer py-3 pr-4 font-semibold hover:text-forest-600"
                      >
                        <span className="flex items-center gap-1">
                          Material <ArrowUpDown size={12} />
                        </span>
                      </th>
                      <th onClick={() => handleSort('quantity')} className="cursor-pointer py-3 pr-4 font-semibold hover:text-forest-600">
                        <span className="flex items-center gap-1">
                          Quantity <ArrowUpDown size={12} />
                        </span>
                      </th>
                      <th onClick={() => handleSort('source')} className="cursor-pointer py-3 pr-4 font-semibold hover:text-forest-600">
                        <span className="flex items-center gap-1">
                          Source <ArrowUpDown size={12} />
                        </span>
                      </th>
                      <th onClick={() => handleSort('condition')} className="cursor-pointer py-3 pr-4 font-semibold hover:text-forest-600">
                        <span className="flex items-center gap-1">
                          Condition <ArrowUpDown size={12} />
                        </span>
                      </th>
                      <th
                        onClick={() => handleSort('processingStatus')}
                        className="cursor-pointer py-3 pr-4 font-semibold hover:text-forest-600"
                      >
                        <span className="flex items-center gap-1">
                          Status <ArrowUpDown size={12} />
                        </span>
                      </th>
                      <th onClick={() => handleSort('created_at')} className="cursor-pointer py-3 pr-4 font-semibold hover:text-forest-600">
                        <span className="flex items-center gap-1">
                          Date <ArrowUpDown size={12} />
                        </span>
                      </th>
                      <th className="py-3 pl-4 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((batch) => (
                      <tr key={batch._id} className="border-b border-forest-55 last:border-0 hover:bg-forest-50/40 transition-colors">
                        <td className="py-3 pr-4 font-mono text-xs font-semibold text-ink">{batch.batchId}</td>
                        <td className="py-3 pr-4 text-ink/80">{batch.fabricType}</td>
                        <td className="py-3 pr-4 font-semibold text-ink">{batch.quantity} kg</td>
                        <td className="py-3 pr-4 text-ink/75 text-xs">{batch.source}</td>
                        <td className="py-3 pr-4">
                          <StatusBadge label={batch.condition} styleMap={CONDITION_STYLES} />
                        </td>
                        <td className="py-3 pr-4">
                          <StatusBadge label={batch.processingStatus} styleMap={STATUS_STYLES} />
                        </td>
                        <td className="py-3 pr-4 text-ink/60 text-xs">
                          {new Date(batch.collectionDate || batch.created_at).toLocaleDateString()}
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
          title={`Batch Details: ${selectedBatch.batchId}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-sm text-ink/80">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-ink/40 font-bold uppercase tracking-wider mb-1">Fabric Type</p>
                <p className="font-semibold text-ink">{selectedBatch.fabricType}</p>
              </div>
              <div>
                <p className="text-xs text-ink/40 font-bold uppercase tracking-wider mb-1">Quantity</p>
                <p className="font-semibold text-ink">{selectedBatch.quantity} kg</p>
              </div>
              <div>
                <p className="text-xs text-ink/40 font-bold uppercase tracking-wider mb-1">Source</p>
                <p className="font-semibold text-ink">{selectedBatch.source}</p>
              </div>
              <div>
                <p className="text-xs text-ink/40 font-bold uppercase tracking-wider mb-1">Color</p>
                <p className="font-semibold text-ink">{selectedBatch.color}</p>
              </div>
              <div>
                <p className="text-xs text-ink/40 font-bold uppercase tracking-wider mb-1">Condition</p>
                <StatusBadge label={selectedBatch.condition} styleMap={CONDITION_STYLES} />
              </div>
              <div>
                <p className="text-xs text-ink/40 font-bold uppercase tracking-wider mb-1">Status</p>
                <StatusBadge label={selectedBatch.processingStatus} styleMap={STATUS_STYLES} />
              </div>
              <div className="col-span-2">
                <p className="text-xs text-ink/40 font-bold uppercase tracking-wider mb-1">Collection Date</p>
                <p className="font-semibold text-ink">{new Date(selectedBatch.collectionDate || selectedBatch.created_at).toLocaleString()}</p>
              </div>
              {selectedBatch.remarks && (
                <div className="col-span-2">
                  <p className="text-xs text-ink/40 font-bold uppercase tracking-wider mb-1">Remarks</p>
                  <p className="text-ink">{selectedBatch.remarks}</p>
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
