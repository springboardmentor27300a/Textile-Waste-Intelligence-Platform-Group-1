"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Recycle, Package, TrendingUp, BarChart3, CheckCircle,
  Clock, AlertTriangle, Zap, Droplets, RefreshCw, ArrowUpRight
} from "lucide-react";
import api from "@/lib/api";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
);

const chartOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { color: "#94a3b8", font: { size: 11 } } } },
  scales: {
    x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" } },
    y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" } },
  },
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MATERIALS = ["Cotton","Polyester","Wool","Denim","Nylon","Rayon","Acrylic","Silk"];

// Demo recycling facility data
function buildFacilityData(stats: any, charts: any) {
  const total = stats?.total_waste_kg || 12450;
  const recycled = stats?.total_recycled_kg || 8341;
  return {
    kpis: [
      { label: "Total Waste Received",  value: Math.round(total),        suffix: " kg",    icon: Package,    color: "from-blue-500 to-blue-700",     trend: +8.2  },
      { label: "Successfully Recycled", value: Math.round(recycled),     suffix: " kg",    icon: Recycle,    color: "from-emerald-500 to-emerald-700", trend: +12.4 },
      { label: "Recovery Rate",         value: `${Math.round(recycled/total*100)}`,suffix: "%",  icon: TrendingUp, color: "from-purple-500 to-purple-700",  trend: +3.1  },
      { label: "Pending Processing",    value: Math.round(total * 0.15), suffix: " kg",    icon: Clock,      color: "from-amber-500 to-amber-700",    trend: -5.0  },
      { label: "Capacity Utilized",     value: 73,                        suffix: "%",      icon: BarChart3,  color: "from-teal-500 to-teal-700",      trend: +2.4  },
      { label: "AI Analyses",           value: stats?.uploaded_images || 23,suffix: "",    icon: Zap,        color: "from-pink-500 to-pink-700",      trend: +15.0 },
    ],
  };
}

const PROCESSING_QUEUE = [
  { id: "TW-Q001", material: "Cotton",    qty: 245, condition: "Fair",   priority: "High",   status: "Processing",  method: "Fiber Recycling",    recovery: "82%" },
  { id: "TW-Q002", material: "Polyester", qty: 180, condition: "Poor",   priority: "High",   status: "Queue",       method: "Chemical Recycling", recovery: "91%" },
  { id: "TW-Q003", material: "Wool",      qty: 95,  condition: "Good",   priority: "Medium", status: "Complete",    method: "Direct Reuse",       recovery: "98%" },
  { id: "TW-Q004", material: "Denim",     qty: 320, condition: "Fair",   priority: "Medium", status: "Processing",  method: "Mechanical Shredding","recovery": "72%" },
  { id: "TW-Q005", material: "Nylon",     qty: 60,  condition: "Critical","priority": "Low", status: "Queue",       method: "Industrial Recovery", recovery: "55%" },
  { id: "TW-Q006", material: "Silk",      qty: 40,  condition: "Good",   priority: "Low",    status: "Complete",    method: "Donation",           recovery: "100%"},
];

const statusBadge: Record<string, string> = {
  Processing: "badge-blue",
  Queue:      "badge-yellow",
  Complete:   "badge-green",
};
const priorityBadge: Record<string, string> = {
  High:   "badge-red",
  Medium: "badge-blue",
  Low:    "badge-green",
};

