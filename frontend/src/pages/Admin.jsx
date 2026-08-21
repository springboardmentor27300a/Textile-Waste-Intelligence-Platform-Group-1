import { useEffect, useState } from "react";
import { BarChart, Frame } from "../components/Charts.jsx";
import { ErrorNote, Loading, Pill, StatCard, Table } from "../components/Ui.jsx";
import { Brain, Shield } from "../components/Icons.jsx";
import { api, ROLE_LABEL } from "../lib/api.js";

export default function Admin() {
  const [s, setS] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.users(), api.adminMetrics(), api.modelMetrics(), api.materials(),
                 api.datasetModels()])
      .then(([users, metrics, models, materials, datasets]) =>
        setS({ users, metrics, models, materials, datasets }))
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorNote>{error}</ErrorNote>;
  if (!s.users) return <Loading label="Loading platform state" />;

  const { users, metrics, models, materials, datasets } = s;
  const importance = models.trained ? models.waste_feature_importance || {} : {};

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Users" value={metrics.users} icon={Shield} />
        <StatCard label="Batches" value={metrics.batches} />
        <StatCard label="Analyses" value={metrics.analyses} />
        <StatCard label="Mean inference" value={`${metrics.mean_inference_ms} ms`} tone="text-brand" />
        <StatCard label="p95 inference" value={`${metrics.p95_inference_ms} ms`} />
      </div>

      <section className="card p-5">
        <h2 className="font-display text-[15px] font-bold">Model performance</h2>
        {models.trained ? (
          <>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Material accuracy"
                        value={`${(models.material_holdout_accuracy * 100).toFixed(1)}%`} icon={Brain}
                        sub={models.material_algorithm} />
              <StatCard label="Material samples" value={models.material_samples.toLocaleString()}
                        sub={models.material_source} />
              <StatCard label="Waste accuracy"
                        value={`${(models.waste_holdout_accuracy * 100).toFixed(1)}%`}
                        sub={models.waste_algorithm} />
              <StatCard label="Waste samples" value={models.waste_samples.toLocaleString()} />
            </div>
            {models.waste_note && (
              <p className="mt-4 rounded-lg border border-warn/30 bg-warn/10 px-3.5 py-2.5 text-xs text-warn">
                {models.waste_note}
              </p>
            )}
          </>
        ) : <p className="mt-3 text-sm">{models.detail}</p>}
      </section>

      {datasets && (
        <section className="card p-5">
          <h2 className="font-display text-[15px] font-bold">Dataset-backed models</h2>
          <p className="mt-1 text-xs text-muted">
            Optional modules trained on the public datasets named in the specification.
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {Object.values(datasets).map((d) => (
              <div key={d.model} className="rounded-lg border border-line bg-panel-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{d.model}</p>
                    <p className="mt-0.5 text-xs text-muted">{d.dataset}</p>
                  </div>
                  <Pill tone={d.trained ? "brand" : "warn"}>
                    {d.trained ? "Trained" : "Not trained"}
                  </Pill>
                </div>
                <p className="mt-3 text-xs text-muted">{d.supports}</p>

                {d.trained ? (
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    {d.holdout_auc !== undefined && (
                      <Metric label="Holdout AUC" value={d.holdout_auc} />)}
                    {d.defect_recall !== undefined && (
                      <Metric label="Defect recall" value={d.defect_recall} />)}
                    {d.defect_precision !== undefined && (
                      <Metric label="Defect precision" value={d.defect_precision} />)}
                    {d.patches !== undefined && (
                      <Metric label="Patches" value={d.patches.toLocaleString()} />)}
                    {d.source_images !== undefined && (
                      <Metric label="Source images" value={d.source_images} />)}
                    {d.test_accuracy !== undefined && (
                      <Metric label="Test accuracy" value={`${(d.test_accuracy * 100).toFixed(1)}%`} />)}
                    {d.train_samples !== undefined && (
                      <Metric label="Train samples" value={d.train_samples.toLocaleString()} />)}
                  </dl>
                ) : (
                  <p className="mt-3 rounded-lg border border-line bg-ground px-3 py-2 font-mono
                                text-[11px] text-muted">
                    {d.command}
                  </p>
                )}
                {d.split && <p className="mt-3 text-[11px] text-muted">{d.split}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {Object.keys(importance).length > 0 && (
        <Frame title="Waste classifier feature importance"
               subtitle="What the XGBoost model actually leans on" height={260}>
          <BarChart horizontal labels={Object.keys(importance).map((k) => k.replace(/_/g, " "))}
                    datasets={[{ label: "Importance", data: Object.values(importance) }]} />
        </Frame>
      )}

      <section>
        <h2 className="mb-3 font-display text-[15px] font-bold">Users</h2>
        <Table head={["Name", "Email", "Organisation", "Role", "Active"]}>
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-panel-2/60">
              <td className="td">{u.full_name}</td>
              <td className="td font-mono text-xs">{u.email}</td>
              <td className="td text-muted">{u.organisation || "—"}</td>
              <td className="td">{ROLE_LABEL[u.role]}</td>
              <td className="td">
                <Pill tone={u.is_active ? "brand" : "danger"}>{u.is_active ? "Active" : "Disabled"}</Pill>
              </td>
            </tr>
          ))}
        </Table>
      </section>

      <section>
        <h2 className="mb-1 font-display text-[15px] font-bold">Impact reference table</h2>
        <p className="mb-3 text-xs text-muted">
          The per-kilogram figures every environmental estimate is built from.
        </p>
        <Table head={["Material", "Recyclability", "CO₂ / kg", "Water / kg", "Compostable", "Chemical route"]}>
          {materials.map((m) => (
            <tr key={m.material} className="hover:bg-panel-2/60">
              <td className="td">{m.material}</td>
              <td className="td tnum">{(m.recyclability * 100).toFixed(0)}%</td>
              <td className="td tnum">{m.co2_kg_per_kg} kg</td>
              <td className="td tnum">{m.water_l_per_kg.toLocaleString()} L</td>
              <td className="td">{m.compostable ? "Yes" : "No"}</td>
              <td className="td">{m.chemical_route ? "Yes" : "No"}</td>
            </tr>
          ))}
        </Table>
      </section>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-0.5 font-semibold tnum">{value}</dd>
    </div>
  );
}
