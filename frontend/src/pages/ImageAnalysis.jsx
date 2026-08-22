import { useState, useEffect } from "react";
import { api } from "../api/client";

export default function ImageAnalysis() {
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.listBatches()
      .then((data) => {
        setBatches(data);
        if (data.length > 0) setSelectedBatchId(data[0].id);
      })
      .catch((e) => setError(e.message));
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an image file to analyze.");
      return;
    }
    if (!selectedBatchId) {
      setError("Please select a waste batch for analysis.");
      return;
    }

    setAnalyzing(true);
    setError("");
    setAnalysisResult(null);

    try {
      const result = await api.analyzeBatchPhoto(selectedBatchId, file);
      setAnalysisResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base border border-emerald-500/30">
            AI
          </span>
          AI Textile Image Scanner & Classifier
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload any textile image to identify fabric materials (Denim twill weave, Cotton, Silk sheen, Wool, Polyester), detect damage & contamination, and estimate recyclability.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Form */}
        <form onSubmit={handleAnalyze} className="glass-card rounded-2xl border border-slate-800 p-6 space-y-4">
          <h2 className="text-lg font-bold text-white mb-2">1. Select Batch & Upload Image</h2>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Target Waste Batch</label>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.batch_code} — {b.fabric_type} ({b.quantity_kg} kg)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Textile Photo (JPEG/PNG/WEBP)</label>
            <div className="border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center hover:border-emerald-500/50 transition bg-slate-900/50">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer space-y-2 block">
                <svg className="w-10 h-10 mx-auto text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-medium text-slate-200">
                  {file ? file.name : "Click to select or drag & drop textile photo"}
                </p>
                <p className="text-xs text-slate-500">Supports Denim, Cotton, Wool, Silk, Polyester, etc.</p>
              </label>
            </div>
          </div>

          {previewUrl && (
            <div className="mt-4">
              <p className="text-xs font-medium text-slate-400 mb-2">Selected Image Preview:</p>
              <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover rounded-xl border border-slate-700" />
            </div>
          )}

          <button
            type="submit"
            disabled={analyzing || !file}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-semibold text-white transition disabled:opacity-50 shadow-lg shadow-emerald-500/20 text-sm flex items-center justify-center gap-2"
          >
            {analyzing ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Analyzing Pixels & Twill Weave...
              </>
            ) : (
              "Run AI Material Classification"
            )}
          </button>
        </form>

        {/* Results Panel */}
        <div className="glass-card rounded-2xl border border-slate-800 p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">2. Computer Vision & Material Results</h2>

          {!analysisResult ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-sm text-center">
              <svg className="w-12 h-12 mb-2 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Upload a photo to view AI fabric prediction, twill score, & recyclability analysis.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Material Badge */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Predicted Fabric Material</p>
                  <p className="text-2xl font-black text-emerald-400 capitalize mt-0.5">
                    {analysisResult.predicted_fabric_type}
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {Math.round((analysisResult.fabric_confidence || 0.85) * 100)}% Confidence
                  </span>
                </div>
              </div>

              {/* Rationale */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-200 leading-relaxed">
                <span className="font-semibold text-emerald-400">AI Classification Rationale: </span>
                {analysisResult.material_rationale || analysisResult.rationale}
              </div>

              {/* Visual Feature Gauges */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-[11px] text-slate-400 font-medium">Texture Score</p>
                  <p className="text-lg font-bold text-white mt-0.5">{analysisResult.texture_score}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-[11px] text-slate-400 font-medium">Dominant Color</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="w-5 h-5 rounded-md border border-slate-600"
                      style={{ backgroundColor: analysisResult.dominant_color_hex || "#3b82f6" }}
                    />
                    <span className="text-sm font-mono text-slate-200">{analysisResult.dominant_color_hex}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-[11px] text-slate-400 font-medium">Contamination Level</p>
                  <p className="text-lg font-bold text-amber-400 mt-0.5">
                    {Math.round((analysisResult.contamination_score || 0) * 100)}%
                    <span className="text-xs font-normal text-slate-400 ml-1">
                      {analysisResult.contamination_score > 0.4 ? "(High)" : analysisResult.contamination_score > 0.1 ? "(Moderate)" : "(Clean)"}
                    </span>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-[11px] text-slate-400 font-medium">Damage Level</p>
                  <p className="text-lg font-bold text-rose-400 mt-0.5">
                    {Math.round((analysisResult.damage_score || 0) * 100)}%
                    <span className="text-xs font-normal text-slate-400 ml-1">
                      {analysisResult.damage_score > 0.4 ? "(Torn)" : analysisResult.damage_score > 0.1 ? "(Worn)" : "(Undamaged)"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Recyclability & Recommendation */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Recyclability Assessment</p>
                  <p className="text-lg font-bold text-white capitalize mt-0.5">
                    {analysisResult.recommended_category?.replace(/_/g, " ")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-emerald-400">
                    {analysisResult.recyclability_score} <span className="text-xs text-slate-400">/ 100</span>
                  </p>
                </div>
              </div>

              {/* PDF Download Button */}
              <a
                href={api.getSingleAnalysisPdfUrl(selectedBatchId, analysisResult.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-emerald-500/40 text-emerald-400 font-semibold text-xs transition shadow-md flex items-center justify-center gap-2 mt-3"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download AI Classification PDF Report
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
