import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Band, Empty, ErrorNote, Loading, Pill, StatCard, Table } from "../components/Ui.jsx";
import { Box, Trash } from "../components/Icons.jsx";
import { api } from "../lib/api.js";

const CONDITIONS = ["excellent", "good", "fair", "poor", "unusable"];
const STATUSES = ["registered", "analysed", "scheduled", "processed", "disposed"];
const EMPTY = { fabric_type: "", source: "", quantity_kg: "", condition: "good", notes: "" };

export default function Inventory() {
  const [params] = useSearchParams();
  const [batches, setBatches] = useState(null);
  const [search, setSearch] = useState(params.get("q") || "");
  const [statusFilter, setStatusFilter] = useState("all");
  const [form, setForm] = useState(EMPTY);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const load = () => api.batches().then(setBatches).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const register = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await api.createBatch({
        ...form,
        fabric_type: form.fabric_type || "Unknown",
        quantity_kg: Number(form.quantity_kg) || 0,
      });
      setForm(EMPTY);
      setOpen(false);
      load();
    } catch (err) { setError(err.message); }
  };

  const remove = async (batch) => {
    if (!window.confirm(`Delete ${batch.batch_code}? This also removes its analyses.`)) return;
    try { await api.deleteBatch(batch.id); load(); } catch (err) { setError(err.message); }
  };

  if (error && !batches) return <ErrorNote>{error}</ErrorNote>;
  if (batches === null) return <Loading label="Loading register" />;

  const visible = batches.filter((b) => {
    const matchesSearch = !search
      || `${b.batch_code} ${b.source} ${b.fabric_type}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalKg = batches.reduce((s, b) => s + b.quantity_kg, 0);
  const analysed = batches.filter((b) => b.latest_analysis).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Batches" value={batches.length} icon={Box} />
        <StatCard label="Total mass" value={`${totalKg.toLocaleString()} kg`} />
        <StatCard label="Analysed" value={analysed} tone="text-brand"
                  sub={`${batches.length - analysed} awaiting an image`} />
        <StatCard label="Showing" value={visible.length} sub="After search and filters" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input className="field max-w-xs" placeholder="Search code, source or fabric"
               aria-label="Search batches" value={search}
               onChange={(e) => setSearch(e.target.value)} />
        <select className="field max-w-[180px]" aria-label="Filter by status"
                value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn-primary ml-auto" onClick={() => setOpen(!open)}>
          {open ? "Cancel" : "Register batch"}
        </button>
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}

      {open && (
        <form onSubmit={register} className="card grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="label" htmlFor="fabric">Fabric type</label>
            <input id="fabric" className="field" value={form.fabric_type}
                   placeholder="e.g. Denim offcuts"
                   onChange={(e) => setForm({ ...form, fabric_type: e.target.value })} />
            <p className="mt-1 text-xs text-muted">Leave blank to let the image set it.</p>
          </div>
          <div>
            <label className="label" htmlFor="source">Source</label>
            <input id="source" className="field" value={form.source}
                   placeholder="Mill, collection round, returns"
                   onChange={(e) => setForm({ ...form, source: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="qty">Quantity (kg)</label>
            <input id="qty" className="field" type="number" min="0" step="0.1" required
                   value={form.quantity_kg}
                   onChange={(e) => setForm({ ...form, quantity_kg: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="condition">Condition</label>
            <select id="condition" className="field" value={form.condition}
                    onChange={(e) => setForm({ ...form, condition: e.target.value })}>
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="notes">Notes</label>
            <input id="notes" className="field" value={form.notes}
                   onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <button className="btn-primary" type="submit">Register batch</button>
          </div>
        </form>
      )}

      {visible.length === 0 ? (
        <Empty>{search || statusFilter !== "all"
          ? "No batch matches those filters."
          : "The register is empty. Register a batch to start."}</Empty>
      ) : (
        <Table head={["Batch", "Fabric", "Source", "Mass", "Condition", "Reading", "Status", ""]}>
          {visible.map((b) => {
            const a = b.latest_analysis;
            return (
              <tr key={b.id} className="hover:bg-panel-2/60">
                <td className="td font-mono text-xs">{b.batch_code}</td>
                <td className="td">{b.fabric_type}</td>
                <td className="td text-muted">{b.source || "—"}</td>
                <td className="td tnum">{b.quantity_kg.toLocaleString()} kg</td>
                <td className="td capitalize">{b.condition}</td>
                <td className="td">
                  {a ? (
                    <span className="flex flex-wrap items-center gap-2">
                      <span>{a.material}</span>
                      <span className="tnum font-semibold">{a.circularity_score.toFixed(0)}</span>
                      <Band band={a.circularity_band} />
                    </span>
                  ) : <span className="text-muted">Awaiting image</span>}
                </td>
                <td className="td"><Pill tone={b.status === "processed" ? "brand" : "muted"}>
                  {b.status}</Pill></td>
                <td className="td">
                  <div className="flex items-center justify-end gap-3">
                    <Link to={`/inventory/${b.id}`} className="text-brand hover:underline">Open</Link>
                    <button onClick={() => remove(b)} aria-label={`Delete ${b.batch_code}`}
                            className="text-muted hover:text-danger"><Trash className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            );
          })}
        </Table>
      )}
    </div>
  );
}
