import { useEffect, useState } from "react";
import { BarChart, Frame } from "../components/Charts.jsx";
import { Empty, ErrorNote, Loading, StatCard, Table } from "../components/Ui.jsx";
import { Globe, Leaf } from "../components/Icons.jsx";
import { api } from "../lib/api.js";

export default function Environmental() {
  const [d, setD] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.insightEnvironmental().then(setD).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorNote>{error}</ErrorNote>;
  if (!d) return <Loading label="Calculating impact" />;
  if (!d.by_material.length) return <Empty>Analyse a batch to see its environmental impact.</Empty>;

  const t = d.totals;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="CO₂ saved" value={`${(t.co2_saved_kg / 1000).toFixed(2)} t`} icon={Globe}
                  tone="text-brand" sub={`≈ ${t.trees_equivalent.toLocaleString()} tree-years`} />
        <StatCard label="Water saved" value={`${Math.round(t.water_saved_litres / 1000).toLocaleString()} kL`}
                  sub={`≈ ${t.households_water_days.toLocaleString()} household-days`} />
        <StatCard label="Landfill avoided" value={`${t.landfill_avoided_kg.toLocaleString()} kg`} icon={Leaf}
                  sub={`of ${t.registered_kg.toLocaleString()} kg registered`} />
        <StatCard label="Virgin fibre replaced" value={`${t.virgin_fibre_replaced_kg.toLocaleString()} kg`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Frame title="CO₂ saved by material" subtitle="Kilograms of CO₂e avoided" height={280}>
          <BarChart horizontal labels={d.by_material.map((m) => m.material)}
                    datasets={[{ label: "kg CO₂e", data: d.by_material.map((m) => m.co2_saved_kg) }]} />
        </Frame>
        <Frame title="Water saved by material" subtitle="Litres of virgin-production water avoided"
               height={280}>
          <BarChart horizontal labels={d.by_material.map((m) => m.material)}
                    datasets={[{ label: "litres", data: d.by_material.map((m) => m.water_saved_litres),
                                 color: "#60A5FA" }]} />
        </Frame>
      </div>

      <Frame title="Diverted vs registered mass" subtitle="How much of each material actually gets recovered"
             height={300}>
        <BarChart labels={d.by_material.map((m) => m.material)}
          datasets={[
            { label: "Registered (kg)", data: d.by_material.map((m) => m.kg), color: "#7C9CBF" },
            { label: "Diverted (kg)", data: d.by_material.map((m) => m.diverted_kg), color: "#10B981" },
          ]} />
      </Frame>

      <section>
        <h2 className="mb-3 font-display text-[15px] font-bold">Impact by material</h2>
        <Table head={["Material", "Registered", "Diverted", "CO₂ saved", "Water saved", "Recyclability"]}>
          {d.by_material.map((m) => (
            <tr key={m.material} className="hover:bg-panel-2/60">
              <td className="td font-medium">{m.material}</td>
              <td className="td tnum">{m.kg.toLocaleString()} kg</td>
              <td className="td tnum">{m.diverted_kg.toLocaleString()} kg</td>
              <td className="td tnum text-brand">{m.co2_saved_kg.toLocaleString()} kg</td>
              <td className="td tnum">{Math.round(m.water_saved_litres).toLocaleString()} L</td>
              <td className="td tnum">{(m.recyclability * 100).toFixed(0)}%</td>
            </tr>
          ))}
        </Table>
      </section>

      <p className="text-xs text-muted">{d.basis}</p>
    </div>
  );
}
