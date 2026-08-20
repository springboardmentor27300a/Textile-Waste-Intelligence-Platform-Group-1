"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, Leaf, Droplets, Recycle, TrendingDown, TreePine,
  Calculator, CheckCircle2, AlertTriangle, BarChart3, Zap, Wind
} from "lucide-react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, LineElement, PointElement, Filler, Title, Tooltip, Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Filler, Title, Tooltip, Legend);

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Per-material environmental impact factors (per kg)
const MATERIAL_FACTORS: Record<string, { co2: number; water: number; land: number; energy: number }> = {
  Cotton:         { co2: 5.9,  water: 850, land: 0.25, energy: 55 },
  Polyester:      { co2: 8.9,  water: 120, land: 0.05, energy: 125 },
  Wool:           { co2: 7.5,  water: 1000,land: 0.40, energy: 63 },
  Silk:           { co2: 5.2,  water: 500, land: 0.20, energy: 48 },
  Linen:          { co2: 3.2,  water: 200, land: 0.15, energy: 28 },
  Denim:          { co2: 8.0,  water: 1800,land: 0.30, energy: 85 },
  Nylon:          { co2: 9.5,  water: 100, land: 0.04, energy: 140 },
  Rayon:          { co2: 5.5,  water: 400, land: 0.18, energy: 52 },
  Acrylic:        { co2: 9.8,  water: 90,  land: 0.03, energy: 155 },
  "Mixed Fabric": { co2: 7.0,  water: 500, land: 0.20, energy: 80 },
};

const MONTHLY_CO2 = [3.2, 4.1, 5.0, 3.8, 4.7, 5.2, 4.4, 5.8, 4.9, 6.1, 5.3, 5.5];
const MONTHLY_WATER = [850, 920, 1100, 970, 1040, 1150, 1020, 1280, 1100, 1350, 1200, 1230];

const IMPACT_CATEGORIES = [
  { label: "CO₂ Reduction",    value: 52.3,      unit: "tonnes", icon: Leaf,        color: "from-primary-500 to-primary-700",    progress: 78 },
  { label: "Landfill Reduced", value: 11.8,      unit: "tonnes", icon: Recycle,      color: "from-secondary-500 to-secondary-700",progress: 65 },
  { label: "Water Conserved",  value: 10.6,      unit: "kL",     icon: Droplets,     color: "from-blue-500 to-cyan-600",          progress: 82 },
  { label: "Energy Recovered", value: 3245,      unit: "kWh",    icon: Zap,          color: "from-yellow-500 to-orange-500",      progress: 71 },
  { label: "Trees Equivalent", value: 2353,      unit: "",       icon: TreePine,     color: "from-teal-500 to-green-600",         progress: 88 },
  { label: "Resource Recovery",value: 67.8,      unit: "%",      icon: TrendingDown, color: "from-purple-500 to-pink-600",        progress: 68 },
];

const MATERIALS = ["Cotton","Polyester","Wool","Silk","Linen","Denim","Nylon","Rayon","Acrylic","Mixed Fabric"];
const RECOVERY_METHODS = ["Fiber Recycling","Mechanical Recycling","Chemical Recycling","Donation","Upcycling","Composting","Industrial Use"];

