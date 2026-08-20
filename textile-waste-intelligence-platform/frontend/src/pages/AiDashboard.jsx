import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Leaf, 
  Cpu, 
  History, 
  Layers, 
  Compass, 
  ArrowUpRight,
  Eye,
  Calendar
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
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
import { aiService } from '../services/aiService';

const COLORS = ['#16a34a', '#2563eb', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#4f46e5'];

const AiDashboard = () => {
  const [stats, setStats] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAiDashboardData = async () => {
    setIsLoading(true);
    try {
      const statsRes = await aiService.stats();
      if (statsRes.success) {
        setStats(statsRes.stats);
      }
      
      const historyRes = await aiService.history();
      if (historyRes.success) {
        setHistoryList(historyRes.history);
      }
    } catch (err) {
      toast.error('Could not load AI dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAiDashboardData();
  }, []);

  const safeStats = {
    total_analyzed: 0,
    average_sustainability: 0,
    average_circularity_score: 0,
    total_co2_savings_kg: 0,
    average_resource_conservation: 0,
    total_water_savings_liters: 0,
    waste_diversion_percentage: 0,
    material_recovery_performance: 0,
    material_distribution: [],
    category_distribution: [],
    circularity_distribution: [],
    recent_analyses: [],
    ...stats,
  };

  const hasData = safeStats.total_analyzed > 0;

  if (isLoading) {
    return <LoadingSpinner label="Loading AI intelligence dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink font-sans">AI Sustainability Dashboard</h1>
          <p className="text-sm text-ink/60">Overview of AI-recognized fabric types, recyclability segments, and carbon footprints.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/ai-analysis" className="btn-primary flex items-center gap-1.5 text-xs py-2">
            <Sparkles className="h-4 w-4" />
            New Image Analysis
          </Link>
          <button 
            onClick={fetchAiDashboardData}
            className="btn-secondary flex items-center gap-1.5 text-xs py-2 bg-white"
          >
            <RefreshCwIcon className="h-4 w-4 text-emerald-600" />
            Refresh
          </button>
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          icon={Cpu}
          title="No AI analyses completed yet"
          description="Analyze textile waste images to populate composition charts, carbon tracking, and material breakdowns."
          action={
            <Link to="/ai-analysis" className="btn-primary mt-1">
              Start first analysis
            </Link>
          }
        />
      ) : (
        <>
          {/* KPI Dashboard Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Images Analyzed"
              value={stats.total_analyzed.toLocaleString()}
              sublabel="Total scanned textiles"
              icon={Cpu}
              tone="blue"
            />
            <KpiCard
              label="Avg Sustainability"
              value={`${stats.average_sustainability}%`}
              sublabel="Average circularity grade"
              icon={Leaf}
              tone="forest"
            />
            <KpiCard
              label="Avg Circularity"
              value={`${stats.average_circularity_score || 0}%`}
              sublabel="Weighted circularity score"
              icon={Compass}
              tone="amber"
            />
            <KpiCard
              label="CO2 Savings"
              value={`${stats.total_co2_savings_kg || 0} kg`}
              sublabel="Estimated emissions avoided"
              icon={ArrowUpRight}
              tone="ink"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <KpiCard
              label="Average Resource Conservation"
              value={`${stats.average_resource_conservation || 0}%`}
              sublabel="Average resource recovery potential"
              icon={Leaf}
              tone="forest"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Water Savings"
              value={`${stats.total_water_savings_liters || 0} L`}
              sublabel="Estimated water conserved"
              icon={Leaf}
              tone="forest"
            />
            <KpiCard
              label="Waste Diversion"
              value={`${stats.waste_diversion_percentage || 0}%`}
              sublabel="Average landfill reduction"
              icon={Layers}
              tone="blue"
            />
            <KpiCard
              label="Material Recovery"
              value={`${stats.material_recovery_performance || 0}%`}
              sublabel="Average recovery score"
              icon={Cpu}
              tone="amber"
            />
            <KpiCard
              label="Historical Logs"
              value={historyList.length}
              sublabel="Registered items"
              icon={History}
              tone="ink"
            />
          </div>

          {/* Recharts Graphical Visualizations */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            
            {/* 1. Material Distribution (Pie Chart) */}
            <div className="card flex flex-col justify-between">
              <div className="mb-4">
                <h3 className="font-display text-sm font-bold text-ink">Material Distribution</h3>
                <p className="text-2xs text-ink/50">Analyzed count by fabric category</p>
              </div>
              <div className="relative h-60 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={safeStats.material_distribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {safeStats.material_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-3xs font-semibold text-slate-500 uppercase tracking-wider mt-2 border-t pt-3">
                {safeStats.material_distribution.map((entry, index) => (
                  <span key={entry.name} className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    {entry.name} ({entry.value})
                  </span>
                ))}
              </div>
            </div>

            {/* 2. Waste Category Distribution (Bar Chart) */}
            <div className="card">
              <div className="mb-4">
                <h3 className="font-display text-sm font-bold text-ink">Waste Classifications</h3>
                <p className="text-2xs text-ink/50">Count of textiles per recovery category</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={safeStats.category_distribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 11 }} />
                    <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 3. Circularity Category Distribution (Area Chart) */}
            <div className="card">
              <div className="mb-4">
                <h3 className="font-display text-sm font-bold text-ink">Circularity Categories</h3>
                <p className="text-2xs text-ink/50">Distribution of recovery potential categories</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={safeStats.circularity_distribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 11 }} />
                    <Area type="monotone" dataKey="value" stroke="#16a34a" fill="#dcfce7" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Historical Logs List */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-display text-base font-bold text-ink">Recent AI Analysis Logs</h3>
              <span className="text-2xs text-ink/40">Showing last 5 scans</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-3xs">
                    <th className="py-2.5">Textile Scan</th>
                    <th>Fabric Type</th>
                    <th>Category</th>
                    <th>Circular Score</th>
                    <th>Scan Date</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700 font-light">
                  {safeStats.recent_analyses.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/40 transition">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-16 rounded overflow-hidden bg-slate-100 border">
                            <img src={record.image_url} alt="Scan preview" className="h-full w-full object-cover" />
                          </div>
                          <span className="font-mono font-semibold text-2xs text-slate-500">SCAN-{record.id}</span>
                        </div>
                      </td>
                      <td className="font-semibold text-slate-800">{record.fabric_type}</td>
                      <td>
                        <span className="text-3xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          {record.waste_category}
                        </span>
                      </td>
                      <td className="font-bold text-slate-800">{record.scores?.circularity_score ?? record.sustainability_score}%</td>
                      <td>
                        <span className="flex items-center gap-1 text-3xs text-slate-400">
                          <Calendar size={11} />
                          {new Date(record.timestamp).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="text-right">
                        <Link 
                          to="/ai-analysis"
                          className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold font-sans"
                        >
                          Details <ArrowUpRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Quick helper icon component to avoid importing refreshcw manually
const RefreshCwIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 16h5v5" />
  </svg>
);

export default AiDashboard;
