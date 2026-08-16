import React, { useState, useCallback, useEffect } from 'react';
import { createPortal, flushSync } from 'react-dom';
import {
  Brain, Upload, Cpu, BarChart2, FileText,
  CheckCircle, Loader, AlertCircle, ArrowRight,
  Sparkles, Eye, Layers, Recycle, ChevronRight, RefreshCw
} from 'lucide-react';
import ImageUploader from '../../components/ImageUploader/ImageUploader';
import ClassificationResult from '../../components/ClassificationResult/ClassificationResult';
import PrintableClassificationReport from '../../components/PrintableClassificationReport/PrintableClassificationReport';
import AIService from '../../services/aiService';
import { useAuth } from '../../context/AuthContext';


// ─── Pipeline Steps ───────────────────────────────────────────────────────────
const STEPS = [
  { id: 'upload', label: 'Image Upload', icon: Upload, description: 'Validate & upload textile image' },
  { id: 'processing', label: 'Preprocessing', icon: Cpu, description: 'Resize, normalize, extract features' },
  { id: 'classification', label: 'AI Classification', icon: Brain, description: 'Material & waste classification' },
  { id: 'results', label: 'Results Ready', icon: BarChart2, description: 'View full analysis report' },
];

function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-between mb-8 px-2">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isActive = step.id === currentStep;
        const stepIdx = steps.findIndex(s => s.id === currentStep);
        const isDone = idx < stepIdx;
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div className={`
                w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500
                ${isDone ? 'bg-primary-500 text-white shadow-neon' :
                  isActive ? 'bg-primary-800 dark:bg-emerald-900 text-primary-neon shadow-neon animate-pulse' :
                  'bg-slate-100 dark:bg-cardDark text-slate-300 dark:text-slate-600'}
              `}>
                {isDone ? <CheckCircle size={18} /> : <Icon size={18} />}
              </div>
              <p className={`text-[9px] mt-2 font-semibold text-center max-w-16 leading-tight
                ${isActive ? 'text-primary-600 dark:text-primary-neon' : isDone ? 'text-slate-600 dark:text-slate-400' : 'text-slate-300 dark:text-slate-600'}`}>
                {step.label}
              </p>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 transition-all duration-500
                ${idx < stepIdx ? 'bg-primary-500' : 'bg-slate-100 dark:bg-borderDark'}`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function FeatureTag({ label, detected, type = 'info' }) {
  const colors = {
    info: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    success: 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    warning: 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    danger: 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
  };
  return (
    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-semibold border ${colors[type]}`}>
      {label}: {detected ? '✓ Detected' : '✗ Clear'}
    </span>
  );
}

