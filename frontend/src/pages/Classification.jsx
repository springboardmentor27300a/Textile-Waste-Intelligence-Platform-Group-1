import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart, DoughnutChart, Frame } from "../components/Charts.jsx";
import { Empty, ErrorNote, Loading, Pill, StatCard, Table } from "../components/Ui.jsx";
import { Brain, Tag } from "../components/Icons.jsx";
import { api } from "../lib/api.js";

export default function Classification() {
  const [d, setD] = useState(null);
  const [models, setModels] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    api.insightClassification().then(setD).catch((e) => setError(e.message));
    api.modelMetrics().then(setModels).catch(() => {});
  }, []);

  if (error) return <ErrorNote>{error}</ErrorNote>;
  if (!d) return <Loading label="Loading classifications" />;
  if (!d.classified) return <Empty>No batch has been analysed yet. Upload an image against a batch first.</Empty>;

  const materials = ["All", ...d.by_material.map((m) => m.label)];
  const rows = filter === "All" ? d.rows : d.rows.filter((r) => r.material === filter);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Classified batches" value={d.classified} icon={Tag} />
        <StatCard label="Mean confidence" value={`${(d.mean_confidence * 100).toFixed(0)}%`} icon={Brain}
                  tone="text-brand" />
        <StatCard label="Blends detected" value={d.blends}
                  sub="Narrow top-two margin or high colour entropy" />
        <StatCard label="Material classes"
                  value={models?.trained ? (models.material_report ? Object.keys(models.material_report).filter((k) => !k.includes("avg") && k !== "accuracy").length : "—") : "—"}
                  sub={models?.material_algorithm || ""} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Frame title="Material distribution" subtitle="Batches per fibre" height={250}>
          <DoughnutChart labels={d.by_material.map((m) => m.label)}
                         values={d.by_material.map((m) => m.count)} />
        </Frame>
        <Frame title="Waste categories" subtitle="Batches per class" height={250}>
          <DoughnutChart labels={d.by_category.map((m) => m.label)}
                         values={d.by_category.map((m) => m.count)} />
        </Frame>
        <Frame title="Confidence spread" subtitle="How sure the classifier was" height={250}>
          <BarChart labels={d.confidence_bands.map((b) => b.label)}
                    datasets={[{ label: "Batches", data: d.confidence_bands.map((b) => b.count) }]} />
        </Frame>
      </div>

      <section>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h2 className="mr-2 font-display text-[15px] font-bold">Classification results</h2>
          {materials.map((m) => (
            <button key={m} onClick={() => setFilter(m)}
              className={`chip transition-colors ${filter === m
                ? "border-brand/50 bg-brand/12 text-brand" : "hover:text-ink"}`}>
              {m}
            </button>
          ))}
        </div>

        <Table head={["Batch", "Material", "Confidence", "Composition", "Waste class",
                      "Texture / pattern", "Damage", "Contam.", ""]}>
          {rows.map((r) => (
            <tr key={r.batch_id} className="hover:bg-panel-2/60">
              <td className="td font-mono text-xs">{r.batch_code}</td>
              <td className="td">
                {r.material} {r.is_blend && <Pill tone="info">blend</Pill>}
              </td>
              <td className="td">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-panel-2">
                    <div className="h-full rounded-full bg-brand"
                         style={{ width: `${r.confidence * 100}%` }} />
                  </div>
                  <span className="font-mono text-xs tnum">{(r.confidence * 100).toFixed(0)}%</span>
                </div>
              </td>
              <td className="td text-xs text-muted">
                {Object.entries(r.fibre_composition).map(([f, p]) => `${f} ${p}%`).join(" · ")}
              </td>
              <td className="td">{r.waste_category}</td>
              <td className="td text-xs text-muted">{r.texture} · {r.pattern}</td>
              <td className="td tnum">{(r.damage_score * 100).toFixed(0)}%</td>
              <td className="td tnum">{(r.contamination_score * 100).toFixed(0)}%</td>
              <td className="td text-right">
                <Link to={`/inventory/${r.batch_id}`} className="text-brand hover:underline">Open</Link>
              </td>
            </tr>
          ))}
        </Table>
      </section>
    </div>
  );
}
