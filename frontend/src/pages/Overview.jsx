import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import WeaveMeter from "../components/WeaveMeter.jsx";
import { BarChart, DoughnutChart, Frame, LineChart } from "../components/Charts.jsx";
import { Band, ErrorNote, Empty, Loading, StatCard, Table } from "../components/Ui.jsx";
import { Bolt, Box, Globe, Trend } from "../components/Icons.jsx";
import { api } from "../lib/api.js";

export default function Overview({ user }) {
  const [d, setD] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.summary(), api.composition(), api.trend(), api.opportunities(), api.esg()])
      .then(([summary, composition, trend, opportunities, esg]) =>
        setD({ summary, composition, trend, opportunities, esg }))
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorNote>{error}</ErrorNote>;
  if (!d) return <Loading label="Reading the register" />;

  const { summary, composition, trend, opportunities, esg } = d;

  if (summary.batches === 0) {
    return (
      <Empty>
        Nothing in the register yet.{" "}
        <Link className="text-brand hover:underline" to="/inventory">Register a batch</Link>{" "}
        or <Link className="text-brand hover:underline" to="/image-analysis">analyse an image</Link> to begin.
      </Empty>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Batches" value={summary.batches} icon={Box}
                  sub={`${summary.total_kg.toLocaleString()} kg registered`} />
        <StatCard label="Diversion rate" value={`${summary.diversion_rate.toFixed(0)}%`} icon={Trend}
                  tone="text-brand" sub={`${summary.diverted_kg.toLocaleString()} kg with a route`} />
        <StatCard label="CO₂ saved" value={`${(summary.co2_saved_kg / 1000).toFixed(1)} t`} icon={Globe}
                  sub={`${Math.round(summary.water_saved_litres / 1000).toLocaleString()} kL water saved`} />
        <StatCard label="Mean circularity" value={summary.mean_circularity.toFixed(0)} icon={Bolt}
                  sub={summary.awaiting_analysis > 0
                    ? `${summary.awaiting_analysis} batch(es) awaiting an image`
                    : "Every batch analysed"} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Frame title="Intake and diversion" subtitle="Registered vs diverted mass, last 8 weeks"
               height={280}>
          <LineChart
            labels={trend.map((t) => t.week)}
            datasets={[
              { label: "Registered (kg)", data: trend.map((t) => t.kg), color: "#60A5FA" },
              { label: "Diverted (kg)", data: trend.map((t) => t.diverted_kg), color: "#10B981" },
            ]}
          />
        </Frame>

        <section className="card flex flex-col items-center justify-center p-5">
          <WeaveMeter score={summary.mean_circularity} size={168} />
          <p className="mt-4 max-w-[240px] text-center text-xs text-muted">
            Circularity drawn as cloth — the weft fills in as the score rises, so a failing
            batch reads as something coming apart.
          </p>
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Frame title="Material mix" subtitle="By mass" height={240}>
          <DoughnutChart labels={composition.by_material.map((m) => m.label)}
                         values={composition.by_material.map((m) => m.kg)} />
        </Frame>
        <Frame title="Waste categories" subtitle="By mass" height={240}>
          <DoughnutChart labels={composition.by_waste_category.map((m) => m.label)}
                         values={composition.by_waste_category.map((m) => m.kg)} />
        </Frame>
        <Frame title="Recovery bands" subtitle="Batches per circularity band" height={240}>
          <BarChart horizontal
                    labels={composition.by_circularity_band.map((b) => b.label.replace(" Recovery Potential", ""))}
                    datasets={[{ label: "Batches", data: composition.by_circularity_band.map((b) => b.count) }]} />
        </Frame>
      </div>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-[15px] font-bold">
            {user.role === "textile_manufacturer" ? "Production waste worth recovering" : "Work queue"}
          </h2>
          <Link to="/recommendations" className="text-xs text-brand hover:underline">
            All recommendations →
          </Link>
        </div>
        <Table head={["Batch", "Material", "Mass", "Route", "Circularity", "Band", ""]}>
          {opportunities.map((r) => (
            <tr key={r.batch_id} className="hover:bg-panel-2/60">
              <td className="td font-mono text-xs">{r.batch_code}</td>
              <td className="td">{r.material}</td>
              <td className="td tnum">{r.quantity_kg.toLocaleString()} kg</td>
              <td className="td">{r.route}</td>
              <td className="td tnum font-semibold">{r.circularity_score.toFixed(0)}</td>
              <td className="td"><Band band={r.band} /></td>
              <td className="td text-right">
                <Link to={`/inventory/${r.batch_id}`} className="text-brand hover:underline">Open</Link>
              </td>
            </tr>
          ))}
        </Table>
      </section>

      {(user.role === "sustainability_manager" || user.role === "administrator") && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Landfill avoided" value={`${esg.landfill_avoided_kg.toLocaleString()} kg`} />
          <StatCard label="CO₂ saved" value={`${esg.co2_saved_tonnes} t`} />
          <StatCard label="Virgin fibre replaced" value={`${esg.virgin_fibre_replaced_kg.toLocaleString()} kg`} />
          <StatCard label="Hazardous batches" value={esg.hazardous_batches}
                    tone={esg.hazardous_batches > 0 ? "text-danger" : "text-ink"} />
        </div>
      )}
    </div>
  );
}
