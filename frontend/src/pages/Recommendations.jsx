import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart, Frame, PolarChart } from "../components/Charts.jsx";
import { Band, Empty, ErrorNote, Loading, Pill, StatCard } from "../components/Ui.jsx";
import { Sparkle } from "../components/Icons.jsx";
import { api } from "../lib/api.js";

export default function Recommendations() {
  const [d, setD] = useState(null);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    api.insightRecommendations().then(setD).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorNote>{error}</ErrorNote>;
  if (!d) return <Loading label="Building recommendations" />;
  if (!d.rows.length) return <Empty>No analysed batches yet, so there is nothing to recommend.</Empty>;

  const top = d.routes[0];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Distinct routes in use" value={d.routes.length} icon={Sparkle} />
        <StatCard label="Leading route" value={top.route} tone="text-brand"
                  sub={`${top.kg.toLocaleString()} kg across ${top.batches} batch(es)`} />
        <StatCard label="Mass with a route"
                  value={`${d.routes.reduce((s, r) => s + r.kg, 0).toLocaleString()} kg`} />
        <StatCard label="CO₂ across routes"
                  value={`${(d.routes.reduce((s, r) => s + r.co2_saved_kg, 0) / 1000).toFixed(1)} t`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Frame title="Mass by recommended route" subtitle="Where the material should go" height={280}>
          <BarChart horizontal labels={d.routes.map((r) => r.route)}
                    datasets={[{ label: "kg", data: d.routes.map((r) => r.kg) }]} />
        </Frame>
        <Frame title="Route fit" subtitle="Mean fit score per route" height={280}>
          <PolarChart labels={d.routes.map((r) => r.route)} values={d.routes.map((r) => r.mean_fit)} />
        </Frame>
      </div>

      <section>
        <h2 className="mb-3 font-display text-[15px] font-bold">Batch recommendations</h2>
        <div className="space-y-3">
          {d.rows.map((r) => {
            const open = openId === r.batch_id;
            return (
              <article key={r.batch_id} className="card p-4">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="font-mono text-xs text-muted">{r.batch_code}</span>
                  <span className="font-semibold">{r.material}</span>
                  <span className="text-sm text-muted tnum">{r.quantity_kg.toLocaleString()} kg</span>
                  <Pill>{r.waste_category}</Pill>
                  <Band band={r.band} />
                  <span className="ml-auto flex items-center gap-3">
                    <Pill tone="brand">{r.options[0].route}</Pill>
                    <button onClick={() => setOpenId(open ? null : r.batch_id)}
                            className="text-xs text-brand hover:underline">
                      {open ? "Hide options" : `${r.options.length} options`}
                    </button>
                    <Link to={`/inventory/${r.batch_id}`}
                          className="text-xs text-muted hover:text-ink">Open</Link>
                  </span>
                </div>

                {open && (
                  <ol className="mt-4 grid gap-3 md:grid-cols-2">
                    {r.options.map((o) => (
                      <li key={o.route} className="rounded-lg border border-line bg-panel-2 p-3.5">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="font-semibold">
                            <span className="mr-2 font-mono text-xs text-muted">{o.rank}</span>{o.route}
                          </span>
                          <span className="font-mono text-xs tnum text-brand">{o.fit.toFixed(0)} fit</span>
                        </div>
                        <p className="mt-1.5 text-sm text-muted">{o.rationale}</p>
                        {o.note && <p className="mt-1.5 text-xs text-muted/80">{o.note}</p>}
                      </li>
                    ))}
                  </ol>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
