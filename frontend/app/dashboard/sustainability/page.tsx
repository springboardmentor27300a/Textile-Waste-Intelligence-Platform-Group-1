"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, Droplets, Zap, Leaf, Globe, Award, Calculator,
  Brain, RefreshCw, ArrowRight, AlertCircle, CheckCircle2,
  Recycle, BarChart3, Sparkles, Info
} from "lucide-react";
import { Line, Radar, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, RadialLinearScale, PointElement, LineElement,
  Filler, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from "chart.js";
import api from "@/lib/api";
import toast from "react-hot-toast";

ChartJS.register(
  RadialLinearScale, PointElement, LineElement, Filler,
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
);

const MATERIALS = ["Cotton","Polyester","Wool","Silk","Linen","Denim","Nylon","Rayon","Acrylic","Mixed Fabric"];
const WASTE_CATS = ["Recyclable","Reusable","Repairable","Upcyclable","Compostable","Hazardous Waste"];
const CONDITIONS = ["Good","Fair","Poor","Critical"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Material-specific sustainability data
const MATERIAL_INTELLIGENCE: Record<string, { waterFactor: number; co2Factor: number; circularScore: number; recyclability: string; lifespan: string; tip: string }> = {
  Cotton:        { waterFactor: 850, co2Factor: 0.0059, circularScore: 88, recyclability: "High", lifespan: "5–10 yrs", tip: "Cotton degrades naturally — composting is a great end-of-life option." },
  Polyester:     { waterFactor: 120, co2Factor: 0.0089, circularScore: 72, recyclability: "Medium", lifespan: "20–50 yrs", tip: "Chemical recycling can recover virgin-quality polyester fibers." },
  Wool:          { waterFactor: 1000, co2Factor: 0.0075, circularScore: 91, recyclability: "Very High", lifespan: "10–20 yrs", tip: "Wool is highly reusable — donation or mechanical recycling are ideal." },
  Silk:          { waterFactor: 500, co2Factor: 0.0052, circularScore: 79, recyclability: "Medium", lifespan: "8–15 yrs", tip: "Silk can be chemically dissolved and re-spun into new fibers." },
  Linen:         { waterFactor: 200, co2Factor: 0.0032, circularScore: 94, recyclability: "Very High", lifespan: "10–20 yrs", tip: "One of the most sustainable fabrics — composting returns nutrients to soil." },
  Denim:         { waterFactor: 1800, co2Factor: 0.008,  circularScore: 76, recyclability: "High", lifespan: "5–15 yrs", tip: "Shredded denim makes excellent insulation material." },
  Nylon:         { waterFactor: 100, co2Factor: 0.0095, circularScore: 65, recyclability: "Low", lifespan: "30–40 yrs", tip: "Specialized chemical recycling required — limit landfill disposal." },
  Rayon:         { waterFactor: 400, co2Factor: 0.0055, circularScore: 70, recyclability: "Medium", lifespan: "5–10 yrs", tip: "Bio-based origin makes rayon suitable for composting." },
  Acrylic:       { waterFactor: 90,  co2Factor: 0.0098, circularScore: 58, recyclability: "Low", lifespan: "30–200 yrs", tip: "Avoid landfill — acrylic releases microplastics. Mechanical recycling preferred." },
  "Mixed Fabric":{ waterFactor: 500, co2Factor: 0.007,  circularScore: 68, recyclability: "Medium", lifespan: "5–20 yrs", tip: "Sorting mixed fabrics improves recovery rates significantly." },
};

function ProgressStat({ label, value, max, unit, color, icon: Icon }: any) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${color}`} />
          <span className="text-sm text-gray-400">{label}</span>
        </div>
        <span className="font-black text-white">{typeof value === "number" ? value.toLocaleString() : value} {unit}</span>
      </div>
      <div className="progress-bar">
        <motion.div className="progress-fill bg-gradient-to-r from-primary-500 to-secondary-500"
          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.2 }} />
      </div>
    </div>
  );
}

function CircularGauge({ score, label }: { score: number; label: string }) {
  const r = 42; const circ = 2 * Math.PI * r;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="9" />
          <motion.circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="9"
            strokeLinecap="round" strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - (score / 100) * circ }}
            transition={{ duration: 1.5, ease: "easeOut" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-white">{score}</span>
          <span className="text-[10px] text-gray-400">/100</span>
        </div>
      </div>
      <span className="text-xs text-gray-300 font-semibold text-center">{label}</span>
    </div>
  );
}

export default function SustainabilityPage() {
  const [fabric, setFabric] = useState("Cotton");
  const [quantity, setQuantity] = useState("100");
  const [wasteCategory, setWasteCategory] = useState("Recyclable");
  const [condition, setCondition] = useState("Good");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"metrics" | "circular" | "intelligence">("metrics");

  const matInfo = MATERIAL_INTELLIGENCE[fabric] || MATERIAL_INTELLIGENCE["Mixed Fabric"];

  const calculate = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/sustainability/calculate?fabric_type=${fabric}&quantity=${quantity}&waste_category=${wasteCategory}&condition=${condition}`);
      setResult(res.data);
      toast.success("Sustainability calculated!");
    } catch {
      await new Promise(r => setTimeout(r, 900));
      const qty = parseFloat(quantity);
      const condMultiplier = { Good: 1.0, Fair: 0.85, Poor: 0.65, Critical: 0.45 }[condition] || 1;
      const catMultiplier = { Recyclable: 1.0, Reusable: 1.05, Repairable: 0.9, Upcyclable: 0.95, Compostable: 0.85, "Hazardous Waste": 0.3 }[wasteCategory] || 1;
      const baseScore = matInfo.circularScore * condMultiplier * catMultiplier;
      setResult({
        co2_saved_tonnes: +(qty * matInfo.co2Factor).toFixed(3),
        water_saved_liters: Math.round(qty * matInfo.waterFactor),
        energy_saved_kwh: +(qty * 5.5).toFixed(1),
        landfill_reduced_kg: +(qty * 0.95 * condMultiplier).toFixed(2),
        carbon_footprint_tonnes: +(qty * 0.001).toFixed(4),
        circular_economy_score: +baseScore.toFixed(1),
        sustainability_score: +(baseScore * 0.97 + Math.random() * 3).toFixed(1),
        environmental_rating: baseScore >= 80 ? "Excellent" : baseScore >= 65 ? "Good" : "Needs Work",
        trees_equivalent: Math.round(qty * 0.266 * condMultiplier),
        car_trips_avoided: Math.round(qty * 1.357 * condMultiplier),
        breakdown: {
          recycling_efficiency_pct: Math.round(85 * condMultiplier),
          material_recovery_pct: Math.round(87 * condMultiplier),
          energy_recovery_pct: Math.round(78 * condMultiplier),
          water_recovery_pct: Math.round(72 * condMultiplier),
        },
        // Circular economy analytics
        circular_analytics: {
          material_loop_efficiency: +(matInfo.circularScore * condMultiplier).toFixed(1),
          value_retention_pct: +(88 * condMultiplier).toFixed(1),
          end_of_life_options: wasteCategory === "Recyclable" ? ["Fiber Recycling", "Mechanical Shredding", "Industrial Use"]
            : wasteCategory === "Reusable" ? ["Direct Donation", "Resale", "Remanufacturing"]
            : wasteCategory === "Compostable" ? ["Composting", "Biogas", "Soil Amendment"]
            : ["Upcycling", "Repurposing", "Mechanical Recycling"],
          circular_potential_score: +baseScore.toFixed(0),
          waste_prevention_score: +(baseScore * 1.05 > 100 ? 100 : baseScore * 1.05).toFixed(0),
          resource_productivity: +(qty * matInfo.co2Factor * 120).toFixed(0),
        }
      });
      toast.success("Calculated! (Demo mode)");
    } finally { setLoading(false); }
  };

  const trendData = MONTHS.map(() => 60 + Math.random() * 35);
  const radarData = result ? [
    result.breakdown.recycling_efficiency_pct,
    result.breakdown.material_recovery_pct,
    result.breakdown.energy_recovery_pct,
    result.breakdown.water_recovery_pct,
    result.circular_analytics?.material_loop_efficiency ?? 75,
    result.circular_analytics?.value_retention_pct ?? 80,
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Sustainability Intelligence Engine</h1>
        <p className="text-gray-400 text-sm mt-1">
          AI &amp; data-driven sustainability analysis &amp; Circular Economy Analytics
        </p>
      </div>

      {/* ── Material Intelligence Banner ── */}
      <div className="glass-card p-5 border border-primary-500/20">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="p-2 bg-primary-500/20 rounded-xl">
            <Brain className="w-6 h-6 text-primary-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-sm mb-1">
              AI Material Intelligence — <span className="text-primary-400">{fabric}</span>
            </p>
            <p className="text-xs text-gray-400">{matInfo.tip}</p>
          </div>
          <div className="flex gap-4 flex-wrap">
            {[
              { label: "Recyclability", value: matInfo.recyclability },
              { label: "Lifespan", value: matInfo.lifespan },
              { label: "Circular Score", value: `${matInfo.circularScore}/100` },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-sm font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Input Panel ── */}
      <div className="glass-card p-6">
        <div className="grid md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-xs text-gray-400 mb-2">Fabric Type</label>
            <select value={fabric} onChange={e => setFabric(e.target.value)} className="input-field text-sm">
              {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">Quantity (kg)</label>
            <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className="input-field text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">Waste Category</label>
            <select value={wasteCategory} onChange={e => setWasteCategory(e.target.value)} className="input-field text-sm">
              {WASTE_CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">Condition</label>
            <select value={condition} onChange={e => setCondition(e.target.value)} className="input-field text-sm">
              {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button onClick={calculate} disabled={loading} className="btn-primary flex items-center justify-center gap-2">
            {loading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Calculator className="w-4 h-4" /> Calculate</>}
          </button>
        </div>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

          {/* ── Tabs ── */}
          <div className="flex gap-2 flex-wrap">
            {[
              { id: "metrics", label: "📊 Sustainability Metrics" },
              { id: "circular", label: "♻️ Circular Economy" },
              { id: "intelligence", label: "🧠 AI Intelligence" },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                  activeTab === tab.id
                    ? "bg-primary-500/20 border-primary-500/50 text-primary-400"
                    : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "metrics" && (
              <motion.div key="metrics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                {/* Score Hero */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="glass-card p-8 text-center">
                    <div className="relative inline-flex items-center justify-center mb-4">
                      <svg className="w-36 h-36 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                        <motion.circle cx="18" cy="18" r="16" fill="none" stroke="url(#grad)" strokeWidth="3"
                          strokeLinecap="round" pathLength="100"
                          initial={{ strokeDasharray: "0 100" }}
                          animate={{ strokeDasharray: `${result.sustainability_score} 100` }}
                          transition={{ duration: 1.5 }} strokeDasharray="0 100" />
                        <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient></defs>
                      </svg>
                      <div className="absolute">
                        <p className="text-4xl font-black gradient-text">{result.sustainability_score.toFixed(0)}</p>
                        <p className="text-xs text-gray-500">/ 100</p>
                      </div>
                    </div>
                    <p className="font-bold text-white text-lg">Sustainability Score</p>
                    <span className={`mt-2 inline-block ${result.environmental_rating === "Excellent" ? "badge-green" : result.environmental_rating === "Good" ? "badge-blue" : "badge-yellow"}`}>
                      {result.environmental_rating}
                    </span>
                  </div>
                  <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    {[
                      { label: "CO₂ Saved", value: result.co2_saved_tonnes, unit: "t", icon: Leaf, color: "text-primary-400", bg: "bg-primary-500" },
                      { label: "Water Saved", value: (result.water_saved_liters / 1000).toFixed(1), unit: "kL", icon: Droplets, color: "text-secondary-400", bg: "bg-secondary-500" },
                      { label: "Energy Saved", value: result.energy_saved_kwh, unit: "kWh", icon: Zap, color: "text-yellow-400", bg: "bg-yellow-500" },
                      { label: "Circular Score", value: result.circular_economy_score.toFixed(0), unit: "/100", icon: Globe, color: "text-purple-400", bg: "bg-purple-500" },
                    ].map(m => (
                      <div key={m.label} className="glass-card p-5 flex items-center gap-4">
                        <div className={`w-12 h-12 ${m.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <m.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className={`text-2xl font-black ${m.color}`}>{m.value} {m.unit}</p>
                          <p className="text-xs text-gray-400">{m.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Equivalent Impact */}
                <div className="glass-card p-6">
                  <h3 className="font-bold text-white mb-4">Equivalent Environmental Impact</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { icon: "🌳", label: "Trees Planted Equivalent", value: result.trees_equivalent },
                      { icon: "🚗", label: "Car Trips Avoided", value: result.car_trips_avoided },
                      { icon: "♻️", label: "Landfill Reduced (kg)", value: result.landfill_reduced_kg },
                      { icon: "💨", label: "Carbon Footprint (t)", value: result.carbon_footprint_tonnes }
                    ].map(item => (
                      <div key={item.label} className="p-4 bg-white/5 rounded-xl text-center">
                        <p className="text-3xl mb-2">{item.icon}</p>
                        <p className="text-xl font-black text-white">{item.value}</p>
                        <p className="text-xs text-gray-400 mt-1">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Breakdown & Trend */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="glass-card p-6">
                    <h3 className="font-bold text-white mb-4">Recovery Efficiency Breakdown</h3>
                    <div className="space-y-4">
                      {Object.entries(result.breakdown).map(([k, v]: any) => (
                        <div key={k}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400 capitalize">{k.replace(/_pct/, "").replace(/_/g, " ")}</span>
                            <span className="text-white font-bold">{v}%</span>
                          </div>
                          <div className="progress-bar">
                            <motion.div className="progress-fill bg-gradient-to-r from-primary-500 to-secondary-500"
                              initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ duration: 1 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="glass-card p-6">
                    <h3 className="font-bold text-white mb-4">Sustainability Score Trend (12 months)</h3>
                    <div className="h-48">
                      <Line
                        options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
                          scales: { x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" } },
                                    y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" }, min: 40 } } }}
                        data={{ labels: MONTHS, datasets: [{ data: trendData, borderColor: "#10b981",
                          backgroundColor: "rgba(16,185,129,0.1)", fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: "#10b981" }] }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "circular" && (
              <motion.div key="circular" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Recycle className="w-5 h-5 text-primary-400" />
                    <h3 className="font-bold text-white">Circular Economy Analytics</h3>
                    <span className="badge-green ml-auto">Active</span>
                  </div>

                  {/* 3 Circular Gauges */}
                  <div className="flex flex-wrap justify-around gap-6 mb-8">
                    <CircularGauge score={result.circular_analytics.circular_potential_score} label="Circular Potential" />
                    <CircularGauge score={result.circular_analytics.material_loop_efficiency} label="Material Loop Efficiency" />
                    <CircularGauge score={result.circular_analytics.waste_prevention_score} label="Waste Prevention Score" />
                  </div>

                  {/* Value Retention */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-white text-sm">Circular Economy Indicators</h4>
                      {[
                        { label: "Value Retention", value: result.circular_analytics.value_retention_pct, unit: "%" },
                        { label: "Material Loop Efficiency", value: result.circular_analytics.material_loop_efficiency, unit: "%" },
                        { label: "Resource Productivity Value", value: result.circular_analytics.resource_productivity, unit: "₹" },
                      ].map(({ label, value, unit }) => (
                        <div key={label}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">{label}</span>
                            <span className="text-white font-bold">{value} {unit}</span>
                          </div>
                          <div className="progress-bar">
                            <motion.div className="progress-fill bg-gradient-to-r from-purple-500 to-primary-500"
                              initial={{ width: 0 }} animate={{ width: `${Math.min(value, 100)}%` }} transition={{ duration: 1 }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* End-of-Life Options */}
                    <div>
                      <h4 className="font-semibold text-white text-sm mb-3">Recommended End-of-Life Pathways</h4>
                      <div className="space-y-2">
                        {result.circular_analytics.end_of_life_options.map((opt: string, i: number) => (
                          <motion.div key={opt} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                            <div className="w-7 h-7 bg-primary-500/20 rounded-lg flex items-center justify-center text-xs font-bold text-primary-400">
                              {i + 1}
                            </div>
                            <span className="text-sm text-white">{opt}</span>
                            <CheckCircle2 className="w-4 h-4 text-primary-400 ml-auto" />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Radar Chart */}
                <div className="glass-card p-6">
                  <h3 className="font-bold text-white mb-4">Multi-Dimensional Circular Performance</h3>
                  <div className="h-64">
                    <Radar
                      options={{
                        responsive: true, maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { r: { beginAtZero: true, max: 100, ticks: { color: "#94a3b8", stepSize: 20 },
                          grid: { color: "rgba(255,255,255,0.1)" }, pointLabels: { color: "#94a3b8", font: { size: 11 } } } }
                      }}
                      data={{
                        labels: ["Recycling Efficiency", "Material Recovery", "Energy Recovery", "Water Recovery", "Loop Efficiency", "Value Retention"],
                        datasets: [{
                          data: radarData,
                          backgroundColor: "rgba(16,185,129,0.2)",
                          borderColor: "#10b981", borderWidth: 2,
                          pointBackgroundColor: "#10b981", pointRadius: 4,
                        }]
                      }} />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "intelligence" && (
              <motion.div key="intelligence" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Brain className="w-5 h-5 text-primary-400" />
                    <h3 className="font-bold text-white">AI Material Intelligence — {fabric}</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {[
                        { label: "Recyclability Rating", value: matInfo.recyclability, badge: true },
                        { label: "Expected Lifespan", value: matInfo.lifespan, badge: false },
                        { label: "Water Footprint Factor", value: `${matInfo.waterFactor} L/kg`, badge: false },
                        { label: "CO₂ Factor", value: `${matInfo.co2Factor} t/kg`, badge: false },
                        { label: "Circular Economy Score", value: `${matInfo.circularScore}/100`, badge: false },
                      ].map(({ label, value, badge }) => (
                        <div key={label} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                          <span className="text-sm text-gray-400">{label}</span>
                          {badge
                            ? <span className={matInfo.recyclability === "Very High" || matInfo.recyclability === "High" ? "badge-green" : matInfo.recyclability === "Medium" ? "badge-yellow" : "badge-red"}>{value}</span>
                            : <span className="font-bold text-white text-sm">{value}</span>
                          }
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-white text-sm mb-1">AI Recommendation</p>
                            <p className="text-sm text-gray-300">{matInfo.tip}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">Condition Impact on Score</p>
                        {[
                          { cond: "Good", mult: 1.0 }, { cond: "Fair", mult: 0.85 },
                          { cond: "Poor", mult: 0.65 }, { cond: "Critical", mult: 0.45 }
                        ].map(({ cond, mult }) => (
                          <div key={cond} className="mb-2">
                            <div className="flex justify-between text-xs mb-0.5">
                              <span className={cond === condition ? "text-primary-400 font-bold" : "text-gray-500"}>{cond}</span>
                              <span className="text-gray-400">{Math.round(matInfo.circularScore * mult)}/100</span>
                            </div>
                            <div className="progress-bar h-1.5">
                              <div className="progress-fill" style={{
                                width: `${matInfo.circularScore * mult}%`,
                                background: cond === condition ? "#10b981" : "rgba(255,255,255,0.15)"
                              }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {!result && (
        <div className="glass-card p-16 text-center">
          <Award className="w-20 h-20 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Configure parameters above and click Calculate</p>
          <p className="text-gray-600 text-sm">to see comprehensive sustainability metrics and circular economy analytics</p>
        </div>
      )}
    </div>
  );
}
