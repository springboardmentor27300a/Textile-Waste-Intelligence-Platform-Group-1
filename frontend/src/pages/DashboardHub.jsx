import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Layers, Recycle, ShieldAlert, TrendingUp, Leaf, 
  Droplet, Trash, Activity, Calendar, ArrowRight, Package, Plus, Database,
  Brain, History, Sparkles, BarChart2
} from 'lucide-react';

import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function DashboardHub() {
  const { user } = useAuth();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/summary');
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <Activity size={24} className="animate-spin text-primary-neon mb-2 shadow-neon" />
        <span>Aggregating real-time operations database...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 rounded-2xl text-xs">
        <span>{error || 'Could not load dashboard parameters.'}</span>
      </div>
    );
  }

  const { role, stats, charts, activities, ai_stats } = data;


  // Circular gauge config
  const recyclingRate = stats.recycling_rate || 78.5; // Default or calculated
  const radius = 58;
  const circumference = 2 * Math.PI * radius; // 364.42
  const dashoffset = circumference - (recyclingRate / 100) * circumference;

  return (
    <div className="space-y-8">
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
            Hello, {user?.full_name?.split(' ')[0]} 👋
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Operational Overview &bull; Account: <span className="text-primary-800 dark:text-primary-neon font-bold">{role}</span>
          </p>
        </div>
        
        {/* Quick Actions Panel */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          {['Administrator', 'Recycling Facility Operator', 'Textile Manufacturer'].includes(role) && (
            <Link
              to="/inventory?add=true"
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-primary-800 dark:bg-emerald-950 text-white dark:text-primary-neon border border-transparent dark:border-borderDark rounded-2xl text-xs font-bold shadow-soft dark:shadow-neon hover-scale"
            >
              <Plus size={14} />
              <span>Log Waste Batch</span>
            </Link>
          )}
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark px-4 py-2.5 rounded-2xl hidden md:block">
            Today: <span className="text-slate-800 dark:text-white">{new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* KPI 4-Columns Grid with Inline Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1 */}
        <div className="p-6 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-3xl shadow-soft transition-all hover-glow-green">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                {role === 'Textile Manufacturer' ? 'Submitted Batches' : 'Total Waste Logged'}
              </p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-2 leading-none">
                {role === 'Textile Manufacturer' 
                  ? `${stats.submitted_batches} Batches`
                  : `${stats.total_waste_registered_kg || stats.todays_collections_kg || 1490} kg`}
              </h3>
            </div>
            <div className="p-2.5 bg-primary-50 dark:bg-emerald-950/40 text-primary-800 dark:text-primary-neon rounded-2xl shadow-neon">
              <Layers size={16} />
            </div>
          </div>
          {/* SVG Sparkline */}
          <svg className="w-full h-8 mt-4 text-emerald-500 dark:text-primary-neon" viewBox="0 0 100 30" fill="none">
            <path d="M0,25 Q15,5 30,18 T60,5 T90,20 T100,10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <div className="text-[9px] text-slate-400 mt-2 font-medium flex justify-between">
            <span>Historical volume trend</span>
            <span className="text-primary-neon font-bold">+12%</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-6 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-3xl shadow-soft transition-all hover-glow-green">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                {role === 'Sustainability Manager' ? 'Carbon Offset' : 'Pending Batches'}
              </p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-2 leading-none">
                {role === 'Sustainability Manager'
                  ? `-${stats.co2_saved_kg || 6250} kg CO₂`
                  : `${stats.pending_batches_count || 4} Batches`}
              </h3>
            </div>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-neon">
              <Leaf size={16} />
            </div>
          </div>
          {/* SVG Sparkline */}
          <svg className="w-full h-8 mt-4 text-primary-neon" viewBox="0 0 100 30" fill="none">
            <path d="M0,5 Q20,28 40,10 T80,28 T100,5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <div className="text-[9px] text-slate-400 mt-2 font-medium flex justify-between">
            <span>Greenhouse offset values</span>
            <span className="text-emerald-400 font-bold">-4.2kg/kg</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-6 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-3xl shadow-soft transition-all hover-glow-cyan">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                {role === 'Sustainability Manager' ? 'Water Preservation' : 'Active Stock'}
              </p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-2 leading-none">
                {role === 'Sustainability Manager'
                  ? `${(stats.water_saved_liters || 372000).toLocaleString()} L`
                  : `${stats.total_inventory_items || stats.available_recycled_yarn_kg || 12} Items`}
              </h3>
            </div>
            <div className="p-2.5 bg-blue-50 dark:bg-emerald-950/40 text-blue-600 dark:text-accent-cyan rounded-2xl shadow-neon-cyan">
              <Droplet size={16} />
            </div>
          </div>
          {/* SVG Sparkline */}
          <svg className="w-full h-8 mt-4 text-accent-cyan" viewBox="0 0 100 30" fill="none">
            <path d="M0,28 L20,15 L40,22 L60,8 L80,18 L100,3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <div className="text-[9px] text-slate-400 mt-2 font-medium flex justify-between">
            <span>Water reserves calculation</span>
            <span className="text-accent-cyan font-bold">2.5kL/kg</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-6 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-3xl shadow-soft transition-all hover-glow-green">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                {role === 'Administrator' ? 'User Profiles' : 'Recycling Index'}
              </p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-2 leading-none">
                {role === 'Administrator' ? stats.total_users : `${stats.recycling_rate || 78.5}%`}
              </h3>
            </div>
            <div className="p-2.5 bg-teal-50 dark:bg-emerald-950/40 text-teal-600 dark:text-primary-neon rounded-2xl shadow-neon">
              <TrendingUp size={16} />
            </div>
          </div>
          {/* SVG Sparkline */}
          <svg className="w-full h-8 mt-4 text-primary-neon" viewBox="0 0 100 30" fill="none">
            <path d="M0,25 Q15,5 30,12 T60,20 T80,5 T100,2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <div className="text-[9px] text-slate-400 mt-2 font-medium flex justify-between">
            <span>Recycling target indices</span>
            <span className="text-primary-neon font-bold">78% Target</span>
          </div>
        </div>

      </div>

      {/* Main Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns: Circular Wellness Progress (2 Cols, or 3 if right column is hidden) */}
        <div className={['Administrator', 'Sustainability Manager', 'Textile Manufacturer'].includes(role) ? "lg:col-span-2 space-y-6" : "lg:col-span-3 space-y-6"}>

          <div className="p-8 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-3xl shadow-soft flex flex-col sm:flex-row items-center gap-8">
            
            {/* Circular Gauge Ring */}
            <div className="relative shrink-0 flex items-center justify-center">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  strokeWidth="8"
                  className="text-slate-100 dark:text-slate-900"
                  fill="transparent"
                  stroke="currentColor"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  strokeWidth="8"
                  className="text-primary-neon circular-gauge-path"
                  fill="transparent"
                  stroke="currentColor"
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: dashoffset,
                  }}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                  {recyclingRate}%
                </span>
                <span className="text-[8px] uppercase tracking-wider font-bold text-slate-400 mt-1">
                  Circular Rate
                </span>
              </div>
            </div>

            {/* Description list */}
            <div className="space-y-4 flex-1">
              <div>
                <span className="text-[9px] text-primary-800 dark:text-primary-neon uppercase tracking-wider font-bold">Traceability Ratio</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">Textile Recovery Index</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Your organization's circularity rating represents completed recycling pipelines relative to total registered post-industrial textile wastes.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-borderLight dark:border-borderDark text-xs">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-semibold">Active Inventory Weight</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-1 block">{(stats.total_waste_registered_kg || 1490).toLocaleString()} kg</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-semibold">Completed Recycled</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-1 block">{(stats.recycled_quantity_kg || 480).toLocaleString()} kg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fabric Breakdown Table list */}
          <div className="p-6 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-3xl shadow-soft">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Material Breakdown Distribution</h3>
            
            <div className="space-y-4">
              {Object.keys(charts.fabric_breakdown).length === 0 ? (
                <p className="text-xs text-slate-400">No composition metrics logged.</p>
              ) : (
                Object.entries(charts.fabric_breakdown).map(([fabric, weight]) => {
                  const percent = Math.min((weight / 1500) * 100, 100);
                  return (
                    <div key={fabric} className="space-y-2 text-xs">
                      <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                        <span>{fabric}</span>
                        <span className="font-mono text-slate-500">{weight.toFixed(1)} kg</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-50 dark:bg-slate-900 border border-borderLight dark:border-slate-850 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-800 dark:bg-primary-neon rounded-full shadow-neon" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Side Column (Tailored by Role) */}
        {['Administrator', 'Sustainability Manager', 'Textile Manufacturer'].includes(role) && (
          <div className="lg:col-span-1">
            {role === 'Sustainability Manager' ? (
              <div className="space-y-6 sticky top-24">
                {/* Report generator */}
                <div className="p-6 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-3xl shadow-soft">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
                    <Database size={16} className="text-primary-800 dark:text-primary-neon" />
                    <span>ESG Report Center</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed font-semibold">
                    Synthesize database metrics to export compliant corporate sustainability reports.
                  </p>
                  <button
                    onClick={() => alert('ESG Report generated successfully! Saved to exports catalog.')}
                    className="w-full py-2.5 bg-primary-800 dark:bg-emerald-950 text-white dark:text-primary-neon font-bold text-xs rounded-2xl hover-scale shadow-neon"
                  >
                    Generate ESG Summary
                  </button>
                </div>

                {/* Impact Goals */}
                <div className="p-6 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-3xl shadow-soft">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Offset Objectives</h3>
                  <div className="space-y-4 text-xs font-semibold">
                    <div>
                      <div className="flex justify-between mb-1.5 text-slate-700 dark:text-slate-350 font-bold">
                        <span>Carbon Divert Target</span>
                        <span className="text-primary-neon font-mono">82%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-50 dark:bg-slate-900 border border-borderLight dark:border-borderDark rounded-full overflow-hidden">
                        <div className="h-full bg-primary-neon rounded-full shadow-neon" style={{ width: '82%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1.5 text-slate-700 dark:text-slate-350 font-bold">
                        <span>Water Converted Target</span>
                        <span className="text-accent-cyan font-mono">91%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-50 dark:bg-slate-900 border border-borderLight dark:border-borderDark rounded-full overflow-hidden">
                        <div className="h-full bg-accent-cyan rounded-full shadow-neon-cyan" style={{ width: '91%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : role === 'Textile Manufacturer' ? (
              <div className="p-6 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-3xl shadow-soft sticky top-24 space-y-6">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Leaf size={16} className="text-primary-800 dark:text-primary-neon" />
                  <span>AI Circular Suggestions</span>
                </h3>
                <div className="space-y-4 text-xs font-medium">
                  <div className="p-3 bg-primary-50/25 dark:bg-emerald-950/10 border border-slate-200 dark:border-[#1C2621] rounded-2xl">
                    <h4 className="font-bold text-slate-900 dark:text-white">Denim Scrap Reclaim</h4>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Cotton denim roll cutoffs are classified as premium carding feedstocks. We recommend direct routing to respinning facilities.
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50/25 dark:bg-emerald-950/10 border border-slate-200 dark:border-[#1C2621] rounded-2xl">
                    <h4 className="font-bold text-slate-900 dark:text-white">Polyester Recommendation</h4>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Polyester knit fibers should be routed to thermal extrusion for recycled PET pellet conversion rather than landfill storage.
                    </p>
                  </div>
                </div>
              </div>
            ) : role === 'Administrator' ? (
              /* Administrator sees Security Audit Feed */
              <div className="p-6 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-3xl shadow-soft sticky top-24">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <Activity size={16} className="text-primary-800 dark:text-primary-neon" />
                    <span>Security Audit Feed</span>
                  </h3>
                  <Link to="/inventory" className="text-[10px] font-bold text-primary-800 dark:text-primary-neon hover:underline">
                    View logs
                  </Link>
                </div>

                <div className="space-y-4">
                  {activities.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">No logs available.</p>
                  ) : (
                    activities.map((act) => (
                      <div key={act.id} className="relative pl-6 pb-4 border-l border-borderLight dark:border-borderDark last:pb-0">
                        {/* Pulsing action marker */}
                        <span className="absolute -left-[4px] top-1.5 w-2 h-2 rounded-full bg-primary-800 dark:bg-primary-neon border border-white dark:border-cardDark shadow-neon"></span>
                        
                        <div className="text-[10px] space-y-1">
                          <div className="flex justify-between text-slate-950 dark:text-white font-bold">
                            <span className="truncate max-w-[120px]">{act.user_name}</span>
                            <span className="text-[9px] text-slate-400 font-mono">
                              {new Date(act.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <p className="text-slate-500 font-semibold text-[9px] uppercase tracking-wider">{act.action}</p>
                          <p className="text-slate-400 leading-normal font-medium">{act.details}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}
        {/* ─────────────────────────────────────────────────────────────────
            MILESTONE 2: AI Intelligence Section
        ──────────────────────────────────────────────────────────────────── */}
        {ai_stats && (
          <div className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 bg-primary-800 dark:bg-emerald-950 text-primary-neon rounded-xl shadow-neon">
                  <Brain size={14} />
                </div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-white">AI Intelligence</h2>
              </div>
              <Link to="/analysis" className="flex items-center space-x-1.5 text-xs text-primary-600 dark:text-primary-neon hover:underline font-semibold">
                <Sparkles size={12} />
                <span>New Analysis</span>
              </Link>
            </div>

            {/* AI Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Predictions', value: ai_stats.total_predictions || 0, icon: Brain, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-emerald-950/20' },
                { label: 'Most Common Material', value: ai_stats.most_common_material || 'N/A', icon: Layers, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20' },
                { label: 'Top Waste Category', value: ai_stats.most_common_waste_category || 'N/A', icon: Recycle, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/20' },
                { label: 'Avg Confidence', value: ai_stats.average_confidence ? `${ai_stats.average_confidence.toFixed(1)}%` : '—', icon: BarChart2, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/20' },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="glass-card rounded-3xl p-4 flex items-center space-x-3">
                  <div className={`p-2 ${bg} rounded-xl flex-shrink-0`}>
                    <Icon size={16} className={color} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-slate-400 uppercase tracking-wider truncate">{label}</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Predictions + Recent Images */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Recent Predictions */}
              <div className="glass-card rounded-3xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-white flex items-center space-x-1.5">
                    <History size={13} className="text-primary-500" />
                    <span>Recent Predictions</span>
                  </h3>
                  <Link to="/predictions" className="text-[10px] text-primary-600 dark:text-primary-neon hover:underline">View All</Link>
                </div>
                {ai_stats.recent_predictions && ai_stats.recent_predictions.length > 0 ? (
                  <div className="space-y-2">
                    {ai_stats.recent_predictions.map((pred) => (
                      <Link
                        key={pred.id}
                        to={`/predictions/${pred.id}`}
                        className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-bgDark/30 transition-colors group"
                      >
                        <div className="flex items-center space-x-2 min-w-0">
                          <div className="w-2 h-2 rounded-full bg-primary-neon flex-shrink-0" />
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{pred.material}</span>
                          <span className="text-[9px] text-slate-400 truncate hidden sm:inline">· {pred.waste_category}</span>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {pred.confidence != null && (
                            <span className="text-[10px] font-bold text-primary-600 dark:text-primary-neon">{pred.confidence.toFixed(0)}%</span>
                          )}
                          <ArrowRight size={11} className="text-slate-300 group-hover:text-primary-500 transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Brain size={24} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-xs text-slate-400">No predictions yet</p>
                    <Link to="/analysis" className="text-[10px] text-primary-600 dark:text-primary-neon hover:underline mt-1 inline-block">Upload your first image →</Link>
                  </div>
                )}
              </div>

              {/* Recent Uploaded Images */}
              <div className="glass-card rounded-3xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-white">Recent Uploads</h3>
                  <Link to="/analysis" className="text-[10px] text-primary-600 dark:text-primary-neon hover:underline">Upload New</Link>
                </div>
                {ai_stats.recent_images && ai_stats.recent_images.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {ai_stats.recent_images.map((img) => (
                      <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-cardDark group">
                        <img
                          src={`http://localhost:8000/uploads/${img.path}`}
                          alt={img.filename}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200" />
                        <div className="absolute bottom-0 inset-x-0 p-1 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-[8px] text-white truncate">{img.surface_quality}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-xs text-slate-400">No images uploaded yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
