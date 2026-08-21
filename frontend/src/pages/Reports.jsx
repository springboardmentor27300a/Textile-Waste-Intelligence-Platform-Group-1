import { useEffect, useState } from "react";
import { DoughnutChart, Frame } from "../components/Charts.jsx";
import { Empty, ErrorNote, Loading, StatCard, Table } from "../components/Ui.jsx";
import { Download, FileText } from "../components/Icons.jsx";
import { api } from "../lib/api.js";

// `slug` maps straight to the backend route: GET /api/reports/pdf/{slug}
const REPORT_TYPES = [
  { slug: "classification", title: "Waste classification report",
    blurb: "Material and waste class per batch, with confidence." },
  { slug: "recycling", title: "Recycling report",
    blurb: "Recommended route and fit score per batch." },
  { slug: "sustainability", title: "Sustainability report",
    blurb: "Diversion rate, circularity and ESG position." },
  { slug: "environmental", title: "Environmental impact report",
    blurb: "CO₂, water, landfill and virgin-fibre savings." },
  { slug: "circular-economy", title: "Circular economy report",
    blurb: "Mass by recovery route across the facility." },
];

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const [esg, setEsg] = useState(null);
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");       // "pdf" | "excel" — the combined exports
  const [singleBusy, setSingleBusy] = useState(""); // slug of the individual report downloading

  useEffect(() => {
    api.esg().then(setEsg).catch((e) => setError(e.message));
    api.insightRecommendations().then((d) => setRows(d.rows)).catch(() => setRows([]));
  }, []);

  // Top button: downloads every section together as one PDF/Excel file.
  const download = async (kind) => {
    setBusy(kind);
    setError("");
    try {
      const blob = await api.reportBlob(kind);
      saveBlob(blob, `textile-waste-report.${kind === "pdf" ? "pdf" : "xlsx"}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  };

  // Report list: downloads just that one report as its own PDF.
  const downloadSingle = async (slug) => {
    setSingleBusy(slug);
    setError("");
    try {
      const blob = await api.singleReportBlob(slug);
      saveBlob(blob, `${slug}-report.pdf`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSingleBusy("");
    }
  };

  if (error && !esg) return <ErrorNote>{error}</ErrorNote>;
  if (!esg) return <Loading label="Preparing reports" />;

  return (
    <div className="space-y-6">
      <section className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-[15px] font-bold">Export the full register</h2>
            <p className="mt-1 max-w-xl text-sm text-muted">
              Both exports cover every batch you can see. The PDF carries the ESG headline
              and the batch register; the workbook adds a second sheet with the
              sustainability block. Figures are recalculated at download time.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="btn-primary" onClick={() => download("pdf")} disabled={busy === "pdf"}>
              <Download className="h-4 w-4" />
              {busy === "pdf" ? "Building PDF…" : "Download report (PDF)"}
            </button>
            <button className="btn-quiet" onClick={() => download("excel")} disabled={busy === "excel"}>
              <Download className="h-4 w-4" />
              {busy === "excel" ? "Building workbook…" : "Download Excel sheet"}
            </button>
          </div>
        </div>
        {error && <div className="mt-4"><ErrorNote>{error}</ErrorNote></div>}
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Diversion rate" value={`${esg.waste_diversion_rate}%`} icon={FileText}
                  tone="text-brand" sub={esg.reporting_period} />
        <StatCard label="CO₂ saved" value={`${esg.co2_saved_tonnes} t`} />
        <StatCard label="Water saved"
                  value={`${Math.round(esg.water_saved_kilolitres).toLocaleString()} kL`} />
        <StatCard label="Hazardous batches" value={esg.hazardous_batches}
                  tone={esg.hazardous_batches > 0 ? "text-danger" : "text-ink"} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="font-display text-[15px] font-bold">What each export contains</h2>
          <p className="mt-1 text-xs text-muted">Click a report to download just that one as a PDF.</p>
          <ul className="mt-4 space-y-3">
            {REPORT_TYPES.map(({ slug, title, blurb }) => (
              <li key={slug}>
                <button
                  type="button"
                  onClick={() => downloadSingle(slug)}
                  disabled={singleBusy === slug}
                  className="group flex w-full items-center gap-3 rounded-lg border-b border-line
                             pb-3 pt-1 text-left last:border-0 last:pb-0 hover:bg-panel-2/60
                             disabled:cursor-wait disabled:opacity-70"
                >
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg
                                   bg-brand/12 text-brand"><FileText className="h-4 w-4" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{title}</span>
                    <span className="block text-xs text-muted">
                      {singleBusy === slug ? "Building PDF…" : blurb}
                    </span>
                  </span>
                  <Download className="h-4 w-4 shrink-0 text-muted transition-colors
                                        group-hover:text-brand" />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <Frame title="Mass by recovery route" subtitle="What the circular economy report summarises"
               height={280}>
          {esg.recovery_routes.length
            ? <DoughnutChart labels={esg.recovery_routes.map((r) => r.route)}
                             values={esg.recovery_routes.map((r) => r.kg)} />
            : <p className="text-sm text-muted">No analysed batches in this period yet.</p>}
        </Frame>
      </div>

      <section>
        <h2 className="mb-3 font-display text-[15px] font-bold">Report preview</h2>
        {rows === null ? <Loading /> : rows.length === 0 ? (
          <Empty>Nothing to export yet — register and analyse a batch first.</Empty>
        ) : (
          <Table head={["Batch", "Material", "Mass", "Waste class", "Route", "Circularity"]}>
            {rows.slice(0, 12).map((r) => (
              <tr key={r.batch_id} className="hover:bg-panel-2/60">
                <td className="td font-mono text-xs">{r.batch_code}</td>
                <td className="td">{r.material}</td>
                <td className="td tnum">{r.quantity_kg.toLocaleString()} kg</td>
                <td className="td">{r.waste_category}</td>
                <td className="td">{r.options[0]?.route || "—"}</td>
                <td className="td tnum font-semibold">{r.circularity_score.toFixed(0)}</td>
              </tr>
            ))}
          </Table>
        )}
      </section>
    </div>
  );
}