export default function EnvironmentalPage() {
  const [tab, setTab] = useState<"overview" | "calculator" | "indicators">("overview");
  // Calculator state
  const [material, setMaterial] = useState("Cotton");
  const [qty, setQty] = useState("100");
  const [method, setMethod] = useState("Fiber Recycling");
  const [calcResult, setCalcResult] = useState<any>(null);

  const runCalculator = () => {
    const q = parseFloat(qty) || 0;
    const f = MATERIAL_FACTORS[material] || MATERIAL_FACTORS["Mixed Fabric"];
    const methodMultiplier: Record<string, number> = {
      "Fiber Recycling": 0.85, "Mechanical Recycling": 0.72, "Chemical Recycling": 0.91,
      "Donation": 1.0, "Upcycling": 0.88, "Composting": 0.60, "Industrial Use": 0.55,
    };
    const mult = methodMultiplier[method] || 0.75;
    setCalcResult({
      co2_saved_kg:       +(q * f.co2 * mult).toFixed(2),
      water_saved_liters: Math.round(q * f.water * mult),
      energy_saved_kwh:   +(q * f.energy * mult * 0.1).toFixed(1),
      landfill_diverted_kg: +(q * 0.95 * mult).toFixed(2),
      resource_conservation_pct: Math.round(mult * 100),
      co2_vs_landfill_pct: Math.round(mult * 85),
      impact_rating: mult >= 0.85 ? "Excellent" : mult >= 0.70 ? "Good" : mult >= 0.55 ? "Moderate" : "Low",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Environmental Impact Assessment</h1>
        <p className="text-gray-400 text-sm mt-1">
          CO₂, water, landfill reduction &amp; resource conservation indicators
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: "overview",    label: "🌍 Platform Impact Overview" },
          { id: "calculator",  label: "🧮 Impact Calculator" },
          { id: "indicators",  label: "📈 Environmental Indicators" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
              tab === t.id
                ? "bg-primary-500/20 border-primary-500/50 text-primary-400"
                : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── Overview Tab ── */}
        {tab === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Impact Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {IMPACT_CATEGORIES.map((item, i) => (
                <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }} className="glass-card p-6">
                  <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-4`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-black text-white mb-1">{item.value.toLocaleString()} <span className="text-sm text-gray-400">{item.unit}</span></p>
                  <p className="text-xs text-gray-400 mb-3">{item.label}</p>
                  <div className="progress-bar">
                    <motion.div className="progress-fill bg-gradient-to-r from-primary-500 to-secondary-500"
                      initial={{ width: 0 }} animate={{ width: `${item.progress}%` }} transition={{ duration: 1.2, delay: i * 0.1 }} />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{item.progress}% of annual target</p>
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="font-bold text-white mb-4">Monthly CO₂ Reduction (tonnes)</h3>
                <div className="h-56">
                  <Bar
                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
                      scales: { x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" } },
                                y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" } } } }}
                    data={{ labels: MONTHS, datasets: [{ data: MONTHLY_CO2, backgroundColor: "rgba(16,185,129,0.7)",
                      borderRadius: 8, borderSkipped: false, hoverBackgroundColor: "#10b981" }] }} />
                </div>
              </div>
              <div className="glass-card p-6">
                <h3 className="font-bold text-white mb-4">Environmental Benefit Distribution</h3>
                <div className="h-56">
                  <Doughnut
                    options={{ responsive: true, maintainAspectRatio: false,
                      plugins: { legend: { position: "right", labels: { color: "#94a3b8", font: { size: 11 }, boxWidth: 12 } } } }}
                    data={{ labels: ["CO₂ Reduction","Landfill Reduction","Water Conservation","Energy Recovery","Resource Recovery"],
                      datasets: [{ data: [30,20,25,15,10],
                        backgroundColor: ["#10b981","#3b82f6","#06b6d4","#f59e0b","#8b5cf6"],
                        borderWidth: 0, hoverOffset: 8 }] }} />
                </div>
              </div>
            </div>

            {/* Benefits Summary */}
            <div className="glass-card p-6">
              <h3 className="font-bold text-white mb-6">Environmental Benefits Summary</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  {[
                    { label: "Total CO₂ Emissions Avoided", value: "52.3 tonnes", pct: 78 },
                    { label: "Landfill Waste Diverted",     value: "11.8 tonnes", pct: 65 },
                    { label: "Water Resources Conserved",   value: "10,582 kL",   pct: 82 },
                    { label: "Energy Recovered",            value: "3,245 kWh",   pct: 71 },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-400">{item.label}</span>
                        <span className="text-white font-bold">{item.value}</span>
                      </div>
                      <div className="progress-bar">
                        <motion.div className="progress-fill bg-gradient-to-r from-primary-500 to-secondary-500"
                          initial={{ width: 0 }} animate={{ width: `${item.pct}%` }} transition={{ duration: 1 }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: "🏭", label: "Factories Equivalent", value: "0.26 factories/year" },
                    { icon: "✈️", label: "Flights Avoided",      value: "47 flights" },
                    { icon: "💧", label: "Drinking Water",        value: "10.6M liters" },
                    { icon: "🌿", label: "Biodiversity Impact",   value: "Positive" },
                  ].map(item => (
                    <div key={item.label} className="p-4 bg-white/5 rounded-xl text-center">
                      <p className="text-2xl mb-1">{item.icon}</p>
                      <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                      <p className="text-sm font-bold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Calculator Tab ── */}
        {tab === "calculator" && (
          <motion.div key="calculator" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-bold text-white mb-5 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary-400" /> Environmental Impact Calculator
              </h3>
              <div className="grid md:grid-cols-4 gap-4 items-end mb-6">
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Material Type</label>
                  <select value={material} onChange={e => setMaterial(e.target.value)} className="input-field text-sm">
                    {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Quantity (kg)</label>
                  <input type="number" value={qty} onChange={e => setQty(e.target.value)} className="input-field text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Recovery Method</label>
                  <select value={method} onChange={e => setMethod(e.target.value)} className="input-field text-sm">
                    {RECOVERY_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <button onClick={runCalculator} className="btn-primary flex items-center justify-center gap-2">
                  <Calculator className="w-4 h-4" /> Calculate
                </button>
              </div>

              {/* Per-material factors preview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 p-4 bg-white/5 rounded-xl">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">CO₂ Factor</p>
                  <p className="font-bold text-primary-400">{MATERIAL_FACTORS[material]?.co2 ?? 7.0} kg/kg</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Water Factor</p>
                  <p className="font-bold text-blue-400">{MATERIAL_FACTORS[material]?.water ?? 500} L/kg</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Land Factor</p>
                  <p className="font-bold text-yellow-400">{MATERIAL_FACTORS[material]?.land ?? 0.2} m²/kg</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Energy Factor</p>
                  <p className="font-bold text-purple-400">{MATERIAL_FACTORS[material]?.energy ?? 80} MJ/kg</p>
                </div>
              </div>
            </div>

            {calcResult && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {/* Impact Rating Banner */}
                <div className={`glass-card p-5 border ${
                  calcResult.impact_rating === "Excellent" ? "border-primary-500/30 bg-primary-500/5"
                  : calcResult.impact_rating === "Good" ? "border-blue-500/30 bg-blue-500/5"
                  : "border-yellow-500/30 bg-yellow-500/5"
                }`}>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className={`w-6 h-6 ${calcResult.impact_rating === "Excellent" ? "text-primary-400" : calcResult.impact_rating === "Good" ? "text-blue-400" : "text-yellow-400"}`} />
                    <div>
                      <p className="font-bold text-white">Impact Rating: <span className={calcResult.impact_rating === "Excellent" ? "text-primary-400" : calcResult.impact_rating === "Good" ? "text-blue-400" : "text-yellow-400"}>{calcResult.impact_rating}</span></p>
                      <p className="text-xs text-gray-400">Based on {method} for {qty} kg of {material}</p>
                    </div>
                    <span className="ml-auto text-sm text-gray-400">{calcResult.resource_conservation_pct}% resource conserved</span>
                  </div>
                </div>

                {/* Result Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: Leaf,     label: "CO₂ Saved",        value: `${calcResult.co2_saved_kg} kg`,         color: "text-primary-400", bg: "from-primary-500 to-primary-700" },
                    { icon: Droplets, label: "Water Saved",       value: `${calcResult.water_saved_liters.toLocaleString()} L`, color: "text-blue-400", bg: "from-blue-500 to-blue-700" },
                    { icon: Zap,      label: "Energy Saved",      value: `${calcResult.energy_saved_kwh} kWh`,    color: "text-yellow-400", bg: "from-yellow-500 to-orange-500" },
                    { icon: Recycle,  label: "Landfill Diverted", value: `${calcResult.landfill_diverted_kg} kg`, color: "text-purple-400", bg: "from-purple-500 to-purple-700" },
                  ].map(card => (
                    <div key={card.label} className="glass-card p-5 text-center">
                      <div className={`w-12 h-12 bg-gradient-to-br ${card.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                        <card.icon className="w-6 h-6 text-white" />
                      </div>
                      <p className={`text-xl font-black ${card.color}`}>{card.value}</p>
                      <p className="text-xs text-gray-400 mt-1">{card.label}</p>
                    </div>
                  ))}
                </div>

                {/* Progress indicators */}
                <div className="glass-card p-6">
                  <h3 className="font-bold text-white mb-4">Conservation Indicators</h3>
                  <div className="space-y-4">
                    {[
                      { label: "Resource Conservation", value: calcResult.resource_conservation_pct, color: "#10b981" },
                      { label: "CO₂ vs Landfill Avoidance", value: calcResult.co2_vs_landfill_pct, color: "#3b82f6" },
                    ].map(({ label, value, color }) => (
                      <div key={label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">{label}</span>
                          <span className="text-white font-bold">{value}%</span>
                        </div>
                        <div className="progress-bar">
                          <motion.div className="progress-fill" style={{ background: color, width: `${value}%` }}
                            initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── Indicators Tab ── */}
        {tab === "indicators" && (
          <motion.div key="indicators" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Monthly trends */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="font-bold text-white mb-4">CO₂ Reduction Trend</h3>
                <div className="h-52">
                  <Line
                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
                      scales: { x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" } },
                                y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" } } } }}
                    data={{ labels: MONTHS, datasets: [{
                      data: MONTHLY_CO2, borderColor: "#10b981", backgroundColor: "rgba(16,185,129,0.1)",
                      fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: "#10b981"
                    }] }} />
                </div>
              </div>
              <div className="glass-card p-6">
                <h3 className="font-bold text-white mb-4">Water Conservation (kL)</h3>
                <div className="h-52">
                  <Line
                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
                      scales: { x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" } },
                                y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" } } } }}
                    data={{ labels: MONTHS, datasets: [{
                      data: MONTHLY_WATER, borderColor: "#3b82f6", backgroundColor: "rgba(59,130,246,0.1)",
                      fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: "#3b82f6"
                    }] }} />
                </div>
              </div>
            </div>

            {/* SDG Indicators */}
            <div className="glass-card p-6">
              <h3 className="font-bold text-white mb-5 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary-400" /> UN SDG Alignment Indicators
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { sdg: "SDG 12", title: "Responsible Consumption", value: 78, color: "#f59e0b", desc: "Sustainable production & consumption patterns" },
                  { sdg: "SDG 13", title: "Climate Action", value: 82, color: "#10b981", desc: "Combat climate change & its impacts" },
                  { sdg: "SDG 14", title: "Life Below Water", value: 65, color: "#3b82f6", desc: "Reduce marine pollution from textiles" },
                  { sdg: "SDG 15", title: "Life on Land", value: 71, color: "#22c55e", desc: "Sustainable land use & biodiversity" },
                  { sdg: "SDG 9",  title: "Industry Innovation", value: 88, color: "#8b5cf6", desc: "Sustainable industrialization" },
                  { sdg: "SDG 17", title: "Partnerships",         value: 74, color: "#ec4899", desc: "Strengthen global partnerships" },
                ].map(({ sdg, title, value, color, desc }) => (
                  <div key={sdg} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: `${color}20`, color }}>{sdg}</span>
                      <span className="font-black text-white">{value}%</span>
                    </div>
                    <p className="font-semibold text-white text-sm mb-1">{title}</p>
                    <p className="text-xs text-gray-500 mb-3">{desc}</p>
                    <div className="progress-bar">
                      <motion.div className="progress-fill" style={{ background: color, width: `${value}%` }}
                        initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1.2 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
