import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Loader, AlertCircle, Download, Printer,
  ChevronLeft, ChevronRight, Brain, Calendar, Building, User
} from 'lucide-react';
import AIService from '../../services/aiService';

const STATUS_COLORS = {
  Generated: 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400',
  Exported: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400',
  Archived: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
};

export default function Reports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const PER_PAGE = 10;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await AIService.getReports({ page, per_page: PER_PAGE });
      setReports(res.data.items || []);
      setTotal(res.data.total || 0);
      setPages(Math.ceil((res.data.total || 0) / PER_PAGE));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handlePrint = (report) => {
    navigate(`/predictions/${report.prediction_id}`);
    setTimeout(() => window.print(), 500);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-primary-800 dark:bg-emerald-950 text-primary-neon rounded-2xl shadow-neon">
            <FileText size={18} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Classification Reports</h1>
            <p className="text-xs text-slate-400">{total} reports generated</p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl px-4 py-3">
          <AlertCircle size={14} className="text-red-500" />
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Reports List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader size={24} className="animate-spin text-primary-500" />
          <p className="text-xs text-slate-400">Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="glass-card rounded-3xl py-20 text-center space-y-4">
          <FileText size={40} className="mx-auto text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-semibold text-slate-500">No reports generated yet</p>
          <p className="text-xs text-slate-400">Reports are automatically created after each AI analysis</p>
          <button
            onClick={() => navigate('/analysis')}
            className="px-5 py-2.5 bg-primary-700 text-white text-xs font-semibold rounded-xl hover:bg-primary-600 transition-all"
          >
            Start Your First Analysis
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="glass-card rounded-3xl p-5 hover:shadow-neon transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left */}
                <div className="flex-1 min-w-0">
                  {/* Title + Status */}
                  <div className="flex items-center space-x-2 mb-1.5 flex-wrap gap-y-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[report.status] || STATUS_COLORS.Generated}`}>
                      {report.status}
                    </span>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate">
                      {report.report_title || `Report — ${report.material || 'Textile'}`}
                    </h3>
                  </div>

                  {/* Summary */}
                  {report.summary && (
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-3 leading-relaxed line-clamp-2">
                      {report.summary}
                    </p>
                  )}

                  {/* Classification Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {report.material && (
                      <span className="px-2 py-0.5 bg-primary-50 dark:bg-emerald-950/20 text-primary-700 dark:text-primary-neon rounded-lg text-[10px] font-semibold">
                        {report.material}
                      </span>
                    )}
                    {report.waste_category && (
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-semibold">
                        {report.waste_category}
                      </span>
                    )}
                    {report.recyclability_score != null && (
                      <span className="px-2 py-0.5 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-lg text-[10px] font-semibold">
                        ♻ {report.recyclability_score.toFixed(0)}% Recyclable
                      </span>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-3 text-[10px] text-slate-400">
                    {report.user_name && (
                      <span className="flex items-center space-x-1">
                        <User size={10} />
                        <span>{report.user_name}</span>
                      </span>
                    )}
                    {report.organization_name && (
                      <span className="flex items-center space-x-1">
                        <Building size={10} />
                        <span>{report.organization_name}</span>
                      </span>
                    )}
                    <span className="flex items-center space-x-1">
                      <Calendar size={10} />
                      <span>{new Date(report.created_at).toLocaleString()}</span>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 flex-shrink-0">
                  <button
                    onClick={() => navigate(`/predictions/${report.prediction_id}`)}
                    className="flex items-center space-x-1.5 px-3 py-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300 border border-borderLight dark:border-borderDark rounded-xl hover:bg-slate-50 dark:hover:bg-cardDark transition-all"
                  >
                    <Brain size={11} />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handlePrint(report)}
                    className="flex items-center space-x-1.5 px-3 py-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300 border border-borderLight dark:border-borderDark rounded-xl hover:bg-slate-50 dark:hover:bg-cardDark transition-all"
                  >
                    <Printer size={11} />
                    <span>Print</span>
                  </button>
                  <button
                    onClick={() => handlePrint(report)}
                    className="flex items-center space-x-1.5 px-3 py-2 text-[11px] font-semibold text-white bg-primary-700 hover:bg-primary-600 rounded-xl transition-all shadow-neon"
                  >
                    <Download size={11} />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl border border-borderLight dark:border-borderDark text-slate-400 hover:text-slate-600 disabled:opacity-30"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs text-slate-500">Page {page} of {pages}</span>
          <button
            onClick={() => setPage(p => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="p-2 rounded-xl border border-borderLight dark:border-borderDark text-slate-400 hover:text-slate-600 disabled:opacity-30"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
