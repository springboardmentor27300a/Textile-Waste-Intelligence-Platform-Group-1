import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";

export default function RecyclerDashboard() {
  const [batches, setBatches] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.listBatches(), api.getClassificationSummary()])
      .then(([bData, sData]) => {
        setBatches(bData);
        setSummary(sData);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading Recycling Facility Dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Recycling Facility Operator Dashboard</h1>
          <p className="text-sm text-slate-400">Waste Batch Queue, AI Image Classification & Processing Analytics.</p>
        </div>

        <Link
          to="/scanner"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition shadow-lg shadow-emerald-500/20"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          </svg>
          Launch AI Fabric Scanner
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 glass-card rounded-2xl border border-slate-800">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Batches Analyzed</p>
          <p className="text-3xl font-bold text-emerald-400 mt-2">{summary?.total_analyzed || 0}</p>
          <p className="text-xs text-slate-400 mt-1">Out of {summary?.total_batches} total</p>
        </div>

        <div className="p-5 glass-card rounded-2xl border border-slate-800">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg Recyclability Score</p>
          <p className="text-3xl font-bold text-cyan-400 mt-2">{summary?.average_recyclability_score || "—"}</p>
          <p className="text-xs text-cyan-300 mt-1">Out of 100 max score</p>
        </div>

        <div className="p-5 glass-card rounded-2xl border border-slate-800">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">High Contamination Flag</p>
          <p className="text-3xl font-bold text-amber-400 mt-2">{summary?.high_contamination_count || 0}</p>
          <p className="text-xs text-amber-300 mt-1">Requires pre-cleaning</p>
        </div>

        <div className="p-5 glass-card rounded-2xl border border-slate-800">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Structural Damage Flag</p>
          <p className="text-3xl font-bold text-rose-400 mt-2">{summary?.high_damage_count || 0}</p>
          <p className="text-xs text-rose-300 mt-1">Ripped / shredded items</p>
        </div>
      </div>

      {/* Waste Batch Queue */}
      <div className="glass-card rounded-2xl border border-slate-800 p-6">
        <h2 className="text-lg font-bold text-white mb-4">Facility Waste Intake Queue</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-3">Batch Code</th>
                <th className="p-3">Fabric Type</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Condition</th>
                <th className="p-3">Category</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {batches.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/30">
                  <td className="p-3 font-semibold text-emerald-400">{b.batch_code}</td>
                  <td className="p-3 capitalize font-medium text-white">{b.fabric_type}</td>
                  <td className="p-3">{b.quantity_kg} kg</td>
                  <td className="p-3 capitalize text-slate-400">{b.condition.replace(/_/g, " ")}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-200 capitalize">
                      {b.category.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        b.status === "classified"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : b.status === "routed"
                          ? "bg-cyan-500/20 text-cyan-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      to={`/inventory/${b.id}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
                    >
                      Inspect & Classify
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
