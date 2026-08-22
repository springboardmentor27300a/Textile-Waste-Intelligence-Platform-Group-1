import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function SustainabilityAnalytics() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getCircularEconomySummary()
      .then(setSummary)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading Sustainability Intelligence...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Sustainability Intelligence Engine</h1>
          <p className="text-sm text-slate-400">Circular economy metrics, lifecycle emissions avoided & resource recovery.</p>
        </div>

        <a
          href={api.getCircularEconomyReportPdfUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition shadow-lg shadow-emerald-500/20"
        >
          Export ESG PDF Report
        </a>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 glass-card rounded-2xl border border-slate-800">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">CO₂ Footprint Avoided</p>
          <p className="text-3xl font-bold text-emerald-400 mt-2">
            {summary?.total_co2_saved_kg?.toLocaleString()} <span className="text-sm font-normal text-slate-300">kg</span>
          </p>
        </div>

        <div className="p-5 glass-card rounded-2xl border border-slate-800">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Water Saved</p>
          <p className="text-3xl font-bold text-cyan-400 mt-2">
            {summary?.total_water_saved_liters?.toLocaleString()} <span className="text-sm font-normal text-slate-300">L</span>
          </p>
        </div>

        <div className="p-5 glass-card rounded-2xl border border-slate-800">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Landfill Diverted</p>
          <p className="text-3xl font-bold text-indigo-400 mt-2">
            {summary?.total_landfill_diverted_kg?.toLocaleString()} <span className="text-sm font-normal text-slate-300">kg</span>
          </p>
        </div>

        <div className="p-5 glass-card rounded-2xl border border-slate-800">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Diversion Rate</p>
          <p className="text-3xl font-bold text-purple-400 mt-2">{summary?.diversion_rate_pct}%</p>
        </div>
      </div>
    </div>
  );
}
