import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";

export default function BatchDetail() {
  const { batchId } = useParams();
  const [batch, setBatch] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [sustainability, setSustainability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getBatch(batchId),
      api.listBatchAnalyses(batchId),
      api.getBatchSustainability(batchId),
    ])
      .then(([bData, aData, sData]) => {
        setBatch(bData);
        setAnalyses(aData);
        setSustainability(sData);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [batchId]);

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading batch details...</div>;
  }

  if (error || !batch) {
    return <div className="p-8 text-center text-rose-400">{error || "Batch not found."}</div>;
  }

  const latestAnalysis = analyses[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/inventory" className="text-xs text-slate-400 hover:text-emerald-400">
              ← Back to Inventory
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-3">
            Batch {batch.batch_code}
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 capitalize">
              {batch.fabric_type}
            </span>
          </h1>
          <p className="text-sm text-slate-400">Registered from {batch.source}</p>
        </div>

        {latestAnalysis && (
          <a
            href={api.getSingleAnalysisPdfUrl(batch.id, latestAnalysis.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition border border-slate-700"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF Report
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 1: Batch Info */}
        <div className="glass-card rounded-2xl border border-slate-800 p-5 space-y-3">
          <h2 className="text-base font-bold text-white mb-2 border-b border-slate-800 pb-2">
            Batch Overview
          </h2>
          <div>
            <p className="text-xs text-slate-400">Declared Fabric</p>
            <p className="text-sm font-semibold text-white capitalize">{batch.fabric_type}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Quantity</p>
            <p className="text-sm font-semibold text-white">{batch.quantity_kg} kg</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Condition</p>
            <p className="text-sm font-semibold text-slate-200 capitalize">{batch.condition.replace(/_/g, " ")}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Assigned Category</p>
            <p className="text-sm font-semibold text-emerald-400 capitalize">{batch.category.replace(/_/g, " ")}</p>
          </div>
        </div>

        {/* Right 2: AI Vision Analysis */}
        <div className="md:col-span-2 glass-card rounded-2xl border border-slate-800 p-5 space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2">
            AI Computer Vision & Fabric Classification
          </h2>

          {!latestAnalysis ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              No photo analysis recorded for this batch yet.
              <div className="mt-3">
                <Link
                  to="/scanner"
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-medium text-xs hover:bg-emerald-600 inline-block"
                >
                  Upload & Analyze Image
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {latestAnalysis.image_url && (
                  <img
                    src={`${import.meta.env.VITE_API_URL || "http://localhost:8000"}${latestAnalysis.image_url}`}
                    alt="Analyzed batch photo"
                    className="w-32 h-32 object-cover rounded-xl border border-slate-700"
                  />
                )}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400">Predicted Fabric Material</p>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300">
                      {Math.round((latestAnalysis.fabric_confidence || 0.85) * 100)}% Match
                    </span>
                  </div>
                  <p className="text-2xl font-black text-emerald-400 capitalize">
                    {latestAnalysis.predicted_fabric_type}
                  </p>
                  <p className="text-xs text-slate-300 bg-slate-800/60 p-2.5 rounded-lg leading-relaxed">
                    {latestAnalysis.material_rationale || latestAnalysis.rationale}
                  </p>
                </div>
              </div>

              {/* Feature Metrics */}
              <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <p className="text-slate-400 text-[10px]">Texture Score</p>
                  <p className="font-bold text-white mt-0.5">{latestAnalysis.texture_score}</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <p className="text-slate-400 text-[10px]">Color Hex</p>
                  <p className="font-mono font-bold text-slate-200 mt-0.5">{latestAnalysis.dominant_color_hex}</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <p className="text-slate-400 text-[10px]">Contamination</p>
                  <p className="font-bold text-amber-400 mt-0.5">{latestAnalysis.contamination_score}</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <p className="text-slate-400 text-[10px]">Damage</p>
                  <p className="font-bold text-rose-400 mt-0.5">{latestAnalysis.damage_score}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sustainability & Circularity Score */}
      {sustainability && (
        <div className="glass-card rounded-2xl border border-slate-800 p-6 space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
            Sustainability Intelligence & Weighted Circularity Score
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-white">Recommended Recovery Pathway:</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {sustainability.recommended_pathway}
                </span>
              </div>
              <p className="text-xs text-slate-300 bg-slate-800/60 p-3 rounded-xl leading-relaxed">
                {sustainability.rationale}
              </p>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-slate-400 text-[11px]">CO₂ Avoided</p>
                  <p className="font-bold text-emerald-400 text-base mt-0.5">{sustainability.co2_saved_kg} kg</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-slate-400 text-[11px]">Water Saved</p>
                  <p className="font-bold text-cyan-400 text-base mt-0.5">{sustainability.water_saved_liters} L</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-slate-400 text-[11px]">Landfill Diverted</p>
                  <p className="font-bold text-indigo-400 text-base mt-0.5">{sustainability.landfill_diverted_kg} kg</p>
                </div>
              </div>
            </div>

            {/* Circularity Formula Breakdown */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Circularity Score Formula</span>
                <span className="text-xl font-black text-emerald-400">
                  {sustainability.circularity_score} <span className="text-xs text-slate-400">/ 100</span>
                </span>
              </div>
              <p className="text-xs font-semibold text-emerald-300">{sustainability.circularity_category}</p>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Material Recyclability (35%)</span>
                  <span className="font-medium text-slate-100">{sustainability.recyclability_component}</span>
                </div>
                <div className="flex justify-between">
                  <span>Material Condition (20%)</span>
                  <span className="font-medium text-slate-100">{sustainability.condition_component}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reuse Potential (20%)</span>
                  <span className="font-medium text-slate-100">{sustainability.reuse_component}</span>
                </div>
                <div className="flex justify-between">
                  <span>Environmental Benefit (15%)</span>
                  <span className="font-medium text-slate-100">{sustainability.environmental_component}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Feasibility (10%)</span>
                  <span className="font-medium text-slate-100">{sustainability.feasibility_component}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
