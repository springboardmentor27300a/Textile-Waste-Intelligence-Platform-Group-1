"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Tag, ChevronDown } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

const MATERIALS = ["Cotton","Polyester","Wool","Silk","Linen","Denim","Nylon","Rayon","Acrylic","Mixed Fabric"];
const WASTE_CATS = ["Recyclable","Reusable","Repairable","Upcyclable","Compostable","Hazardous Waste"];
const CONDITIONS = ["Good","Fair","Poor","Critical"];

const matColors = ["bg-emerald-500","bg-blue-500","bg-purple-500","bg-amber-500","bg-teal-500","bg-indigo-500","bg-pink-500","bg-orange-500","bg-red-500","bg-cyan-500"];
const wasteColors: Record<string, string> = {
  Recyclable: "badge-green", Reusable: "badge-blue", Repairable: "badge-yellow",
  Upcyclable: "badge-purple", Compostable: "badge-orange", "Hazardous Waste": "badge-red"
};

function ConfBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-xs text-gray-400 w-28 truncate">{label}</span>
      <div className="flex-1 progress-bar">
        <motion.div className={`progress-fill ${color}`}
          initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8 }} />
      </div>
      <span className="text-xs font-bold text-white w-12 text-right">{value.toFixed(1)}%</span>
    </div>
  );
}

