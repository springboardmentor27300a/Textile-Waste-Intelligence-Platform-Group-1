import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Inventory() {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [fabricFilter, setFabricFilter] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fabric_type: "cotton",
    fabric_blend_notes: "",
    source: "",
    source_type: "post_consumer",
    quantity_kg: 100,
    color: "Blue",
    condition: "worn",
    collection_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const loadBatches = async () => {
    setLoading(true);
    try {
      const data = await api.listBatches();
      setBatches(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.createBatch({
        ...formData,
        quantity_kg: parseFloat(formData.quantity_kg),
      });
      setShowModal(false);
      loadBatches();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDeleteBatch = async (id) => {
    if (!confirm("Are you sure you want to delete this waste batch?")) return;
    try {
      await api.deleteBatch(id);
      setBatches((prev) => prev.filter((b) => b.id !== id));
    } catch (e) {
      setError(e.message);
    }
  };

  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.batch_code.toLowerCase().includes(search.toLowerCase()) ||
      b.source.toLowerCase().includes(search.toLowerCase()) ||
      b.fabric_type.toLowerCase().includes(search.toLowerCase());
    const matchesFabric = !fabricFilter || b.fabric_type === fabricFilter;
    return matchesSearch && matchesFabric;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Textile Inventory & Waste Batches</h1>
          <p className="text-sm text-slate-400">Track and manage registered textile waste streams and sources.</p>
        </div>

        {(user.role === "administrator" || user.role === "recycling_facility_operator" || user.role === "textile_manufacturer") && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition shadow-lg shadow-emerald-500/20"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Register Waste Batch
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by Batch Code, Source, or Fabric..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <select
          value={fabricFilter}
          onChange={(e) => setFabricFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="">All Fabric Types</option>
          <option value="denim">Denim</option>
          <option value="cotton">Cotton</option>
          <option value="polyester">Polyester</option>
          <option value="wool">Wool</option>
          <option value="silk">Silk</option>
          <option value="linen">Linen</option>
          <option value="nylon">Nylon</option>
          <option value="rayon">Rayon</option>
          <option value="acrylic">Acrylic</option>
          <option value="mixed_fabrics">Mixed Fabrics</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl border border-slate-800 p-6">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading inventory batches...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-3">Batch ID</th>
                  <th className="p-3">Fabric Material</th>
                  <th className="p-3">Source & Location</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Condition</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredBatches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/30">
                    <td className="p-3 font-semibold text-emerald-400">{b.batch_code}</td>
                    <td className="p-3 capitalize font-medium text-white">{b.fabric_type}</td>
                    <td className="p-3 text-slate-300">{b.source}</td>
                    <td className="p-3 font-medium text-slate-100">{b.quantity_kg} kg</td>
                    <td className="p-3 capitalize text-slate-400">{b.condition.replace(/_/g, " ")}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-200 capitalize">
                        {b.category.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          b.status === "classified"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <Link
                        to={`/inventory/${b.id}`}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
                      >
                        Inspect
                      </Link>
                      {user.role === "administrator" && (
                        <button
                          onClick={() => handleDeleteBatch(b.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card bg-slate-900 rounded-2xl border border-slate-700 max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">Register Waste Batch</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Declared Fabric Material</label>
                <select
                  value={formData.fabric_type}
                  onChange={(e) => setFormData({ ...formData, fabric_type: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200"
                >
                  <option value="denim">Denim</option>
                  <option value="cotton">Cotton</option>
                  <option value="polyester">Polyester</option>
                  <option value="wool">Wool</option>
                  <option value="silk">Silk</option>
                  <option value="linen">Linen</option>
                  <option value="nylon">Nylon</option>
                  <option value="rayon">Rayon</option>
                  <option value="acrylic">Acrylic</option>
                  <option value="mixed_fabrics">Mixed Fabrics</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Waste Source / Origin</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bangalore Cutting Floor Unit 2"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Quantity (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={formData.quantity_kg}
                    onChange={(e) => setFormData({ ...formData, quantity_kg: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200"
                  >
                    <option value="new_surplus">New Surplus</option>
                    <option value="lightly_worn">Lightly Worn</option>
                    <option value="worn">Worn</option>
                    <option value="damaged">Damaged</option>
                    <option value="contaminated">Contaminated</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                >
                  Register Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
