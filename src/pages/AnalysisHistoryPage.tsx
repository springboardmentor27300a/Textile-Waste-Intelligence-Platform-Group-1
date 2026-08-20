import React, { useState, useEffect } from 'react';
import { 
  History, Search, Filter, Eye, Download, 
  Trash2, FileSpreadsheet, X, Sparkles, Layers, Image as ImageIcon 
} from 'lucide-react';
import { api } from '../services/api';
import { NavigationPage } from '../types/client';

interface AnalysisHistoryPageProps {
  onNavigate: (page: NavigationPage) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AnalysisHistoryPage: React.FC<AnalysisHistoryPageProps> = ({ onNavigate, onToast }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAnalysis, setSelectedAnalysis] = useState<any | null>(null);

  useEffect(() => {
    loadHistory();
  }, [search]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await api.getAnalysisHistory({ search: search || undefined });
      setHistory(data);
    } catch (err) {
      onToast('Error loading history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this analysis record?')) return;
    try {
      await api.deleteAnalysis(id);
      onToast('Analysis deleted from history', 'success');
      loadHistory();
    } catch (err) {
      onToast('Failed to delete record', 'error');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all analysis history records?')) return;
    try {
      await api.clearAnalysisHistory();
      onToast('Analysis history cleared', 'success');
      loadHistory();
    } catch (err) {
      onToast('Failed to clear history', 'error');
    }
  };

  const handleDownloadAnalysisPdf = async (item: any) => {
    try {
      onToast(`Generating PDF report for ${item.detectedMaterial} (${item.id})...`, 'info');
      await api.downloadPdfReport('classification', `Textile Analysis ${item.id}`, item.id);
      onToast('PDF report downloaded successfully.', 'success');
    } catch (err) {
      onToast('Failed to download PDF report.', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <History className="w-6 h-6 text-emerald-400" />
            <span>Analysis History</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Searchable log of past AI textile diagnostics, stored image details, and circularity evaluations
          </p>
        </div>

        <div className="flex items-center gap-3">
          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-rose-400 text-xs font-medium rounded-xl border border-slate-800 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear History</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('analysis')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-all"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>New Analysis</span>
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search analysis ID, material, or recommendation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <span className="text-xs font-mono text-slate-400 hidden sm:inline-block">
          Total Stored Analyses: <strong className="text-emerald-400">{history.length}</strong>
        </span>
      </div>

      {/* HISTORY TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-slate-400">Loading analysis history...</div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No past analyses found in database.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] font-mono uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Image</th>
                  <th className="py-3.5 px-4">Analysis ID</th>
                  <th className="py-3.5 px-4">Detected Material</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Circularity</th>
                  <th className="py-3.5 px-4">Primary Recommendation</th>
                  <th className="py-3.5 px-4">Analyzed By</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <img src={item.imageUrl} alt={item.imageName} className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-700" />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">{item.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-100">{item.detectedMaterial}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {item.wasteCategory}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">
                      {item.circularity?.overallScore} / 100
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 truncate max-w-xs">{item.recommendation?.primary}</td>
                    <td className="py-3.5 px-4 text-slate-300">{item.analyzedBy || 'Analyst'}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{item.analyzedAt ? item.analyzedAt.split('T')[0] : '2026-07-23'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleDownloadAnalysisPdf(item)}
                          className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Download Specific PDF Report"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedAnalysis(item)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="View Full Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
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
      </div>

      {/* RICH IMAGE & ANALYSIS DETAILS MODAL */}
      {selectedAnalysis && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
            
            {/* MODAL HEADER */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950 shrink-0">
              <div>
                <span className="text-xs font-mono text-emerald-400 font-bold">{selectedAnalysis.id}</span>
                <h3 className="font-bold text-slate-100 text-lg">{selectedAnalysis.detectedMaterial}</h3>
              </div>
              <button onClick={() => setSelectedAnalysis(null)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 font-sans">
              
              {/* IMAGE PREVIEW & QUICK METRICS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="relative h-48 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                  <img src={selectedAnalysis.imageUrl} alt={selectedAnalysis.detectedMaterial} className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-2 bg-slate-950/80 px-2.5 py-0.5 rounded text-[10px] font-mono text-emerald-400">
                    Confidence: {Math.round(selectedAnalysis.confidenceScore * 100)}%
                  </div>
                </div>

                <div className="space-y-2 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
                  <div><span className="text-slate-500">Image Name:</span> <span className="text-slate-200">{selectedAnalysis.imageName}</span></div>
                  <div><span className="text-slate-500">Waste Category:</span> <span className="text-emerald-400">{selectedAnalysis.wasteCategory}</span></div>
                  <div><span className="text-slate-500">Circularity Score:</span> <span className="text-indigo-400 font-bold">{selectedAnalysis.circularity?.overallScore} / 100</span></div>
                  <div><span className="text-slate-500">Batch ID:</span> <span className="text-slate-200">{selectedAnalysis.batchId || 'Unassigned'}</span></div>
                  <div><span className="text-slate-500">Analyzed By:</span> <span className="text-slate-200">{selectedAnalysis.analyzedBy}</span></div>
                  <div><span className="text-slate-500">Date:</span> <span className="text-slate-400">{selectedAnalysis.analyzedAt ? selectedAnalysis.analyzedAt.replace('T', ' ').slice(0, 16) : '2026-07-23'}</span></div>
                </div>
              </div>

              {/* FIBER COMPOSITION */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-200 uppercase font-mono tracking-wider">Fiber Composition</h4>
                <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  {selectedAnalysis.fiberComposition?.map((fc: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span>{fc.fiber}</span>
                      <span className="font-mono text-emerald-400 font-bold">{fc.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* VISUAL CHARACTERISTICS */}
              {selectedAnalysis.visualCharacteristics && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-200 uppercase font-mono tracking-wider">Visual Characteristics</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800"><span className="text-slate-500 block">Texture:</span> {selectedAnalysis.visualCharacteristics.texture}</div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800"><span className="text-slate-500 block">Pattern:</span> {selectedAnalysis.visualCharacteristics.pattern}</div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800"><span className="text-slate-500 block">Color:</span> {selectedAnalysis.visualCharacteristics.dominantColor}</div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800"><span className="text-slate-500 block">Condition:</span> {selectedAnalysis.visualCharacteristics.condition}</div>
                  </div>
                </div>
              )}

              {/* RECOMMENDATION */}
              {selectedAnalysis.recommendation && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-200 uppercase font-mono tracking-wider">Recommended Strategy</h4>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <h5 className="font-bold text-emerald-400 text-sm">{selectedAnalysis.recommendation.primary}</h5>
                    <p className="text-slate-300 text-xs leading-relaxed">{selectedAnalysis.recommendation.rationale}</p>
                    <div className="font-mono text-[11px] text-slate-400 pt-1">
                      Processing: {selectedAnalysis.recommendation.processingMethod}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* MODAL FOOTER */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 shrink-0 flex justify-between items-center">
              <button
                onClick={() => handleDownloadAnalysisPdf(selectedAnalysis)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Report</span>
              </button>

              <button
                onClick={() => setSelectedAnalysis(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
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

