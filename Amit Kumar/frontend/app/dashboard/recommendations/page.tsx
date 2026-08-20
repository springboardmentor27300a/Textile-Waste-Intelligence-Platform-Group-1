"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Recycle, DollarSign, Leaf, Clock, Building2,
  ChevronDown, ChevronUp, Zap, ArrowRight, CheckCircle2,
  AlertTriangle, BarChart3, Filter, Sparkles
} from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

const DEMO_RECS = [
  { method: "Fiber Recycling", priority: "High", description: "Mechanically break down fibers to create new textile raw materials, suitable for high-quality fabrics.", benefits: ["Reduces virgin material usage by 60%","Creates high-value recycled fibers","Supports circular economy"], environmental_impact: { co2_saved_kg: 57.5, water_saved_liters: 3750, energy_saved_kwh: 212.5 }, estimated_cost_usd: 11.25, recovery_rate_pct: 83.7, time_to_process_days: 9, facilities_nearby: 5 },
  { method: "Mechanical Recycling", priority: "High", description: "Shred and process textiles into fiber fill, insulation, or industrial rags without chemical treatments.", benefits: ["Cost-effective process","No chemical waste","Suitable for mixed fabrics"], environmental_impact: { co2_saved_kg: 45, water_saved_liters: 2000, energy_saved_kwh: 130 }, estimated_cost_usd: 6.25, recovery_rate_pct: 74.2, time_to_process_days: 4, facilities_nearby: 10 },
  { method: "Fabric Reuse", priority: "High", description: "Directly reuse fabric pieces in new garment manufacturing or industrial applications.", benefits: ["Zero processing cost","Maximum material value retained","Immediate impact"], environmental_impact: { co2_saved_kg: 100, water_saved_liters: 7500, energy_saved_kwh: 375 }, estimated_cost_usd: 1.25, recovery_rate_pct: 95.0, time_to_process_days: 1, facilities_nearby: 14 },
  { method: "Chemical Recycling", priority: "Medium", description: "Dissolve and re-polymerize synthetic fibers back to virgin-quality material using chemical solvents.", benefits: ["Virgin-quality output","100% pure material recovery","Handles contaminated textiles"], environmental_impact: { co2_saved_kg: 77.5, water_saved_liters: 5000, energy_saved_kwh: 300 }, estimated_cost_usd: 30.0, recovery_rate_pct: 91.5, time_to_process_days: 18, facilities_nearby: 2 },
  { method: "Donation", priority: "Medium", description: "Donate usable textiles to charitable organizations, shelters, or developing communities.", benefits: ["Social impact","Tax deductible","Community benefit","Zero disposal cost"], environmental_impact: { co2_saved_kg: 87.5, water_saved_liters: 6250, energy_saved_kwh: 250 }, estimated_cost_usd: 0, recovery_rate_pct: 100.0, time_to_process_days: 3, facilities_nearby: 22 },
  { method: "Upcycling", priority: "Medium", description: "Transform waste textiles into higher-value products like home décor, bags, or art installations.", benefits: ["Creates premium products","High profit margin","Brand sustainability story"], environmental_impact: { co2_saved_kg: 50, water_saved_liters: 3000, energy_saved_kwh: 150 }, estimated_cost_usd: 20.0, recovery_rate_pct: 85.0, time_to_process_days: 12, facilities_nearby: 7 },
  { method: "Industrial Recovery", priority: "Low", description: "Use textile waste as industrial wipes, padding, soundproofing, or construction insulation.", benefits: ["Always in demand","Simple processing","Stable market price"], environmental_impact: { co2_saved_kg: 30, water_saved_liters: 1250, energy_saved_kwh: 75 }, estimated_cost_usd: 3.75, recovery_rate_pct: 62.5, time_to_process_days: 6, facilities_nearby: 14 }
];

const MATERIALS = ["Cotton","Polyester","Wool","Silk","Linen","Denim","Nylon","Rayon","Acrylic","Mixed Fabric"];
const WASTE_CATS = ["Recyclable","Reusable","Repairable","Upcyclable","Compostable","Hazardous Waste"];
const CONDITIONS = ["Good","Fair","Poor","Critical"];

