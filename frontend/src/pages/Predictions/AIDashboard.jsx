import React, { useState, useEffect } from 'react';
import { 
  Brain, BarChart2, Layers, Recycle, TrendingUp, Calendar, 
  Activity, RefreshCw, AlertCircle, Award, Sparkles, Clock 
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import AIService from '../../services/aiService';

export default function AIDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await AIService.getAnalytics();
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch AI classification metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <Activity size={28} className="animate-spin text-primary-neon mb-2 shadow-neon" />
        <span className="text-xs font-semibold">Aggregating AI classification telemetry...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center space-x-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 p-6 rounded-3xl">
        <AlertCircle size={20} className="flex-shrink-0" />
        <div className="text-xs font-medium">
          <p>{error || 'Could not load AI dashboard parameters.'}</p>
          <button onClick={fetchAnalytics} className="mt-2 text-primary-600 dark:text-primary-neon underline font-bold flex items-center space-x-1">
            <RefreshCw size={10} /> <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  const { 
    total_analyses, 
    average_confidence, 
    recyclability_average, 
    material_distribution, 
    waste_distribution, 
    daily_analyses, 
    weekly_analyses 
  } = data;

  // Prepare Pie Chart Data
  const pieData = Object.entries(material_distribution).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value);

  // Prepare Bar Chart Data
  const barData = Object.entries(waste_distribution).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value);

  // Colors for charts
  const PIE_COLORS = [
    '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#06B6D4', 
    '#EC4899', '#14B8A6', '#6366F1', '#A855F7', '#EF4444'
  ];
  
  const BAR_COLORS = {
    'Recyclable': '#10B981',
    'Reusable': '#3B82F6',
    'Repairable': '#F59E0B',
    'Upcyclable': '#06B6D4',
    'Compostable': '#84CC16',
    'Hazardous Textile Waste': '#EF4444'
  };

  const getBarColor = (name) => BAR_COLORS[name] || '#64748B';

  const mostCommonMaterial = pieData.length > 0 ? pieData[0].name : 'N/A';
  const topWasteCategory = barData.length > 0 ? barData[0].name : 'N/A';

  // Calculate sum counts for daily/weekly
  const dailyCount = daily_analyses.reduce((sum, item) => sum + item.count, 0);
  const weeklyCount = weekly_analyses.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Title Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <div className="p-2 bg-primary-800 dark:bg-emerald-950 text-primary-neon rounded-2xl shadow-neon">
              <BarChart2 size={18} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Textile AI Dashboard</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 ml-11">
            Real-time tracking of material classifications, confidence levels, and recyclability scores
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark hover:bg-slate-50 dark:hover:bg-slate-900 rounded-2xl text-xs font-bold text-slate-700 dark:text-white shadow-soft transition-all"
        >
          <RefreshCw size={12} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Analyses', value: total_analyses, icon: Brain, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-emerald-950/20' },
          { label: 'Avg Confidence', value: `${average_confidence.toFixed(1)}%`, icon: Award, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/20' },
          { label: 'Recyclability Rate', value: `${recyclability_average.toFixed(1)}%`, icon: Recycle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/20' },
          { label: 'Most Common', value: mostCommonMaterial, icon: Layers, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20' },
          { label: 'Daily Volume', value: dailyCount, icon: Calendar, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/20' },
          { label: 'Weekly Volume', value: weeklyCount, icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="glass-card rounded-3xl p-4 flex flex-col justify-between hover-glow-green min-h-[100px] relative overflow-hidden transition-all duration-300">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold truncate max-w-[80%]">{label}</span>
              <div className={`p-1.5 ${bg} rounded-xl`}>
                <Icon size={12} className={color} />
              </div>
            </div>
            <p className="text-sm font-black text-slate-800 dark:text-white mt-1 truncate">{value}</p>
          </div>
        ))}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (2 Cols Width) */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <TrendingUp size={15} className="text-primary-500" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Prediction Volume Trend</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily_analyses} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#FFF', fontSize: '11px' }} 
                  labelClassName="font-bold text-primary-neon"
                />
                <Area type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Material Breakdown (1 Col Width) */}
        <div className="glass-card rounded-3xl p-6 space-y-4 flex flex-col justify-between">
          <div className="flex items-center space-x-2">
            <Layers size={15} className="text-blue-500" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Material Class Distribution</h3>
          </div>
          <div className="h-48 w-full relative flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#FFF', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">No material distribution available</p>
            )}
            {pieData.length > 0 && (
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Top Material</span>
                <span className="text-xs font-black text-slate-800 dark:text-white truncate max-w-[80px]">{mostCommonMaterial}</span>
              </div>
            )}
          </div>
          {/* Custom legend */}
          <div className="flex flex-wrap gap-2 justify-center max-h-24 overflow-y-auto mt-2">
            {pieData.slice(0, 5).map((entry, index) => (
              <div key={entry.name} className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar Chart: Waste Distribution */}
      <div className="glass-card rounded-3xl p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Recycle size={15} className="text-yellow-500" />
          <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Waste Category Classification</h3>
        </div>
        <div className="h-64 w-full">
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#FFF', fontSize: '11px' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={40}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.name)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-xs text-slate-400">No waste categories logged yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
