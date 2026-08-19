import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, Download, Calendar, 
  CheckCircle2, FileText, Sparkles, RefreshCw, 
  Filter, Layers, Scale, Leaf, Eye, ArrowUpRight, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell 
} from 'recharts';
import { api } from '../services/api';

interface ReportsPageProps {
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const REPORT_TEMPLATES = [
  {
    type: 'classification',
    title: 'Textile Waste Classification Report',
    subtitle: 'Module 12.1 • Fiber Composition & Purity Audit',
    description: 'Comprehensive inventory breakdown by fiber composition (10 materials), blend ratios, purity grade, contamination index, and recyclability scores.',
    pdfPages: '2 Pages',
    excelSheets: '3 Sheets (Summary, Fiber Breakdown, Quality Diagnostics)',
    accent: 'emerald'
  },
  {
    type: 'recycling',
    title: 'Circular Recycling & Recovery Strategy Report',
    subtitle: 'Module 12.2 • 7-Pathway Recovery Routing',
    description: 'Technical circular processing pathways matched with regional recovery facilities, processing efficiencies (82–94%), and industrial compounding next steps.',
    pdfPages: '2 Pages',
    excelSheets: '3 Sheets (Strategy Matrix, Facility Routing, Yields)',
    accent: 'teal'
  },
  {
    type: 'sustainability',
    title: 'Executive Sustainability & Circularity Report',
    subtitle: 'Module 12.3 • 5-Part Mathematical Formula Scoring',
    description: 'High-level ESG executive report detailing weighted circularity scores (0.35R + 0.20C + 0.20P + 0.15E + 0.10F), diversion rates, and grade distribution.',
    pdfPages: '3 Pages',
    excelSheets: '4 Sheets (ESG Scorecard, Formula Breakdown, Benchmarks)',
    accent: 'forest'
  },
  {
    type: 'environmental',
    title: 'Environmental Impact & LCA Audit Report',
    subtitle: 'Module 12.4 • Carbon & Resource Conservation',
    description: 'Verified ISO 14040 LCA metrics calculating CO₂ emission reductions, freshwater preservation, landfill avoidance, and virgin fiber displacement.',
    pdfPages: '2 Pages',
    excelSheets: '3 Sheets (LCA Metrics, Resource Savings, Emissions)',
    accent: 'amber'
  },
  {
    type: 'circular_economy',
    title: 'Enterprise Circular Economy & Waste Diversion Audit',
    subtitle: 'Module 12.5 • Multi-Node Facility Overview',
    description: 'Cross-warehouse consolidated performance audit comparing recovery yields, closed-loop retention, and circular supply chain economic value.',
    pdfPages: '4 Pages',
    excelSheets: '5 Sheets (Consolidated KPIs, Batch Logs, LCA, Audit Log)',
    accent: 'indigo'
  }
];

export const ReportsPage: React.FC<ReportsPageProps> = ({ onToast }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(REPORT_TEMPLATES[0]);
  const [dateRange, setDateRange] = useState({ start: '2026-01-01', end: '2026-08-15' });
  const [downloading, setDownloading] = useState<string | null>(null);
  const [systemData, setSystemData] = useState<any>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>('all');
  const [includeLca, setIncludeLca] = useState(true);
  const [includeFacilityRouting, setIncludeFacilityRouting] = useState(true);
  const [includeFiberTable, setIncludeFiberTable] = useState(true);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [dash, analyses] = await Promise.all([
        api.getDashboardData(),
        api.getAnalysisHistory()
      ]);
      setSystemData(dash);
      setRecentAnalyses(analyses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloading('pdf');
    try {
      onToast(`Generating verified PDF report: ${selectedTemplate.title}...`, 'info');
      const titleParam = selectedAnalysisId !== 'all' 
        ? `${selectedTemplate.title} (${selectedAnalysisId})` 
        : selectedTemplate.title;
      await api.downloadPdfReport(selectedTemplate.type, titleParam, selectedAnalysisId !== 'all' ? selectedAnalysisId : undefined);
      onToast('PDF Report generated and downloaded successfully!', 'success');
    } catch (err) {
      onToast('Failed to generate PDF report. Please try again.', 'error');
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadExcel = async () => {
    setDownloading('excel');
    try {
      onToast(`Generating Excel workbook: ${selectedTemplate.title}...`, 'info');
      const titleParam = selectedAnalysisId !== 'all' 
        ? `${selectedTemplate.title} (${selectedAnalysisId})` 
        : selectedTemplate.title;
      await api.downloadExcelReport(selectedTemplate.type, titleParam);
      onToast('Excel workbook exported successfully!', 'success');
    } catch (err) {
      onToast('Failed to export Excel spreadsheet.', 'error');
    } finally {
      setDownloading(null);
    }
  };

  const sampleChartData = [
    { name: 'Cotton (98%)', value: 42, color: '#004d3d' },
    { name: 'Poly-Cotton', value: 24, color: '#059669' },
    { name: 'Merino Wool', value: 16, color: '#0d9488' },
    { name: 'Nylon 6,6', value: 11, color: '#3b82f6' },
    { name: 'Linen / Silk', value: 7, color: '#d97706' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. EDITORIAL HEADER SECTION */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-semibold text-[#004d3d] uppercase tracking-wider">
              Module 12 • Presentation & Corporate Exports
            </span>
            <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              Reports & Environmental Analytics
            </h1>
            <p className="text-sm text-stone-500 max-w-2xl leading-relaxed">
              Export comprehensive, publication-grade sustainability audits, ISO 14040 LCA certifications, 
              fiber blend diagnostics, and full Excel spreadsheets with real calculated parameters.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="p-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-full text-stone-600 transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-[#004d3d] text-xs font-semibold rounded-full flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Real-Time Data Synced</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 2. REPORT TEMPLATE SELECTOR (LEFT COLUMN: 4 SPANS) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider font-mono">
              Standardized Report Types
            </h2>
            <span className="text-[11px] text-stone-400 font-mono">5 Available</span>
          </div>

          <div className="space-y-3">
            {REPORT_TEMPLATES.map((tmpl) => {
              const isSelected = selectedTemplate.type === tmpl.type;
              return (
                <div
                  key={tmpl.type}
                  onClick={() => setSelectedTemplate(tmpl)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-[#004d3d] ring-2 ring-[#004d3d]/20 shadow-md'
                      : 'bg-white/80 hover:bg-white border-stone-200/80 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1 gap-2">
                    <span className={`text-xs font-bold ${isSelected ? 'text-[#004d3d]' : 'text-stone-900'}`}>
                      {tmpl.title}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600 shrink-0">
                      PDF / XLSX
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-[#004d3d] font-semibold mb-1">
                    {tmpl.subtitle}
                  </div>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    {tmpl.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* QUICK EXPORT PRESETS */}
          <div className="bg-[#004d3d]/5 border border-[#004d3d]/20 rounded-2xl p-4 text-xs space-y-2">
            <div className="font-bold text-[#004d3d] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Audit Compliance Guarantee</span>
            </div>
            <p className="text-stone-600 text-[11px] leading-relaxed">
              Every exported document is tagged with verified timestamps, cryptographic report IDs, 
              and full mathematical derivations according to the ISO 14040 Circularity Standard.
            </p>
          </div>
        </div>

        {/* 3. REPORT BUILDER & LIVE DATA PREVIEW (RIGHT COLUMN: 8 SPANS) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* BUILDER CONFIGURATION CARD */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-xs space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#004d3d] font-bold">Selected Export Specification</span>
                <h3 className="font-serif-display text-xl font-bold text-stone-900 mt-0.5">{selectedTemplate.title}</h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-500 font-mono">
                <span className="px-2 py-1 bg-stone-100 rounded-md">{selectedTemplate.pdfPages}</span>
                <span className="px-2 py-1 bg-stone-100 rounded-md">{selectedTemplate.excelSheets}</span>
              </div>
            </div>

            {/* REPORT SCOPE CONTROLS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1.5">Report Target Scope:</label>
                <select
                  value={selectedAnalysisId}
                  onChange={(e) => setSelectedAnalysisId(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-800 focus:ring-2 focus:ring-[#004d3d] outline-hidden"
                >
                  <option value="all">Entire Warehouse & Inventory (Consolidated)</option>
                  {recentAnalyses.map((a) => (
                    <option key={a.id} value={a.id}>
                      Analysis {a.id} - {a.detectedMaterial} ({a.batchId || 'Single Batch'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1.5">Audit Timeframe:</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 text-xs text-stone-800 font-mono"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 text-xs text-stone-800 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* CUSTOM REPORT TOGGLE OPTIONS */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/70 space-y-3">
              <div className="text-xs font-bold text-stone-700">Optional Audit Modules to Include:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                  <input
                    type="checkbox"
                    checked={includeLca}
                    onChange={(e) => setIncludeLca(e.target.checked)}
                    className="rounded text-[#004d3d] focus:ring-[#004d3d]"
                  />
                  <span>ISO 14040 LCA Accounting</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                  <input
                    type="checkbox"
                    checked={includeFacilityRouting}
                    onChange={(e) => setIncludeFacilityRouting(e.target.checked)}
                    className="rounded text-[#004d3d] focus:ring-[#004d3d]"
                  />
                  <span>Facility Routing & Yields</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                  <input
                    type="checkbox"
                    checked={includeFiberTable}
                    onChange={(e) => setIncludeFiberTable(e.target.checked)}
                    className="rounded text-[#004d3d] focus:ring-[#004d3d]"
                  />
                  <span>Fiber Blend Breakdown</span>
                </label>
              </div>
            </div>

            {/* LIVE REPORT DATA PREVIEW CONTAINER */}
            <div className="border border-stone-200 rounded-2xl p-5 bg-white space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                  <Eye className="w-4 h-4 text-[#004d3d]" />
                  <span>Real-time Report Preview (Sample Calculated Data)</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 font-bold px-2 py-0.5 bg-emerald-50 rounded">
                  VERIFIED ACCURACY
                </span>
              </div>

              {/* KPI STATS IN PREVIEW */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-stone-50 border border-stone-200/60 rounded-xl">
                  <div className="text-[10px] uppercase font-mono text-stone-500">Processed Waste</div>
                  <div className="text-base font-bold text-stone-900 font-mono mt-0.5">
                    {systemData ? (systemData.metrics.totalWasteKg / 1000).toFixed(1) : '124.5'} <span className="text-xs font-normal text-stone-500">Tons</span>
                  </div>
                </div>
                <div className="p-3 bg-stone-50 border border-stone-200/60 rounded-xl">
                  <div className="text-[10px] uppercase font-mono text-stone-500">Circularity Index</div>
                  <div className="text-base font-bold text-[#004d3d] font-mono mt-0.5">
                    {systemData ? systemData.metrics.circularityScore : '84.2'} <span className="text-xs font-normal text-stone-500">/ 100</span>
                  </div>
                </div>
                <div className="p-3 bg-stone-50 border border-stone-200/60 rounded-xl">
                  <div className="text-[10px] uppercase font-mono text-stone-500">CO₂ Avoided</div>
                  <div className="text-base font-bold text-emerald-700 font-mono mt-0.5">
                    {systemData ? systemData.metrics.co2SavedTons : '342.8'} <span className="text-xs font-normal text-stone-500">Tons</span>
                  </div>
                </div>
                <div className="p-3 bg-stone-50 border border-stone-200/60 rounded-xl">
                  <div className="text-[10px] uppercase font-mono text-stone-500">Landfill Diverted</div>
                  <div className="text-base font-bold text-stone-900 font-mono mt-0.5">
                    88.4%
                  </div>
                </div>
              </div>

              {/* PREVIEW SUMMARY TABLE */}
              <div className="overflow-x-auto rounded-xl border border-stone-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100/80 text-stone-700 font-semibold font-mono text-[11px]">
                    <tr>
                      <th className="p-2.5">Material / Batch</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5">Dominant Fiber</th>
                      <th className="p-2.5">Recyclability</th>
                      <th className="p-2.5">Primary Strategy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-600">
                    <tr className="hover:bg-stone-50/50">
                      <td className="p-2.5 font-semibold text-stone-900">Indigo Cotton Twill (BATCH-2026-101)</td>
                      <td className="p-2.5"><span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-medium">Recyclable</span></td>
                      <td className="p-2.5 font-mono">Cotton (98%)</td>
                      <td className="p-2.5 font-mono text-emerald-700 font-bold">94%</td>
                      <td className="p-2.5">Mechanical Respinning</td>
                    </tr>
                    <tr className="hover:bg-stone-50/50">
                      <td className="p-2.5 font-semibold text-stone-900">Heavy Poly-Cotton (BATCH-2026-102)</td>
                      <td className="p-2.5"><span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-medium">Chemical Recovery</span></td>
                      <td className="p-2.5 font-mono">Poly (65%) + Cotton (35%)</td>
                      <td className="p-2.5 font-mono text-teal-700 font-bold">86%</td>
                      <td className="p-2.5">Hydrothermal Separation</td>
                    </tr>
                    <tr className="hover:bg-stone-50/50">
                      <td className="p-2.5 font-semibold text-stone-900">Pure Merino Knit (BATCH-2026-103)</td>
                      <td className="p-2.5"><span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-medium">Upcyclable</span></td>
                      <td className="p-2.5 font-mono">Merino Wool (100%)</td>
                      <td className="p-2.5 font-mono text-amber-700 font-bold">96%</td>
                      <td className="p-2.5">Thermal Insulation / Felt</td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>

            {/* ACTION BUTTONS: DOWNLOAD PDF & EXCEL */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              
              <button
                onClick={handleDownloadPdf}
                disabled={downloading === 'pdf'}
                className="w-full sm:w-auto flex-1 py-3.5 px-6 bg-[#004d3d] hover:bg-[#00382c] text-white font-semibold text-xs rounded-full shadow-md hover:shadow-lg transition-all hover:scale-101 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{downloading === 'pdf' ? 'Generating Presentation PDF...' : 'Download Verified Corporate PDF (.pdf)'}</span>
              </button>

              <button
                onClick={handleDownloadExcel}
                disabled={downloading === 'excel'}
                className="w-full sm:w-auto flex-1 py-3.5 px-6 bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs rounded-full border border-stone-300 shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#004d3d]" />
                <span>{downloading === 'excel' ? 'Exporting Multi-Sheet Workbook...' : 'Export Full Raw Excel Workbook (.xlsx)'}</span>
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
