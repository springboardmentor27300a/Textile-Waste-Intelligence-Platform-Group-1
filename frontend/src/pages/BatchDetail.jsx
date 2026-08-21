import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import WeaveMeter from "../components/WeaveMeter.jsx";
import { BarChart, Frame, ScoreBar } from "../components/Charts.jsx";
import { Band, ErrorNote, Loading, Pill } from "../components/Ui.jsx";
import DatasetFindings from "../components/DatasetFindings.jsx";
import { api, BAND_TONE } from "../lib/api.js";

const SCORE_LABELS = {
  material_recyclability: "Material recyclability",
  material_condition: "Material condition",
  reuse_potential: "Reuse potential",
  environmental_benefit: "Environmental benefit",
  processing_feasibility: "Processing feasibility",
};

export default function BatchDetail() {
  const { batchId } = useParams();
  const [batch, setBatch] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef(null);

  const load = () => api.batch(batchId).then(setBatch).catch((e) => setError(e.message));
  useEffect(() => { load(); }, [batchId]);

  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      await api.analyse(batchId, file);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  if (error && !batch) return <ErrorNote>{error}</ErrorNote>;
  if (!batch) return <Loading label="Loading batch" />;

  const a = batch.latest_analysis;

  return (
    <div>
      <Link to="/inventory" className="eyebrow hover:text-ink">← Back to register</Link>

      <header className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-muted">{batch.batch_code}</p>
          <h1 className="mt-1 font-display text-3xl font-bold">{batch.fabric_type}</h1>
          <p className="mt-1 text-sm text-muted">
            {batch.quantity_kg.toLocaleString()} kg · {batch.condition} condition
            {batch.source && ` · ${batch.source}`}
          </p>
        </div>
        <div>
          <input ref={fileInput} type="file" accept="image/*" onChange={upload}
                 className="hidden" id="swatch-upload" />
          <label htmlFor="swatch-upload" className="btn-primary cursor-pointer">
            {busy ? "Reading image…" : a ? "Re-analyse with new image" : "Upload textile image"}
          </label>
        </div>
      </header>

      {error && <p className="mt-5 rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">{error}</p>}

      {!a ? (
        <p className="card mt-8 p-6 text-sm">
          No reading yet. Upload a close, evenly lit photo of the material — a flat swatch
          filling the frame gives the most reliable fibre call.
        </p>
      ) : (
        <div className="mt-6 space-y-6">
          <section className="card grid gap-8 p-6 md:grid-cols-[auto_1fr]">
            <WeaveMeter score={a.circularity_score} size={160} />
            <div>
              <p className="eyebrow">Verdict</p>
              <h2 className="mt-1 font-display text-2xl font-bold"><Band band={a.circularity_band} /></h2>
              <p className="mt-3 max-w-prose text-sm leading-relaxed">
                Read as <strong>{a.material}</strong>
                {a.is_blend && " (blend)"} at {(a.material_confidence * 100).toFixed(0)}% confidence,
                classed <strong>{a.waste_category}</strong>. Surface damage sits at{" "}
                {(a.damage_score * 100).toFixed(0)}% and contamination at{" "}
                {(a.contamination_score * 100).toFixed(0)}%.
              </p>
              <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
                <Metric label="Recyclability" value={a.recyclability_score} />
                <Metric label="Reuse" value={a.reuse_score} />
                <Metric label="Material recovery" value={a.material_recovery_score} />
                <Metric label="Sustainability" value={a.sustainability_score} />
              </dl>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="card p-5">
              <h3 className="font-display text-lg font-bold">How the score was built</h3>
              <div className="mt-4 space-y-3.5">
                {Object.entries(SCORE_LABELS).map(([key, label]) => (
                  <ScoreBar key={key} label={label}
                            value={a.score_components?.[key] ?? 0}
                            weight={a.score_weights?.[key]} />
                ))}
              </div>
              <p className="mt-4 text-xs text-muted">
                Weighted sum of the five components, scaled to 100.
              </p>
            </div>

            <div className="card p-5">
              <h3 className="font-display text-lg font-bold">What the image showed</h3>
              <dl className="mt-4 divide-y divide-line text-sm">
                <Row label="Dominant colour" value={a.dominant_colour} />
                <Row label="Texture" value={a.texture_class} />
                <Row label="Pattern" value={a.pattern_class} />
                <Row label="Fibre composition" value={
                  Object.entries(a.fibre_composition)
                    .map(([fibre, pct]) => `${fibre} ${pct}%`).join(" · ")
                } />
                <Row label="Material quality" value={`${(a.material_quality * 100).toFixed(0)} / 100`} />
                <Row label="Inference" value={`${a.inference_ms.toFixed(0)} ms`} />
              </dl>
              <details className="mt-4 text-muted">
                <summary className="cursor-pointer eyebrow hover:text-ink">
                  Alternative fibre calls
                </summary>
                <ul className="mt-2 space-y-1 text-sm">
                  {Object.entries(a.material_probabilities).map(([material, p]) => (
                    <li key={material} className="flex justify-between">
                      <span>{material}</span>
                      <span className="font-mono text-xs tnum text-muted">{(p * 100).toFixed(1)}%</span>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          </section>

          <DatasetFindings defect={a.defect_detection} garment={a.garment_recognition} />

          <section>
            <h3 className="font-display text-lg font-bold">Recommended routes</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {a.recommendations.map((option) => (
                <article key={option.route} className="card p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h4 className="font-display text-base font-bold">
                      <span className="font-mono text-xs text-muted mr-2">{option.rank}</span>
                      {option.route}
                    </h4>
                    <span className="font-mono text-xs tnum text-muted">{option.fit.toFixed(0)} fit</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed">{option.rationale}</p>
                  {option.note && <p className="mt-2 text-sm text-muted">{option.note}</p>}
                </article>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <h3 className="font-display text-lg font-bold">
              If routed to {a.environmental_impact.recommended_route}
            </h3>
            <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4">
              <Metric label="Diverted" value={`${a.environmental_impact.diverted_kg.toLocaleString()} kg`} raw />
              <Metric label="CO₂ saved" value={`${a.environmental_impact.co2_saved_kg.toLocaleString()} kg`} raw />
              <Metric label="Water saved" value={`${Math.round(a.environmental_impact.water_saved_litres / 1000).toLocaleString()} kL`} raw />
              <Metric label="Virgin fibre replaced" value={`${a.environmental_impact.virgin_fibre_replaced_kg.toLocaleString()} kg`} raw />
            </dl>
            <p className="mt-4 text-xs text-muted">{a.environmental_impact.basis}</p>
          </section>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, raw }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1 font-display text-xl font-bold tnum leading-none">
        {raw ? value : value.toFixed(0)}
      </dd>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line py-2 last:border-0">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}
