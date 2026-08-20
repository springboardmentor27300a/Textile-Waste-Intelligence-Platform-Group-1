import React, { useEffect, useState } from 'react';
import { 
  Leaf, Droplets, Scale, Trees, Car, 
  Calendar, RefreshCw, BarChart3, Zap, Download,
  CheckCircle2, ShieldCheck, Factory
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { api } from '../services/api';
import { NavigationPage } from '../types/client';

interface EnvironmentalImpactPageProps {
  onNavigate: (page: NavigationPage) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const EnvironmentalImpactPage: React.FC<EnvironmentalImpactPageProps> = ({ onNavigate, onToast }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('30d');
  const [downloadingReport, setDownloadingReport] = useState(false);

  useEffect(() => {
    loadData();
  }, [timeFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getEnvironmental();
      setData(res);
    } catch (err) {
      onToast('Error loading environmental data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAuditReport = async () => {
    setDownloadingReport(true);
    try {
      onToast('Generating Environmental Impact Audit PDF Report...', 'info');
      await api.downloadPdfReport('environmental', 'Environmental Impact & Carbon Displacement Audit');
      onToast('Environmental Audit Report downloaded successfully!', 'success');
    } catch (err) {
      onToast('Failed to download audit report. Navigating to Reports manager...', 'error');
      onNavigate('reports');
    } finally {
      setDownloadingReport(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-stone-500 font-mono text-xs space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#004d3d]" />
        <span>Loading Environmental Impact Assessment Engine...</span>
      </div>
    );
  }

  const co2Tons = (data.co2SavedKg / 1000).toFixed(1);
  const waterM3 = (data.waterSavedLiters / 1000).toLocaleString();
  const landfillTons = (data.landfillAvoidedKg / 1000).toFixed(1);
  const energyMwh = Math.round(data.co2SavedKg * 0.00185);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. EDITORIAL HEADER */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold text-[#004d3d] uppercase tracking-wider">
              Module 7 • Life Cycle Assessment Engine
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-[#004d3d] border border-emerald-200">
              ReCiPe 2016 Midpoint
            </span>
          </div>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight flex items-center gap-3">
            <span>Environmental Impact & Resource Conservation</span>
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            CO₂ savings estimation, water conservation, energy reduction, landfill diversion, and ESG compliance reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadAuditReport}
            disabled={downloadingReport}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-[#004d3d] hover:bg-[#00382c] text-white text-xs font-semibold rounded-full shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloadingReport ? 'Generating Audit PDF...' : 'Download Audit Report (.pdf)'}</span>
          </button>
        </div>
      </div>

      {/* 2. 4 CORE IMPACT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-stone-500 uppercase">CO₂ Abated</span>
            <span className="p-2 bg-emerald-50 rounded-xl text-[#004d3d]">
              <Leaf className="w-5 h-5" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif-display text-3xl font-bold text-[#004d3d]">{co2Tons}</span>
            <span className="text-xs font-mono text-stone-500">Metric Tons</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Equivalent to removing {data.equivalencies?.carsOffRoadYear || 9} passenger cars from roads for an entire year.
          </p>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-stone-500 uppercase">Water Conserved</span>
            <span className="p-2 bg-cyan-50 rounded-xl text-cyan-700">
              <Droplets className="w-5 h-5" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif-display text-3xl font-bold text-cyan-800">{waterM3}</span>
            <span className="text-xs font-mono text-stone-500">m³</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Enough freshwater to supply {data.equivalencies?.dailyShowersSaved?.toLocaleString() || '127,500'} domestic shower cycles.
          </p>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-stone-500 uppercase">Landfill Diverted</span>
            <span className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
              <Scale className="w-5 h-5" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif-display text-3xl font-bold text-emerald-800">{landfillTons}</span>
            <span className="text-xs font-mono text-stone-500">Metric Tons</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            94.2% diversion efficiency across all intake streams.
          </p>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-stone-500 uppercase">Energy Conserved</span>
            <span className="p-2 bg-amber-50 rounded-xl text-amber-700">
              <Zap className="w-5 h-5" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif-display text-3xl font-bold text-amber-800">{energyMwh}</span>
            <span className="text-xs font-mono text-stone-500">MWh</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Averting thermal grid power needed for virgin fiber synthesis.
          </p>
        </div>
      </div>

      {/* 3. MATERIAL TYPE BREAKDOWN */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="font-serif-display text-lg font-bold text-stone-900">
          Environmental Impact Savings by Material Category
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="text-[11px] font-mono uppercase bg-stone-50 text-stone-600 border-b border-stone-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Material</th>
                <th className="py-3 px-4 font-semibold">CO₂ Saved / Ton</th>
                <th className="py-3 px-4 font-semibold">Water Saved / Ton</th>
                <th className="py-3 px-4 font-semibold">Energy Saved / Ton</th>
                <th className="py-3 px-4 font-semibold">Recycled Yield</th>
                <th className="py-3 px-4 font-semibold">Virgin Equivalence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-sans">
              <tr className="hover:bg-stone-50/60 transition-colors">
                <td className="py-3 px-4 font-semibold text-stone-900">100% Organic Cotton</td>
                <td className="py-3 px-4 font-mono font-bold text-[#004d3d]">4,200 kg</td>
                <td className="py-3 px-4 font-mono text-cyan-700 font-bold">12,500 m³</td>
                <td className="py-3 px-4 font-mono text-amber-700">7,800 kWh</td>
                <td className="py-3 px-4 font-mono font-semibold text-emerald-800">94.5%</td>
                <td className="py-3 px-4 text-stone-600">890 kg virgin cotton lint</td>
              </tr>
              <tr className="hover:bg-stone-50/60 transition-colors">
                <td className="py-3 px-4 font-semibold text-stone-900">Recycled Polyester (rPET)</td>
                <td className="py-3 px-4 font-mono font-bold text-[#004d3d]">5,100 kg</td>
                <td className="py-3 px-4 font-mono text-cyan-700 font-bold">1,800 m³</td>
                <td className="py-3 px-4 font-mono text-amber-700">14,200 kWh</td>
                <td className="py-3 px-4 font-mono font-semibold text-emerald-800">91.0%</td>
                <td className="py-3 px-4 text-stone-600">1.2 bbl crude oil monomer</td>
              </tr>
              <tr className="hover:bg-stone-50/60 transition-colors">
                <td className="py-3 px-4 font-semibold text-stone-900">Merino Wool</td>
                <td className="py-3 px-4 font-mono font-bold text-[#004d3d]">6,800 kg</td>
                <td className="py-3 px-4 font-mono text-cyan-700 font-bold">8,900 m³</td>
                <td className="py-3 px-4 font-mono text-amber-700">6,100 kWh</td>
                <td className="py-3 px-4 font-mono font-semibold text-emerald-800">96.0%</td>
                <td className="py-3 px-4 text-stone-600">920 kg raw fleece scouring</td>
              </tr>
              <tr className="hover:bg-stone-50/60 transition-colors">
                <td className="py-3 px-4 font-semibold text-stone-900">Flax Linen</td>
                <td className="py-3 px-4 font-mono font-bold text-[#004d3d]">3,900 kg</td>
                <td className="py-3 px-4 font-mono text-cyan-700 font-bold">9,400 m³</td>
                <td className="py-3 px-4 font-mono text-amber-700">5,400 kWh</td>
                <td className="py-3 px-4 font-mono font-semibold text-emerald-800">95.0%</td>
                <td className="py-3 px-4 text-stone-600">880 kg retting crop</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
