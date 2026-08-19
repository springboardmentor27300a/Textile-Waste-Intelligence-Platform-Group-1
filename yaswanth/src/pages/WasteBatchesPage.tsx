import React, { useState, useEffect } from 'react';
import { 
  Layers, Plus, Search, Trash2, Eye, Sparkles, 
  ArrowRight, Check, Clock, CheckCircle2, AlertCircle, X 
} from 'lucide-react';
import { api } from '../services/api';
import { BatchStatus } from '../../server/types';
import { NavigationPage } from '../types/client';

interface WasteBatchesPageProps {
  onNavigate: (page: NavigationPage) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const BATCH_PIPELINE: BatchStatus[] = [
  'Collected',
  'Awaiting Analysis',
  'Analyzed',
  'Approved',
  'Processing',
  'Completed'
];

export const WasteBatchesPage: React.FC<WasteBatchesPageProps> = ({ onNavigate, onToast }) => {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingBatch, setViewingBatch] = useState<any | null>(null);

  const [newBatch, setNewBatch] = useState({
    title: '',
    sourceFacility: 'Milano EcoTextiles Mill #4',
    materialType: 'Denim Cotton & Poly Blend',
    weightKg: 2500,
    location: 'Receiving Dock #1',
    notes: ''
  });

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      setLoading(true);
      const data = await api.getBatches();
      setBatches(data);
    } catch (err: any) {
      onToast('Error loading waste batches', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatch.title) {
      onToast('Batch title is required', 'error');
      return;
    }
    try {
      await api.createBatch(newBatch);
      onToast('Batch created successfully', 'success');
      setShowCreateModal(false);
      loadBatches();
    } catch (err: any) {
      onToast('Failed to create batch', 'error');
    }
  };

  const handleStatusAdvance = async (batchId: string, currentStatus: BatchStatus) => {
    const currentIndex = BATCH_PIPELINE.indexOf(currentStatus);
    if (currentIndex < BATCH_PIPELINE.length - 1) {
      const nextStatus = BATCH_PIPELINE[currentIndex + 1];
      try {
        await api.updateBatchStatus(batchId, nextStatus);
        onToast(`Batch updated to ${nextStatus}`, 'success');
        loadBatches();
      } catch (err) {
        onToast('Failed to update status', 'error');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this batch?')) return;
    try {
      await api.deleteBatch(id);
      onToast('Batch deleted', 'success');
      loadBatches();
    } catch (err) {
      onToast('Delete failed', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. EDITORIAL HEADER */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-semibold text-[#004d3d] uppercase tracking-wider">
            Module 4 • Batch Lifecycle & Processing
          </span>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight flex items-center gap-3 mt-0.5">
            <span>Waste Batch Tracking</span>
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Track batch progression from collection to circular recycling and zero-landfill completion.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-[#004d3d] hover:bg-[#00382c] text-white font-semibold text-xs rounded-full shadow-sm hover:shadow transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Batch</span>
        </button>
      </div>

      {/* 2. BATCH PIPELINE STAGES SUMMARY */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {BATCH_PIPELINE.map((stage, idx) => {
          const count = batches.filter(b => b.status === stage).length;
          return (
            <div key={idx} className="p-4 bg-white border border-stone-200/80 rounded-2xl shadow-xs">
              <span className="text-[10px] font-mono uppercase text-stone-500 block font-semibold">{stage}</span>
              <span className="text-xl font-bold font-mono text-[#004d3d] mt-1 block">{count}</span>
            </div>
          );
        })}
      </div>

      {/* 3. BATCHES CARDS LIST */}
      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-stone-500">Loading batches...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch) => {
            const currentStageIndex = BATCH_PIPELINE.indexOf(batch.status);
            return (
              <div key={batch.id} className="bg-white border border-stone-200/80 rounded-2xl p-6 flex flex-col justify-between hover:border-stone-300 shadow-xs transition-all space-y-4">
                
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-[#004d3d] font-bold">{batch.id}</span>
                    <span className="text-stone-400">{batch.collectionDate}</span>
                  </div>

                  <h3 className="font-serif-display text-base font-bold text-stone-900">{batch.title}</h3>
                  <p className="text-xs text-stone-500 mt-0.5 font-mono">{batch.materialType}</p>

                  <div className="mt-3 p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1.5">
                    <div className="flex justify-between text-stone-600">
                      <span>Facility:</span>
                      <span className="text-stone-900 font-semibold">{batch.sourceFacility}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Weight:</span>
                      <span className="text-[#004d3d] font-mono font-bold">{batch.weightKg} kg</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Location:</span>
                      <span className="text-stone-700">{batch.location}</span>
                    </div>
                  </div>
                </div>

                {/* PROGRESS BAR */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-mono text-stone-600">
                    <span>Status: <strong className="text-[#004d3d]">{batch.status}</strong></span>
                    <span>{Math.round(((currentStageIndex + 1) / BATCH_PIPELINE.length) * 100)}%</span>
                  </div>

                  <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                    <div 
                      className="h-full bg-[#004d3d] transition-all duration-300"
                      style={{ width: `${((currentStageIndex + 1) / BATCH_PIPELINE.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* CARD ACTIONS */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingBatch(batch)}
                      className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onNavigate('analysis')}
                      className="p-1.5 text-stone-400 hover:text-[#004d3d] hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                      title="Analyze Batch"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(batch.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {currentStageIndex < BATCH_PIPELINE.length - 1 && (
                    <button
                      onClick={() => handleStatusAdvance(batch.id, batch.status)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-semibold rounded-full border border-stone-200 transition-colors cursor-pointer"
                    >
                      <span>Advance Stage</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* CREATE BATCH MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-serif-display font-bold text-stone-900 text-base">Create New Waste Batch</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4 text-xs">
              <div>
                <label className="text-stone-700 block mb-1 font-semibold">Batch Title *</label>
                <input
                  type="text"
                  required
                  value={newBatch.title}
                  onChange={(e) => setNewBatch({ ...newBatch, title: e.target.value })}
                  placeholder="e.g. Post-Industrial Cotton Scraps Batch #12"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-900 focus:ring-2 focus:ring-[#004d3d] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-stone-700 block mb-1 font-semibold">Source Facility</label>
                  <input
                    type="text"
                    value={newBatch.sourceFacility}
                    onChange={(e) => setNewBatch({ ...newBatch, sourceFacility: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-900"
                  />
                </div>
                <div>
                  <label className="text-stone-700 block mb-1 font-semibold">Weight (kg)</label>
                  <input
                    type="number"
                    value={newBatch.weightKg}
                    onChange={(e) => setNewBatch({ ...newBatch, weightKg: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-700 block mb-1 font-semibold">Material Description / Type</label>
                <input
                  type="text"
                  value={newBatch.materialType}
                  onChange={(e) => setNewBatch({ ...newBatch, materialType: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-900"
                />
              </div>

              <div>
                <label className="text-stone-700 block mb-1 font-semibold">Storage Location</label>
                <input
                  type="text"
                  value={newBatch.location}
                  onChange={(e) => setNewBatch({ ...newBatch, location: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-900"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#004d3d] hover:bg-[#00382c] text-white text-xs font-semibold rounded-full shadow-sm"
                >
                  Create Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW BATCH DETAILS MODAL */}
      {viewingBatch && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#004d3d] font-bold">Batch Record</span>
                <h3 className="font-serif-display font-bold text-stone-900 text-lg">{viewingBatch.title}</h3>
              </div>
              <button onClick={() => setViewingBatch(null)} className="text-stone-400 hover:text-stone-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <div>
                  <span className="text-stone-500 text-[10px] block font-mono uppercase">Batch ID</span>
                  <span className="font-mono font-bold text-[#004d3d]">{viewingBatch.id}</span>
                </div>
                <div>
                  <span className="text-stone-500 text-[10px] block font-mono uppercase">Stage</span>
                  <span className="font-mono font-bold text-stone-900">{viewingBatch.status}</span>
                </div>
                <div>
                  <span className="text-stone-500 text-[10px] block font-mono uppercase">Weight</span>
                  <span className="font-mono font-bold text-stone-900">{viewingBatch.weightKg} kg</span>
                </div>
                <div>
                  <span className="text-stone-500 text-[10px] block font-mono uppercase">Collected</span>
                  <span className="font-mono font-bold text-stone-700">{viewingBatch.collectionDate}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-stone-600">
                <div className="flex justify-between border-b border-stone-100 pb-1">
                  <span>Source Facility:</span>
                  <span className="font-semibold text-stone-900">{viewingBatch.sourceFacility}</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 pb-1">
                  <span>Storage Dock:</span>
                  <span className="font-semibold text-stone-900">{viewingBatch.location}</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 pb-1">
                  <span>Material Composition:</span>
                  <span className="font-semibold text-stone-900">{viewingBatch.materialType}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setViewingBatch(null)}
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
