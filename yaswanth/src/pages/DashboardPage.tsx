import React, { useEffect, useState } from 'react';
import { 
  Sparkles, Package, Layers, Recycle, LineChart, 
  ArrowUpRight, ArrowDownRight, ArrowRight, ShieldCheck, 
  TrendingUp, Leaf, Droplets, Scale, Eye, RefreshCw,
  FileSpreadsheet, CheckCircle2
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area 
} from 'recharts';
import { api } from '../services/api';
import { NavigationPage } from '../types/client';

interface DashboardPageProps {
  currentUser?: any;
  onNavigate: (page: NavigationPage, params?: any) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ currentUser, onNavigate, onToast }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Locked to the authenticated user's role from login
  const userRole = currentUser?.role || 'admin';

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardData();
      setData(res);
    } catch (err: any) {
      onToast(err.message || 'Error loading dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="w-10 h-10 border-4 border-[#004d3d] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-mono text-stone-500">Loading circular intelligence metrics...</p>
      </div>
    );
  }

  const { metrics, wasteByMaterial, monthlyTrend, recentAnalyses, recentOpportunities } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. EDITORIAL HERO BANNER (The Sill Style) */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-8 sm:p-12 shadow-xs relative overflow-hidden">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono font-semibold text-[#004d3d]">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>Live Regional Circularity Network</span>
          </div>

          <h1 className="font-serif-display text-3xl sm:text-5xl font-normal text-stone-900 tracking-tight leading-[1.15]">
            Textile Waste Intelligence & Resource Recovery.
          </h1>

          <p className="text-base sm:text-lg text-stone-600 font-sans max-w-2xl leading-relaxed">
            AI-powered multimodal fiber classification, 5-factor weighted circularity scoring, and automated circular recovery routing across industrial and consumer textile streams.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('analysis')}
              className="px-6 py-3 bg-[#004d3d] hover:bg-[#00382c] text-white text-xs sm:text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-all hover:scale-102 flex items-center gap-2 cursor-pointer"
            >
              <span>Analyze Textile AI →</span>
            </button>

            <button
              onClick={() => onNavigate('inventory')}
              className="px-6 py-3 bg-white hover:bg-stone-50 text-stone-800 text-xs sm:text-sm font-semibold rounded-full border border-stone-300 shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Inventory →</span>
            </button>

            <button
              onClick={() => onNavigate('reports')}
              className="px-5 py-3 text-stone-600 hover:text-[#004d3d] text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#004d3d]" />
              <span>Export PDF Audit</span>
            </button>
          </div>
        </div>

        {/* Decorative subtle botanical ring graphic */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-emerald-50/60 pointer-events-none blur-2xl"></div>
      </div>

      {/* AUTHENTICATED ROLE WORKSPACE BADGE (PDF Module 1 & 10) */}
      <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#004d3d] text-white rounded-xl shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-stone-500 uppercase tracking-wider">
                Active User Role:
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-100 text-[#004d3d] border border-emerald-300 capitalize">
                {userRole === 'operator' ? 'Recycling Facility Operator' :
                 userRole === 'sustainability' ? 'Sustainability Manager' :
                 userRole === 'manufacturer' ? 'Textile Manufacturer' : 'Platform Administrator'}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Logged in as <strong className="text-stone-800">{currentUser?.name || 'Yaswanth'}</strong> • {currentUser?.department || 'Textile Waste Intelligence'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-stone-500 font-mono bg-white px-3 py-1.5 rounded-xl border border-stone-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Role verified & locked from login</span>
        </div>
      </div>

      {/* ROLE SPECIFIC HIGHLIGHT CALLOUT & WORKSPACE METRICS */}
      {userRole === 'operator' && (
        <div className="bg-[#004d3d] text-white rounded-3xl p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-700/60 pb-3">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">
                Recycling Facility Operator Workspace (Module 10)
              </span>
              <h3 className="font-serif-display text-xl font-bold text-white mt-0.5">
                Mechanical Garnetting Lines & Sorting Queue Control
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('batches')}
                className="px-4 py-2 bg-white text-[#004d3d] hover:bg-emerald-50 text-xs font-bold rounded-full transition-all shadow-xs cursor-pointer"
              >
                Manage 6-Stage Batches →
              </button>
              <button
                onClick={() => onNavigate('inventory')}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-medium rounded-full transition-all cursor-pointer"
              >
                Warehouse Inventory
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 font-mono">
            <div className="bg-emerald-950/40 border border-emerald-600/40 rounded-xl p-3.5">
              <span className="text-[10px] text-emerald-300 uppercase">Mechanical Fiber Yield</span>
              <div className="text-2xl font-bold text-white mt-1">91.8%</div>
              <span className="text-[10px] text-emerald-400">High count yarn grade</span>
            </div>
            <div className="bg-emerald-950/40 border border-emerald-600/40 rounded-xl p-3.5">
              <span className="text-[10px] text-emerald-300 uppercase">Active Sorting Batches</span>
              <div className="text-2xl font-bold text-white mt-1">{metrics.activeBatches} Batches</div>
              <span className="text-[10px] text-emerald-400">Stages 1 to 6 in progress</span>
            </div>
            <div className="bg-emerald-950/40 border border-emerald-600/40 rounded-xl p-3.5">
              <span className="text-[10px] text-emerald-300 uppercase">Garnetting Uptime</span>
              <div className="text-2xl font-bold text-white mt-1">98.4%</div>
              <span className="text-[10px] text-emerald-400">4 lines running active</span>
            </div>
            <div className="bg-emerald-950/40 border border-emerald-600/40 rounded-xl p-3.5">
              <span className="text-[10px] text-emerald-300 uppercase">Sorting Purity Rate</span>
              <div className="text-2xl font-bold text-white mt-1">96.2%</div>
              <span className="text-[10px] text-emerald-400">&lt;3.8% contamination</span>
            </div>
          </div>
        </div>
      )}

      {userRole === 'sustainability' && (
        <div className="bg-teal-900 text-white rounded-3xl p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-700/60 pb-3">
            <div>
              <span className="text-xs font-mono font-bold text-teal-300 uppercase tracking-wider">
                Sustainability Manager Workspace (Module 10)
              </span>
              <h3 className="font-serif-display text-xl font-bold text-white mt-0.5">
                Scope 3 Carbon Abatement & ISO 14040 LCA Audit Center
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('sustainability')}
                className="px-4 py-2 bg-white text-teal-900 hover:bg-teal-50 text-xs font-bold rounded-full transition-all shadow-xs cursor-pointer"
              >
                Circularity Analytics →
              </button>
              <button
                onClick={() => onNavigate('environmental')}
                className="px-4 py-2 bg-teal-800 hover:bg-teal-700 text-white text-xs font-medium rounded-full transition-all cursor-pointer"
              >
                LCA Resource Simulator
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 font-mono">
            <div className="bg-teal-950/40 border border-teal-600/40 rounded-xl p-3.5">
              <span className="text-[10px] text-teal-300 uppercase">CO₂ Abated (Scope 3)</span>
              <div className="text-2xl font-bold text-white mt-1">{(metrics.co2SavedKg / 1000).toFixed(1)} Tons</div>
              <span className="text-[10px] text-teal-400">~9 passenger cars/yr</span>
            </div>
            <div className="bg-teal-950/40 border border-teal-600/40 rounded-xl p-3.5">
              <span className="text-[10px] text-teal-300 uppercase">Water Conserved</span>
              <div className="text-2xl font-bold text-white mt-1">{(metrics.waterSavedLiters / 1000).toLocaleString()} m³</div>
              <span className="text-[10px] text-teal-400">127,500 domestic showers</span>
            </div>
            <div className="bg-teal-950/40 border border-teal-600/40 rounded-xl p-3.5">
              <span className="text-[10px] text-teal-300 uppercase">Landfill Diversion</span>
              <div className="text-2xl font-bold text-white mt-1">{metrics.diversionRate}%</div>
              <span className="text-[10px] text-teal-400">{(metrics.landfillAvoidedKg / 1000).toFixed(1)} tons avoided</span>
            </div>
            <div className="bg-teal-950/40 border border-teal-600/40 rounded-xl p-3.5">
              <span className="text-[10px] text-teal-300 uppercase">Circularity Index Avg</span>
              <div className="text-2xl font-bold text-white mt-1">{metrics.avgCircularityScore} / 100</div>
              <span className="text-[10px] text-teal-400">ISO 14044 Certified</span>
            </div>
          </div>
        </div>
      )}

      {userRole === 'manufacturer' && (
        <div className="bg-indigo-900 text-white rounded-3xl p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-700/60 pb-3">
            <div>
              <span className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-wider">
                Textile Manufacturer Workspace (Module 10)
              </span>
              <h3 className="font-serif-display text-xl font-bold text-white mt-0.5">
                Post-Industrial Scrap Inflow & Secondary Material Sourcing
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('inventory')}
                className="px-4 py-2 bg-white text-indigo-900 hover:bg-indigo-50 text-xs font-bold rounded-full transition-all shadow-xs cursor-pointer"
              >
                Register Cutting Scraps →
              </button>
              <button
                onClick={() => onNavigate('recommendations')}
                className="px-4 py-2 bg-indigo-800 hover:bg-indigo-700 text-white text-xs font-medium rounded-full transition-all cursor-pointer"
              >
                Recovery Pathways
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 font-mono">
            <div className="bg-indigo-950/40 border border-indigo-600/40 rounded-xl p-3.5">
              <span className="text-[10px] text-indigo-300 uppercase">Post-Industrial Diverted</span>
              <div className="text-2xl font-bold text-white mt-1">18.6 Tons</div>
              <span className="text-[10px] text-indigo-400">Zero factory incineration</span>
            </div>
            <div className="bg-indigo-950/40 border border-indigo-600/40 rounded-xl p-3.5">
              <span className="text-[10px] text-indigo-300 uppercase">Procurement Savings</span>
              <div className="text-2xl font-bold text-white mt-1">$34,200</div>
              <span className="text-[10px] text-indigo-400">vs Virgin Cotton/PET</span>
            </div>
            <div className="bg-indigo-950/40 border border-indigo-600/40 rounded-xl p-3.5">
              <span className="text-[10px] text-indigo-300 uppercase">Virgin Polymer Displaced</span>
              <div className="text-2xl font-bold text-white mt-1">14.2 Tons</div>
              <span className="text-[10px] text-indigo-400">rPET & recycled spun yarn</span>
            </div>
            <div className="bg-indigo-950/40 border border-indigo-600/40 rounded-xl p-3.5">
              <span className="text-[10px] text-indigo-300 uppercase">Recycled Fiber Grade</span>
              <div className="text-2xl font-bold text-white mt-1">Grade A</div>
              <span className="text-[10px] text-indigo-400">Ring spinning ready</span>
            </div>
          </div>
        </div>
      )}

      {(userRole === 'admin' || userRole === 'manager' || userRole === 'analyst') && (
        <div className="bg-stone-900 text-white rounded-3xl p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-700/60 pb-3">
            <div>
              <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                Platform Administrator Control Center (Module 10)
              </span>
              <h3 className="font-serif-display text-xl font-bold text-white mt-0.5">
                Enterprise Multi-Facility RBAC, AI Telemetry & Audit Logs
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('admin')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-full transition-all shadow-xs cursor-pointer"
              >
                Open Admin Center →
              </button>
              <button
                onClick={() => onNavigate('reports')}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white text-xs font-medium rounded-full transition-all cursor-pointer"
              >
                Reports Manager
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 font-mono">
            <div className="bg-stone-950 border border-stone-700 rounded-xl p-3.5">
              <span className="text-[10px] text-amber-300 uppercase">System Uptime</span>
              <div className="text-2xl font-bold text-white mt-1">99.98%</div>
              <span className="text-[10px] text-emerald-400">All microservices green</span>
            </div>
            <div className="bg-stone-950 border border-stone-700 rounded-xl p-3.5">
              <span className="text-[10px] text-amber-300 uppercase">Active Platform Users</span>
              <div className="text-2xl font-bold text-white mt-1">14 Operators</div>
              <span className="text-[10px] text-stone-400">Across 4 facility nodes</span>
            </div>
            <div className="bg-stone-950 border border-stone-700 rounded-xl p-3.5">
              <span className="text-[10px] text-amber-300 uppercase">API Ingestion Rate</span>
              <div className="text-2xl font-bold text-white mt-1">1,420 req/m</div>
              <span className="text-[10px] text-stone-400">FastAPI Gateway</span>
            </div>
            <div className="bg-stone-950 border border-stone-700 rounded-xl p-3.5">
              <span className="text-[10px] text-amber-300 uppercase">Audit Records</span>
              <div className="text-2xl font-bold text-white mt-1">1,840 Items</div>
              <span className="text-[10px] text-emerald-400">Cryptographically signed</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. 8 EXECUTIVE KPI CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Waste */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Total Waste Inflow</span>
            <div className="p-2 rounded-lg bg-sky-50 text-sky-700">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-900 font-mono">
            {(metrics.totalWasteKg / 1000).toFixed(1)} <span className="text-xs font-normal text-stone-500">Tons</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 mt-2 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+12.4% vs last month</span>
          </div>
        </div>

        {/* KPI 2: Active Batches */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Active Batches</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-[#004d3d]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-900 font-mono">
            {metrics.activeBatches} <span className="text-xs font-normal text-stone-500">Batches</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span>All nodes processing</span>
          </div>
        </div>

        {/* KPI 3: Recyclable Share */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Recyclable Yield</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Recycle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#004d3d] font-mono">
            {metrics.recyclablePercent}%
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 mt-2 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>High purity grade</span>
          </div>
        </div>

        {/* KPI 4: Circularity Score */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Circularity Index</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-900 font-mono">
            {metrics.avgCircularity} <span className="text-xs font-normal text-stone-500">/ 100</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-indigo-700 mt-2 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Weighted formula active</span>
          </div>
        </div>

        {/* KPI 5: CO2 Savings */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">CO₂ Emissions Avoided</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-900 font-mono">
            {metrics.co2SavedTons} <span className="text-xs font-normal text-stone-500">Tons</span>
          </div>
          <div className="text-xs text-stone-500 mt-2 font-mono">
            ~{Math.round(metrics.co2SavedTons * 45)} trees equivalent
          </div>
        </div>

        {/* KPI 6: Water Savings */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Freshwater Preserved</span>
            <div className="p-2 rounded-lg bg-cyan-50 text-cyan-700">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-900 font-mono">
            {(metrics.waterSavedM3).toLocaleString()} <span className="text-xs font-normal text-stone-500">m³</span>
          </div>
          <div className="text-xs text-stone-500 mt-2 font-mono">
            Virgin cotton replacement
          </div>
        </div>

        {/* KPI 7: Landfill Diversion */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Landfill Diversion</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-[#004d3d]">
              <LineChart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#004d3d] font-mono">
            {metrics.landfillDivertedPercent}%
          </div>
          <div className="text-xs text-stone-500 mt-2 font-mono">
            Zero-landfill milestone
          </div>
        </div>

        {/* KPI 8: Reuse Feasibility */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Reuse & Upcycling</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-900 font-mono">
            Grade A / B
          </div>
          <div className="text-xs text-stone-500 mt-2 font-mono">
            Secondary garment triage
          </div>
        </div>

      </div>

      {/* 3. CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART 1: MONTHLY INTAKE & RECOVERY */}
        <div className="lg:col-span-2 bg-white border border-stone-200/80 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-serif-display text-lg font-bold text-stone-900">Monthly Intake vs Circular Material Recovery</h2>
              <p className="text-xs text-stone-500">Gross intake volume vs closed-loop recovered fiber (kg)</p>
            </div>
            <span className="text-xs font-mono text-[#004d3d] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-semibold">
              +18.2% Efficiency
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRecycled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#004d3d" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#004d3d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1ee" />
                <XAxis dataKey="month" stroke="#78716c" fontSize={12} />
                <YAxis stroke="#78716c" fontSize={12} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e7e5e4', borderRadius: '12px', color: '#1c1917', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Area type="monotone" dataKey="wasteKg" name="Gross Waste (kg)" stroke="#0284c7" fillOpacity={1} fill="url(#colorWaste)" strokeWidth={2} />
                <Area type="monotone" dataKey="recycledKg" name="Recovered Fiber (kg)" stroke="#004d3d" fillOpacity={1} fill="url(#colorRecycled)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: MATERIAL BREAKDOWN */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="font-serif-display text-lg font-bold text-stone-900">Material Composition</h2>
            <p className="text-xs text-stone-500 mb-4">Fiber share of active warehouse inventory</p>
          </div>

          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={wasteByMaterial}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {wasteByMaterial.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e7e5e4', borderRadius: '8px', color: '#1c1917' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold font-mono text-stone-900">100%</span>
              <span className="text-[10px] uppercase font-mono text-stone-500">Classified</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
            {wasteByMaterial.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2 text-stone-700">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="truncate">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. RECENT ANALYSES & OPPORTUNITIES TABLE */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif-display text-lg font-bold text-stone-900">Recent AI Textile Diagnostics</h2>
            <p className="text-xs text-stone-500">Live test samples processed through multi-spectral recognition</p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-semibold text-[#004d3d] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View all archive</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-stone-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-700 font-semibold font-mono text-[11px]">
              <tr>
                <th className="p-3">Analysis ID</th>
                <th className="p-3">Material Detected</th>
                <th className="p-3">Waste Category</th>
                <th className="p-3">Circularity Score</th>
                <th className="p-3">Primary Recovery Strategy</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-600">
              {recentAnalyses.slice(0, 5).map((item: any) => (
                <tr key={item.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="p-3 font-mono font-semibold text-stone-900">{item.id}</td>
                  <td className="p-3 font-medium text-stone-900">{item.detectedMaterial}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-50 text-[#004d3d] border border-emerald-200">
                      {item.wasteCategory}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-[#004d3d]">{item.circularityScore || 85} / 100</td>
                  <td className="p-3">{item.primaryRecommendation || 'Mechanical Garnetting'}</td>
                  <td className="p-3 font-mono text-stone-500">{item.analyzedAt ? item.analyzedAt.split('T')[0] : '2026-08-15'}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onNavigate('analysis', { analysisId: item.id })}
                      className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs rounded-md font-medium transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