export default function ClassificationPage() {
  const [fabric, setFabric] = useState("Cotton");
  const [condition, setCondition] = useState("Good");
  const [quantity, setQuantity] = useState("100");
  const [matResult, setMatResult] = useState<any>(null);
  const [wasteResult, setWasteResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const classify = async () => {
    setLoading(true);
    try {
      const [matRes, wasteRes] = await Promise.all([
        api.post(`/ai/classify-material?fabric_type=${fabric}&quantity=${quantity}`),
        api.post(`/ai/classify-waste?fabric_type=${fabric}&condition=${condition}&quantity=${quantity}`)
      ]);
      setMatResult(matRes.data);
      setWasteResult(wasteRes.data);
      toast.success("Classification complete!");
    } catch {
      // Demo fallback
      await new Promise(r => setTimeout(r, 800));
      const matConfs = MATERIALS.map(m => ({ label: m, confidence: m === fabric ? 0.87 + Math.random()*0.10 : Math.random()*0.08 }));
      matConfs.sort((a,b) => b.confidence - a.confidence);
      const total = matConfs.reduce((s,c) => s+c.confidence, 0);
      matConfs.forEach(c => c.confidence = c.confidence / total);
      
      const primary = condition === "Good" ? "Recyclable" : condition === "Fair" ? "Repairable" : "Compostable";
      const wasteConfs = WASTE_CATS.map(c => ({ label: c, confidence: c === primary ? 0.75 + Math.random()*0.15 : Math.random()*0.10 }));
      wasteConfs.sort((a,b) => b.confidence - a.confidence);
      const wTotal = wasteConfs.reduce((s,c) => s+c.confidence, 0);
      wasteConfs.forEach(c => c.confidence = c.confidence / wTotal);
      
      setMatResult({
        primary_classification: matConfs[0].label,
        confidence_pct: +(matConfs[0].confidence * 100).toFixed(1),
        all_classifications: matConfs,
        properties: { recyclability: "High", biodegradability: "Biodegradable", moisture_absorption: "High", durability: "High" }
      });
      setWasteResult({
        waste_category: wasteConfs[0].label,
        confidence_pct: +(wasteConfs[0].confidence * 100).toFixed(1),
        all_classifications: wasteConfs,
        disposal_urgency: "Within 30 days",
        regulatory_compliance: "Compliant"
      });
      toast.success("Classification complete! (Demo mode)");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Material Classification</h1>
        <p className="text-gray-400 text-sm mt-1">AI-powered textile material and waste type classification</p>
      </div>

      {/* Input Panel */}
      <div className="glass-card p-6">
        <h2 className="font-bold text-white mb-4">Classify Textile</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-2">Fabric Type</label>
            <select value={fabric} onChange={e => setFabric(e.target.value)} className="input-field text-sm">
              {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
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
            <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)}
              className="input-field text-sm" min="0.1" step="0.1" />
          </div>
          <div className="flex items-end">
            <button onClick={classify} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Tag className="w-4 h-4" /> Classify</>}
            </button>
          </div>
        </div>
      </div>

      {/* Material Cards Grid - always show */}
      <div className="glass-card p-6">
        <h3 className="font-bold text-white mb-5">Material Type Recognition</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {MATERIALS.map((mat, i) => (
            <div key={mat} onClick={() => setFabric(mat)}
              className={`p-3 rounded-xl cursor-pointer transition-all duration-200 text-center border
                ${fabric === mat ? "border-primary-500 bg-primary-500/10" : "border-white/10 bg-white/5 hover:border-white/20"}`}>
              <div className={`w-10 h-10 ${matColors[i]} rounded-lg mx-auto mb-2 flex items-center justify-center text-white font-black text-sm`}>
                {mat.slice(0, 2)}
              </div>
              <p className="text-xs font-semibold text-white leading-tight">{mat}</p>
            </div>
          ))}
        </div>
      </div>

      {matResult && wasteResult && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-6">
          {/* Material Classification Result */}
          <div className="glass-card p-6">
            <h3 className="font-bold text-white mb-2">Material Classification</h3>
            <div className="flex items-center gap-3 mb-4 p-3 bg-primary-500/10 rounded-xl border border-primary-500/20">
              <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center text-white font-black">
                {matResult.primary_classification.slice(0,2)}
              </div>
              <div>
                <p className="font-black text-xl text-white">{matResult.primary_classification}</p>
                <p className="text-sm text-primary-400">{matResult.confidence_pct}% confidence</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              {matResult.all_classifications.slice(0, 5).map((c: any) => (
                <ConfBar key={c.label} label={c.label} value={+(c.confidence * 100).toFixed(1)} color="bg-gradient-to-r from-primary-500 to-primary-600" />
              ))}
            </div>
            {matResult.properties && (
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-gray-400 mb-3 font-semibold uppercase tracking-wider">Properties</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(matResult.properties).map(([k, v]: any) => (
                    <div key={k} className="flex justify-between p-2 bg-white/5 rounded-lg">
                      <span className="text-xs text-gray-400 capitalize">{k.replace(/_/g, " ")}</span>
                      <span className="text-xs font-semibold text-white">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Waste Classification Result */}
          <div className="glass-card p-6">
            <h3 className="font-bold text-white mb-2">Waste Classification</h3>
            <div className="flex items-center gap-3 mb-4 p-3 bg-secondary-500/10 rounded-xl border border-secondary-500/20">
              <div className="w-12 h-12 bg-secondary-500 rounded-xl flex items-center justify-center text-white font-black text-sm">
                {wasteResult.waste_category.slice(0,2)}
              </div>
              <div>
                <p className="font-black text-xl text-white">{wasteResult.waste_category}</p>
                <p className="text-sm text-secondary-400">{wasteResult.confidence_pct}% confidence</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              {wasteResult.all_classifications.slice(0, 5).map((c: any) => (
                <ConfBar key={c.label} label={c.label} value={+(c.confidence * 100).toFixed(1)} color="bg-gradient-to-r from-secondary-500 to-secondary-600" />
              ))}
            </div>
            <div className="pt-4 border-t border-white/10 space-y-3">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Classification Details</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-white/5 rounded-lg">
                  <p className="text-xs text-gray-400">Disposal Urgency</p>
                  <p className="text-xs font-semibold text-white">{wasteResult.disposal_urgency}</p>
                </div>
                <div className="p-2 bg-white/5 rounded-lg">
                  <p className="text-xs text-gray-400">Compliance</p>
                  <span className={`text-xs ${wasteResult.regulatory_compliance === "Compliant" ? "text-primary-400" : "text-yellow-400"}`}>
                    {wasteResult.regulatory_compliance}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {WASTE_CATS.map(cat => (
                  <div key={cat} className={`p-2 rounded-lg text-center border text-xs font-medium
                    ${cat === wasteResult.waste_category ? "border-secondary-500 bg-secondary-500/20 text-secondary-300" : "border-white/10 text-gray-500"}`}>
                    {cat}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
