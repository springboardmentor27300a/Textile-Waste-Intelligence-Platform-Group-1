import { useEffect, useState } from "react";
import { api } from "../../api/client";

export default function SustainabilityDashboard() {
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Sustainability Manager Dashboard</h1>
          <p className="text-sm text-slate-400">ESG Metrics, Carbon Footprint & Landfill Diversion Analytics.</p>
        </div>

        <a
          href={api.getCircularEconomyReportPdfUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition shadow-lg shadow-emerald-500/20"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
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
          <p className="text-xs text-slate-400 mt-1">Lifecycle emissions offset</p>
        </div>

        <div className="p-5 glass-card rounded-2xl border border-slate-800">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Water Conserved</p>
          <p className="text-3xl font-bold text-cyan-400 mt-2">
            {summary?.total_water_saved_liters?.toLocaleString()} <span className="text-sm font-normal text-slate-300">L</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">Virgin crop & process water saved</p>
        </div>

        <div className="p-5 glass-card rounded-2xl border border-slate-800">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Landfill Diversion</p>
          <p className="text-3xl font-bold text-indigo-400 mt-2">
            {summary?.total_landfill_diverted_kg?.toLocaleString()} <span className="text-sm font-normal text-slate-300">kg</span>
          </p>
          <p className="text-xs text-emerald-400 mt-1">{summary?.diversion_rate_pct}% Diversion Rate</p>
        </div>

        <div className="p-5 glass-card rounded-2xl border border-slate-800">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Waste Tracked</p>
          <p className="text-3xl font-bold text-purple-400 mt-2">
            {summary?.total_quantity_kg?.toLocaleString()} <span className="text-sm font-normal text-slate-300">kg</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">{summary?.total_batches} Registered Batches</p>
        </div>
      </div>

      {/* Pathways Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl border border-slate-800 p-6">
          <h2 className="text-lg font-bold text-white mb-4">Waste Diversion by Recovery Pathway</h2>
          <div className="space-y-4">
            {summary?.by_pathway &&
              Object.entries(summary.by_pathway).map(([pathway, qty]) => {
                const pct = Math.round((qty / summary.total_quantity_kg) * 100) || 0;
                return (
                  <div key={pathway}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-200">{pathway}</span>
                      <span className="text-slate-400">{qty} kg ({pct}%)</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="glass-card rounded-2xl border border-slate-800 p-6">
          <h2 className="text-lg font-bold text-white mb-4">Category Quantity Distribution</h2>
          <div className="space-y-4">
            {summary?.by_category_quantity_kg &&
              Object.entries(summary.by_category_quantity_kg).map(([cat, qty]) => {
                const pct = Math.round((qty / summary.total_quantity_kg) * 100) || 0;
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-200 capitalize">{cat.replace(/_/g, " ")}</span>
                      <span className="text-slate-400">{qty} kg ({pct}%)</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
