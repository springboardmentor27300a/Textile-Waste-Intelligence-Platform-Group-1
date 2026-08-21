import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import WeaveMeter from "../components/WeaveMeter.jsx";
import { BarChart, Frame, ScoreBar } from "../components/Charts.jsx";
import { Band, ErrorNote, Pill, StatCard } from "../components/Ui.jsx";
import { Bolt, Brain, Camera, Eye } from "../components/Icons.jsx";
import DatasetFindings from "../components/DatasetFindings.jsx";
import { api } from "../lib/api.js";

const CONDITIONS = ["excellent", "good", "fair", "poor", "unusable"];
const SCORE_LABELS = {
  material_recyclability: "Material recyclability",
  material_condition: "Material condition",
  reuse_potential: "Reuse potential",
  environmental_benefit: "Environmental benefit",
  processing_feasibility: "Processing feasibility",
};

export default function ImageAnalysis() {
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [condition, setCondition] = useState("good");
  const [quantity, setQuantity] = useState(100);
  const inputRef = useRef(null);

  const run = useCallback(async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("That file isn't an image. Upload a JPG, PNG, WebP or BMP.");
      return;
    }
    setBusy(true);
    setError("");
    setResult(null);
    setPreview(URL.createObjectURL(file));
    try {
      setResult(await api.quickAnalyse(file, condition, Number(quantity) || 0));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }, [condition, quantity]);

  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-sm text-muted">
        Drop a photograph of textile waste and the pipeline reads it end to end — fibre,
        texture, damage, waste class, circularity and the routes worth taking. Nothing is
        saved to the register here, so it's safe to experiment.
      </p>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
        <section>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); run(e.dataTransfer.files?.[0]); }}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
            role="button" tabIndex={0}
            className={`grid cursor-pointer place-items-center rounded-card border-2 border-dashed
                        p-10 text-center transition-colors
                        ${dragging ? "border-brand bg-brand/8" : "border-line bg-panel hover:border-brand/50"}`}
          >
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
                   onChange={(e) => run(e.target.files?.[0])} />
            {preview ? (
              <img src={preview} alt="Uploaded textile"
                   className="max-h-56 rounded-lg border border-line object-contain" />
            ) : (
              <span className="grid h-20 w-20 place-items-center rounded-2xl bg-panel-2 text-muted">
                <Camera className="h-8 w-8" />
              </span>
            )}
            <h3 className="mt-5 font-display text-lg font-bold">
              {busy ? "Analysing…" : preview ? "Drop another image" : "Upload textile image"}
            </h3>
            <p className="mt-1 text-sm text-muted">Drag &amp; drop or click to select</p>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {["JPG", "PNG", "JPEG", "WebP", "BMP"].map((f) => <Pill key={f} tone="info">{f}</Pill>)}
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="cond">Condition (feeds the score)</label>
              <select id="cond" className="field" value={condition}
                      onChange={(e) => setCondition(e.target.value)}>
                {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="qty">Quantity (kg)</label>
              <input id="qty" type="number" min="0" className="field" value={quantity}
                     onChange={(e) => setQuantity(e.target.value)} />
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              [Eye, "Fabric detection", "Texture, pattern, colour"],
              [Brain, "AI classification", "10 materials, 6 waste classes"],
              [Bolt, "Fast inference", "~100 ms per image"],
            ].map(([Icon, title, sub]) => (
              <div key={title} className="card p-4 text-center">
                <span className="mx-auto grid h-9 w-9 place-items-center rounded-lg bg-brand/12 text-brand">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <p className="mt-2 text-sm font-semibold">{title}</p>
                <p className="text-xs text-muted">{sub}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          {error && <ErrorNote>{error}</ErrorNote>}

          {!result && !busy && (
            <div className="card grid h-full min-h-[280px] place-items-center p-6 text-center">
              <div>
                <p className="font-display text-base font-bold">No reading yet</p>
                <p className="mx-auto mt-2 max-w-xs text-sm text-muted">
                  A flat, evenly lit swatch filling the frame gives the most reliable fibre call.
                </p>
              </div>
            </div>
          )}

          {busy && <div className="card grid min-h-[280px] place-items-center p-6">
            <p className="eyebrow animate-pulse">Running the pipeline…</p></div>}

          {result && (
            <>
              <div className="card p-5">
                <div className="flex flex-wrap items-center gap-5">
                  <WeaveMeter score={result.circularity_score} size={130} />
                  <div className="min-w-[190px] flex-1">
                    <p className="eyebrow">Verdict</p>
                    <Band band={result.circularity_band} />
                    <p className="mt-2 text-sm leading-relaxed">
                      Read as <strong>{result.material}</strong>
                      {result.is_blend && " (blend)"} at{" "}
                      {(result.material_confidence * 100).toFixed(0)}% confidence, classed{" "}
                      <strong>{result.waste_category}</strong>.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <Pill tone="brand">{result.texture_class}</Pill>
                      <Pill tone="brand">{result.pattern_class}</Pill>
                      <Pill>{result.dominant_colour}</Pill>
                      <Pill tone={result.damage_score > 0.3 ? "warn" : "muted"}>
                        Damage {(result.damage_score * 100).toFixed(0)}%
                      </Pill>
                      <Pill tone={result.contamination_score > 0.4 ? "danger" : "muted"}>
                        Contamination {(result.contamination_score * 100).toFixed(0)}%
                      </Pill>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <StatCard label="Recyclability" value={result.recyclability_score.toFixed(0)} />
                <StatCard label="Reuse" value={result.reuse_score.toFixed(0)} />
              </div>

              <DatasetFindings defect={result.defect_detection}
                               garment={result.garment_recognition} />

              <Frame title="Fibre probabilities" subtitle="Top calls from the classifier" height={200}>
                <BarChart horizontal
                  labels={Object.keys(result.material_probabilities)}
                  datasets={[{
                    label: "Probability",
                    data: Object.values(result.material_probabilities).map((p) => +(p * 100).toFixed(1)),
                  }]} />
              </Frame>

              <section className="card p-5">
                <h3 className="font-display text-[15px] font-bold">How the score was built</h3>
                <div className="mt-4 space-y-3">
                  {Object.entries(SCORE_LABELS).map(([key, label]) => (
                    <ScoreBar key={key} label={label} value={result.score_components?.[key] ?? 0}
                              weight={result.score_weights?.[key]} />
                  ))}
                </div>
              </section>

              <section className="card p-5">
                <h3 className="font-display text-[15px] font-bold">Recommended routes</h3>
                <ol className="mt-3 space-y-3">
                  {result.recommendations.map((o) => (
                    <li key={o.route} className="rounded-lg border border-line bg-panel-2 p-3.5">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-semibold">
                          <span className="mr-2 font-mono text-xs text-muted">{o.rank}</span>{o.route}
                        </span>
                        <span className="font-mono text-xs tnum text-brand">{o.fit.toFixed(0)} fit</span>
                      </div>
                      <p className="mt-1.5 text-sm text-muted">{o.rationale}</p>
                    </li>
                  ))}
                </ol>
                <p className="mt-4 text-xs text-muted">
                  To keep this reading, register it in{" "}
                  <Link to="/inventory" className="text-brand hover:underline">Inventory</Link>{" "}
                  and upload the image against the batch.
                </p>
              </section>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
