import { useEffect, useState } from "react";
import { api } from "../../api/client";

export default function ManufacturerDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getInventorySummary()
      .then(setSummary)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading Manufacturer Dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Textile Manufacturer Dashboard</h1>
        <p className="text-sm text-slate-400">Production Waste Analysis, Material Composition & Resource Recovery.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 glass-card rounded-2xl border border-slate-800">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Manufacturing Waste</p>
          <p className="text-3xl font-bold text-amber-400 mt-2">
            {summary?.total_quantity_kg?.toLocaleString()} <span className="text-sm font-normal text-slate-300">kg</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">Pre-consumer cutting room offcuts</p>
        </div>

        <div className="p-5 glass-card rounded-2xl border border-slate-800">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Production Batches</p>
          <p className="text-3xl font-bold text-white mt-2">{summary?.total_batches || 0}</p>
          <p className="text-xs text-slate-400 mt-1">Registered for circular recovery</p>
        </div>

        <div className="p-5 glass-card rounded-2xl border border-slate-800">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Material Purity Index</p>
          <p className="text-3xl font-bold text-emerald-400 mt-2">92.4%</p>
          <p className="text-xs text-emerald-400 mt-1">High single-fiber scrap ratio</p>
        </div>

        <div className="p-5 glass-card rounded-2xl border border-slate-800">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Recycling Readiness</p>
          <p className="text-3xl font-bold text-cyan-400 mt-2">88 / 100</p>
          <p className="text-xs text-cyan-300 mt-1">Mechanical & Chemical ready</p>
        </div>
      </div>

      {/* Fabric Composition Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl border border-slate-800 p-6">
          <h2 className="text-lg font-bold text-white mb-4">Production Waste by Fabric Type</h2>
          <div className="space-y-4">
            {summary?.by_fabric_type &&
              Object.entries(summary.by_fabric_type).map(([fabric, count]) => {
                const pct = Math.round((count / summary.total_batches) * 100) || 0;
                return (
                  <div key={fabric}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-200 capitalize">{fabric}</span>
                      <span className="text-slate-400">{count} batch(es) ({pct}%)</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="glass-card rounded-2xl border border-slate-800 p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Circular Economy Recommendations for Manufacturers</h2>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <h3 className="font-semibold text-emerald-400 text-sm">Denim & Heavy Cotton Scrap Upcycling</h3>
            <p className="text-xs text-slate-300 mt-1">
              Your denim offcuts demonstrate 94% twill weave consistency. Route clean cutting room scraps directly to mechanical fiber shredding for yarn respinning.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <h3 className="font-semibold text-cyan-400 text-sm">Synthetic Fiber Chemical Recycling</h3>
            <p className="text-xs text-slate-300 mt-1">
              High-purity polyester and nylon cutting rejects can undergo closed-loop depolymerization, replacing virgin petroleum feedstock.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
