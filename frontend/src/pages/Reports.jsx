import { api } from "../api/client";

export default function Reports() {
  const reports = [
    {
      title: "Waste Classification PDF Report",
      description: "Complete list of analyzed batches, predicted fabric materials (Denim, Cotton, Wool, Silk, etc.), contamination & damage scores.",
      pdfUrl: api.getClassificationReportPdfUrl(),
      excelUrl: api.getExcelClassificationExportUrl(),
    },
    {
      title: "Circular Economy & Sustainability PDF Report",
      description: "Aggregated landfill diversion, CO₂ lifecycle emissions avoided, water savings, and circular economy recovery pathways.",
      pdfUrl: api.getCircularEconomyReportPdfUrl(),
      excelUrl: api.getExcelSustainabilityExportUrl(),
    },
    {
      title: "Full Inventory Classification Excel Export",
      description: "Raw data export of all registered waste batches, fabric compositions, recyclability scores, and status.",
      excelUrl: api.getExcelClassificationExportUrl(),
    },
    {
      title: "ESG Environmental Impact Excel Export",
      description: "Detailed sustainability impact indicators, CO₂e and water metrics per kilogram of waste diverted.",
      excelUrl: api.getExcelSustainabilityExportUrl(),
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Reports & Export Center</h1>
        <p className="text-sm text-slate-400">
          Generate and download PDF & Excel reports across classification, recycling, sustainability, and environmental impact.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((r, i) => (
          <div key={i} className="p-5 glass-card rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
            <div>
              <h2 className="font-bold text-white text-base">{r.title}</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{r.description}</p>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              {r.pdfUrl && (
                <a
                  href={r.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-medium text-white text-xs text-center transition shadow-lg shadow-emerald-500/20"
                >
                  Download PDF
                </a>
              )}
              {r.excelUrl && (
                <a
                  href={r.excelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-medium text-slate-200 text-xs text-center border border-slate-700 transition"
                >
                  Export Excel (.xlsx)
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
