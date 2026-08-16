import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Leaf, Award, TrendingUp, Compass, Activity, ArrowRight, FileText,
  Percent, Loader, AlertCircle, RefreshCw, BarChart2
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, Legend
} from 'recharts';

import SustainabilityService from '../../services/sustainabilityService';
import SustainabilityCard from '../../components/SustainabilityCard/SustainabilityCard';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#3b0764'];

export default function SustainabilityDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await SustainabilityService.getDashboardStats();
      setStats(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch sustainability dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <Activity size={24} className="animate-spin text-primary-500 mb-2" />
        <span>Aggregating sustainability indicators database...</span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="glass-card rounded-3xl p-8 text-center space-y-3">
        <AlertCircle size={32} className="mx-auto text-red-500" />
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        <button onClick={loadStats} className="text-xs text-slate-500 hover:text-primary-500 flex items-center justify-center space-x-1.5 mx-auto">
          <RefreshCw size={12} />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  // Format data for Recharts Pie Chart
  const pieData = Object.entries(stats.recovery_method_distribution || {}).map(([key, value]) => ({
    name: key,
    value: value
  }));

  // Format data for Recharts Bar Chart
  const barData = (stats.material_recovery_statistics || []).map(item => ({
    name: item.material,
    'Sustain Score': item.avg_sustainability_score,
    'Circular Index': item.avg_circularity_score
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
            Sustainability Portal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Real-time carbon offset, water reserves saving, and circularity indicators.
          </p>
        </div>
        <button
          onClick={loadStats}
          className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-500 border border-borderLight dark:border-borderDark rounded-xl hover:bg-slate-50 dark:hover:bg-cardDark transition-all"
        >
          <RefreshCw size={12} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SustainabilityCard 
          title="Sustainability Index" 
          score={stats.average_sustainability_score} 
          subtitle="Platform overall rating"
          icon="award"
          colorClass="text-emerald-500"
          progressColor="bg-emerald-500"
        />
        <SustainabilityCard 
          title="Circular Economy Index" 
          score={stats.average_circularity_score} 
          subtitle="Resource recovery loop index"
          icon="compass"
          colorClass="text-accent-cyan"
          progressColor="bg-accent-cyan"
        />
        <SustainabilityCard 
          title="Carbon Saved" 
          score={`${(stats.estimated_co2_saved_kg || 0).toLocaleString()} kg`}
          subtitle="CO₂ diverted from atmosphere"
          icon="trending"
          colorClass="text-primary-600 dark:text-primary-neon"
          progressColor="bg-primary-500 dark:bg-primary-neon"
        />
        <SustainabilityCard 
          title="Water Preservation" 
          score={`${(stats.estimated_water_saved_liters || 0).toLocaleString()} L`}
          subtitle="Clean water reserves preserved"
          icon="activity"
          colorClass="text-blue-500"
          progressColor="bg-blue-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Material Recovery Statistics (Bar Chart) */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
              <BarChart2 size={14} className="text-primary-500" />
              <span>Material Recovery Statistics</span>
            </h3>
          </div>
          {barData.length > 0 ? (
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '16px',
                      fontSize: '11px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="Sustain Score" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Circular Index" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-80 text-xs text-slate-400">
              No material data registered yet.
            </div>
          )}
        </div>

        {/* Recovery Method Distribution (Pie Chart) */}
        <div className="glass-card rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-6 flex items-center space-x-1.5">
              <Leaf size={14} className="text-emerald-500" />
              <span>Recovery Methods</span>
            </h3>
            {pieData.length > 0 ? (
              <div className="w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '16px',
                        fontSize: '11px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-56 text-xs text-slate-400">
                No recovery logs available.
              </div>
            )}
          </div>
          {/* Pie Chart Legend List */}
          <div className="space-y-1.5 pt-4 border-t border-borderLight dark:border-borderDark">
            {pieData.map((item, idx) => (
              <div key={item.name} className="flex justify-between items-center text-[10px] text-slate-400">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-bold text-slate-700 dark:text-white">{item.value} times</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Layout - Recent Reports Table */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
            <FileText size={14} className="text-primary-500" />
            <span>Recent Sustainability Reports</span>
          </h3>
          <Link 
            to="/reports" 
            className="flex items-center space-x-1 text-[10px] font-bold text-primary-600 dark:text-primary-neon hover:underline"
          >
            <span>View All Reports</span>
            <ArrowRight size={10} />
          </Link>
        </div>

        {stats.recent_sustainability_reports?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-borderLight dark:border-borderDark text-slate-400 font-bold">
                  <th className="py-3 px-4">Report Title</th>
                  <th className="py-3 px-4">Material</th>
                  <th className="py-3 px-4">Waste Category</th>
                  <th className="py-3 px-4">Analysis Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderLight dark:divide-borderDark">
                {stats.recent_sustainability_reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-cardDark/20 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-white">
                      {report.report_title}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-500 dark:text-slate-400">{report.material}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary-50 dark:bg-emerald-950/20 text-primary-800 dark:text-primary-neon border border-borderLight dark:border-borderDark">
                        {report.waste_category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{new Date(report.created_at).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link 
                        to={`/predictions/${report.prediction_id}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-50 dark:bg-cardDark text-[10px] font-bold text-slate-600 dark:text-white rounded-xl border border-borderLight dark:border-borderDark hover:bg-slate-100 dark:hover:bg-bgDark transition-all"
                      >
                        <span>Audit Details</span>
                        <ArrowRight size={10} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-xs text-slate-400">
            No report history available yet.
          </div>
        )}
      </div>

    </div>
  );
}
