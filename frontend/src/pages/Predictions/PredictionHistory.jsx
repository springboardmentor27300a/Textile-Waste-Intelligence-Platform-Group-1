import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History, Search, Filter, ChevronRight, ChevronLeft,
  Loader, AlertCircle, Brain, Download, SlidersHorizontal, ArrowUpDown
} from 'lucide-react';
import AIService from '../../services/aiService';

const MATERIALS = ['Cotton', 'Polyester', 'Wool', 'Silk', 'Linen', 'Denim', 'Rayon', 'Nylon', 'Acrylic', 'Mixed Fabric'];
const WASTE_CATS = ['Recyclable', 'Reusable', 'Repairable', 'Upcyclable', 'Compostable', 'Hazardous Textile Waste'];

const WASTE_BADGE = {
  Recyclable: 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400',
  Reusable: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400',
  Repairable: 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400',
  Upcyclable: 'bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400',
  Compostable: 'bg-lime-100 dark:bg-lime-950/30 text-lime-700 dark:text-lime-400',
  'Hazardous Textile Waste': 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400',
};

function ConfBar({ value, color = 'bg-primary-500' }) {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex-shrink-0">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${value || 0}%` }} />
      </div>
      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{(value || 0).toFixed(1)}%</span>
    </div>
  );
}

