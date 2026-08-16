import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  History, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, 
  Layers, Leaf, Download, ArrowRight, Eye, CheckCircle2, Activity,
  AlertCircle
} from 'lucide-react';

import SustainabilityService from '../../services/sustainabilityService';

export default function SustainabilityHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination, sorting, filter states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [materialFilter, setMaterialFilter] = useState('');
  const [wasteFilter, setWasteFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Comparison State
  const [compareIds, setCompareIds] = useState([]);
  const [isComparing, setIsComparing] = useState(false);
  const [compareData, setCompareData] = useState([]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: 8,
        search: search || undefined,
        material: materialFilter || undefined,
        waste_category: wasteFilter || undefined,
        sort_by: sortBy,
        sort_order: sortOrder
      };
      const res = await SustainabilityService.getHistory(params);
      setHistory(res.data.items || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch sustainability history logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [page, materialFilter, wasteFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadHistory();
  };

  // Toggle selection for comparison
  const handleSelectCompare = (id) => {
    if (compareIds.includes(id)) {
      setCompareIds(compareIds.filter(item => item !== id));
    } else {
      if (compareIds.length >= 3) {
        alert("You can compare a maximum of 3 items at a time.");
        return;
      }
      setCompareIds([...compareIds, id]);
    }
  };

  // Run Comparison Detail Lookup
  const handleRunComparison = async () => {
    if (compareIds.length < 2) {
      alert("Please select at least 2 items to compare.");
      return;
    }
    setLoading(true);
    try {
      const details = [];
      for (const id of compareIds) {
        const res = await SustainabilityService.getDetail(id);
        details.push(res.data);
      }
      setCompareData(details);
      setIsComparing(true);
    } catch (err) {
      console.error(err);
      alert("Failed to compile comparison logs.");
    } finally {
      setLoading(false);
    }
  };

  // Export logs to CSV
  const handleExportCSV = () => {
    if (history.length === 0) return;
    
    const headers = ['ID', 'Material', 'Waste Category', 'Sustainability Score', 'Circularity Score', 'CO2 Saved (kg)', 'Water Saved (L)', 'Recommendation', 'Date'];
    const rows = history.map(item => [
      item.id,
      item.material,
      item.waste_category,
      item.sustainability_score,
      item.circularity_score,
      item.co2_saved,
      item.water_saved,
      item.recovery_recommendation,
      new Date(item.created_at).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "weavecycle_sustainability_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const API_BASE = 'http://localhost:8000';

  if (isComparing) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Audit Comparison Matrix</h1>
            <p className="text-xs text-slate-400">Comparing selected circularity parameters side-by-side.</p>
          </div>
          <button 
            onClick={() => { setIsComparing(false); setCompareData([]); }}
            className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-white border border-borderLight dark:border-borderDark rounded-xl hover:bg-slate-50 dark:hover:bg-cardDark transition-all"
          >
            Back to Logs
          </button>
        </div>

        {/* Matrix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {compareData.map((item, idx) => (
            <div key={item.id} className="glass-card rounded-3xl p-6 space-y-5 relative">
              <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-primary-800 dark:bg-emerald-950 text-primary-neon flex items-center justify-center font-bold text-xs">
                #{idx + 1}
              </div>

              {/* Top info */}
              <div>
                <p className="text-[10px] text-slate-400 font-bold font-mono">Prediction ID: {item.prediction_id.slice(0,8).toUpperCase()}</p>
                <h3 className="text-lg font-black text-slate-800 dark:text-white mt-1">{item.material}</h3>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-primary-50 dark:bg-emerald-950/20 text-primary-800 dark:text-primary-neon">
                  {item.waste_category}
                </span>
              </div>

              {/* Visual image */}
              {item.image_path ? (
                <img 
                  src={`${API_BASE}/uploads/${item.image_path}`}
                  alt="Analyzed batch" 
                  className="w-full aspect-video object-cover rounded-2xl" 
                />
              ) : (
                <div className="w-full aspect-video rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xs">
                  No image preview
                </div>
              )}

              {/* Parameters metrics list */}
              <div className="space-y-2 border-t border-borderLight dark:border-borderDark pt-4 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Sustainability Index</span>
                  <span className="font-bold text-slate-800 dark:text-white">{item.sustainability_metrics?.sustainability_score}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Circularity Index</span>
                  <span className="font-bold text-emerald-500">{item.circularity?.circularity_score}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">CO₂ Saved</span>
                  <span className="font-bold text-blue-500">{item.environmental_impact?.co2_saved} kg</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Water Saved</span>
                  <span className="font-bold text-blue-500">{item.environmental_impact?.water_saved.toLocaleString()} L</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Recyclability rate</span>
                  <span className="font-bold text-slate-700 dark:text-white">{item.confidence?.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Recovery Method</span>
                  <span className="font-bold text-slate-700 dark:text-white truncate max-w-32">{item.recommendations[0]?.recovery_method || 'Mechanical'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <div className="p-2 bg-primary-800 dark:bg-emerald-950/40 text-primary-neon rounded-2xl shadow-neon">
              <History size={18} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Sustainability History Logs</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 ml-11">
            View completed audits, download reports, compare metrics, and view circular trends.
          </p>
        </div>
        <div className="flex space-x-2">
          {compareIds.length >= 2 && (
            <button
              onClick={handleRunComparison}
              className="flex items-center space-x-1.5 px-3 py-2 bg-primary-700 text-white text-xs font-bold rounded-xl hover:bg-primary-600 transition-all shadow-neon"
            >
              <span>Compare Selected ({compareIds.length})</span>
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-500 border border-borderLight dark:border-borderDark rounded-xl hover:bg-slate-50 dark:hover:bg-cardDark transition-all"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="glass-card rounded-3xl p-5">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          {/* Search box */}
          <div className="space-y-1">
            <label className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Search keyword</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 text-slate-400" size={13} />
              <input
                type="text"
                placeholder="Search material or waste category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </div>

          {/* Material Filter */}
          <div className="space-y-1">
            <label className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Material</label>
            <select
              value={materialFilter}
              onChange={(e) => setMaterialFilter(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-xl text-xs outline-none text-slate-500 dark:text-white"
            >
              <option value="">All Materials</option>
              {['Cotton', 'Polyester', 'Denim', 'Wool', 'Silk', 'Linen', 'Nylon', 'Rayon', 'Acrylic', 'Mixed'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Waste Category Filter */}
          <div className="space-y-1">
            <label className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Waste Category</label>
            <select
              value={wasteFilter}
              onChange={(e) => setWasteFilter(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-xl text-xs outline-none text-slate-500 dark:text-white"
            >
              <option value="">All Categories</option>
              {['Reusable', 'Recyclable', 'Repairable', 'Upcyclable', 'Compostable', 'Hazardous Textile Waste'].map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="py-2 bg-slate-100 hover:bg-slate-200 dark:bg-cardDark dark:hover:bg-bgDark border border-borderLight dark:border-borderDark rounded-xl text-xs font-bold transition-all text-slate-700 dark:text-white"
          >
            Apply Filters
          </button>
        </form>
      </div>

      {/* Main logs display list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Activity size={24} className="animate-spin text-primary-500 mb-2" />
          <p className="text-xs">Fetching history logs...</p>
        </div>
      ) : error ? (
        <div className="glass-card rounded-3xl p-6 flex items-center space-x-2 text-red-500 text-xs">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      ) : history.length > 0 ? (
        <div className="space-y-4">
          
          {/* Table display */}
          <div className="glass-card rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-borderLight dark:border-borderDark text-slate-400 font-bold bg-slate-50/50 dark:bg-cardDark/10">
                    <th className="py-3 px-4 text-center w-12">Select</th>
                    <th className="py-3 px-4">Image Preview</th>
                    <th className="py-3 px-4">Material</th>
                    <th className="py-3 px-4">Waste Stream</th>
                    <th className="py-3 px-4">Primary Recommendation</th>
                    <th className="py-3 px-4 text-center">Sustain Score</th>
                    <th className="py-3 px-4 text-center">Circularity Index</th>
                    <th className="py-3 px-4">CO₂ Offset</th>
                    <th className="py-3 px-4">Audit Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderLight dark:divide-borderDark">
                  {history.map((item) => {
                    const isSelected = compareIds.includes(item.prediction_id);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-cardDark/20 transition-colors">
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectCompare(item.prediction_id)}
                            className="w-4 h-4 text-primary-600 border-borderLight dark:border-borderDark rounded focus:ring-primary-500"
                          />
                        </td>
                        <td className="py-3.5 px-4">
                          {item.image_path ? (
                            <img
                              src={`${API_BASE}/uploads/${item.image_path}`}
                              alt={item.material}
                              className="w-10 h-10 object-cover rounded-xl border border-borderLight dark:border-borderDark"
                              onError={(e) => { e.target.src = ''; e.target.alt = 'No img'; }}
                            />
                          ) : (
                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-[8px] text-slate-400">
                              No image
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-white">{item.material}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-primary-50 dark:bg-emerald-950/20 text-primary-800 dark:text-primary-neon">
                            {item.waste_category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-medium">
                          {item.recovery_recommendation}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-white">
                          {item.sustainability_score}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-emerald-500">
                          {item.circularity_score}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-medium">{item.co2_saved.toFixed(1)} kg</td>
                        <td className="py-3.5 px-4 text-slate-400">{new Date(item.created_at).toLocaleDateString()}</td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            to={`/predictions/${item.prediction_id}`}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-50 dark:bg-cardDark text-[10px] font-bold text-slate-600 dark:text-white rounded-xl border border-borderLight dark:border-borderDark hover:bg-slate-100 dark:hover:bg-bgDark transition-all"
                          >
                            <span>Audit details</span>
                            <ChevronRight size={10} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-4 py-2 text-xs">
              <span className="text-slate-400">Page {page} of {totalPages}</span>
              <div className="flex space-x-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="p-1.5 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-lg hover:bg-slate-50 dark:hover:bg-bgDark disabled:opacity-50 text-slate-500"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-1.5 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-lg hover:bg-slate-50 dark:hover:bg-bgDark disabled:opacity-50 text-slate-500"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

        </div>
      ) : (
        <div className="glass-card rounded-3xl p-16 text-center text-slate-400">
          <History size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-700" />
          <p>No historical sustainability audit logs found.</p>
        </div>
      )}
    </div>
  );
}
