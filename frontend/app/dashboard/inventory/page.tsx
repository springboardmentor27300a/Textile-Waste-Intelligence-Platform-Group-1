"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Filter, Download, Edit2, Trash2, X, ChevronLeft, ChevronRight, Package } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

const FABRIC_TYPES = ["Cotton","Polyester","Wool","Silk","Linen","Denim","Nylon","Rayon","Acrylic","Mixed Fabric"];
const CONDITIONS = ["Good","Fair","Poor","Critical"];
const CLASSIFICATIONS = ["Recyclable","Reusable","Repairable","Upcyclable","Compostable","Hazardous Waste"];

const conditionBadge: Record<string, string> = {
  Good: "badge-green", Fair: "badge-blue", Poor: "badge-yellow", Critical: "badge-red"
};
const classBadge: Record<string, string> = {
  Recyclable: "badge-green", Reusable: "badge-blue", Repairable: "badge-yellow",
  Upcyclable: "badge-purple", Compostable: "badge-orange", "Hazardous Waste": "badge-red"
};

const EMPTY_FORM = {
  fabric_type: "Cotton", source: "", quantity_kg: "", color: "",
  condition: "Good", collection_date: "", remarks: "", classification: "Recyclable"
};

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filterFabric, setFilterFabric] = useState("");
  const [filterCondition, setFilterCondition] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<null | "add" | "edit">(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, per_page: 10 };
      if (search) params.search = search;
      if (filterFabric) params.fabric_type = filterFabric;
      if (filterCondition) params.condition = filterCondition;
      const res = await api.get("/inventory/", { params });
      setItems(res.data.items || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch {
      // Demo data fallback
      const demo = Array.from({length: 10}, (_, i) => ({
        id: i+1, waste_batch_id: `TW-${Math.random().toString(36).substr(2,8).toUpperCase()}`,
        fabric_type: FABRIC_TYPES[i % FABRIC_TYPES.length],
        source: ["Factory A","Warehouse B","Mill C"][i % 3],
        quantity_kg: Math.round(Math.random()*490+10),
        color: ["White","Black","Blue","Green","Grey"][i % 5],
        condition: CONDITIONS[i % CONDITIONS.length],
        classification: CLASSIFICATIONS[i % CLASSIFICATIONS.length],
        created_at: new Date(Date.now() - i * 86400000).toISOString()
      }));
      setItems(demo);
      setTotal(25); setPages(3);
    } finally { setLoading(false); }
  }, [page, search, filterFabric, filterCondition]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const openAdd = () => { setForm(EMPTY_FORM); setModal("add"); };
  const openEdit = (item: any) => {
    setEditingItem(item);
    setForm({ fabric_type: item.fabric_type, source: item.source, quantity_kg: item.quantity_kg,
      color: item.color || "", condition: item.condition, classification: item.classification || "Recyclable",
      collection_date: item.collection_date?.split("T")[0] || "", remarks: item.remarks || "" });
    setModal("edit");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, quantity_kg: parseFloat(form.quantity_kg) };
      if (modal === "add") {
        await api.post("/inventory/", payload);
        toast.success("Batch added successfully!");
      } else {
        await api.put(`/inventory/${editingItem.id}`, payload);
        toast.success("Batch updated!");
      }
      setModal(null);
      loadItems();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Error saving batch");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this inventory batch?")) return;
    try {
      await api.delete(`/inventory/${id}`);
      toast.success("Batch deleted");
      loadItems();
    } catch { toast.error("Delete failed"); }
  };

  const exportCSV = () => {
    const headers = ["Batch ID","Fabric Type","Source","Quantity (kg)","Color","Condition","Classification","Date"];
    const rows = items.map(i => [i.waste_batch_id,i.fabric_type,i.source,i.quantity_kg,i.color,i.condition,i.classification,i.created_at?.split("T")[0]]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "textile_inventory.csv"; a.click();
    toast.success("CSV exported!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Textile Inventory</h1>
          <p className="text-gray-400 text-sm">{total} total batches</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportCSV} className="btn-outline flex items-center gap-2 text-sm py-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm py-2">
            <Plus className="w-4 h-4" /> Add Batch
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Search className="w-4 h-4 text-gray-500" />
          <input className="bg-transparent text-sm text-gray-300 focus:outline-none flex-1 placeholder-gray-600"
            placeholder="Search batch ID, fabric, source..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select value={filterFabric} onChange={e => { setFilterFabric(e.target.value); setPage(1); }}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none">
          <option value="">All Fabrics</option>
          {FABRIC_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select value={filterCondition} onChange={e => { setFilterCondition(e.target.value); setPage(1); }}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none">
          <option value="">All Conditions</option>
          {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {(search || filterFabric || filterCondition) && (
          <button onClick={() => { setSearch(""); setFilterFabric(""); setFilterCondition(""); }}
            className="btn-ghost text-sm">Clear</button>
        )}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No inventory items found</p>
            <button onClick={openAdd} className="btn-primary mt-4 text-sm py-2">Add First Batch</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch ID</th><th>Fabric Type</th><th>Source</th>
                  <th>Qty (kg)</th><th>Color</th><th>Condition</th>
                  <th>Classification</th><th>Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                    <td><code className="text-primary-400 text-xs">{item.waste_batch_id}</code></td>
                    <td className="font-medium text-white">{item.fabric_type}</td>
                    <td>{item.source}</td>
                    <td className="font-bold text-white">{item.quantity_kg}</td>
                    <td>{item.color || "—"}</td>
                    <td><span className={conditionBadge[item.condition] || "badge"}>{item.condition}</span></td>
                    <td><span className={classBadge[item.classification] || "badge"}>{item.classification || "—"}</span></td>
                    <td className="text-xs">{item.created_at?.split("T")[0]}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-gray-400 hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
            <p className="text-sm text-gray-500">Page {page} of {pages} — {total} total</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                className="btn-ghost p-2 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              {Array.from({length: Math.min(5, pages)}, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${p === page ? "bg-primary-500 text-white" : "text-gray-400 hover:bg-white/10"}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page === pages}
                className="btn-ghost p-2 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="glass-card w-full max-w-2xl p-8 relative max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <button onClick={() => setModal(null)} className="absolute top-4 right-4 btn-ghost p-2">
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-white mb-6">{modal === "add" ? "Add New Batch" : "Edit Batch"}</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Fabric Type *</label>
                  <select value={form.fabric_type} onChange={e => setForm({...form, fabric_type: e.target.value})}
                    className="input-field text-sm">
                    {FABRIC_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Source *</label>
                  <input value={form.source} onChange={e => setForm({...form, source: e.target.value})}
                    className="input-field text-sm" placeholder="Factory / Warehouse" required />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Quantity (kg) *</label>
                  <input type="number" step="0.01" value={form.quantity_kg} onChange={e => setForm({...form, quantity_kg: e.target.value})}
                    className="input-field text-sm" placeholder="0.00" required />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Color</label>
                  <input value={form.color} onChange={e => setForm({...form, color: e.target.value})}
                    className="input-field text-sm" placeholder="White, Black..." />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Condition *</label>
                  <select value={form.condition} onChange={e => setForm({...form, condition: e.target.value})}
                    className="input-field text-sm">
                    {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Classification</label>
                  <select value={form.classification} onChange={e => setForm({...form, classification: e.target.value})}
                    className="input-field text-sm">
                    {CLASSIFICATIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Collection Date</label>
                  <input type="date" value={form.collection_date} onChange={e => setForm({...form, collection_date: e.target.value})}
                    className="input-field text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-400 mb-1.5">Remarks</label>
                  <textarea value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})}
                    className="input-field text-sm resize-none" rows={3} placeholder="Additional notes..." />
                </div>
                <div className="col-span-2 flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setModal(null)} className="btn-outline text-sm py-2">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary text-sm py-2 px-8">
                    {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (modal === "add" ? "Add Batch" : "Save Changes")}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