export default function PredictionHistory() {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [material, setMaterial] = useState('');
  const [wasteCategory, setWasteCategory] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const PER_PAGE = 10;

  const API_BASE = 'http://localhost:8000';

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, per_page: PER_PAGE, sort_by: sortBy, sort_order: sortOrder };
      if (search) params.search = search;
      if (material) params.material = material;
      if (wasteCategory) params.waste_category = wasteCategory;

      const res = await AIService.getPredictions(params);
      setPredictions(res.data.items || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load predictions');
    } finally {
      setLoading(false);
    }
  }, [page, search, material, wasteCategory, sortBy, sortOrder]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const exportCSV = () => {
    const headers = ['Material', 'Waste Category', 'Confidence', 'Recyclability', 'Recovery', 'Rating', 'Status', 'Date', 'User'];
    const rows = predictions.map(p => [
      p.material, p.waste_category,
      (p.material_confidence || 0).toFixed(1) + '%',
      (p.recyclability_score || 0).toFixed(1) + '%',
      p.recovery_difficulty || '',
      p.overall_rating || '',
      p.status,
      new Date(p.created_at).toLocaleDateString(),
      p.user_name || '',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'predictions.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-primary-800 dark:bg-emerald-950 text-primary-neon rounded-2xl shadow-neon">
            <History size={18} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Prediction History</h1>
            <p className="text-xs text-slate-400">{total} total predictions</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-1.5 px-3 py-2 text-xs border rounded-xl transition-all ${showFilters ? 'bg-primary-50 dark:bg-emerald-950/20 border-primary-300 text-primary-600 dark:text-primary-neon' : 'border-borderLight dark:border-borderDark text-slate-500 hover:bg-slate-50 dark:hover:bg-cardDark'}`}
          >
            <SlidersHorizontal size={13} />
            <span>Filters</span>
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-white bg-primary-700 hover:bg-primary-600 rounded-xl transition-all"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="glass-card rounded-3xl p-4 space-y-3">
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search by material or waste category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-emerald-900"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-primary-700 text-white text-xs font-semibold rounded-xl hover:bg-primary-600 transition-all">
            Search
          </button>
        </form>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-borderLight dark:border-borderDark">
            <div>
              <label className="text-[9px] text-slate-400 uppercase tracking-wider block mb-1">Material</label>
              <select
                value={material}
                onChange={(e) => { setMaterial(e.target.value); setPage(1); }}
                className="w-full py-2 px-3 bg-slate-50 dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-xl text-xs outline-none"
              >
                <option value="">All Materials</option>
                {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-slate-400 uppercase tracking-wider block mb-1">Waste Category</label>
              <select
                value={wasteCategory}
                onChange={(e) => { setWasteCategory(e.target.value); setPage(1); }}
                className="w-full py-2 px-3 bg-slate-50 dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-xl text-xs outline-none"
              >
                <option value="">All Categories</option>
                {WASTE_CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-slate-400 uppercase tracking-wider block mb-1">Sort By</label>
              <div className="flex space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 py-2 px-3 bg-slate-50 dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-xl text-xs outline-none"
                >
                  <option value="created_at">Date</option>
                  <option value="material_confidence">Confidence</option>
                  <option value="recyclability_score">Recyclability</option>
                </select>
                <button
                  onClick={() => setSortOrder(o => o === 'desc' ? 'asc' : 'desc')}
                  className="px-2 py-2 border border-borderLight dark:border-borderDark rounded-xl text-slate-400 hover:text-primary-500 transition-all"
                  title={`Sort ${sortOrder === 'desc' ? 'Ascending' : 'Descending'}`}
                >
                  <ArrowUpDown size={13} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl px-4 py-3">
          <AlertCircle size={14} className="text-red-500" />
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="glass-card rounded-3xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <Loader size={24} className="animate-spin text-primary-500" />
            <p className="text-xs text-slate-400">Loading predictions...</p>
          </div>
        ) : predictions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <Brain size={32} className="text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-500">No predictions found</p>
            <p className="text-xs text-slate-400">Upload an image to run your first AI analysis</p>
            <button
              onClick={() => navigate('/analysis')}
              className="px-4 py-2 bg-primary-700 text-white text-xs font-semibold rounded-xl hover:bg-primary-600 transition-all"
            >
              Start Analysis
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-borderLight dark:border-borderDark bg-slate-50/50 dark:bg-bgDark/20">
                  {['Image', 'Material', 'Waste Category', 'Confidence', 'Recyclability', 'Recovery', 'Rating', 'User', 'Date', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-borderLight dark:divide-borderDark">
                {predictions.map((p) => {
                  const imgUrl = p.image?.original_path ? `${API_BASE}/uploads/${p.image.original_path}` : null;
                  const badgeStyle = WASTE_BADGE[p.waste_category] || WASTE_BADGE.Recyclable;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => navigate(`/predictions/${p.id}`)}
                      className="hover:bg-slate-50 dark:hover:bg-cardDark/50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        {imgUrl ? (
                          <img src={imgUrl} alt="" className="w-10 h-10 rounded-xl object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-cardDark flex items-center justify-center">
                            <Brain size={14} className="text-slate-300" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold text-slate-800 dark:text-white whitespace-nowrap">{p.material}</p>
                        <p className="text-[9px] text-slate-400">{p.fabric_category || ''}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${badgeStyle}`}>
                          {p.waste_category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <ConfBar value={p.material_confidence} color="bg-primary-500" />
                      </td>
                      <td className="px-4 py-3">
                        <ConfBar value={p.recyclability_score} color="bg-emerald-500" />
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold ${p.recovery_difficulty === 'Easy' ? 'text-green-500' : p.recovery_difficulty === 'Hard' ? 'text-red-500' : 'text-yellow-500'}`}>
                          {p.recovery_difficulty || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-600 dark:text-slate-300">{p.overall_rating || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[10px] text-slate-500 whitespace-nowrap">{p.user_name || '—'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[10px] text-slate-400 whitespace-nowrap font-mono">
                          {new Date(p.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-[9px] text-slate-300 dark:text-slate-600 font-mono">
                          {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-borderLight dark:border-borderDark">
            <p className="text-xs text-slate-400">
              Page {page} of {pages} · {total} total
            </p>
            <div className="flex space-x-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl border border-borderLight dark:border-borderDark text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                const pg = Math.max(1, Math.min(pages - 4, page - 2)) + i;
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`w-8 h-8 rounded-xl text-xs font-semibold transition-all ${pg === page ? 'bg-primary-700 text-white shadow-neon' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-cardDark'}`}
                  >
                    {pg}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="p-2 rounded-xl border border-borderLight dark:border-borderDark text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
