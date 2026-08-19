import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Search, Filter, Download, 
  Trash2, Edit3, Eye, Sparkles, FileSpreadsheet, 
  X, Check, ChevronLeft, ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { NavigationPage } from '../types/client';

interface WasteInventoryPageProps {
  onNavigate: (page: NavigationPage) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const WasteInventoryPage: React.FC<WasteInventoryPageProps> = ({ onNavigate, onToast }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [viewingItem, setViewingItem] = useState<any | null>(null);

  // Add/Edit Form state
  const [formData, setFormData] = useState({
    batchId: 'BATCH-2026-101',
    materialName: '',
    quantityKg: 1000,
    category: 'Recyclable',
    condition: 'Grade A (Pristine)',
    storageLocation: 'Warehouse Bay A1',
    sourceSupplier: 'Milano EcoTextiles Mill #4',
    recyclabilityScore: 92,
    notes: ''
  });

  useEffect(() => {
    loadInventory();
  }, [search, categoryFilter, statusFilter]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await api.getInventory({
        search: search || undefined,
        category: categoryFilter || undefined,
        status: statusFilter || undefined
      });
      setItems(data);
    } catch (err: any) {
      onToast('Error loading inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.materialName) {
      onToast('Material name is required', 'error');
      return;
    }
    try {
      await api.addInventoryItem(formData);
      onToast('Inventory item added successfully', 'success');
      setShowAddModal(false);
      loadInventory();
    } catch (err: any) {
      onToast('Failed to add inventory item', 'error');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      await api.updateInventoryItem(editingItem.id, formData);
      onToast('Inventory item updated successfully', 'success');
      setEditingItem(null);
      loadInventory();
    } catch (err: any) {
      onToast('Failed to update inventory item', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this inventory item?')) return;
    try {
      await api.deleteInventoryItem(id);
      onToast('Item deleted successfully', 'success');
      loadInventory();
    } catch (err: any) {
      onToast('Failed to delete item', 'error');
    }
  };

  const handleExportExcel = async () => {
    try {
      onToast('Generating Excel export...', 'info');
      await api.downloadExcelReport('inventory', 'Waste Inventory Catalog');
      onToast('Excel export downloaded', 'success');
    } catch (err) {
      onToast('Export failed', 'error');
    }
  };

  const totalPages = Math.ceil(items.length / pageSize) || 1;
  const paginatedItems = items.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. EDITORIAL HEADER */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-semibold text-[#004d3d] uppercase tracking-wider">
            Module 3 • Material Repository & Tracking
          </span>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight flex items-center gap-3 mt-0.5">
            <span>Waste Material Inventory</span>
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Real-time cataloging, storage bay routing, condition grades, and recyclability scores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold rounded-full border border-stone-300 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#004d3d]" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => {
              setFormData({
                batchId: 'BATCH-2026-101',
                materialName: '',
                quantityKg: 1000,
                category: 'Recyclable',
                condition: 'Grade A (Pristine)',
                storageLocation: 'Warehouse Bay A1',
                sourceSupplier: 'Milano EcoTextiles Mill #4',
                recyclabilityScore: 92,
                notes: ''
              });
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-5 py-2 bg-[#004d3d] hover:bg-[#00382c] text-white font-semibold text-xs rounded-full shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Waste Item</span>
          </button>
        </div>
      </div>

      {/* 2. SEARCH & FILTERS BAR */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search material or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-full pl-9 pr-4 py-2 text-xs text-stone-900 placeholder-stone-400 focus:ring-2 focus:ring-[#004d3d] outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-stone-50 border border-stone-200 text-stone-800 text-xs rounded-full px-4 py-2 focus:ring-2 focus:ring-[#004d3d] outline-hidden font-medium"
          >
            <option value="">All Categories</option>
            <option value="Recyclable">Recyclable</option>
            <option value="Reusable">Reusable</option>
            <option value="Upcyclable">Upcyclable</option>
            <option value="Repairable">Repairable</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-stone-50 border border-stone-200 text-stone-800 text-xs rounded-full px-4 py-2 focus:ring-2 focus:ring-[#004d3d] outline-hidden font-medium"
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
            <option value="In Processing">In Processing</option>
            <option value="Recycled">Recycled</option>
          </select>
        </div>
      </div>

      {/* 3. DATA TABLE */}
      <div className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-stone-500">Loading inventory data...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-500 space-y-2">
            <Package className="w-8 h-8 text-stone-300 mx-auto" />
            <p>No inventory items found matching current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="text-[11px] font-mono uppercase bg-stone-50 text-stone-600 border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">INV ID</th>
                  <th className="py-3.5 px-4 font-semibold">Batch ID</th>
                  <th className="py-3.5 px-4 font-semibold">Material Name</th>
                  <th className="py-3.5 px-4 font-semibold">Quantity</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Condition</th>
                  <th className="py-3.5 px-4 font-semibold">Recyclability</th>
                  <th className="py-3.5 px-4 font-semibold">Location</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-sans">
                {paginatedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-stone-900 font-semibold">{item.id}</td>
                    <td className="py-3.5 px-4 font-mono text-[#004d3d] font-medium">{item.batchId}</td>
                    <td className="py-3.5 px-4 font-semibold text-stone-900">{item.materialName}</td>
                    <td className="py-3.5 px-4 font-mono text-stone-800">{item.quantityKg} kg</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-[#004d3d] border border-emerald-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">{item.condition}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#004d3d]">{item.recyclabilityScore}%</td>
                    <td className="py-3.5 px-4 text-stone-500">{item.storageLocation}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                        item.status === 'Available' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                        item.status === 'Reserved' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingItem(item)}
                          className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setFormData({
                              batchId: item.batchId,
                              materialName: item.materialName,
                              quantityKg: item.quantityKg,
                              category: item.category,
                              condition: item.condition,
                              storageLocation: item.storageLocation,
                              sourceSupplier: item.sourceSupplier,
                              recyclabilityScore: item.recyclabilityScore,
                              notes: item.notes || ''
                            });
                          }}
                          className="p-1.5 text-stone-400 hover:text-[#004d3d] hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500 font-mono">
          <div>
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, items.length)} of {items.length} materials
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-1.5 rounded-lg border border-stone-200 hover:bg-white disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-1.5 rounded-lg border border-stone-200 hover:bg-white disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {(showAddModal || editingItem) && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 w-full max-w-lg rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-serif-display font-bold text-stone-900 text-lg">
                {editingItem ? 'Edit Inventory Item' : 'Add New Waste Material'}
              </h3>
              <button onClick={() => { setShowAddModal(false); setEditingItem(null); }} className="text-stone-400 hover:text-stone-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingItem ? handleUpdate : handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-700 font-semibold block mb-1">Batch Identifier:</label>
                  <input
                    type="text"
                    value={formData.batchId}
                    onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-900 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-stone-700 font-semibold block mb-1">Quantity (kg):</label>
                  <input
                    type="number"
                    value={formData.quantityKg}
                    onChange={(e) => setFormData({ ...formData, quantityKg: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-900 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-700 font-semibold block mb-1">Material Name & Blend:</label>
                <input
                  type="text"
                  placeholder="e.g. 100% Recycled Cotton Indigo Twill"
                  value={formData.materialName}
                  onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-700 font-semibold block mb-1">Waste Category:</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-900"
                  >
                    <option value="Recyclable">Recyclable</option>
                    <option value="Reusable">Reusable</option>
                    <option value="Upcyclable">Upcyclable</option>
                    <option value="Repairable">Repairable</option>
                  </select>
                </div>
                <div>
                  <label className="text-stone-700 font-semibold block mb-1">Condition Grade:</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-900"
                  >
                    <option value="Grade A (Pristine)">Grade A (Pristine)</option>
                    <option value="Grade B (Minor Wear)">Grade B (Minor Wear)</option>
                    <option value="Grade C (Post-Consumer Damaged)">Grade C (Post-Consumer Damaged)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-700 font-semibold block mb-1">Storage Location / Bay:</label>
                  <input
                    type="text"
                    value={formData.storageLocation}
                    onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-900"
                  />
                </div>
                <div>
                  <label className="text-stone-700 font-semibold block mb-1">Recyclability Score (%):</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.recyclabilityScore}
                    onChange={(e) => setFormData({ ...formData, recyclabilityScore: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-700 font-semibold block mb-1">Source Supplier / Node:</label>
                <input
                  type="text"
                  value={formData.sourceSupplier}
                  onChange={(e) => setFormData({ ...formData, sourceSupplier: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-900"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingItem(null); }}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-full cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#004d3d] hover:bg-[#00382c] text-white text-xs font-semibold rounded-full shadow-sm cursor-pointer"
                >
                  {editingItem ? 'Save Updates' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {viewingItem && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#004d3d] font-bold">Inventory Record</span>
                <h3 className="font-serif-display font-bold text-stone-900 text-lg">{viewingItem.materialName}</h3>
              </div>
              <button onClick={() => setViewingItem(null)} className="text-stone-400 hover:text-stone-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <div>
                  <span className="text-stone-500 text-[10px] block font-mono uppercase">Inventory ID</span>
                  <span className="font-mono font-bold text-stone-900">{viewingItem.id}</span>
                </div>
                <div>
                  <span className="text-stone-500 text-[10px] block font-mono uppercase">Batch Reference</span>
                  <span className="font-mono font-bold text-[#004d3d]">{viewingItem.batchId}</span>
                </div>
                <div>
                  <span className="text-stone-500 text-[10px] block font-mono uppercase">Quantity</span>
                  <span className="font-mono font-bold text-stone-900">{viewingItem.quantityKg} kg</span>
                </div>
                <div>
                  <span className="text-stone-500 text-[10px] block font-mono uppercase">Recyclability</span>
                  <span className="font-mono font-bold text-[#004d3d]">{viewingItem.recyclabilityScore}%</span>
                </div>
              </div>

              <div className="space-y-1.5 text-stone-600">
                <div className="flex justify-between border-b border-stone-100 pb-1">
                  <span>Category:</span>
                  <span className="font-semibold text-stone-900">{viewingItem.category}</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 pb-1">
                  <span>Condition:</span>
                  <span className="font-semibold text-stone-900">{viewingItem.condition}</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 pb-1">
                  <span>Storage Bay:</span>
                  <span className="font-semibold text-stone-900">{viewingItem.storageLocation}</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 pb-1">
                  <span>Supplier:</span>
                  <span className="font-semibold text-stone-900">{viewingItem.sourceSupplier}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setViewingItem(null)}
                className="px-5 py-2 bg-[#004d3d] text-white text-xs font-semibold rounded-full cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
