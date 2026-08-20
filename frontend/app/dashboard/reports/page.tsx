"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText, Download, FileSpreadsheet, Filter,
  BarChart3, Leaf, Globe, Recycle, RefreshCw, CheckCircle, Loader2
} from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

const REPORT_TYPES = [
  {
    id: "waste",
    title: "Waste Report",
    desc: "Complete textile waste collection and categorization data with batch-level details",
    icon: "🗑️",
    color: "from-primary-500 to-primary-700",
    iconComp: BarChart3,
  },
  {
    id: "recycling",
    title: "Recycling Report",
    desc: "Recycling performance, recovery methods, facility matching, and 7-pathway analysis",
    icon: "♻️",
    color: "from-secondary-500 to-secondary-700",
    iconComp: Recycle,
  },
  {
    id: "sustainability",
    title: "Sustainability Report",
    desc: "CO₂, water, energy savings, circular economy score, and sustainability KPIs",
    icon: "🌱",
    color: "from-teal-500 to-green-700",
    iconComp: Leaf,
  },
  {
    id: "environmental",
    title: "Environmental Impact Report",
    desc: "Full environmental impact assessment, SDG alignment, and ESG metrics",
    icon: "🌍",
    color: "from-blue-500 to-cyan-700",
    iconComp: Globe,
  },
  {
    id: "circular_economy",
    title: "Circular Economy Report",
    desc: "Circular economy analytics, material loop efficiency, and value retention metrics",
    icon: "🔄",
    color: "from-purple-500 to-violet-700",
    iconComp: RefreshCw,
  },
];

export default function ReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null);
  const [format, setFormat] = useState<"pdf" | "excel">("pdf");
  const [reportList, setReportList] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // Load available reports from backend
  useEffect(() => {
    api.get("/reports/")
      .then((r) => setReportList(r.data || []))
      .catch(() => setReportList([]))
      .finally(() => setLoadingList(false));
  }, []);

  /**
   * Download a real PDF or Excel from backend streaming endpoint.
   * Uses fetch + blob URL so the browser triggers a native file download.
   */
  const generateReport = async (type: string) => {
    setGenerating(type);
    try {
      const token = localStorage.getItem("twip_token");
      const apiUrl =
        typeof window !== "undefined"
          ? `http://${window.location.hostname}:8000/api`
          : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

      const res = await fetch(
        `${apiUrl}/reports/generate?report_type=${encodeURIComponent(type)}&format=${format}`,
        {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(err.detail || `Server error ${res.status}`);
      }

      // Get filename from Content-Disposition header
      const cd = res.headers.get("Content-Disposition") || "";
      const match = cd.match(/filename="?([^"]+)"?/);
      const filename =
        match?.[1] ||
        `TWIP_${type}_report.${format === "pdf" ? "pdf" : "xlsx"}`;

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success(
        `✅ ${type.replace(/_/g, " ")} report downloaded as ${format.toUpperCase()}!`
      );
    } catch (err: any) {
      console.error(err);
      toast.error(`Report generation failed: ${err.message}`);
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Reports</h1>
        <p className="text-gray-400 text-sm mt-1">
          Generate and download comprehensive sustainability and waste reports using live platform data
        </p>
      </div>

      {/* Format Selector */}
      <div className="glass-card p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400 font-medium">Export Format:</span>
        </div>
        <div className="flex gap-2">
          {(["pdf", "excel"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all
                ${format === f
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
            >
              {f === "pdf" ? (
                <><FileText className="w-4 h-4" /> PDF</>
              ) : (
                <><FileSpreadsheet className="w-4 h-4" /> Excel</>
              )}
            </button>
          ))}
        </div>
        <div className="ml-auto text-xs text-gray-500 flex items-center gap-2">
          <CheckCircle className="w-3 h-3 text-emerald-400" />
          Reports use live database data
        </div>
      </div>

      {/* Report Type Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {REPORT_TYPES.map((report, i) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-6 hover:border-primary-500/30 transition-all duration-300"
          >
            <div className="flex items-start gap-4 mb-4">
              <div
                className={`w-14 h-14 bg-gradient-to-br ${report.color} rounded-2xl flex items-center justify-center text-2xl flex-shrink-0`}
              >
                {report.icon}
              </div>
              <div>
                <h3 className="font-bold text-white">{report.title}</h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{report.desc}</p>
              </div>
            </div>

            {/* Features list */}
            <div className="grid grid-cols-2 gap-1 mb-4 text-xs text-gray-400">
              {[
                "✓ Real DB data",
                "✓ Charts & Analytics",
                "✓ Executive Summary",
                "✓ Inventory Details",
              ].map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>

            <button
              id={`generate-${report.id}`}
              onClick={() => generateReport(report.id)}
              disabled={generating === report.id}
              className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-2.5"
            >
              {generating === report.id ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating {format.toUpperCase()}...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Generate {format.toUpperCase()} Report
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Available Reports from Backend */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white">Available Report Types</h3>
            <p className="text-sm text-gray-400">
              {loadingList ? "Loading..." : `${reportList.length} report types available`}
            </p>
          </div>
        </div>

        {loadingList ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 text-primary-400 animate-spin mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Loading reports...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Report Title</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reportList.map((r, i) => (
                  <motion.tr
                    key={r.id || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <td className="text-gray-500 font-mono text-xs">{r.id}</td>
                    <td className="font-medium text-white">{r.title}</td>
                    <td>
                      <span className="badge-blue capitalize text-xs">{r.type}</span>
                    </td>
                    <td className="text-xs text-gray-400 max-w-xs">{r.description}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setFormat("pdf"); generateReport(r.type); }}
                          disabled={!!generating}
                          className="flex items-center gap-1 text-primary-400 hover:text-primary-300 text-xs font-medium transition-colors"
                        >
                          {generating === r.type ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <FileText className="w-3 h-3" />
                          )}
                          PDF
                        </button>
                        <button
                          onClick={() => { setFormat("excel"); generateReport(r.type); }}
                          disabled={!!generating}
                          className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-xs font-medium transition-colors"
                        >
                          <FileSpreadsheet className="w-3 h-3" /> Excel
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
