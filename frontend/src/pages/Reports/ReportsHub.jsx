import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FileText, Download, Eye, RefreshCw, Plus, Search,
  Filter, ChevronLeft, ChevronRight, Loader, AlertCircle,
  CheckCircle, Brain, Leaf, Globe, RotateCcw, Recycle,
  Calendar, User, Building, FileSpreadsheet, FileDown,
  Archive, X, TrendingUp, BarChart2, Droplets, Zap, Layers,
  ChevronDown, ChevronUp, Clock, Award, TreePine, Flame
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell, Tooltip as RTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import ReportService from '../../services/reportService';
import AIService from '../../services/aiService';

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_META = {
  waste_classification: {
    label: 'Waste Classification',
    icon: Brain,
    color: 'emerald',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-700 dark:text-emerald-400',
    badge: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  recycling: {
    label: 'Recycling',
    icon: Recycle,
    color: 'blue',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-400',
    badge: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  sustainability: {
    label: 'Sustainability',
    icon: Leaf,
    color: 'green',
    bg: 'bg-green-50 dark:bg-green-950/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-700 dark:text-green-400',
    badge: 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400',
    dot: 'bg-green-500',
  },
  environmental_impact: {
    label: 'Environmental Impact',
    icon: Globe,
    color: 'teal',
    bg: 'bg-teal-50 dark:bg-teal-950/20',
    border: 'border-teal-200 dark:border-teal-800',
    text: 'text-teal-700 dark:text-teal-400',
    badge: 'bg-teal-100 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400',
    dot: 'bg-teal-500',
  },
  circular_economy: {
    label: 'Circular Economy',
    icon: RotateCcw,
    color: 'purple',
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    border: 'border-purple-200 dark:border-purple-800',
    text: 'text-purple-700 dark:text-purple-400',
    badge: 'bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400',
    dot: 'bg-purple-500',
  },
  esg_summary: {
    label: 'ESG Summary',
    icon: TrendingUp,
    color: 'emerald',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-700 dark:text-emerald-400',
    badge: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
};

const STATUS_META = {
  Generated: 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400',
  Exported: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400',
  Archived: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
};

const CHART_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#06b6d4'];
const PER_PAGE = 8;

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon: Icon, value, label, sub, colorClass = 'text-emerald-500' }) {
  return (
    <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
      <div className={`p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 ${colorClass}`}>
        <Icon size={16} />
      </div>
      <div>
        <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{value}</p>
        <p className="text-[10px] text-slate-500">{label}</p>
        {sub && <p className="text-[9px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function TypeBadge({ type }) {
  const meta = TYPE_META[type] || TYPE_META.waste_classification;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${meta.badge}`}>
      <Icon size={9} />
      {meta.label}
    </span>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_META[status] || STATUS_META.Generated}`}>
      {status}
    </span>
  );
}

// ─── Generate Modal ───────────────────────────────────────────────────────────

function GenerateModal({ onClose, onGenerated, allowedTypes = [] }) {
  const [step, setStep] = useState(1); // 1: pick type, 2: pick prediction
  const [selectedType, setSelectedType] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [selectedPred, setSelectedPred] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (step === 2) {
      setLoading(true);
      AIService.getPredictions({ per_page: 30 })
        .then(r => setPredictions(r.data.items || []))
        .catch(() => setError('Failed to load predictions'))
        .finally(() => setLoading(false));
    }
  }, [step]);

  const handleGenerate = async () => {
    if (!selectedPred) return;
    setGenerating(true);
    setError('');
    try {
      const res = await ReportService.generateReport(selectedType, selectedPred);
      onGenerated(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-cardDark rounded-3xl w-full max-w-lg shadow-2xl border border-borderLight dark:border-borderDark">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-borderLight dark:border-borderDark">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary-800 dark:bg-emerald-950 text-primary-neon rounded-xl shadow-neon">
              <Plus size={14} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Generate Report</h2>
              <p className="text-[10px] text-slate-400">Step {step} of 2</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-cardDark rounded-xl text-slate-400">
            <X size={14} />
          </button>
        </div>

        <div className="p-6">
          {/* Step 1: Select Report Type */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 mb-4">Select the type of report to generate:</p>
              {allowedTypes.map((typeItem) => {
                const meta = TYPE_META[typeItem.type] || TYPE_META.waste_classification;
                const Icon = meta.icon;
                const isSelected = selectedType === typeItem.type;
                return (
                  <button
                    key={typeItem.type}
                    onClick={() => setSelectedType(typeItem.type)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                      isSelected
                        ? `${meta.border} ${meta.bg} shadow-sm`
                        : 'border-borderLight dark:border-borderDark hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isSelected ? meta.bg : 'bg-slate-100 dark:bg-slate-800'} ${meta.text}`}>
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold ${isSelected ? meta.text : 'text-slate-800 dark:text-white'}`}>
                          {typeItem.label}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{typeItem.description}</p>
                      </div>
                      {isSelected && <CheckCircle size={14} className={meta.text} />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 2: Select Prediction */}
          {step === 2 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <TypeBadge type={selectedType} />
                <span className="text-xs text-slate-400">Select the AI analysis to generate from:</span>
              </div>
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader size={20} className="animate-spin text-primary-500" />
                </div>
              )}
              {!loading && predictions.length === 0 && (
                <div className="text-center py-8">
                  <Brain size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-xs text-slate-500">No AI analyses found. Run an analysis first.</p>
                </div>
              )}
              {!loading && predictions.length > 0 && (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {predictions.map((pred) => (
                    <button
                      key={pred.id}
                      onClick={() => setSelectedPred(pred.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        selectedPred === pred.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-emerald-950/20'
                          : 'border-borderLight dark:border-borderDark hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-white">{pred.material}</p>
                          <p className="text-[10px] text-slate-400">{pred.waste_category} · {new Date(pred.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-primary-600 dark:text-primary-neon">{pred.recyclability_score?.toFixed(0)}%</p>
                          <p className="text-[9px] text-slate-400">recyclable</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-3 flex items-center gap-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl px-3 py-2">
              <AlertCircle size={12} className="text-red-500" />
              <p className="text-[10px] text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t border-borderLight dark:border-borderDark">
          <button
            onClick={() => step === 1 ? onClose() : setStep(1)}
            className="px-4 py-2 text-xs text-slate-500 hover:text-slate-700 font-medium"
          >
            {step === 1 ? 'Cancel' : '← Back'}
          </button>
          <button
            onClick={() => step === 1 ? (selectedType && setStep(2)) : handleGenerate()}
            disabled={(step === 1 && !selectedType) || (step === 2 && (!selectedPred || generating))}
            className="px-5 py-2 bg-primary-700 hover:bg-primary-600 text-white text-xs font-bold rounded-xl transition-all shadow-neon disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {generating ? <Loader size={12} className="animate-spin" /> : null}
            {step === 1 ? 'Next →' : generating ? 'Generating…' : 'Generate Report'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Preview Modal ─────────────────────────────────────────────────────────────

function PreviewModal({ report, onClose, onDownloadPdf, onDownloadExcel }) {
  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const data = report?.report_data;
  const meta = TYPE_META[report?.report_type] || TYPE_META.waste_classification;

  const handlePdf = async () => {
    setDownloadingPdf(true);
    try { await onDownloadPdf(report.id, report.title); } finally { setDownloadingPdf(false); }
  };
  const handleExcel = async () => {
    setDownloadingExcel(true);
    try { await onDownloadExcel(report.id, report.title); } finally { setDownloadingExcel(false); }
  };

  if (!report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-cardDark rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-borderLight dark:border-borderDark">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-borderLight dark:border-borderDark flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${meta.bg} ${meta.text}`}>
              {React.createElement(meta.icon, { size: 16 })}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{report.title}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <TypeBadge type={report.report_type} />
                <StatusBadge status={report.status} />
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-cardDark rounded-xl text-slate-400">
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Report Identity */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="glass-card rounded-xl p-3 text-center">
              <p className="text-[9px] text-slate-400 uppercase tracking-wider">Report ID</p>
              <p className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 mt-1" title={report.id}>{report.id?.slice(0,8)}…</p>
            </div>
            <div className="glass-card rounded-xl p-3 text-center">
              <p className="text-[9px] text-slate-400 uppercase tracking-wider">Waste Batch ID</p>
              <p className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 mt-1" title={data?.waste_batch_id || 'N/A'}>
                {data?.waste_batch_id ? `${data.waste_batch_id.slice(0,8)}…` : 'N/A'}
              </p>
            </div>
            <div className="glass-card rounded-xl p-3 text-center">
              <p className="text-[9px] text-slate-400 uppercase tracking-wider">Generated Date</p>
              <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mt-1">{new Date(report.created_at).toLocaleDateString()}</p>
            </div>
            <div className="glass-card rounded-xl p-3 text-center">
              <p className="text-[9px] text-slate-400 uppercase tracking-wider">Prediction ID</p>
              <p className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 mt-1" title={report.prediction_id}>
                {report.prediction_id ? `${report.prediction_id.slice(0,8)}…` : 'N/A'}
              </p>
            </div>
          </div>

          {/* Type-specific preview content */}
          {data && <PreviewContent reportType={report.report_type} data={data} />}
        </div>

        {/* Export Actions */}
        <div className="px-6 py-4 border-t border-borderLight dark:border-borderDark flex-shrink-0 flex items-center gap-3 justify-end">
          <button
            onClick={handleExcel}
            disabled={downloadingExcel}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-borderLight dark:border-borderDark rounded-xl hover:bg-slate-50 dark:hover:bg-bgDark transition-all"
          >
            {downloadingExcel ? <Loader size={12} className="animate-spin" /> : <FileSpreadsheet size={12} className="text-green-600" />}
            Export Excel
          </button>
          <button
            onClick={handlePdf}
            disabled={downloadingPdf}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-primary-700 hover:bg-primary-600 rounded-xl transition-all shadow-neon"
          >
            {downloadingPdf ? <Loader size={12} className="animate-spin" /> : <FileDown size={12} />}
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Preview Content by Report Type ───────────────────────────────────────────

function PreviewContent({ reportType, data }) {
  if (reportType === 'waste_classification') return <WasteClassificationPreview data={data} />;
  if (reportType === 'recycling') return <RecyclingPreview data={data} />;
  if (reportType === 'sustainability') return <SustainabilityPreview data={data} />;
  if (reportType === 'environmental_impact') return <EnvironmentalPreview data={data} />;
  if (reportType === 'circular_economy') return <CircularPreview data={data} />;
  if (reportType === 'esg_summary') return <ESGSummaryPreview data={data} />;
  return null;
}

function PreviewRow({ label, value, highlight }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-borderLight dark:border-borderDark last:border-0">
      <span className="text-[10px] text-slate-500 font-medium flex-shrink-0">{label}</span>
      <span className={`text-[10px] font-semibold text-right ${highlight ? 'text-primary-600 dark:text-primary-neon' : 'text-slate-800 dark:text-slate-200'}`}>
        {value ?? '—'}
      </span>
    </div>
  );
}

function FlagChip({ label, active }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
      active
        ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 line-through'
    }`}>
      {label}
    </span>
  );
}

function WasteClassificationPreview({ data }) {
  const ai = data?.ai_results || {};
  const img = data?.image_info || {};

  const radarData = [
    { subject: 'Recyclability', value: ai.recyclability_score || 0 },
    { subject: 'Reuse', value: ai.reuse_potential || 0 },
    { subject: 'AI Confidence', value: ai.overall_confidence || 0 },
    { subject: 'Mat. Recovery', value: ai.material_recovery_score || 0 },
    { subject: 'Waste Conf.', value: ai.waste_confidence || 0 },
  ];

  const API_BASE = 'http://localhost:8000';
  const imageUrl = img.original_path
    ? (img.original_path.startsWith('http')
        ? img.original_path
        : img.original_path.startsWith('/')
          ? `${API_BASE}${img.original_path}`
          : `${API_BASE}/uploads/${img.original_path}`)
    : null;

  const fiberComp = ai.fiber_composition || {};
  const matProbs = ai.material_probabilities || {};

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { v: `${(ai.recyclability_score || 0).toFixed(0)}%`, l: 'Recyclability', c: 'text-emerald-500' },
          { v: `${(ai.material_confidence || 0).toFixed(0)}%`, l: 'AI Confidence', c: 'text-blue-500' },
          { v: `${(ai.reuse_potential || 0).toFixed(0)}%`, l: 'Reuse Potential', c: 'text-amber-500' },
          { v: ai.overall_rating || '—', l: 'Rating', c: 'text-purple-500' },
        ].map((s, i) => (
          <div key={i} className="glass-card rounded-xl p-3 text-center">
            <p className={`text-base font-bold ${s.c}`}>{s.v}</p>
            <p className="text-[9px] text-slate-400 mt-0.5">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Table */}
        <div className="glass-card rounded-xl p-4 space-y-0 md:col-span-1">
          <p className="text-xs font-bold text-slate-700 dark:text-white mb-2">AI Classification</p>
          <PreviewRow label="Material" value={ai.material} highlight />
          <PreviewRow label="Waste Category" value={ai.waste_category} highlight />
          <PreviewRow label="Fabric Category" value={ai.fabric_category} />
          <PreviewRow label="Detected Color" value={ai.detected_color} />
          <PreviewRow label="Contamination" value={ai.contamination_status} />
          <PreviewRow label="Damage" value={ai.damage_detection} />
          <PreviewRow label="Image Quality" value={ai.image_quality} />
          <div className="flex flex-wrap gap-1.5 pt-2">
            <FlagChip label="Recyclable" active={ai.is_recyclable} />
            <FlagChip label="Reusable" active={ai.is_reusable} />
            <FlagChip label="Repairable" active={ai.is_repairable} />
            <FlagChip label="Hazardous" active={ai.is_hazardous} />
          </div>
        </div>

        {/* Radar Chart */}
        <div className="glass-card rounded-xl p-4 md:col-span-1">
          <p className="text-xs font-bold text-slate-700 dark:text-white mb-2">Score Breakdown</p>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#94a3b8' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
              <Radar dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Image Card */}
        <div className="glass-card rounded-xl p-4 flex flex-col justify-between md:col-span-1">
          <p className="text-xs font-bold text-slate-700 dark:text-white mb-2">Uploaded Textile Image</p>
          <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-bgDark rounded-2xl overflow-hidden border border-borderLight dark:border-borderDark h-40">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={img.filename || 'Textile waste'}
                className="max-h-full max-w-full object-contain"
                onError={(e) => { e.target.src = ''; e.target.alt = 'Image load failed'; }}
              />
            ) : (
              <div className="text-center text-slate-400">
                <Layers className="mx-auto mb-2 text-slate-300 dark:text-slate-600" size={24} />
                <p className="text-[10px]">No image available</p>
              </div>
            )}
          </div>
          <div className="mt-3 text-[10px] text-slate-400 font-mono space-y-0.5">
            <p className="truncate"><span className="font-semibold">Filename:</span> {img.filename || 'N/A'}</p>
            {img.resolution && <p><span className="font-semibold">Resolution:</span> {img.resolution}</p>}
          </div>
        </div>
      </div>

      {/* Fiber & Material Composition Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Fiber Composition */}
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs font-bold text-slate-700 dark:text-white mb-3">Fiber Composition</p>
          {Object.keys(fiberComp).length > 0 ? (
            <div className="space-y-2.5">
              {Object.entries(fiberComp).map(([material, pct]) => {
                const val = parseFloat(pct) || 0;
                const displayVal = val <= 1.0 && val > 0 ? val * 100 : val;
                return (
                  <div key={material}>
                    <div className="flex justify-between text-[10px] mb-1 font-semibold">
                      <span className="capitalize text-slate-700 dark:text-slate-300">{material}</span>
                      <span className="text-primary-600 dark:text-primary-neon">{displayVal.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                        style={{ width: `${Math.min(100, displayVal)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[10px] text-slate-400">No fiber composition data available</p>
          )}
        </div>

        {/* Material Probabilities */}
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs font-bold text-slate-700 dark:text-white mb-3">Material Probabilities</p>
          {Object.keys(matProbs).length > 0 ? (
            <div className="space-y-2.5">
              {Object.entries(matProbs).map(([material, pct]) => {
                const val = parseFloat(pct) || 0;
                const displayVal = val <= 1.0 && val > 0 ? val * 100 : val;
                return (
                  <div key={material}>
                    <div className="flex justify-between text-[10px] mb-1 font-semibold">
                      <span className="capitalize text-slate-700 dark:text-slate-300">{material}</span>
                      <span className="text-blue-600 dark:text-blue-400">{displayVal.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full"
                        style={{ width: `${Math.min(100, displayVal)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[10px] text-slate-400">No material probabilities available</p>
          )}
        </div>
      </div>

      {/* AI Recommendation */}
      {data?.ai_recommendation_summary && (
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs font-bold text-slate-700 dark:text-white mb-2 flex items-center gap-2">
            <Brain size={12} className="text-primary-500" /> AI Recommendation Summary
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">{data.ai_recommendation_summary}</p>
        </div>
      )}
    </div>
  );
}

function RecyclingPreview({ data }) {
  const rec = data?.recycling || {};
  const allRecs = rec.all_recommendations || [];
  const timeline = rec.status_timeline || [];

  const barData = allRecs.slice(0, 5).map(r => ({
    name: (r.method || '').slice(0, 10),
    value: parseFloat(r.success_rate) || 0,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { v: `${(rec.material_recovery_pct || 0).toFixed(0)}%`, l: 'Material Recovery', c: 'text-blue-500' },
          { v: rec.success_rate || '—', l: 'Success Rate', c: 'text-emerald-500' },
          { v: rec.estimated_cost || '—', l: 'Est. Cost', c: 'text-amber-500' },
          { v: rec.estimated_time || '—', l: 'Est. Time', c: 'text-purple-500' },
        ].map((s, i) => (
          <div key={i} className="glass-card rounded-xl p-3 text-center">
            <p className={`text-base font-bold ${s.c}`}>{s.v}</p>
            <p className="text-[9px] text-slate-400 mt-0.5">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card rounded-xl p-4 space-y-0">
          <p className="text-xs font-bold text-slate-700 dark:text-white mb-2">Primary Recommendation</p>
          <PreviewRow label="Method" value={rec.recommended_method} highlight />
          <PreviewRow label="Technique" value={rec.technique} />
          <PreviewRow label="Difficulty" value={rec.recovery_difficulty} />
          <PreviewRow label="Env. Benefit" value={rec.environmental_benefit} />
          <PreviewRow label="Applications" value={rec.industry_applications} />
        </div>

        {/* Status Timeline */}
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs font-bold text-slate-700 dark:text-white mb-3">Processing Timeline</p>
          <div className="space-y-2">
            {timeline.map((t, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                  t.done ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                }`}>
                  {t.done ? <CheckCircle size={10} className="text-white" /> : null}
                </div>
                <div>
                  <p className={`text-[10px] font-semibold ${t.done ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                    {t.step}
                  </p>
                  <p className="text-[9px] text-slate-400">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {barData.length > 0 && (
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs font-bold text-slate-700 dark:text-white mb-3">Recovery Methods Comparison</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
              <RTooltip contentStyle={{ fontSize: 11 }} />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Success %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function SustainabilityPreview({ data }) {
  const sus = data?.sustainability || {};
  const insights = sus.insights || [];

  const radarData = [
    { subject: 'Sustainability', value: sus.sustainability_score || 0 },
    { subject: 'Env. Benefit', value: sus.environmental_benefit_score || 0 },
    { subject: 'Resource Rec.', value: sus.resource_recovery_score || 0 },
    { subject: 'Mat. Longevity', value: sus.material_longevity_score || 0 },
    { subject: 'Waste Div.', value: sus.waste_diversion_score || 0 },
  ];

  const ratingColors = {
    'Excellent': 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20',
    'Good': 'text-blue-500 bg-blue-50 dark:bg-blue-950/20',
    'Average': 'text-amber-500 bg-amber-50 dark:bg-amber-950/20',
    'Needs Improvement': 'text-red-500 bg-red-50 dark:bg-red-950/20',
  };

  const diff = sus.benchmark_difference || 0;
  const diffSign = diff >= 0 ? `+${diff}` : `${diff}`;
  const diffColor = diff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';
  const statusColor = sus.benchmark_status === 'Above Average'
    ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20'
    : sus.benchmark_status === 'Below Average'
      ? 'text-red-600 bg-red-50 dark:bg-red-950/20'
      : 'text-amber-600 bg-amber-50 dark:bg-amber-950/20';

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="glass-card rounded-xl p-3 text-center col-span-1">
          <p className="text-2xl font-bold text-emerald-500">{(sus.sustainability_score || 0).toFixed(0)}</p>
          <p className="text-[9px] text-slate-400">Sustainability Score</p>
        </div>
        <div className={`rounded-xl p-3 text-center col-span-1 flex flex-col justify-center ${ratingColors[sus.sustainability_rating] || ratingColors['Average']}`}>
          <p className="text-sm font-bold">{sus.sustainability_rating || 'N/A'}</p>
          <p className="text-[9px] opacity-70">Rating</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center col-span-1">
          <p className="text-sm font-bold text-slate-700 dark:text-white mt-1">{sus.carbon_footprint || '—'}</p>
          <p className="text-[9px] text-slate-400">Carbon Footprint</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center col-span-1">
          <p className="text-sm font-bold text-slate-700 dark:text-white mt-1">{(sus.organization_average || 71.0).toFixed(1)}</p>
          <p className="text-[9px] text-slate-400">Industry Average</p>
        </div>
      </div>

      {/* Benchmark comparison card */}
      <div className="glass-card rounded-xl p-4">
        <p className="text-xs font-bold text-slate-700 dark:text-white mb-3">Sustainability Benchmark Comparison</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 border-r border-borderLight dark:border-borderDark">
            <p className="text-xs text-slate-400">Current Organization</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-1">{(sus.sustainability_score || 0).toFixed(0)}</p>
          </div>
          <div className="p-2 border-r border-borderLight dark:border-borderDark">
            <p className="text-xs text-slate-400">Industry Average</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-1">{(sus.organization_average || 71.0).toFixed(0)}</p>
          </div>
          <div className="p-2">
            <p className="text-xs text-slate-400">Difference</p>
            <p className={`text-sm font-bold mt-1 ${diffColor}`}>{diffSign}</p>
          </div>
        </div>
        <div className={`mt-3 p-2 rounded-xl text-center text-xs font-bold ${statusColor}`}>
          Performance: {sus.benchmark_status || 'Average'}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs font-bold text-slate-700 dark:text-white mb-3">Score Breakdown</p>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8, fill: '#94a3b8' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
              <Radar dataKey="value" stroke="#22c55e" fill="#22c55e" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {insights.length > 0 && (
          <div className="glass-card rounded-xl p-4">
            <p className="text-xs font-bold text-slate-700 dark:text-white mb-3 flex items-center gap-1.5">
              <Leaf size={11} className="text-green-500" /> AI Insights
            </p>
            <ul className="space-y-2">
              {insights.slice(0, 4).map((ins, i) => (
                <li key={i} className="text-[10px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
                  <span className="text-emerald-500 mt-0.5">•</span> {ins}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function EnvironmentalPreview({ data }) {
  const env = data?.environmental || {};

  const barData = [
    { name: 'CO₂ (kg)', value: env.co2_saved || 0, fill: '#10b981' },
    { name: 'Water (L×0.01)', value: (env.water_saved || 0) / 100, fill: '#3b82f6' },
    { name: 'Energy (kWh)', value: env.energy_saved || 0, fill: '#f59e0b' },
    { name: 'Landfill (kg)', value: env.landfill_diversion || 0, fill: '#06b6d4' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { v: `${(env.co2_saved || 0).toFixed(1)} kg`, l: 'CO₂ Saved', c: 'text-emerald-500', icon: Leaf },
          { v: `${(env.water_saved || 0).toFixed(0)} L`, l: 'Water Saved', c: 'text-blue-500', icon: Droplets },
          { v: `${(env.landfill_diversion || 0).toFixed(1)} kg`, l: 'Landfill Diverted', c: 'text-amber-500', icon: Archive },
          { v: `${(env.resource_conservation || 0).toFixed(1)} kg`, l: 'Resources Saved', c: 'text-teal-500', icon: TreePine },
        ].map((s, i) => (
          <div key={i} className="glass-card rounded-xl p-3 text-center">
            <s.icon size={14} className={`mx-auto mb-1 ${s.c}`} />
            <p className={`text-sm font-bold ${s.c}`}>{s.v}</p>
            <p className="text-[9px] text-slate-400">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-xl p-4">
        <p className="text-xs font-bold text-slate-700 dark:text-white mb-3">Impact Visualization</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 9 }} />
            <YAxis tick={{ fontSize: 9 }} />
            <RTooltip contentStyle={{ fontSize: 11 }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {barData.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card rounded-xl p-4">
        <p className="text-xs font-bold text-slate-700 dark:text-white mb-2">Ecological Equivalents</p>
        <div className="grid grid-cols-2 gap-2">
          <PreviewRow label="🌳 Trees Planted" value={`${(env.equivalent_trees || 0).toFixed(1)} trees`} />
          <PreviewRow label="⚡ Electricity Saved" value={`${(env.equivalent_electricity || 0).toFixed(1)} kWh`} />
          <PreviewRow label="🍶 Water Bottles" value={`${(env.equivalent_water_bottles || 0).toFixed(0)}`} />
          <PreviewRow label="🏠 Household Days" value={`${(env.equivalent_household_energy || 0).toFixed(1)} days`} />
        </div>
      </div>
    </div>
  );
}

function CircularPreview({ data }) {
  const circ = data?.circularity || {};

  const radarData = [
    { subject: 'Circularity', value: circ.circularity_score || 0 },
    { subject: 'Reuse', value: circ.reuse_potential || 0 },
    { subject: 'Recovery', value: circ.recovery_efficiency || 0 },
    { subject: 'Retention', value: circ.material_retention || 0 },
    { subject: 'Lifecycle', value: circ.lifecycle_extension || 0 },
  ];

  const pieData = [
    { name: 'Circular', value: circ.circularity_score || 0 },
    { name: 'Gap', value: 100 - (circ.circularity_score || 0) },
  ];

  const ratingColors = { Excellent: '#10b981', Good: '#3b82f6', Average: '#f59e0b', 'Needs Improvement': '#ef4444' };
  const ratingColor = ratingColors[circ.overall_rating] || '#94a3b8';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { v: (circ.circularity_score || 0).toFixed(0), l: 'Circularity Score', c: 'text-purple-500' },
          { v: `${(circ.reuse_potential || 0).toFixed(0)}%`, l: 'Reuse Potential', c: 'text-emerald-500' },
          { v: `${(circ.recovery_efficiency || 0).toFixed(0)}%`, l: 'Recovery Efficiency', c: 'text-blue-500' },
          { v: circ.overall_rating || '—', l: 'Rating', c: 'text-amber-500' },
        ].map((s, i) => (
          <div key={i} className="glass-card rounded-xl p-3 text-center">
            <p className={`text-base font-bold ${s.c}`}>{s.v}</p>
            <p className="text-[9px] text-slate-400 mt-0.5">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs font-bold text-slate-700 dark:text-white mb-2">Circularity Radar</p>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8, fill: '#94a3b8' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
              <Radar dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-xl p-4">
          <p className="text-xs font-bold text-slate-700 dark:text-white mb-2">Circularity Progress</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value" startAngle={90} endAngle={-270}>
                <Cell fill={ratingColor} />
                <Cell fill="#f1f5f9" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <p className="text-center text-xs font-bold" style={{ color: ratingColor, marginTop: -20 }}>
            {circ.classification || 'Standard Recovery'}
          </p>
        </div>
      </div>

      <div className="glass-card rounded-xl p-4">
        <p className="text-xs font-bold text-slate-700 dark:text-white mb-2">Detailed Metrics</p>
        <div className="grid grid-cols-2 gap-0">
          <PreviewRow label="Circularity Index" value={(circ.circularity_index || 0).toFixed(3)} highlight />
          <PreviewRow label="Material Retention" value={`${(circ.material_retention || 0).toFixed(1)}%`} />
          <PreviewRow label="Lifecycle Extension" value={`${(circ.lifecycle_extension || 0).toFixed(1)}%`} />
          <PreviewRow label="Overall Rating" value={circ.overall_rating} highlight />
        </div>
      </div>
    </div>
  );
}


function ESGSummaryPreview({ data }) {
  const esg = data?.esg || {};

  // E Pillar Radar Data
  const radarData = [
    { subject: 'Sustainability', value: esg.sustainability_score || 0 },
    { subject: 'Circularity', value: esg.circularity_score || 0 },
    { subject: 'Recovery', value: esg.material_recovery_score || 0 },
    { subject: 'Carbon Savings', value: Math.min(100, esg.co2_saved || 0) },
    { subject: 'Water Savings', value: Math.min(100, (esg.water_saved || 0) / 100) },
  ];

  // ESG Breakdown Pie Data
  const pieData = [
    { name: 'Environmental', value: esg.esg_score || 0, fill: '#10b981' },
  ];

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div className="glass-card rounded-2xl p-4 border border-borderLight dark:border-borderDark">
        <p className="text-xs font-bold text-slate-800 dark:text-white mb-2">Executive ESG Summary</p>
        <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-relaxed italic">{esg.executive_summary || 'Not Available'}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { v: esg.esg_score?.toFixed(0) || '—', l: 'ESG Score', c: 'text-primary-600 dark:text-primary-neon' },
          { v: esg.esg_rating || '—', l: 'ESG Rating', c: 'text-blue-500' },
          { v: esg.sustainability_score?.toFixed(0) || '—', l: 'Sustainability Score', c: 'text-emerald-500' },
          { v: esg.circularity_score?.toFixed(0) || '—', l: 'Circularity Score', c: 'text-purple-500' },
          { v: `${esg.co2_saved?.toFixed(1) || '0'} kg`, l: 'Carbon Savings', c: 'text-teal-500' },
          { v: `${esg.water_saved?.toFixed(0) || '0'} L`, l: 'Water Savings', c: 'text-cyan-500' },
        ].map((s, i) => (
          <div key={i} className="glass-card rounded-xl p-3 text-center">
            <p className={`text-sm font-bold ${s.c} truncate`}>{s.v}</p>
            <p className="text-[9px] text-slate-400 mt-0.5 leading-tight">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Radar Chart */}
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs font-bold text-slate-700 dark:text-white mb-3">Environmental (E) Performance Radar</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8, fill: '#94a3b8' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
              <Radar dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* ESG Breakdown Pie Chart & S/G Pillar Details */}
        <div className="glass-card rounded-xl p-4 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-700 dark:text-white mb-2">ESG Pillars Breakdown</p>
            <p className="text-[10px] text-slate-400 mb-3">Environmental is dynamically calculated. Social & Governance are trace-only indicators.</p>
          </div>
          <div className="flex items-center justify-around flex-wrap gap-4">
            <div className="w-32 h-32 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={50} dataKey="value" startAngle={90} endAngle={-270}>
                    <Cell fill="#10b981" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-bold text-slate-800 dark:text-white">E Pillar</span>
                <span className="text-[9px] text-slate-450">{esg.sustainability_score?.toFixed(0)}%</span>
              </div>
            </div>
            
            <div className="space-y-2 text-[10px] font-medium min-w-32">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                <span className="text-slate-700 dark:text-slate-350">Environmental: <b>{esg.sustainability_score?.toFixed(0)}%</b></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-slate-300 dark:bg-slate-700 rounded-full"></span>
                <span className="text-slate-450">Social: <b className="text-slate-450">Not Available</b></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-slate-300 dark:bg-slate-700 rounded-full"></span>
                <span className="text-slate-450">Governance: <b className="text-slate-450">Not Available</b></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social & Governance Metrics Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Social Pillars */}
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs font-bold text-slate-700 dark:text-white mb-2">Social (S) Indicators</p>
          <div className="space-y-0 text-[10px]">
            <PreviewRow label="Compliance Status" value={esg.compliance_status || 'Not Available'} />
            <PreviewRow label="Waste Handling Safety" value={esg.waste_handling_safety || 'Not Available'} />
            <PreviewRow label="Hazardous Material Detection" value={esg.hazardous_material_detection || 'Not Available'} highlight={esg.hazardous_material_detection?.includes('Detected')} />
            <PreviewRow label="Contamination Risk" value={esg.contamination_risk || 'Not Available'} highlight={esg.contamination_risk?.includes('Detected')} />
            <PreviewRow label="Supply Chain Transparency" value={esg.supply_chain_transparency || 'Not Available'} />
          </div>
          <p className="text-[8px] text-slate-400 mt-2.5 italic">Note: The current platform does not capture employee-centric social metrics.</p>
        </div>

        {/* Governance Pillars */}
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs font-bold text-slate-700 dark:text-white mb-2">Governance (G) Metadata</p>
          <div className="space-y-0 text-[10px]">
            <PreviewRow label="Prediction Confidence" value={esg.prediction_confidence ? `${esg.prediction_confidence.toFixed(1)}%` : '—'} highlight />
            <PreviewRow label="AI Model Version" value={esg.model_version || 'Not Available'} />
            <PreviewRow label="Dataset Used" value={esg.dataset_used || 'Not Available'} />
            <PreviewRow label="Report Generated By" value={esg.generated_by || '—'} />
            <PreviewRow label="Report Generated On" value={esg.generated_on ? new Date(esg.generated_on).toLocaleString() : '—'} />
            <PreviewRow label="Dataset Traceability" value={esg.dataset_traceability || 'Not Available'} />
            <PreviewRow label="Audit Timestamp" value={esg.audit_timestamp ? new Date(esg.audit_timestamp).toLocaleTimeString() : '—'} />
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── Report Card ──────────────────────────────────────────────────────────────

function ReportCard({ report, onPreview, onDownloadPdf, onDownloadExcel, onArchive }) {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const meta = TYPE_META[report.report_type] || TYPE_META.waste_classification;
  const Icon = meta.icon;

  const handlePdf = async (e) => {
    e.stopPropagation();
    setDownloadingPdf(true);
    try { await onDownloadPdf(report.id, report.title); } finally { setDownloadingPdf(false); }
  };
  const handleExcel = async (e) => {
    e.stopPropagation();
    setDownloadingExcel(true);
    try { await onDownloadExcel(report.id, report.title); } finally { setDownloadingExcel(false); }
  };

  return (
    <div
      className={`glass-card rounded-3xl p-5 border-l-4 ${meta.border} hover:shadow-neon transition-all duration-300 hover:-translate-y-0.5 cursor-pointer`}
      onClick={() => onPreview(report)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`p-2.5 rounded-xl ${meta.bg} ${meta.text} flex-shrink-0`}>
            <Icon size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <StatusBadge status={report.status} />
              <TypeBadge type={report.report_type} />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate">{report.title}</h3>
            <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-slate-400">
              {report.user_name && (
                <span className="flex items-center gap-1">
                  <User size={9} /> {report.user_name}
                </span>
              )}
              {report.organization_name && (
                <span className="flex items-center gap-1">
                  <Building size={9} /> {report.organization_name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={9} /> {new Date(report.created_at).toLocaleString()}
              </span>
              {report.has_pdf && (
                <span className="flex items-center gap-1 text-red-500">
                  <FileDown size={9} /> PDF
                </span>
              )}
              {report.has_excel && (
                <span className="flex items-center gap-1 text-green-600">
                  <FileSpreadsheet size={9} /> Excel
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onPreview(report)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300 border border-borderLight dark:border-borderDark rounded-lg hover:bg-slate-50 dark:hover:bg-cardDark transition-all"
          >
            <Eye size={10} /> Preview
          </button>
          <button
            onClick={handleExcel}
            disabled={downloadingExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-50 dark:hover:bg-green-950/20 transition-all"
          >
            {downloadingExcel ? <Loader size={10} className="animate-spin" /> : <FileSpreadsheet size={10} />}
            Excel
          </button>
          <button
            onClick={handlePdf}
            disabled={downloadingPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-white bg-primary-700 hover:bg-primary-600 rounded-lg shadow-neon transition-all"
          >
            {downloadingPdf ? <Loader size={10} className="animate-spin" /> : <FileDown size={10} />}
            PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ReportsHub() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [allowedTypes, setAllowedTypes] = useState([]);
  const [filterType, setFilterType] = useState(() => {
    return location.state?.filterType || '';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'type_az', 'type_za'
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [previewReport, setPreviewReport] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [successMsg, setSuccessMsg] = useState('');
  const [exportError, setExportError] = useState('');

  // Load allowed types
  useEffect(() => {
    ReportService.getReportTypes()
      .then(r => setAllowedTypes(r.data || []))
      .catch(() => {});
  }, []);

  // Load reports
  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, per_page: PER_PAGE };
      if (filterType) params.report_type = filterType;
      // Pass backend date sort order if applicable
      if (sortBy === 'oldest') {
        params.sort = 'asc';
      } else {
        params.sort = 'desc';
      }

      const res = await ReportService.listReports(params);
      const d = res.data;

      // Client-side search filter
      let items = d.items || [];
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        items = items.filter(r =>
          r.title?.toLowerCase().includes(q) ||
          r.report_type?.toLowerCase().includes(q) ||
          r.user_name?.toLowerCase().includes(q) ||
          r.organization_name?.toLowerCase().includes(q)
        );
      }

      // Sort client-side
      if (sortBy === 'newest') {
        items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      } else if (sortBy === 'oldest') {
        items.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      } else if (sortBy === 'type_az') {
        items.sort((a, b) => (a.report_type || '').localeCompare(b.report_type || ''));
      } else if (sortBy === 'type_za') {
        items.sort((a, b) => (b.report_type || '').localeCompare(a.report_type || ''));
      }

      setReports(items);
      setTotal(d.total || 0);
      setPages(d.pages || 1);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [page, filterType, searchQuery, sortBy]);

  useEffect(() => { loadReports(); }, [loadReports]);

  const handleGenerated = (data) => {
    setShowGenerateModal(false);
    setSuccessMsg(`✓ ${data.title || 'Report'} generated successfully!`);
    setTimeout(() => setSuccessMsg(''), 4000);
    loadReports();
  };

  const handlePreview = async (report) => {
    setPreviewLoading(true);
    setPreviewReport(report);
    setPreviewData(null);
    try {
      const res = await ReportService.getReport(report.id);
      setPreviewData(res.data);
    } catch (err) {
      console.error('Preview load failed:', err);
      setPreviewData(report); // fallback to list item
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    if (location.state?.previewReportId) {
      const reportId = location.state.previewReportId;
      handlePreview({ id: reportId });
      
      if (location.state?.successMsg) {
        setSuccessMsg(location.state.successMsg);
        setTimeout(() => setSuccessMsg(''), 5000);
      }
      
      // Clear location state to prevent opening preview again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleDownloadPdf = async (id, title) => {
    try {
      await ReportService.downloadPdf(id, title);
      setSuccessMsg('PDF downloaded successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      loadReports();
    } catch (err) {
      setExportError('PDF export failed. Please try again.');
      setTimeout(() => setExportError(''), 4000);
    }
  };

  const handleDownloadExcel = async (id, title) => {
    try {
      await ReportService.downloadExcel(id, title);
      setSuccessMsg('Excel downloaded successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      loadReports();
    } catch (err) {
      setExportError('Excel export failed. Please try again.');
      setTimeout(() => setExportError(''), 4000);
    }
  };

  const typeStats = allowedTypes.map(t => ({
    ...t,
    count: reports.filter(r => r.report_type === t.type).length,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-800 dark:bg-emerald-950 text-primary-neon rounded-2xl shadow-neon">
            <FileText size={18} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Reports & Export Hub</h1>
            <p className="text-xs text-slate-400">{total} reports generated · Professional PDF & Excel exports</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadReports}
            className="p-2.5 text-slate-500 border border-borderLight dark:border-borderDark rounded-xl hover:bg-slate-50 dark:hover:bg-cardDark transition-all"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-700 hover:bg-primary-600 text-white text-xs font-bold rounded-xl shadow-neon transition-all"
          >
            <Plus size={13} /> Generate Report
          </button>
        </div>
      </div>

      {/* ── Success / Error Toasts ── */}
      {successMsg && (
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl px-4 py-3 animate-fade-in">
          <CheckCircle size={14} className="text-emerald-500" />
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{successMsg}</p>
        </div>
      )}
      {exportError && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl px-4 py-3">
          <AlertCircle size={14} className="text-red-500" />
          <p className="text-xs text-red-600 dark:text-red-400">{exportError}</p>
        </div>
      )}

      {/* ── Report Type Cards ── */}
      {allowedTypes.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {allowedTypes.map((t) => {
            const meta = TYPE_META[t.type] || TYPE_META.waste_classification;
            const Icon = meta.icon;
            const count = reports.filter(r => r.report_type === t.type).length;
            const isActive = filterType === t.type;
            return (
              <button
                key={t.type}
                onClick={() => setFilterType(isActive ? '' : t.type)}
                className={`glass-card rounded-2xl p-4 text-left transition-all hover:-translate-y-0.5 ${
                  isActive ? `ring-2 ring-${meta.color}-400 ${meta.bg}` : ''
                }`}
              >
                <div className={`p-2 rounded-xl ${meta.bg} ${meta.text} inline-flex mb-2`}>
                  <Icon size={13} />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{t.label}</p>
                <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-2">{t.description}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Search + Filter Bar ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search reports…"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full pl-8 pr-4 py-2.5 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-emerald-900"
          />
        </div>
        
        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-medium">Sort:</span>
          <select
            value={sortBy}
            onChange={e => { setSortBy(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-xl text-xs outline-none text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary-200 dark:focus:ring-emerald-900 font-medium cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="type_az">Report Type (A–Z)</option>
            <option value="type_za">Report Type (Z–A)</option>
          </select>
        </div>

        {filterType && (
          <button
            onClick={() => setFilterType('')}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary-50 dark:bg-emerald-950/20 text-primary-700 dark:text-primary-neon border border-primary-200 dark:border-emerald-800 rounded-xl text-[10px] font-semibold"
          >
            <X size={10} />
            {TYPE_META[filterType]?.label || filterType}
          </button>
        )}
        <p className="text-xs text-slate-400 ml-auto">{total} total</p>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl px-4 py-3">
          <AlertCircle size={14} className="text-red-500" />
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* ── Reports List ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader size={24} className="animate-spin text-primary-500" />
          <p className="text-xs text-slate-400">Loading reports…</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="glass-card rounded-3xl py-20 text-center space-y-4">
          <FileText size={44} className="mx-auto text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-bold text-slate-500">No reports found</p>
          <p className="text-xs text-slate-400">
            {filterType || searchQuery ? 'Try clearing filters' : 'Generate your first report to get started'}
          </p>
          {!filterType && !searchQuery && (
            <button
              onClick={() => setShowGenerateModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-700 text-white text-xs font-bold rounded-xl hover:bg-primary-600 transition-all shadow-neon"
            >
              <Plus size={12} /> Generate First Report
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onPreview={handlePreview}
              onDownloadPdf={handleDownloadPdf}
              onDownloadExcel={handleDownloadExcel}
              onArchive={(id) => {
                ReportService.archiveReport(id).then(loadReports);
              }}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl border border-borderLight dark:border-borderDark text-slate-400 hover:text-slate-600 disabled:opacity-30"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs text-slate-500 px-2">Page {page} of {pages}</span>
          <button
            onClick={() => setPage(p => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="p-2 rounded-xl border border-borderLight dark:border-borderDark text-slate-400 hover:text-slate-600 disabled:opacity-30"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* ── Generate Modal ── */}
      {showGenerateModal && (
        <GenerateModal
          onClose={() => setShowGenerateModal(false)}
          onGenerated={handleGenerated}
          allowedTypes={allowedTypes}
        />
      )}

      {/* ── Preview Modal ── */}
      {previewReport && (
        previewLoading ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Loader size={28} className="animate-spin text-white" />
          </div>
        ) : (
          <PreviewModal
            report={previewData || previewReport}
            onClose={() => { setPreviewReport(null); setPreviewData(null); }}
            onDownloadPdf={handleDownloadPdf}
            onDownloadExcel={handleDownloadExcel}
          />
        )
      )}
    </div>
  );
}