export default function ImageAnalysis() {
  const [currentStep, setCurrentStep] = useState('upload');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingLabel, setProcessingLabel] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const { user } = useAuth();
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const handleBeforePrint = () => {
      flushSync(() => {
        setIsPrinting(true);
      });
    };
    const handleAfterPrint = () => {
      flushSync(() => {
        setIsPrinting(false);
      });
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  const API_BASE = 'http://localhost:8000';


  const handleReset = () => {
    setCurrentStep('upload');
    setSelectedFiles([]);
    setUploadedImage(null);
    setPrediction(null);
    setError(null);
    setIsProcessing(false);
  };

  const handleAnalyze = useCallback(async () => {
    if (!selectedFiles.length) return;
    setError(null);
    setIsProcessing(true);
    setUploadProgress(0);

    try {
      // Step 1: Upload (with progress)
      setCurrentStep('processing');
      setProcessingLabel('Uploading textile image... 0%');
      
      const formData = new FormData();
      formData.append('file', selectedFiles[0].file);
      
      const uploadRes = await AIService.uploadImage(formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
          if (percentCompleted < 100) {
            setProcessingLabel(`Uploading textile image... ${percentCompleted}%`);
          } else {
            setProcessingLabel('Preprocessing image on server...');
          }
        }
      });
      const imgData = uploadRes.data;
      setUploadedImage(imgData);

      // Step 2: Running Model
      setCurrentStep('classification');
      setProcessingLabel('Running AI material & waste classification models...');
      
      const analysisRes = await AIService.analyzeImage(imgData.id);
      
      // Step 3: Completed / Generating Report
      setProcessingLabel('Generating report...');
      setPrediction({ ...analysisRes.data, image: imgData });

      setCurrentStep('results');
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Analysis failed. Please try again.';
      setError(msg);
      setCurrentStep('upload');
    } finally {
      setIsProcessing(false);
      setProcessingLabel('');
      setUploadProgress(0);
    }
  }, [selectedFiles]);

  const imageUrl = uploadedImage?.original_path
    ? `${API_BASE}/uploads/${uploadedImage.original_path}`
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <div className="p-2 bg-primary-800 dark:bg-emerald-950 text-primary-neon rounded-2xl shadow-neon">
              <Brain size={18} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Textile AI Analysis</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 ml-11">
            Upload a textile image to identify material, classify waste, and assess recyclability using AI
          </p>
        </div>
        {currentStep !== 'upload' && (
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-white border border-borderLight dark:border-borderDark rounded-xl hover:bg-slate-50 dark:hover:bg-cardDark transition-all"
          >
            <RefreshCw size={12} />
            <span>New Analysis</span>
          </button>
        )}
      </div>

      {/* Pipeline Step Indicator */}
      <StepIndicator steps={STEPS} currentStep={currentStep} />

      {/* Error Banner */}
      {error && (
        <div className="flex items-center space-x-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl px-4 py-3">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* ─── Upload Step ─────────────────────────────────────────────────── */}
      {currentStep === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Uploader */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-3xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Upload size={15} className="text-primary-500" />
                <h2 className="text-sm font-bold text-slate-800 dark:text-white">Upload Textile Image</h2>
              </div>
              <ImageUploader
                selectedFiles={selectedFiles}
                onFilesSelected={setSelectedFiles}
                onClear={() => setSelectedFiles([])}
              />
              {selectedFiles.length > 0 && (
                <button
                  onClick={handleAnalyze}
                  disabled={isProcessing}
                  className="mt-5 w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-primary-700 to-primary-500 text-white rounded-2xl font-semibold text-sm hover:shadow-neon transition-all duration-300 disabled:opacity-60"
                >
                  <Sparkles size={16} />
                  <span>Run AI Analysis</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Info Panel */}
          <div className="space-y-4">
            <div className="glass-card rounded-3xl p-5">
              <p className="text-xs font-bold text-slate-700 dark:text-white mb-3 flex items-center space-x-1.5">
                <Eye size={13} className="text-primary-500" /><span>What We Detect</span>
              </p>
              <ul className="space-y-2">
                {[
                  'Fabric texture & pattern',
                  'Dominant colors',
                  'Visible damage & tears',
                  'Contamination',
                  'Wrinkle detection',
                  'Surface quality score',
                ].map((item) => (
                  <li key={item} className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-neon flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card rounded-3xl p-5">
              <p className="text-xs font-bold text-slate-700 dark:text-white mb-3 flex items-center space-x-1.5">
                <Layers size={13} className="text-accent-cyan" /><span>Supported Materials</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {['Cotton', 'Polyester', 'Wool', 'Silk', 'Linen', 'Denim', 'Rayon', 'Nylon', 'Acrylic', 'Mixed'].map(m => (
                  <span key={m} className="px-2 py-0.5 bg-slate-100 dark:bg-bgDark/50 rounded-full text-[10px] text-slate-600 dark:text-slate-400 font-medium">{m}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Processing Step ──────────────────────────────────────────────── */}
      {(currentStep === 'processing' || currentStep === 'classification') && (
        <div className="glass-card rounded-3xl p-10 text-center space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full bg-primary-500/10 animate-ping" />
            <div className="relative w-20 h-20 rounded-full bg-primary-800/10 dark:bg-emerald-950/30 flex items-center justify-center">
              <Brain size={36} className="text-primary-neon animate-pulse" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-1">AI Pipeline Running</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{processingLabel}</p>
          </div>
          {/* Real progress bar */}
          <div className="max-w-xs mx-auto space-y-2">
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary-500 to-accent-cyan rounded-full transition-all duration-300"
                style={{ width: `${currentStep === 'processing' ? Math.max(10, uploadProgress) : 92}%` }}
              />
            </div>
            {currentStep === 'processing' && uploadProgress > 0 && (
              <span className="text-[10px] font-mono text-slate-400 block">{uploadProgress}% Uploaded</span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 font-mono">This typically takes 2–4 seconds</p>
        </div>
      )}

      {/* ─── Results Step ─────────────────────────────────────────────────── */}
      {currentStep === 'results' && prediction && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Image + Feature Cards */}
          <div className="space-y-4">
            {/* Image Preview */}
            {imageUrl && (
              <div className="glass-card rounded-3xl overflow-hidden">
                <img
                  src={imageUrl}
                  alt="Analyzed textile"
                  className="w-full aspect-square object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="p-3">
                  <p className="text-[10px] text-slate-400 truncate">{uploadedImage?.filename}</p>
                  <p className="text-[9px] text-slate-300 dark:text-slate-600 font-mono mt-0.5">
                    {uploadedImage?.width && `${uploadedImage.width}×${uploadedImage.height} px`}
                  </p>
                </div>
              </div>
            )}

            {/* Quick Summary Card */}
            <div className="glass-card rounded-3xl p-4 space-y-3">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Quick Summary</p>
              <div className="space-y-1.5">
                {[
                  { label: 'Material', value: prediction.material, color: 'text-primary-600 dark:text-primary-neon' },
                  { label: 'Confidence', value: `${prediction.confidence?.toFixed(1)}%`, color: 'text-slate-700 dark:text-white' },
                  { label: 'Waste Class', value: prediction.waste_category, color: 'text-yellow-600 dark:text-yellow-400' },
                  { label: 'Recyclability', value: `${(prediction.recyclability || prediction.recyclability_score || 0).toFixed(0)}%`, color: 'text-green-600 dark:text-green-400' },
                  { label: 'Recovery', value: prediction.recovery || prediction.recovery_difficulty, color: 'text-blue-600 dark:text-blue-400' },
                  { label: 'Processing Time', value: `${prediction.processing_time_ms || prediction.processing_time || 0} ms`, color: 'text-slate-600 dark:text-slate-400' },
                  { label: 'Model Version', value: prediction.model_version || 'v1.0.0', color: 'text-slate-600 dark:text-slate-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between items-center py-1.5 border-b border-borderLight dark:border-borderDark last:border-0">
                    <span className="text-[10px] text-slate-400">{label}</span>
                    <span className={`text-[11px] font-bold ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Detection */}
            <div className="glass-card rounded-3xl p-4 space-y-2">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-3">Visual Detection</p>
              <div className="flex flex-wrap gap-1.5">
                <FeatureTag label="Damage" detected={prediction.image_features?.visible_damage} type={prediction.image_features?.visible_damage ? 'danger' : 'success'} />
                <FeatureTag label="Contamination" detected={prediction.image_features?.contamination_detected} type={prediction.image_features?.contamination_detected ? 'danger' : 'success'} />
                <FeatureTag label="Wrinkles" detected={prediction.image_features?.wrinkle_detected} type={prediction.image_features?.wrinkle_detected ? 'warning' : 'success'} />
                <FeatureTag label="Tears" detected={prediction.image_features?.tear_detected} type={prediction.image_features?.tear_detected ? 'danger' : 'success'} />
              </div>
              {prediction.image_features?.surface_quality && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] text-slate-400">Surface Quality</span>
                  <span className="text-[11px] font-bold text-primary-600 dark:text-primary-neon">
                    {prediction.image_features.surface_quality}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Full Classification Result Tabs */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-3xl p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-primary-800/10 dark:bg-emerald-950/30 rounded-xl">
                    <Sparkles size={14} className="text-primary-neon" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white">Classification Report</h2>
                    <p className="text-[9px] text-slate-400">ID: {prediction.prediction_id}</p>
                  </div>
                </div>
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-[10px] font-semibold text-slate-500 hover:text-primary-600 border border-borderLight dark:border-borderDark rounded-xl hover:border-primary-300 transition-all"
                >
                  <FileText size={11} />
                  <span>Print Report</span>
                </button>
              </div>

              <ClassificationResult result={prediction} />
            </div>
          </div>
        </div>
      )}
      {isPrinting && prediction && createPortal(
        <div id="print-portal-root">
          <PrintableClassificationReport result={prediction} currentUser={user} />
        </div>,
        document.body
      )}
    </div>
  );
}

