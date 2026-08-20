import React, { useState, useEffect } from 'react';
import { 
  Recycle, Search, Filter, ArrowUpRight, 
  Sparkles, CheckCircle2, ShieldCheck, X, ExternalLink 
} from 'lucide-react';
import { api } from '../services/api';
import { NavigationPage } from '../types/client';

interface RecyclingRecommendationsPageProps {
  onNavigate: (page: NavigationPage) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const RecyclingRecommendationsPage: React.FC<RecyclingRecommendationsPageProps> = ({ onNavigate, onToast }) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const [selectedRec, setSelectedRec] = useState<any | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const data = await api.getRecommendations();
      setRecommendations(data);
    } catch (err: any) {
      onToast('Error loading recommendations catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filtered = filterCategory 
    ? recommendations.filter(r => r.strategyCategory === filterCategory)
    : recommendations;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. EDITORIAL HEADER */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-semibold text-[#004d3d] uppercase tracking-wider">
            Module 6 • 7-Pathway Recovery Engine
          </span>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight flex items-center gap-3 mt-0.5">
            <span>Circular Recovery Pathways</span>
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Circular economy recovery strategies, technical specifications, and regional facility pathways.
          </p>
        </div>

        <button
          onClick={() => onNavigate('analysis')}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#004d3d] hover:bg-[#00382c] text-white font-semibold text-xs rounded-full shadow-sm hover:shadow transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 fill-current text-emerald-300" />
          <span>Match Textile Swatch →</span>
        </button>
      </div>

      {/* 2. FILTER CATEGORY TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['All Pathways', 'Fiber Recycling', 'Mechanical Recycling', 'Chemical Recycling', 'Fabric Reuse', 'Upcycling', 'Donation', 'Industrial Recovery'].map((cat, idx) => {
          const val = cat === 'All Pathways' ? '' : cat;
          const isActive = filterCategory === val;
          return (
            <button
              key={idx}
              onClick={() => setFilterCategory(val)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                isActive 
                  ? 'bg-[#004d3d] text-white font-semibold shadow-xs' 
                  : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 3. RECOMMENDATION STRATEGY CARDS */}
      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-stone-500">Loading recovery pathways...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((rec) => (
            <div key={rec.id} className="bg-white border border-stone-200/80 rounded-2xl p-6 flex flex-col justify-between hover:border-stone-300 shadow-xs transition-all space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-[#004d3d] border border-emerald-200">
                    {rec.strategyCategory}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#004d3d]">
                    {rec.recoveryEfficiency}% Recovery Yield
                  </span>
                </div>

                <h3 className="font-serif-display text-lg font-bold text-stone-900">{rec.title}</h3>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">{rec.description}</p>

                <div className="mt-4 p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Est Processing Cost:</span>
                    <span className="font-mono text-stone-900 font-medium">{rec.processingCostEstPerTon}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>CO₂ Savings:</span>
                    <span className="font-mono text-[#004d3d] font-bold">{rec.co2SavingsPerTon} Tons / Ton</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Water Savings:</span>
                    <span className="font-mono text-cyan-700 font-bold">{rec.waterSavingsPerTon} m³ / Ton</span>
                  </div>
                </div>
              </div>

              {/* CARD FOOTER */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-stone-500">
                  Target: {rec.recommendedMaterials?.slice(0, 2).join(', ')}...
                </span>
                <button
                  onClick={() => setSelectedRec(rec)}
                  className="text-xs font-semibold text-[#004d3d] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Technical Specs</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TECHNICAL SPECIFICATION MODAL */}
      {selectedRec && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 w-full max-w-lg rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#004d3d] font-bold">{selectedRec.strategyCategory}</span>
                <h3 className="font-serif-display font-bold text-stone-900 text-lg mt-0.5">{selectedRec.title}</h3>
              </div>
              <button onClick={() => setSelectedRec(null)} className="text-stone-400 hover:text-stone-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-stone-500 font-mono uppercase block text-[10px] mb-1">Process Overview</span>
                <p className="text-stone-700 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200">
                  {selectedRec.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-500 text-[10px] block font-mono">Recovery Yield</span>
                  <span className="text-lg font-bold font-mono text-[#004d3d]">{selectedRec.recoveryEfficiency}%</span>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-500 text-[10px] block font-mono">Processing Cost</span>
                  <span className="text-lg font-bold font-mono text-stone-900">{selectedRec.processingCostEstPerTon}</span>
                </div>
              </div>

              <div>
                <span className="text-stone-500 font-mono uppercase block text-[10px] mb-1">Compatible Feedstock Materials</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRec.recommendedMaterials?.map((mat: string, idx: number) => (
                    <span key={idx} className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-[11px] font-medium">
                      {mat}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-stone-500 font-mono uppercase block text-[10px] mb-1">Downstream Applications</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRec.downstreamProducts?.map((p: string, idx: number) => (
                    <span key={idx} className="px-2.5 py-1 rounded-full bg-emerald-50 text-[#004d3d] text-[11px] font-medium border border-emerald-200">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setSelectedRec(null)}
                className="px-5 py-2 bg-[#004d3d] text-white text-xs font-semibold rounded-full cursor-pointer"
              >
                Close Technical Specs
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
