import { useEffect, useState } from "react";
import { BarChart, DoughnutChart, Frame, LineChart, ScoreBar } from "../components/Charts.jsx";
import { Empty, ErrorNote, Loading, StatCard } from "../components/Ui.jsx";
import { Globe, Trend } from "../components/Icons.jsx";
import { api } from "../lib/api.js";

export default function Sustainability() {
  const [d, setD] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.esg(), api.trend(), api.composition(), api.summary()])
      .then(([esg, trend, composition, summary]) => setD({ esg, trend, composition, summary }))
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorNote>{error}</ErrorNote>;
  if (!d) return <Loading label="Compiling sustainability position" />;
  if (!d.summary.batches) return <Empty>Register and analyse a batch to see sustainability metrics.</Empty>;

  const { esg, trend, composition, summary } = d;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Waste diversion rate" value={`${esg.waste_diversion_rate}%`} icon={Trend}
                  tone="text-brand" sub={`Reporting period: ${esg.reporting_period}`} />
        <StatCard label="Landfill avoided" value={`${esg.landfill_avoided_kg.toLocaleString()} kg`} />
        <StatCard label="CO₂ saved" value={`${esg.co2_saved_tonnes} t`} icon={Globe} />
        <StatCard label="Hazardous batches" value={esg.hazardous_batches}
                  tone={esg.hazardous_batches > 0 ? "text-danger" : "text-ink"}
                  sub={esg.hazardous_batches > 0 ? "Hold for a licensed handler" : "None flagged"} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Frame title="Circularity trend" subtitle="Mean circularity score by week" height={280}>
          <LineChart labels={trend.map((t) => t.week)}
                     datasets={[{ label: "Mean circularity", data: trend.map((t) => t.mean_circularity) }]} />
        </Frame>
        <Frame title="Recovery routes" subtitle="Mass routed for recovery" height={280}>
          {esg.recovery_routes.length
            ? <DoughnutChart labels={esg.recovery_routes.map((r) => r.route)}
                             values={esg.recovery_routes.map((r) => r.kg)} />
            : <p className="text-sm text-muted">No routes assigned yet.</p>}
        </Frame>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <section className="card p-5">
          <h2 className="font-display text-[15px] font-bold">Circularity scoring model</h2>
          <p className="mt-1 text-xs text-muted">
            Facility-wide averages against the weights defined in the specification.
          </p>
          <div className="mt-4 space-y-3">
            <ScoreBar label="Material recyclability" value={summary.mean_circularity} weight={0.35} />
            <ScoreBar label="Material condition" value={summary.mean_circularity} weight={0.20} />
            <ScoreBar label="Reuse potential" value={summary.mean_circularity} weight={0.20} />
            <ScoreBar label="Environmental benefit" value={summary.mean_circularity} weight={0.15} />
            <ScoreBar label="Processing feasibility" value={summary.mean_circularity} weight={0.10} />
          </div>
          <p className="mt-4 text-xs text-muted">
            These bars show the facility mean, not a per-batch breakdown — open any batch for
            its own component scores.
          </p>
        </section>

        <Frame title="Circularity bands" subtitle="How batches distribute across recovery potential"
               height={280}>
          <BarChart horizontal
            labels={composition.by_circularity_band.map((b) => b.label.replace(" Recovery Potential", ""))}
            datasets={[{ label: "Batches", data: composition.by_circularity_band.map((b) => b.count) }]} />
        </Frame>
      </div>

      <section className="card p-5">
        <h2 className="font-display text-[15px] font-bold">ESG summary</h2>
        <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {[
            ["Reporting period", esg.reporting_period],
            ["Waste diversion rate", `${esg.waste_diversion_rate}%`],
            ["Landfill avoided", `${esg.landfill_avoided_kg.toLocaleString()} kg`],
            ["CO₂ saved", `${esg.co2_saved_tonnes} t`],
            ["Water saved", `${Math.round(esg.water_saved_kilolitres).toLocaleString()} kL`],
            ["Virgin fibre replaced", `${esg.virgin_fibre_replaced_kg.toLocaleString()} kg`],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-line py-2">
              <dt className="text-sm text-muted">{k}</dt>
              <dd className="text-sm font-semibold tnum">{v}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