export default function RecyclingFacilityPage() {
  const [stats, setStats]     = useState<any>(null);
  const [charts, setCharts]   = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [s, c] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/dashboard/charts"),
      ]);
      setStats(s.data);
      setCharts(c.data);
    } catch {
      // use defaults
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);
  const refresh = () => { setRefreshing(true); loadData(); };

  const fData = buildFacilityData(stats, charts);
  const months = charts?.monthly_waste?.map((d: any) => d.month) || MONTHS;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-56 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Recycle className="w-7 h-7 text-emerald-400" /> Recycling Facility Dashboard
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Real-time processing analytics, recovery statistics & waste inventory
          </p>
        </div>
        <button onClick={refresh} disabled={refreshing}
          className="btn-outline flex items-center gap-2 text-sm py-2">
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {fData.kpis.map((kpi, i) => (
          <motion.div key={kpi.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${kpi.color} rounded-xl flex items-center justify-center`}>
                <kpi.icon className="w-5 h-5 text-white" />
              </div>
              <span className={`text-xs font-semibold flex items-center gap-1 ${kpi.trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                <ArrowUpRight className="w-3 h-3" style={{ transform: kpi.trend < 0 ? "scaleY(-1)" : undefined }} />
                {Math.abs(kpi.trend)}%
              </span>
            </div>
            <p className="text-2xl font-black text-white">{kpi.value}{kpi.suffix}</p>
            <p className="text-xs text-gray-400 mt-1">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Monthly Received vs Recycled */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-white mb-1">Waste Received vs Recycled (kg)</h3>
          <p className="text-xs text-gray-500 mb-4">Monthly throughput comparison</p>
          <div className="h-56">
            <Bar options={chartOpts as any}
              data={{ labels: months, datasets: [
                { label: "Received",  data: charts?.monthly_waste?.map((d:any) => d.collected) || MONTHS.map(() => Math.round(Math.random()*2500+500)),
                  backgroundColor: "rgba(59,130,246,0.7)", borderRadius: 6 },
                { label: "Recycled",  data: charts?.monthly_waste?.map((d:any) => d.recycled)  || MONTHS.map(() => Math.round(Math.random()*1800+300)),
                  backgroundColor: "rgba(16,185,129,0.7)", borderRadius: 6 },
              ] }} />
          </div>
        </div>

        {/* Material Distribution */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-white mb-1">Waste by Material Type</h3>
          <p className="text-xs text-gray-500 mb-4">Current inventory breakdown</p>
          <div className="h-56">
            <Doughnut
              options={{ responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: "right", labels: { color: "#94a3b8", font: { size: 10 }, boxWidth: 12 } } } }}
              data={{ labels: MATERIALS,
                datasets: [{ data: MATERIALS.map(() => Math.round(Math.random()*1800+200)),
                  backgroundColor: ["#10b981","#3b82f6","#8b5cf6","#f59e0b","#06b6d4","#ec4899","#f97316","#a855f7"],
                  borderWidth: 0, hoverOffset: 8 }] }} />
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recovery Rate Trend */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-white mb-1">Recovery Rate Trend (%)</h3>
          <p className="text-xs text-gray-500 mb-4">Monthly recycling efficiency</p>
          <div className="h-48">
            <Line options={{ ...chartOpts as any, plugins: { legend: { display: false } } }}
              data={{ labels: months, datasets: [{ data: charts?.recycling_success?.map((d:any) => d.rate) || MONTHS.map(() => Math.round(Math.random()*30+55)),
                borderColor: "#10b981", backgroundColor: "rgba(16,185,129,0.15)",
                fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: "#10b981" }] }} />
          </div>
        </div>

        {/* Water & Energy Saved */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-white mb-1">Resources Conserved</h3>
          <p className="text-xs text-gray-500 mb-4">Water (kL) and Energy (kWh) saved monthly</p>
          <div className="h-48">
            <Bar options={chartOpts as any}
              data={{ labels: months, datasets: [
                { label: "Water (kL÷10)", data: charts?.env_impact?.map((d:any) => d.water/10) || MONTHS.map(() => +(Math.random()*100+60).toFixed(1)),
                  backgroundColor: "rgba(59,130,246,0.7)", borderRadius: 5 },
                { label: "Energy (kWh)", data: MONTHS.map(() => +(Math.random()*80+40).toFixed(1)),
                  backgroundColor: "rgba(245,158,11,0.7)", borderRadius: 5 },
              ] }} />
          </div>
        </div>
      </div>

      {/* Processing Queue Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" /> Processing Queue
            </h3>
            <p className="text-sm text-gray-400">{PROCESSING_QUEUE.length} batches in pipeline</p>
          </div>
          <div className="flex gap-2">
            <span className="badge-blue">2 Processing</span>
            <span className="badge-yellow">2 Queued</span>
            <span className="badge-green">2 Complete</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Batch ID</th><th>Material</th><th>Qty (kg)</th>
                <th>Condition</th><th>Priority</th><th>Status</th>
                <th>Method</th><th>Recovery</th>
              </tr>
            </thead>
            <tbody>
              {PROCESSING_QUEUE.map((row, i) => (
                <motion.tr key={row.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}>
                  <td className="font-mono text-primary-400 font-bold">{row.id}</td>
                  <td className="font-medium text-white">{row.material}</td>
                  <td>{row.qty.toLocaleString()}</td>
                  <td><span className="text-xs text-gray-300">{row.condition}</span></td>
                  <td><span className={`${priorityBadge[row.priority]} text-xs`}>{row.priority}</span></td>
                  <td><span className={`${statusBadge[row.status]} text-xs`}>{row.status}</span></td>
                  <td className="text-gray-300 text-xs">{row.method}</td>
                  <td><span className="font-bold text-emerald-400">{row.recovery}</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recovery Opportunities */}
      <div className="glass-card p-6">
        <h3 className="font-bold text-white mb-5 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-400" /> Recycling Opportunities
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { title: "Fiber Recycling", desc: "245 kg Cotton (Fair) ready for fiber recycling", impact: "82% recovery, 201 kg recycled fiber", color: "#10b981", urgent: true },
            { title: "Chemical Recycling", desc: "180 kg Polyester (Poor) suitable for chemical processing", impact: "91% recovery, 164 kg virgin-quality output", color: "#3b82f6", urgent: true },
            { title: "Industrial Recovery", desc: "60 kg Nylon available for industrial use", impact: "55% recovery, insulation & padding use", color: "#f59e0b", urgent: false },
          ].map((opp) => (
            <div key={opp.title}
              className="p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02]"
              style={{ background: `${opp.color}10`, borderColor: `${opp.color}30` }}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-white text-sm">{opp.title}</h4>
                {opp.urgent && <span className="badge-red text-[10px]">Urgent</span>}
              </div>
              <p className="text-xs text-gray-400 mb-3">{opp.desc}</p>
              <p className="text-xs font-semibold" style={{ color: opp.color }}>
                📊 {opp.impact}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
