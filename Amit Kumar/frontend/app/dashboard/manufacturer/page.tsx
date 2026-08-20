"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Factory, Leaf, TrendingUp, BarChart3, ArrowUpRight,
  RefreshCw, Recycle, Target, Award, Globe
} from "lucide-react";
import api from "@/lib/api";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, ArcElement, RadialLinearScale,
  Title, Tooltip, Legend, Filler
} from "chart.js";
import { Bar, Line, Radar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler
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
const MATERIALS = ["Cotton","Polyester","Wool","Denim","Nylon","Rayon"];

const PRODUCTION_WASTE = [
  { source: "Cutting Room A",  material: "Cotton",    qty: 340, waste_pct: 12.4, recovered: 285, status: "Recovered" },
  { source: "Finishing Line B",material: "Polyester", qty: 210, waste_pct: 8.7,  recovered: 157, status: "Processing"},
  { source: "Knitting Dept C", material: "Wool",      qty: 95,  waste_pct: 5.2,  recovered: 90,  status: "Recovered" },
  { source: "Dyeing Unit D",   material: "Denim",     qty: 185, waste_pct: 15.1, recovered: 120, status: "Pending"   },
  { source: "Assembly Line E", material: "Silk",      qty: 45,  waste_pct: 6.8,  recovered: 42,  status: "Recovered" },
];

export default function ManufacturerPage() {
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
    } catch { /* use defaults */ }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { loadData(); }, []);
  const refresh = () => { setRefreshing(true); loadData(); };

  const total  = stats?.total_waste_kg    || 12450;
  const recycled = stats?.total_recycled_kg || 8341;
  const months = charts?.monthly_waste?.map((d: any) => d.month) || MONTHS;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-56 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const radarData = {
    labels: ["CO₂ Reduction", "Water Saved", "Energy Efficiency", "Waste Diversion", "Recyclability", "Circular Score"],
    datasets: [{
      label: "Your Performance",
      data: [82, 75, 68, 88, 79, 83],
      backgroundColor: "rgba(16,185,129,0.2)",
      borderColor: "#10b981",
      pointBackgroundColor: "#10b981",
    }, {
      label: "Industry Average",
      data: [65, 58, 52, 70, 62, 67],
      backgroundColor: "rgba(59,130,246,0.15)",
      borderColor: "#3b82f6",
      pointBackgroundColor: "#3b82f6",
    }],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Factory className="w-7 h-7 text-blue-400" /> Manufacturer Dashboard
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Production waste analysis, material recovery & sustainability performance
          </p>
        </div>
        <button onClick={refresh} disabled={refreshing}
          className="btn-outline flex items-center gap-2 text-sm py-2">
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Production Waste",   value: Math.round(total),          suffix: " kg",  icon: Factory,    color: "from-blue-500 to-blue-700",      trend: -4.2 },
          { label: "Material Recovered", value: Math.round(recycled),       suffix: " kg",  icon: Recycle,    color: "from-emerald-500 to-emerald-700", trend: +11.3 },
          { label: "Recovery Rate",      value: Math.round(recycled/total*100), suffix: "%", icon: Target,    color: "from-purple-500 to-purple-700",   trend: +5.7 },
          { label: "Sustainability Score",value: stats?.sustainability_score || 87.3, suffix: "/100", icon: Award, color: "from-amber-500 to-amber-700", trend: +3.2 },
        ].map((kpi, i) => (
          <motion.div key={kpi.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }} className="stat-card">
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
        {/* Production Waste Trend */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-white mb-1">Production Waste Trend (kg)</h3>
          <p className="text-xs text-gray-500 mb-4">Monthly waste generation vs recovery</p>
          <div className="h-56">
            <Line options={chartOpts as any}
              data={{ labels: months, datasets: [
                { label: "Waste Generated", data: charts?.monthly_waste?.map((d:any) => d.collected) || MONTHS.map(() => Math.round(Math.random()*2000+500)),
                  borderColor: "#ef4444", backgroundColor: "rgba(239,68,68,0.1)", fill: true, tension: 0.4, pointRadius: 3 },
                { label: "Recovered",       data: charts?.monthly_waste?.map((d:any) => d.recycled)  || MONTHS.map(() => Math.round(Math.random()*1500+300)),
                  borderColor: "#10b981", backgroundColor: "rgba(16,185,129,0.1)", fill: true, tension: 0.4, pointRadius: 3 },
              ] }} />
          </div>
        </div>

        {/* Sustainability Performance Radar */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-white mb-1">Sustainability Performance</h3>
          <p className="text-xs text-gray-500 mb-4">vs Industry Average benchmark</p>
          <div className="h-56">
            <Radar
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { labels: { color: "#94a3b8", font: { size: 10 } } } },
                scales: { r: { ticks: { color: "#94a3b8", backdropColor: "transparent" },
                  grid: { color: "rgba(255,255,255,0.1)" },
                  pointLabels: { color: "#94a3b8", font: { size: 9 } } } },
              }}
              data={radarData} />
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Waste by Material */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-white mb-1">Waste by Material Type (kg)</h3>
          <p className="text-xs text-gray-500 mb-4">Production waste breakdown</p>
          <div className="h-48">
            <Bar options={{ ...chartOpts as any, plugins: { legend: { display: false } } }}
              data={{ labels: MATERIALS,
                datasets: [{ data: MATERIALS.map(() => Math.round(Math.random()*1500+100)),
                  backgroundColor: ["#10b981","#3b82f6","#8b5cf6","#f59e0b","#06b6d4","#ec4899"],
                  borderRadius: 8, borderSkipped: false }] }} />
          </div>
        </div>

        {/* ESG Metrics */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" /> ESG Performance Indicators
          </h3>
          <div className="space-y-3">
            {[
              { label: "Environmental Score", value: 82, color: "#10b981", max: 100 },
              { label: "Social Impact",        value: 74, color: "#3b82f6", max: 100 },
              { label: "Governance",           value: 88, color: "#8b5cf6", max: 100 },
              { label: "Circularity Index",    value: 79, color: "#f59e0b", max: 100 },
            ].map((m) => (
              <div key={m.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">{m.label}</span>
                  <span className="font-bold" style={{ color: m.color }}>{m.value}/100</span>
                </div>
                <div className="progress-bar">
                  <motion.div className="progress-fill" style={{ background: m.color, width: `${m.value}%` }}
                    initial={{ width: 0 }} animate={{ width: `${m.value}%` }} transition={{ duration: 1.2 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Production Waste Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" /> Production Waste by Source
          </h3>
          <p className="text-sm text-gray-400">Waste generation and recovery across production lines</p>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Source</th><th>Material</th><th>Waste (kg)</th>
                <th>Waste %</th><th>Recovered (kg)</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {PRODUCTION_WASTE.map((row, i) => (
                <motion.tr key={row.source}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.07 }}>
                  <td className="font-medium text-white">{row.source}</td>
                  <td>{row.material}</td>
                  <td className="text-right font-bold">{row.qty}</td>
                  <td>
                    <span className={`font-bold ${row.waste_pct > 12 ? "text-red-400" : "text-amber-400"}`}>
                      {row.waste_pct}%
                    </span>
                  </td>
                  <td className="text-right">
                    <span className="text-emerald-400 font-bold">{row.recovered}</span>
                    <span className="text-gray-500 text-xs ml-1">({Math.round(row.recovered/row.qty*100)}%)</span>
                  </td>
                  <td>
                    <span className={`text-xs ${row.status === "Recovered" ? "badge-green" : row.status === "Processing" ? "badge-blue" : "badge-yellow"}`}>
                      {row.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Material Recovery Opportunities */}
      <div className="glass-card p-6">
        <h3 className="font-bold text-white mb-5 flex items-center gap-2">
          <Leaf className="w-5 h-5 text-emerald-400" /> Sustainability Improvement Opportunities
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Reduce Cutting Waste", desc: "AI pattern optimization can reduce cutting room waste by 18%", savings: "61 kg/month", color: "#10b981" },
            { title: "Switch to Chemical Recycling", desc: "Polyester offcuts qualify for virgin-quality chemical recycling", savings: "91% recovery", color: "#3b82f6" },
            { title: "Dyeing Waste Program", desc: "Denim dye sludge qualifies for specialist industrial processing", savings: "30 kg/month", color: "#8b5cf6" },
            { title: "Circular Design", desc: "Designing for disassembly can increase recyclability by 25%", savings: "+25% circular", color: "#f59e0b" },
          ].map((opp) => (
            <div key={opp.title}
              className="p-4 rounded-xl border transition-all hover:scale-[1.02] duration-200"
              style={{ background: `${opp.color}10`, borderColor: `${opp.color}30` }}>
              <h4 className="font-bold text-white text-sm mb-2">{opp.title}</h4>
              <p className="text-xs text-gray-400 mb-3">{opp.desc}</p>
              <p className="text-xs font-bold" style={{ color: opp.color }}>💡 {opp.savings}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
