import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPortal, flushSync } from 'react-dom';
import {
  ArrowLeft, Brain, Recycle, AlertTriangle, Star, Download,
  Printer, Loader, AlertCircle, CheckCircle, Layers
} from 'lucide-react';
import ClassificationResult from '../../components/ClassificationResult/ClassificationResult';
import PrintableClassificationReport from '../../components/PrintableClassificationReport/PrintableClassificationReport';
import AIService from '../../services/aiService';
import { useAuth } from '../../context/AuthContext';


const WASTE_COLORS = {
  Recyclable: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30',
  Reusable: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30',
  Repairable: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30',
  Upcyclable: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30',
  Compostable: 'text-lime-600 dark:text-lime-400 bg-lime-50 dark:bg-lime-950/30',
  'Hazardous Textile Waste': 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30',
};

function ConfidenceMeter({ value, label, color = 'from-primary-500 to-accent-cyan' }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[10px] text-slate-400">{label}</span>
        <span className="text-[11px] font-bold text-primary-600 dark:text-primary-neon">{value?.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-1000`}
          style={{ width: `${value || 0}%` }}
        />
      </div>
    </div>
  );
}

export default function PredictionResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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

  const API_BASE = "http://ec2-user@ip-172-31-42-12:8000";


  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await AIService.getPrediction(id);
        setPrediction(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load prediction');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-64 space-y-3">
      <Loader size={28} className="animate-spin text-primary-500" />
      <p className="text-xs text-slate-400">Loading prediction report...</p>
    </div>
  );

  if (error) return (
    <div className="glass-card rounded-3xl p-8 text-center space-y-3">
      <AlertCircle size={32} className="mx-auto text-red-500" />
      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      <button onClick={() => navigate(-1)} className="text-xs text-slate-500 hover:text-primary-500">← Go Back</button>
    </div>
  );

  if (!prediction) return null;

  const wasteStyle = WASTE_COLORS[prediction.waste_category] || WASTE_COLORS.Recyclable;
  const imageUrl = prediction.image?.original_path
    ? `${API_BASE}/uploads/${prediction.image.original_path}`
    : null;

  const resultForComponent = {
    material: prediction.material,
    confidence: prediction.confidence,
    waste_category: prediction.waste_category,
    waste_confidence: prediction.waste_confidence,
    material_quality: prediction.material_quality,
    severity_level: prediction.severity_level,
    recyclability_score: prediction.recyclability_score,
    recovery_difficulty: prediction.recovery_difficulty,
    overall_rating: prediction.overall_rating,
    material_details: {
      probabilities: prediction.material_details?.probabilities || {},
      fiber_composition: prediction.material_details?.fiber_composition || {},
      properties: prediction.material_details?.properties || {},
    },
    waste_details: {
      reason: prediction.waste_details?.reason,
      description: prediction.waste_details?.description,
      status_badge: prediction.waste_details?.status_badge,
    },
    recyclability_details: {
      recyclability_score: prediction.recyclability_score,
      reuse_potential: prediction.reuse_potential,
      recovery_difficulty: prediction.recovery_difficulty,
      material_recovery_score: prediction.material_recovery_score,
      overall_rating: prediction.overall_rating,
      recovery_indicator: prediction.recyclability_details?.recovery_indicator,
    },
    image_features: prediction.image_features || {
      visible_damage: prediction.image?.visible_damage,
      contamination_detected: prediction.image?.contamination_detected,
      wrinkle_detected: prediction.image?.wrinkle_detected,
      tear_detected: prediction.image?.tear_detected,
      surface_quality: prediction.image?.surface_quality,
      fabric_pattern: prediction.image?.fabric_pattern,
      dominant_colors: prediction.image?.dominant_colors || [],
      texture_complexity: null,
    },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-cardDark transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Prediction Report</h1>
            <p className="text-[10px] text-slate-400 font-mono">ID: {prediction.id}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-500 border border-borderLight dark:border-borderDark rounded-xl hover:bg-slate-50 dark:hover:bg-cardDark transition-all"
          >
            <Printer size={13} />
            <span>Print</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-white bg-primary-700 hover:bg-primary-600 rounded-xl transition-all shadow-neon"
          >
            <Download size={13} />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Report Header Card */}
      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-primary-500 via-emerald-400 to-accent-cyan" />
        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Image */}
          <div className="md:col-span-1">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Analyzed textile"
                className="w-full aspect-square object-cover rounded-2xl"
                onError={(e) => { e.target.src = ''; e.target.alt = 'Image unavailable'; }}
              />
            ) : (
              <div className="w-full aspect-square rounded-2xl bg-slate-100 dark:bg-cardDark flex items-center justify-center">
                <Layers size={32} className="text-slate-300 dark:text-slate-600" />
              </div>
            )}
            {prediction.image?.filename && (
              <p className="text-[9px] text-slate-400 mt-2 truncate text-center">{prediction.image.filename}</p>
            )}
          </div>

          {/* Summary Data */}
          <div className="md:col-span-3 space-y-4">
            {/* Top Row */}
            <div className="flex flex-wrap items-start gap-3">
              <div>
                <p className="text-[9px] text-slate-400 uppercase tracking-wider">Material</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{prediction.material}</p>
              </div>
              <div className={`px-3 py-1.5 rounded-xl text-xs font-bold ${wasteStyle}`}>
                {prediction.waste_category}
              </div>
            </div>

            {/* Confidence Meters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <ConfidenceMeter value={prediction.confidence} label="Material Confidence" />
                <ConfidenceMeter value={prediction.waste_confidence} label="Waste Confidence" color="from-yellow-500 to-orange-400" />
              </div>
              <div className="space-y-2">
                <ConfidenceMeter value={prediction.recyclability_score} label="Recyclability Score" color="from-emerald-500 to-green-400" />
                <ConfidenceMeter value={prediction.reuse_potential} label="Reuse Potential" color="from-blue-500 to-accent-cyan" />
              </div>
            </div>

            {/* Meta Row */}
            <div className="flex flex-wrap gap-4 pt-2 border-t border-borderLight dark:border-borderDark text-[10px] text-slate-400">
              {prediction.user_name && (
                <span>👤 <span className="text-slate-600 dark:text-slate-300 font-medium">{prediction.user_name}</span></span>
              )}
              {prediction.organization && (
                <span>🏢 <span className="text-slate-600 dark:text-slate-300 font-medium">{prediction.organization}</span></span>
              )}
              {prediction.created_at && (
                <span>📅 <span className="text-slate-600 dark:text-slate-300 font-medium">{new Date(prediction.created_at).toLocaleString()}</span></span>
              )}
              <span>⭐ <span className="text-slate-600 dark:text-slate-300 font-medium">{prediction.overall_rating}</span></span>
              <span>
                <span className={`font-semibold ${prediction.recovery_difficulty === 'Easy' ? 'text-green-500' : prediction.recovery_difficulty === 'Hard' ? 'text-red-500' : 'text-yellow-500'}`}>
                  {prediction.recovery_difficulty} Recovery
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="glass-card rounded-3xl p-6">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-5 flex items-center space-x-2">
          <Brain size={15} className="text-primary-neon" />
          <span>Detailed AI Analysis</span>
        </h2>
        <ClassificationResult result={resultForComponent} />
      </div>
      {isPrinting && prediction && createPortal(
        <div id="print-portal-root">
          <PrintableClassificationReport result={prediction} currentUser={user} />
        </div>,
        document.body
      )}
    </div>
  );
}

