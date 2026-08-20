import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Upload, 
  Camera, 
  Trash2, 
  RefreshCw, 
  FileDown, 
  Download, 
  Leaf, 
  CheckCircle, 
  AlertTriangle, 
  Cpu, 
  Info,
  Layers,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { aiService } from '../services/aiService';

// Circular gauge component built using SVG
const CircularGauge = ({ value, label, size = 110, strokeWidth = 8, tone = "forest" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  const colors = {
    forest: { stroke: "stroke-emerald-600", track: "stroke-emerald-50 text-emerald-600" },
    blue: { stroke: "stroke-blue-600", track: "stroke-blue-50 text-blue-600" },
    amber: { stroke: "stroke-amber-500", track: "stroke-amber-50 text-amber-500" },
    red: { stroke: "stroke-rose-600", track: "stroke-rose-50 text-rose-600" }
  };
  
  const current = colors[tone] || colors.forest;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="h-full w-full -rotate-90">
          <circle
            className="stroke-slate-100"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            className={`${current.stroke} transition-all duration-1000 ease-out`}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-xl font-black text-slate-800">{value}%</span>
        </div>
      </div>
      <span className="mt-2 text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
    </div>
  );
};

const AiAnalysis = () => {
  const [image, setImage] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  
  // Progress states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  
  // Results
  const [analysisResult, setAnalysisResult] = useState(null);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Webcam activation
  const startWebcam = async () => {
    setImage(null);
    setAnalysisResult(null);
    setIsWebcamActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
    } catch (err) {
      toast.error("Could not access camera. Ensure permissions are granted.");
      setIsWebcamActive(false);
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsWebcamActive(false);
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');
    setImage(dataUrl);
    stopWebcam();
    toast.success("Snapshot captured successfully!");
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // File Handlers
  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files (JPG, PNG, WEBP) are supported.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
      setAnalysisResult(null);
      stopWebcam();
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  // AI Pipeline Submission
  const runAiAnalysis = async () => {
    if (!image) return;
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      setUploadProgress(p => {
        if (p >= 100) {
          clearInterval(uploadInterval);
          setIsUploading(false);
          setIsAnalyzing(true);
          // Start simulated analysis progress
          startAnalysisSim();
          return 100;
        }
        return p + 25;
      });
    }, 100);
  };

  const startAnalysisSim = () => {
    setAnalysisProgress(0);
    const analysisInterval = setInterval(() => {
      setAnalysisProgress(p => {
        if (p >= 100) {
          clearInterval(analysisInterval);
          // Hit actual API once simulation finishes loading for premium feel
          submitToBackend();
          return 100;
        }
        return p + 20;
      });
    }, 150);
  };

  const submitToBackend = async () => {
    try {
      const res = await aiService.analyze({ image });
      if (res.success) {
        setAnalysisResult(res.analysis);
        toast.success("AI Material Recognition and Waste Classification completed!");
      } else {
        toast.error("AI engine returned unsuccessful status.");
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "AI analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setAnalysisResult(null);
    stopWebcam();
  };

  const recommendationData = analysisResult?.recommendations || analysisResult?.recommendation || [];
  const scoreData = analysisResult?.scores || {};
  const environmentalData = analysisResult?.environmental_impact || {};
  const circularityScore = scoreData.circularity_score ?? analysisResult?.sustainability_metrics?.circular_economy_score ?? analysisResult?.sustainability_score;
  const circularityCategory = analysisResult?.circularity_category || analysisResult?.sustainability_metrics?.circularity_category || null;

  // CSV Report Generator
  const downloadCsvReport = () => {
    if (!analysisResult) return;
    
    const rows = [
      ["AI Textile Waste Intelligence Platform Analysis Report"],
      ["Date", new Date(analysisResult.timestamp).toLocaleString()],
      ["Fabric Type", analysisResult.fabric_type],
      ["Waste Category", analysisResult.waste_category],
      ["Confidence Score", `${analysisResult.confidence_score}%`],
      ["Sustainability Score", `${analysisResult.sustainability_score}%`],
      [],
      ["Material Fiber Compositions"],
    ];
    
    Object.entries(analysisResult.material_prediction).forEach(([fiber, pct]) => {
      rows.push([fiber, `${pct}%`]);
    });
    
    rows.push([], ["Visual Characteristics"]);
    Object.entries(analysisResult.visual_features).forEach(([feat, val]) => {
      rows.push([feat, val]);
    });

    rows.push([], ["Sustainability Metrics"]);
    rows.push(["Recyclability", `${analysisResult.sustainability_metrics.recyclability_score}%`]);
    rows.push(["Reuse Potential", `${analysisResult.sustainability_metrics.reuse_potential}%`]);
    rows.push(["Circularity Score", `${circularityScore}/100`]);
    rows.push(["Circularity Category", circularityCategory]);
    rows.push(["Water Savings (liters)", environmentalData.water_savings_liters ?? analysisResult.sustainability_metrics.water_savings]);
    rows.push(["CO2 Savings (kg)", environmentalData.co2_savings_kg ?? analysisResult.sustainability_metrics.carbon_footprint]);
    rows.push(["Resource Conservation Score", environmentalData.resource_conservation_score ?? analysisResult.sustainability_metrics.resource_conservation_score ?? 'N/A']);
    rows.push(["Resource Conservation Category", environmentalData.resource_conservation_category ?? analysisResult.sustainability_metrics.resource_conservation_category ?? 'N/A']);

    rows.push([], ["Ranked Recycling Recommendations"]);
    recommendationData.forEach(rec => {
      rows.push([`Rank ${rec.rank}`, rec.name, `Confidence: ${rec.confidence}%`]);
      rows.push(["Carbon Reduction", rec.carbon_reduction]);
      rows.push(["Cost Effectiveness", rec.cost_effectiveness]);
      rows.push(["Reasoning", rec.reasoning]);
      rows.push([]);
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ai_report_${analysisResult.id}_${analysisResult.fabric_type.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF trigger (styled via css print layout)
  const printPdfReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center print:hidden">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">AI Material Recognition & Analysis</h1>
          <p className="text-sm text-ink/60">Upload fabric images to assess materials, compositions, waste grades, and carbon savings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 print:grid-cols-1">
        
        {/* Upload & Source Capture Panel */}
        <div className="card h-fit space-y-5 lg:col-span-1 print:hidden">
          <h3 className="font-display text-lg font-bold text-ink">Source Input</h3>
          
          {/* Webcam stream viewport */}
          {isWebcamActive && (
            <div className="relative overflow-hidden rounded-xl bg-slate-900 aspect-video border border-slate-700">
              <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover"></video>
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 px-4">
                <button 
                  onClick={captureSnapshot} 
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow"
                >
                  <Camera size={14} /> Snap Photo
                </button>
                <button 
                  onClick={stopWebcam} 
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Drag & Drop Upload Zone */}
          {!image && !isWebcamActive && (
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all ${
                isDragOver 
                  ? 'border-emerald-500 bg-emerald-50/50' 
                  : 'border-slate-300 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/10'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden" 
              />
              <Upload className="h-10 w-10 text-slate-400 mb-3" />
              <p className="text-sm font-semibold text-slate-700">Drag & drop textile image</p>
              <p className="text-xs text-slate-500 mt-1">Supports JPG, PNG, WEBP (Max 10MB)</p>
              <div className="mt-4 flex items-center justify-center">
                <span className="text-2xs font-bold text-slate-400 bg-white border px-2 py-0.5 rounded shadow-sm">OR CLICK TO BROWSE</span>
              </div>
            </div>
          )}

          {/* Captured / Uploaded Image Viewport */}
          {image && !isWebcamActive && (
            <div className="relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200 aspect-video flex items-center justify-center">
              <img src={image} alt="Textile source" className="h-full w-full object-cover" />
              <button 
                onClick={clearImage}
                className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow transition"
                title="Remove image"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}

          {/* Capture Trigger Buttons */}
          {!isWebcamActive && (
            <div className="flex gap-2.5">
              {!image && (
                <button 
                  onClick={startWebcam} 
                  className="flex-1 btn-secondary flex items-center justify-center gap-1.5 text-xs py-2 bg-white"
                >
                  <Camera size={14} className="text-slate-500" /> Capture from Camera
                </button>
              )}
              {image && !isUploading && !isAnalyzing && (
                <button 
                  onClick={runAiAnalysis}
                  className="flex-1 btn-primary flex items-center justify-center gap-1.5 text-xs py-2 shadow-emerald-200 shadow-md"
                >
                  <Sparkles size={14} /> Analyze Textile
                </button>
              )}
            </div>
          )}

          {/* Progress Indicators */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Uploading Image...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span className="flex items-center gap-1.5"><Cpu size={13} className="animate-spin text-emerald-600" /> AI Classification...</span>
                <span>{analysisProgress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${analysisProgress}%` }}></div>
              </div>
              <p className="text-2xs text-slate-400 font-light italic">Running material composition extraction models...</p>
            </div>
          )}
        </div>

        {/* Results Presentation Panel */}
        <div className="lg:col-span-2 space-y-6 print:col-span-1">
          
          {!analysisResult ? (
            <div className="card flex flex-col items-center justify-center py-20 text-center space-y-4 print:hidden">
              <div className="h-12 w-12 bg-forest-50 text-forest-600 rounded-xl flex items-center justify-center">
                <Sparkles size={24} />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-ink">AI Analysis Results</h3>
                <p className="text-xs text-ink/50 max-w-sm mt-1">Upload a textile image and run the analysis pipeline to inspect visual features, composition blends, and recovery scoring.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* PDF Print Report Header (Visible only on print) */}
              <div className="hidden print:flex items-center gap-3 border-b pb-4 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
                  <Leaf size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">AI Material Recognition & Classification Report</h1>
                  <p className="text-xs text-slate-500">Textile Waste Intelligence Platform · Generated on {new Date(analysisResult.timestamp).toLocaleString()}</p>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between print:hidden">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1"><CheckCircle size={14} className="text-emerald-600" /> ANALYSIS COMPLETED</span>
                <div className="flex gap-2">
                  <button 
                    onClick={printPdfReport} 
                    className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 bg-white border border-slate-200"
                  >
                    <FileDown size={14} className="text-slate-500" /> Export PDF
                  </button>
                  <button 
                    onClick={downloadCsvReport} 
                    className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 bg-white border border-slate-200"
                  >
                    <Download size={14} className="text-slate-500" /> Download CSV
                  </button>
                </div>
              </div>

              {/* Print Only Image and basic metadata */}
              <div className="hidden print:grid grid-cols-3 gap-6 mb-6">
                <div className="col-span-1 rounded-xl overflow-hidden border max-h-40">
                  <img src={analysisResult.image_url} alt="Report Textile" className="h-full w-full object-cover" />
                </div>
                <div className="col-span-2 space-y-2 text-xs">
                  <p><strong>Batch Fabric:</strong> {analysisResult.fabric_type} (Confidence: {analysisResult.confidence_score}%)</p>
                  <p><strong>Primary Category:</strong> {analysisResult.waste_category}</p>
                  <p><strong>Sustainability Score:</strong> {analysisResult.sustainability_score}%</p>
                  <p><strong>Visual Characteristics:</strong> {analysisResult.visual_features.texture} · {analysisResult.visual_features.color} · {analysisResult.visual_features.pattern}</p>
                  <p><strong>Environmental Risk:</strong> {analysisResult.sustainability_metrics.environmental_risk}%</p>
                </div>
              </div>

              {/* 1. Dashboard circular Gauges & Primary Grade */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Gauge 1: Sustainability Score */}
                <div className="card flex items-center justify-center py-4 bg-gradient-to-br from-white to-emerald-50/10">
                  <CircularGauge 
                    value={analysisResult.sustainability_score} 
                    label="Sustainability" 
                    tone="forest"
                  />
                </div>

                {/* Gauge 2: Recyclability Score */}
                <div className="card flex items-center justify-center py-4 bg-gradient-to-br from-white to-blue-50/10">
                  <CircularGauge 
                    value={analysisResult.sustainability_metrics.recyclability_score} 
                    label="Recyclability" 
                    tone="blue"
                  />
                </div>

                {/* Gauge 3: Reuse Potential */}
                <div className="card flex items-center justify-center py-4 bg-gradient-to-br from-white to-amber-50/10">
                  <CircularGauge 
                    value={analysisResult.sustainability_metrics.reuse_potential} 
                    label="Reuse Potential" 
                    tone="amber"
                  />
                </div>
              </div>

              {/* 2. Visual Features & Material Composition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Visual characteristics card */}
                <div className="card space-y-4">
                  <div className="border-b pb-2">
                    <h3 className="font-display text-sm font-bold text-ink flex items-center gap-1.5"><Layers size={14} className="text-emerald-600" /> Detected Visual Features</h3>
                    <p className="text-2xs text-ink/40">Real-time image classification results</p>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="font-semibold text-slate-500">Texture:</span>
                      <span className="text-slate-800 font-medium">{analysisResult.visual_features.texture}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="font-semibold text-slate-500">Pattern:</span>
                      <span className="text-slate-800 font-medium">{analysisResult.visual_features.pattern}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="font-semibold text-slate-500">Color Profile:</span>
                      <span className="text-slate-800 font-medium">{analysisResult.visual_features.color}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="font-semibold text-slate-500">Damage:</span>
                      <span className="text-slate-800 font-medium">{analysisResult.visual_features.damage}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="font-semibold text-slate-500">Contamination:</span>
                      <span className="text-slate-800 font-medium">{analysisResult.visual_features.contamination}</span>
                    </div>
                  </div>
                </div>

                {/* Material composition card */}
                <div className="card space-y-4">
                  <div className="border-b pb-2">
                    <h3 className="font-display text-sm font-bold text-ink flex items-center gap-1.5"><Cpu size={14} className="text-emerald-600" /> Fiber Composition</h3>
                    <p className="text-2xs text-ink/40">Extracted material blends (%)</p>
                    <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                     <p className="text-xs font-semibold text-slate-500">
                     Fabric Type
                   </p>

  <p className="text-xl font-bold text-emerald-700">
    {analysisResult.fabric_type}
  </p>

  <p className="text-xs text-slate-500 mt-1">
    Confidence: {analysisResult.fabric_confidence ?? analysisResult.confidence_score}%
  </p>

  <p className="text-xs font-semibold text-slate-500 mt-3">
    Defect Status
  </p>

  <p className="text-lg font-bold text-blue-700">
    {analysisResult.defect_status}
  </p>

  <p className="text-xs text-slate-500">
    Confidence: {analysisResult.defect_confidence ?? analysisResult.confidence_score}%
  </p>
</div>
                  </div>
                  <div className="space-y-3.5">
                    {Object.entries(analysisResult.material_prediction).map(([fiber, pct]) => (
                      <div key={fiber} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-700">{fiber}</span>
                          <span className="text-slate-900 font-bold">{pct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-600 rounded-full transition-all duration-1000" 
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Waste category assessment */}
              <div className="card bg-emerald-50/15 border border-emerald-100/60 p-5 rounded-xl space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-2xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded uppercase tracking-wider">PRIMARY CLASSIFICATION</span>
                    <h3 className="font-display text-lg font-black text-slate-900 mt-1">{analysisResult.waste_category}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-2xs font-semibold text-slate-400">AI Confidence</span>
                    <p className="text-sm font-black text-slate-700">{analysisResult.confidence_score}%</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-light">{analysisResult.waste_explanation}</p>
                <div className="grid grid-cols-2 gap-4 pt-2 text-2xs font-bold text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle size={12} className={analysisResult.sustainability_metrics.contamination_level > 10 ? 'text-amber-500' : 'text-slate-400'} />
                    Contamination: {analysisResult.sustainability_metrics.contamination_level}%
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingDown size={12} className="text-slate-400" />
                    Environmental Risk: {analysisResult.sustainability_metrics.environmental_risk}%
                  </div>
                </div>
              </div>

              {/* 4. Circularity Summary */}
              <div className="card space-y-4">
                <div className="border-b pb-2">
                  <h3 className="font-display text-sm font-bold text-ink">Circularity Result</h3>
                  <p className="text-2xs text-ink/40">Deterministic sustainability assessment derived from fabric type, defect status, and condition.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-3xs font-bold uppercase tracking-wider text-emerald-700">Circularity Score</span>
                      <span className="text-lg font-black text-emerald-700">{circularityScore}/100</span>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-800">{circularityCategory}</p>
                    <p className="mt-2 text-2xs text-slate-600">The score combines recyclability, material condition, reuse potential, environmental benefit, and processing feasibility.</p>
                  </div>
                  <div className="space-y-2 rounded-xl border border-slate-100 bg-white p-4">
                    <div className="flex justify-between text-xs"><span className="text-slate-500">Recyclability</span><span className="font-semibold text-slate-800">{scoreData.recyclability_score ?? analysisResult.sustainability_metrics.recyclability_score}%</span></div>
                    <div className="flex justify-between text-xs"><span className="text-slate-500">Reuse</span><span className="font-semibold text-slate-800">{scoreData.reuse_score ?? analysisResult.sustainability_metrics.reuse_potential}%</span></div>
                    <div className="flex justify-between text-xs"><span className="text-slate-500">Sustainability</span><span className="font-semibold text-slate-800">{scoreData.sustainability_score ?? analysisResult.sustainability_score}%</span></div>
                    <div className="flex justify-between text-xs"><span className="text-slate-500">Material Recovery</span><span className="font-semibold text-slate-800">{scoreData.material_recovery_score ?? analysisResult.sustainability_metrics.resource_recovery_score}%</span></div>
                  </div>
                </div>
              </div>

              {/* 5. Environmental Impact */}
              <div className="card space-y-4">
                <div className="border-b pb-2">
                  <h3 className="font-display text-sm font-bold text-ink">Environmental Impact</h3>
                  <p className="text-2xs text-ink/40">Estimated resource and climate impact indicators.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-100 bg-white p-4">
                    <p className="text-3xs font-bold uppercase tracking-wider text-slate-400">Estimated CO2 Savings</p>
                    <p className="mt-2 text-lg font-black text-slate-800">{environmentalData.co2_savings_kg ?? analysisResult.sustainability_metrics.carbon_footprint} kg</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-white p-4">
                    <p className="text-3xs font-bold uppercase tracking-wider text-slate-400">Estimated Water Savings</p>
                    <p className="mt-2 text-lg font-black text-slate-800">{environmentalData.water_savings_liters ?? analysisResult.sustainability_metrics.water_savings} L</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-white p-4">
                    <p className="text-3xs font-bold uppercase tracking-wider text-slate-400">Landfill Reduction</p>
                    <p className="mt-2 text-lg font-black text-slate-800">{environmentalData.landfill_reduction_percent ?? analysisResult.sustainability_metrics.landfill_diversion}%</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-white p-4">
                    <p className="text-3xs font-bold uppercase tracking-wider text-slate-400">Resource Conservation</p>
                    <p className="mt-2 text-lg font-black text-slate-800">{environmentalData.resource_conservation_score ?? 85}/100</p>
                  </div>
                </div>
              </div>

              {/* 6. Recycling Recommendations */}
              <div className="card space-y-4">
                <div className="border-b pb-2">
                  <h3 className="font-display text-sm font-bold text-ink">Disposal & Recovery Recommendations</h3>
                  <p className="text-2xs text-ink/40">Ranked from best suitability to least</p>
                </div>
                
                <div className="space-y-4">
                  {recommendationData.map((rec) => (
                    <div key={rec.rank} className="flex gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition">
                      <div className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 font-display text-xs font-black">
                        #{rec.rank}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-800">{rec.name}</h4>
                          <span className="text-3xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wider self-start sm:self-center">
                            {rec.confidence}% Confidence
                          </span>
                        </div>
                        <p className="text-2xs text-slate-500 leading-relaxed font-light">{rec.reasoning}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-3xs font-bold text-slate-400 uppercase tracking-wider">
                          <div>Carbon Saved: <span className="text-emerald-700">{rec.carbon_reduction}</span></div>
                          <div>Cost Efficiency: <span className="text-slate-700">{rec.cost_effectiveness}</span></div>
                          <div className="truncate">Benefit: <span className="text-slate-700">{rec.environmental_benefit}</span></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 7. Sustainability Scores Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:grid-cols-2">
                
                {/* Card 1: Carbon Footprint */}
                <div className="card py-3.5 px-4 space-y-1 bg-white border border-slate-100 flex flex-col justify-between">
                  <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider">Carbon Footprint</span>
                  <p className="font-display text-base font-black text-slate-800">{analysisResult.sustainability_metrics.carbon_footprint} kg CO2</p>
                  <span className="text-3xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded self-start mt-1">High Savings</span>
                </div>

                {/* Card 2: Water Saved */}
                <div className="card py-3.5 px-4 space-y-1 bg-white border border-slate-100 flex flex-col justify-between">
                  <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider">Water Saved</span>
                  <p className="font-display text-base font-black text-slate-800">{analysisResult.sustainability_metrics.water_savings.toLocaleString()} L/kg</p>
                  <span className="text-3xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded self-start mt-1">Conservation</span>
                </div>

                {/* Card 3: Landfill Diversion */}
                <div className="card py-3.5 px-4 space-y-1 bg-white border border-slate-100 flex flex-col justify-between">
                  <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider">Landfill Diversion</span>
                  <p className="font-display text-base font-black text-slate-800">{analysisResult.sustainability_metrics.landfill_diversion}%</p>
                  <span className="text-3xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded self-start mt-1">Zero Waste</span>
                </div>

                {/* Card 4: Circular Score */}
                <div className="card py-3.5 px-4 space-y-1 bg-white border border-slate-100 flex flex-col justify-between">
                  <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider">Circular Economy</span>
                  <p className="font-display text-base font-black text-slate-800">{analysisResult.sustainability_metrics.circular_economy_score}%</p>
                  <span className="text-3xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded self-start mt-1">Closed Loop</span>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default AiAnalysis;