// Workflow steps for recycling
const WORKFLOW_STEPS = [
  { step: 1, title: "Material Assessment", desc: "Identify fabric type, condition, and contamination level via AI image analysis.", icon: "🔍", duration: "< 2 min" },
  { step: 2, title: "Waste Classification", desc: "AI classifies waste into: Recyclable, Reusable, Repairable, Upcyclable, Compostable, or Hazardous.", icon: "🏷️", duration: "Auto" },
  { step: 3, title: "Recovery Path Selection", desc: "Algorithm selects optimal recovery/recycling/reuse options based on material & condition.", icon: "🔀", duration: "< 1 min" },
  { step: 4, title: "Facility Matching", desc: "Match waste batch to nearby certified recycling facilities and partners.", icon: "🏭", duration: "Real-time" },
  { step: 5, title: "Processing & Tracking", desc: "Track the waste through the recycling/recovery pipeline with status updates.", icon: "📡", duration: "Live" },
  { step: 6, title: "Impact Reporting", desc: "Generate environmental impact report: CO₂ saved, water conserved, landfill diverted.", icon: "📊", duration: "Instant" },
];

const priorityBadge: Record<string, string> = { High: "badge-green", Medium: "badge-yellow", Low: "badge-blue" };

function RecCard({ rec, index }: { rec: any; index: number }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="glass-card p-6 hover:border-primary-500/30 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border border-primary-500/30 rounded-xl flex items-center justify-center">
            <Recycle className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h3 className="font-bold text-white">{rec.method}</h3>
            <span className={priorityBadge[rec.priority]}>{rec.priority} Priority</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-primary-400">{rec.recovery_rate_pct}%</p>
          <p className="text-xs text-gray-500">Recovery Rate</p>
        </div>
      </div>
      <p className="text-sm text-gray-400 mb-4 leading-relaxed">{rec.description}</p>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Recovery Rate</span><span>{rec.recovery_rate_pct}%</span>
        </div>
        <div className="progress-bar">
          <motion.div className="progress-fill bg-gradient-to-r from-primary-500 to-secondary-500"
            initial={{ width: 0 }} animate={{ width: `${rec.recovery_rate_pct}%` }} transition={{ duration: 1, delay: index * 0.1 }} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-2 bg-white/5 rounded-lg text-center">
          <DollarSign className="w-4 h-4 text-primary-400 mx-auto mb-1" />
          <p className="text-sm font-bold text-white">${rec.estimated_cost_usd.toFixed(2)}</p>
          <p className="text-xs text-gray-500">Est. Cost</p>
        </div>
        <div className="p-2 bg-white/5 rounded-lg text-center">
          <Clock className="w-4 h-4 text-secondary-400 mx-auto mb-1" />
          <p className="text-sm font-bold text-white">{rec.time_to_process_days}d</p>
          <p className="text-xs text-gray-500">Processing</p>
        </div>
        <div className="p-2 bg-white/5 rounded-lg text-center">
          <Building2 className="w-4 h-4 text-purple-400 mx-auto mb-1" />
          <p className="text-sm font-bold text-white">{rec.facilities_nearby}</p>
          <p className="text-xs text-gray-500">Facilities</p>
        </div>
      </div>

      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors py-1">
        {expanded ? <><ChevronUp className="w-3 h-3" /> Less details</> : <><ChevronDown className="w-3 h-3" /> More details</>}
      </button>

      {expanded && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 pt-4 border-t border-white/10 space-y-3">
          <div>
            <p className="text-xs text-gray-400 font-semibold mb-2">Benefits</p>
            <div className="space-y-1">
              {rec.benefits.map((b: string) => (
                <div key={b} className="flex items-center gap-2 text-xs text-gray-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />{b}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold mb-2">Environmental Impact</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 bg-primary-500/10 rounded-lg text-center">
                <p className="text-xs font-bold text-primary-400">{rec.environmental_impact.co2_saved_kg}kg</p>
                <p className="text-xs text-gray-500">CO₂ Saved</p>
              </div>
              <div className="p-2 bg-secondary-500/10 rounded-lg text-center">
                <p className="text-xs font-bold text-secondary-400">{rec.environmental_impact.water_saved_liters}L</p>
                <p className="text-xs text-gray-500">Water Saved</p>
              </div>
              <div className="p-2 bg-purple-500/10 rounded-lg text-center">
                <p className="text-xs font-bold text-purple-400">{rec.environmental_impact.energy_saved_kwh} kWh</p>
                <p className="text-xs text-gray-500">Energy Saved</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function RecommendationsPage() {
  const [fabric, setFabric] = useState("Cotton");
  const [wasteCategory, setWasteCategory] = useState("Recyclable");
  const [quantity, setQuantity] = useState("25");
  const [condition, setCondition] = useState("Good");
  const [recs, setRecs] = useState<any[]>(DEMO_RECS);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"recommendations" | "workflow">("workflow");
  const [priorityFilter, setPriorityFilter] = useState<"All" | "High" | "Medium" | "Low">("All");

  const generate = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/recommendations/generate?fabric_type=${fabric}&waste_category=${wasteCategory}&quantity=${quantity}`);
      setRecs(res.data.recommendations);
      toast.success("Recommendations generated!");
    } catch {
      await new Promise(r => setTimeout(r, 800));
      // Sort by condition priority
      const conditionMultiplier = { Good: 1.0, Fair: 0.85, Poor: 0.65, Critical: 0.45 }[condition] || 1;
      const sorted = [...DEMO_RECS]
        .map(r => ({ ...r, recovery_rate_pct: +(r.recovery_rate_pct * conditionMultiplier).toFixed(1) }))
        .sort((a, b) => b.recovery_rate_pct - a.recovery_rate_pct);
      setRecs(sorted);
      toast.success("Recommendations ready! (Demo mode)");
    } finally { setLoading(false); }
  };

  const filteredRecs = priorityFilter === "All" ? recs : recs.filter(r => r.priority === priorityFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Recycling Recommendation Workflow</h1>
        <p className="text-gray-400 text-sm mt-1">
          AI-generated recovery, recycling &amp; reuse pathways based on material, condition &amp; assessment
        </p>
      </div>

      {/* Input Panel */}
      <div className="glass-card p-6">
        <div className="grid md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-xs text-gray-400 mb-2">Fabric Type</label>
            <select value={fabric} onChange={e => setFabric(e.target.value)} className="input-field text-sm">
              {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
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
          <div>
            <label className="block text-xs text-gray-400 mb-2">Quantity (kg)</label>
            <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className="input-field text-sm" />
          </div>
          <button onClick={generate} disabled={loading} className="btn-primary flex items-center justify-center gap-2">
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Zap className="w-4 h-4" /> Generate</>}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: "workflow",        label: "🔀 Recycling Workflow" },
          { id: "recommendations", label: "♻️ Recommendations" },
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
        {/* ── Workflow Tab ── */}
        {tab === "workflow" && (
          <motion.div key="workflow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" /> 6-Step Recycling Recommendation Workflow
              </h3>
              <div className="space-y-4">
                {WORKFLOW_STEPS.map((step, i) => (
                  <motion.div key={step.step} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4 items-start">
                    {/* Connector */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border border-primary-500/30 flex items-center justify-center text-xl">
                        {step.icon}
                      </div>
                      {i < WORKFLOW_STEPS.length - 1 && (
                        <div className="w-0.5 h-6 bg-gradient-to-b from-primary-500/40 to-transparent mt-1" />
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-primary-400 font-bold uppercase tracking-wider">Step {step.step}</span>
                        <span className="badge-blue text-[10px]">{step.duration}</span>
                      </div>
                      <p className="font-semibold text-white mb-1">{step.title}</p>
                      <p className="text-sm text-gray-400">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Condition-based routing */}
            <div className="glass-card p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-secondary-400" /> Condition-Based Recovery Routing
              </h3>
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { cond: "Good",     routes: ["Direct Reuse","Donation","Resale"],               color: "#10b981", badge: "badge-green" },
                  { cond: "Fair",     routes: ["Mechanical Recycling","Upcycling","Industrial"],   color: "#3b82f6", badge: "badge-blue" },
                  { cond: "Poor",     routes: ["Fiber Recycling","Chemical Recycling","Shredding"],color: "#f59e0b", badge: "badge-yellow" },
                  { cond: "Critical", routes: ["Industrial Fuel","Composting","Hazardous Proc."],  color: "#ef4444", badge: "badge-red" },
                ].map(({ cond, routes, color, badge }) => (
                  <div key={cond} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={badge}>{cond}</span>
                    </div>
                    <div className="space-y-2">
                      {routes.map((r, i) => (
                        <div key={r} className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                            style={{ background: color, opacity: 1 - i * 0.2 }}>{i + 1}</div>
                          <span className="text-xs text-gray-300">{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Recommendations Tab ── */}
        {tab === "recommendations" && (
          <motion.div key="recs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Filter bar */}
            <div className="flex items-center gap-3 flex-wrap">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Filter by priority:</span>
              {(["All","High","Medium","Low"] as const).map(p => (
                <button key={p} onClick={() => setPriorityFilter(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                    priorityFilter === p ? "bg-primary-500/20 border-primary-500/50 text-primary-400" : "border-white/10 text-gray-400 hover:text-white"
                  }`}>{p}</button>
              ))}
              <span className="ml-auto text-xs text-gray-500">{filteredRecs.length} options found</span>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredRecs.map((rec, i) => <RecCard key={rec.method} rec={rec} index={i} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
