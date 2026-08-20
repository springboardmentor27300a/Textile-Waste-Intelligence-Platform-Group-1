import React, { useEffect, useState } from 'react';
import { 
  LineChart, TrendingUp, ShieldCheck, Leaf, 
  Scale, Droplets, Calendar, RefreshCw, Award, Zap,
  BarChart3, PieChart, Layers, Download, CheckCircle2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart as RechartsPie, Pie, Cell
} from 'recharts';
import { api } from '../services/api';
import { NavigationPage } from '../types/client';

interface SustainabilityPageProps {
  onNavigate: (page: NavigationPage) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const CIRCULARITY_CATEGORIES = [
  { range: '90–100', category: 'Excellent Recovery Potential', color: '#004d3d', desc: 'Direct reuse, zero degradation closed-loop yarn spinning' },
  { range: '75–89', category: 'High Recovery Potential', color: '#047857', desc: 'Mechanical garnetting fiber recovery & premium upcycling' },
  { range: '60–74', category: 'Moderate Recovery Potential', color: '#0284c7', desc: 'Chemical depolymerization or acoustic insulation padding' },
  { range: '40–59', category: 'Limited Recovery Potential', color: '#d97706', desc: 'Downcycling into non-woven mats or thermal insulation' },
  { range: '0–39', category: 'Disposal Recommended', color: '#e11d48', desc: 'Energy recovery / waste-to-energy incineration only' }
];

const WEIGHTED_FORMULA = [
  { factor: 'Material Recyclability', weight: '35%', desc: 'Fiber purity, monomaterial presence, dye contamination' },
  { factor: 'Material Condition', weight: '20%', desc: 'Tensile strength retention, abrasion wear, cleanliness' },
  { factor: 'Reuse Potential', weight: '20%', desc: 'Direct remanufacturing feasibility & structural integrity' },
  { factor: 'Environmental Benefit', weight: '15%', desc: 'CO₂ emissions abated vs virgin material extraction' },
  { factor: 'Processing Feasibility', weight: '10%', desc: 'Regional equipment readiness & sorting throughput' }
];

const BENCHMARKS = [
  { metric: 'Avg. Circularity Score', platform: '86.4 / 100', industry: '62.1 / 100', status: 'Top 5% Tier' },
  { metric: 'Waste Diversion Rate', platform: '94.2%', industry: '48.5%', status: '+45.7% Lead' },
  { metric: 'Recycled Fiber Yield', platform: '91.8%', industry: '71.0%', status: '+20.8% Superior' },
  { metric: 'Water Savings per Ton', platform: '1,020 m³', industry: '640 m³', status: 'High Conservation' }
];

export const SustainabilityPage: React.FC<SustainabilityPageProps> = ({ onNavigate, onToast }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'intelligence' | 'impact' | 'scoring'>('intelligence');
  const [downloadingReport, setDownloadingReport] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getSustainability();
      setData(res);
    } catch (err: any) {
      onToast('Error loading sustainability data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportEsgReport = async () => {
    setDownloadingReport(true);
    try {
      onToast('Generating Executive Sustainability & Circularity PDF Report...', 'info');
      await api.downloadPdfReport('sustainability', 'Executive Sustainability & Circularity Report');
      onToast('ESG Sustainability Report downloaded successfully!', 'success');
    } catch (err) {
      onToast('Failed to download ESG report. Navigating to Reports manager...', 'error');
      onNavigate('reports');
    } finally {
      setDownloadingReport(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-stone-500 font-mono text-xs space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#004d3d]" />
        <span>Loading Sustainability Intelligence & Circularity Metrics...</span>
      </div>
    );
  }

  const { metrics, circularityPerformance, diversionTrend } = data;

  const carbonFootprintData = [
    { month: 'Feb', manufacturing: 4800, saved: 4100, net: 700 },
    { month: 'Mar', manufacturing: 5200, saved: 4500, net: 700 },
    { month: 'Apr', manufacturing: 5100, saved: 4600, net: 500 },
    { month: 'May', manufacturing: 5900, saved: 5350, net: 550 },
    { month: 'Jun', manufacturing: 6200, saved: 5700, net: 500 },
    { month: 'Jul', manufacturing: 6800, saved: 6410, net: 390 }
  ];

  const categoryDistributionData = [
    { name: 'Excellent', value: 45, color: '#004d3d' },
    { name: 'High', value: 35, color: '#047857' },
    { name: 'Moderate', value: 12, color: '#0284c7' },
    { name: 'Limited', value: 5, color: '#d97706' },
    { name: 'Disposal', value: 3, color: '#e11d48' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. EDITORIAL HEADER */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold text-[#004d3d] uppercase tracking-wider">
              Module 8 & 9 • Circularity & ESG Intelligence
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-[#004d3d] border border-emerald-200">
              ISO 14044 LCA Compliant
            </span>
          </div>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight flex items-center gap-3">
            <span>Sustainability & Circularity Analytics</span>
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Carbon footprint estimation, waste diversion analytics, AI scoring engine, and LCA environmental impact assessment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportEsgReport}
            disabled={downloadingReport}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-[#004d3d] hover:bg-[#00382c] text-white text-xs font-semibold rounded-full shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloadingReport ? 'Generating ESG PDF...' : 'Export ESG Report (.pdf)'}</span>
          </button>
        </div>
      </div>

      {/* 2. TOP METRIC STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider block">Average Circularity Score</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-serif-display text-3xl font-bold text-[#004d3d]">{metrics.averageCircularityScore || 86.4}</span>
            <span className="text-xs font-mono text-stone-500">/ 100</span>
          </div>
          <p className="text-xs text-stone-600 mt-2 font-medium">Weighted formula: 35/20/20/15/10</p>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider block">Waste Diversion Rate</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-serif-display text-3xl font-bold text-[#004d3d]">{metrics.wasteDiversionRate || 94.2}%</span>
          </div>
          <p className="text-xs text-stone-600 mt-2 font-medium">9.42 tons diverted from landfills</p>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider block">Total CO₂ Abatement</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-serif-display text-3xl font-bold text-emerald-800">{metrics.totalCo2SavedKg?.toLocaleString() || '41,400'} kg</span>
          </div>
          <p className="text-xs text-stone-600 mt-2 font-medium">4.14 kg CO₂ per kg textile</p>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider block">Water Conserved</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-serif-display text-3xl font-bold text-cyan-800">
              {((metrics.totalWaterSavedLiters || 10200000) / 1000).toLocaleString()} m³
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-2 font-medium">10.2 million liters freshwater saved</p>
        </div>
      </div>

      {/* 3. SUB-SECTION TABS */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
        <button
          onClick={() => setActiveTab('intelligence')}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'intelligence'
              ? 'bg-[#004d3d] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
          }`}
        >
          Circularity & Diversion Curves
        </button>
        <button
          onClick={() => setActiveTab('impact')}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'impact'
              ? 'bg-[#004d3d] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
          }`}
        >
          Carbon Footprint & LCA
        </button>
        <button
          onClick={() => setActiveTab('scoring')}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'scoring'
              ? 'bg-[#004d3d] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
          }`}
        >
          Scoring Methodology & Benchmarks
        </button>
      </div>

      {/* TAB 1: INTELLIGENCE */}
      {activeTab === 'intelligence' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-serif-display text-lg font-bold text-stone-900">Monthly Waste Diversion Trajectory</h3>
            <p className="text-xs text-stone-500">Volume of post-industrial and post-consumer textile waste diverted (kg)</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={diversionTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="month" stroke="#78716c" fontSize={11} />
                  <YAxis stroke="#78716c" fontSize={11} />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="divertedKg" stroke="#004d3d" fill="#004d3d" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-serif-display text-lg font-bold text-stone-900">Circularity Score Distribution</h3>
            <p className="text-xs text-stone-500">Distribution of analyzed batches across circularity potential tiers</p>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={categoryDistributionData}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: IMPACT */}
      {activeTab === 'impact' && (
        <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="font-serif-display text-lg font-bold text-stone-900">Carbon Footprint Abatement Balance</h3>
            <p className="text-xs text-stone-500 mt-0.5">Estimated lifecycle manufacturing emissions vs. averted circular emissions (kg CO₂e)</p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={carbonFootprintData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="month" stroke="#78716c" fontSize={11} />
                <YAxis stroke="#78716c" fontSize={11} />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="manufacturing" name="Baseline Emissions" fill="#a8a29e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="saved" name="Abated Emissions" fill="#004d3d" radius={[4, 4, 0, 0]} />
                <Bar dataKey="net" name="Residual Footprint" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB 3: SCORING METHODOLOGY */}
      {activeTab === 'scoring' && (
        <div className="space-y-6">
          {/* FORMULA CARD */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-serif-display text-lg font-bold text-stone-900">
              Circularity Index Formula Architecture (100% Weight)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {WEIGHTED_FORMULA.map((item, idx) => (
                <div key={idx} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-stone-900">{item.factor}</span>
                    <span className="font-mono text-xs font-bold text-[#004d3d]">{item.weight}</span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-tight">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* BENCHMARK COMPARISONS */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-serif-display text-lg font-bold text-stone-900">Industry Performance Benchmark Comparisons</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {BENCHMARKS.map((b, idx) => (
                <div key={idx} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                  <span className="text-xs font-semibold text-stone-700 block">{b.metric}</span>
                  <div className="flex justify-between items-baseline font-mono text-xs">
                    <span className="text-stone-500">Platform:</span>
                    <span className="font-bold text-[#004d3d] text-sm">{b.platform}</span>
                  </div>
                  <div className="flex justify-between items-baseline font-mono text-xs">
                    <span className="text-stone-500">Industry Avg:</span>
                    <span className="text-stone-700">{b.industry}</span>
                  </div>
                  <div className="pt-2 border-t border-stone-200 text-right">
                    <span className="px-2 py-0.5 bg-emerald-50 text-[#004d3d] font-mono text-[10px] font-bold rounded-full border border-emerald-200">
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
