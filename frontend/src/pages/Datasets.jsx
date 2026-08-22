import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function Datasets() {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.listDatasets()
      .then(setDatasets)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading Textile Datasets...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Textile ML Datasets & Benchmarks</h1>
        <p className="text-sm text-slate-400">
          Integrated vision & waste classification datasets (TIPS, DeepFashion, Fashion-MNIST, Kaggle Fabric/Sustainable Fashion).
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {datasets.map((d) => (
          <div key={d.id} className="p-5 glass-card rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-bold text-white text-base leading-snug">{d.name}</h2>
              <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 capitalize">
                {d.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{d.purpose}</p>
            {d.notes && <p className="text-[11px] text-slate-400 italic bg-slate-900/60 p-2.5 rounded-xl">{d.notes}</p>}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">{d.license}</span>
              <a
                href={d.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline font-medium"
              >
                Source URL →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
