import React, { useState } from 'react';
import {
  Layers, Recycle, AlertTriangle, CheckCircle, Activity,
  Droplets, Thermometer, Wind, Shield, Leaf, Zap,
  FileText, Calendar, Building, User, Clock, Star, ArrowRight, Sparkles
} from 'lucide-react';
import { getMaterialData } from '../../services/materialKnowledgeBase';

const WASTE_COLORS = {
  Recyclable: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
  Reusable: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
  Repairable: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800',
  Upcyclable: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800',
  Compostable: 'text-lime-600 dark:text-lime-400 bg-lime-50 dark:bg-lime-950/30 border-lime-200 dark:border-lime-800',
  'Hazardous Textile Waste': 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
};

const SEVERITY_BADGES = {
  Minimal: 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900',
  Low: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900',
  Moderate: 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900',
  High: 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900',
};

const IMPACT_COLORS = {
  Low: 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
  Medium: 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  High: 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
};

// ─── Sub-component: Tab Button ────────────────────────────────────────────────
function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-1.5 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
        active
          ? 'bg-primary-800 dark:bg-emerald-900 text-white shadow-neon'
          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

// ─── Sub-component: Circular Gauge ──────────────────────────────────────────
function CircularGauge({ score, label, color = '#00F5A0', size = 100 }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#1C2621" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={radius} fill="none"
          stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transformOrigin: 'center',
            transform: 'rotate(-90deg)',
            transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
        <text x="50" y="48" textAnchor="middle" fontSize="16" fontWeight="bold" fill={color}>{score.toFixed(0)}</text>
        <text x="50" y="61" textAnchor="middle" fontSize="8" fill="#94a3b8">%</text>
      </svg>
      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-semibold">{label}</span>
    </div>
  );
}

// ─── Sub-component: Progress Bar ─────────────────────────────────────────────
function ProgressBar({ label, value, max = 100, colorClass = 'bg-primary-500', unit = '%' }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px]">
        <span className="text-slate-500 dark:text-slate-400 font-medium">{label}</span>
        <span className="font-bold text-slate-700 dark:text-slate-200">{typeof value === 'number' ? value.toFixed(1) : value}{unit}</span>
      </div>
      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} rounded-full transition-all duration-1000`}
          style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ClassificationResult({ result, currentUser = null }) {
  const [activeTab, setActiveTab] = useState('material');

  if (!result) return null;

  // Extract nested properties
  const image = result.image || {};
  const materialDetails = result.material_details || {};
  const fiberComp = materialDetails.fiber_composition || {};
  const matProperties = materialDetails.properties || {};
  const wasteDetails = result.waste_details || {};
  const recyclabilityDetails = result.recyclability_details || {};
  const imgFeatures = result.image_features || {};

  const id = result.prediction_id || result.id || 'N/A';
  const createdAt = result.created_at 
    ? new Date(result.created_at).toLocaleString() 
    : new Date().toLocaleString();

  const userName = result.user_name || currentUser?.full_name || 'N/A';
  const organization = result.organization || currentUser?.organization?.name || 'N/A';

  // Material classification details
  const materialName = result.material || 'Mixed Fabric';
  const materialConfidence = result.confidence || result.material_confidence || 0;
  const fabricCategory = result.fabric_category || materialDetails.fabric_category || 'N/A';
  const detectedColor = result.detected_color || image.dominant_colors?.[0] || 'N/A';
  const textureDescription = result.texture_description || 'N/A';

  // Alternative predictions probabilities list
  const probabilities = materialDetails.probabilities || {};
  const topAlternativePredictions = Object.entries(probabilities)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Retrieve data from dynamic Knowledge Base
  const kbData = getMaterialData(materialName);

  // Waste details
  const wasteCategory = result.waste_category || 'N/A';
  const wasteConfidence = result.waste_confidence || wasteDetails.confidence || result.confidence || 0;
  const wasteSeverity = result.severity_level || wasteDetails.severity_level || 'N/A';
  const wasteDescription = result.description || wasteDetails.description || 'N/A';
  const wasteReason = result.waste_reason || wasteDetails.reason || 'N/A';
  const wasteStatus = wasteDetails.status_badge || 'N/A';
  const materialQuality = result.material_quality || wasteDetails.material_quality || 'N/A';

  // Recyclability assessment
  const recyclabilityScore = result.recyclability || result.recyclability_score || recyclabilityDetails.recyclability_score || 0;
  const recoveryDifficulty = result.recovery || result.recovery_difficulty || recyclabilityDetails.recovery_difficulty || 'Medium';
  const reusePotential = result.reuse_potential || recyclabilityDetails.reuse_potential || 0;
  const materialRecoveryScore = result.material_recovery_score || recyclabilityDetails.material_recovery_score || 0;
  const overallRating = result.overall_rating || recyclabilityDetails.overall_rating || 'N/A';
  const recoveryIndicator = recyclabilityDetails.recovery_indicator || 'N/A';

  // Image features
  const visibleDamage = imgFeatures.visible_damage || image.visible_damage || false;
  const contaminationDetected = imgFeatures.contamination_detected || image.contamination_detected || false;
  const wrinkleDetected = imgFeatures.wrinkle_detected || image.wrinkle_detected || false;
  const tearDetected = imgFeatures.tear_detected || image.tear_detected || false;
  const surfaceQuality = imgFeatures.surface_quality || image.surface_quality || 'Good';
  const fabricPattern = imgFeatures.fabric_pattern || image.fabric_pattern || 'Solid';
  const textureComplexity = imgFeatures.texture_complexity || image.texture_complexity || 'Medium';
  const dominantColors = imgFeatures.dominant_colors || image.dominant_colors || [];

  // Summary Text
  const contaminationStr = contaminationDetected ? 'visible contamination' : 'low contamination';
  const damageStr = visibleDamage || tearDetected ? 'some visible damage/wear' : 'high recovery potential';
  const aiSummary = result.report?.summary || 
    `The uploaded textile has been identified as ${materialName} with ${materialConfidence.toFixed(1)}% confidence. The waste has been classified as ${wasteCategory} with a recyclability score of ${recyclabilityScore.toFixed(0)}%. The material shows ${contaminationStr} and ${damageStr}, which yields an overall recovery difficulty of ${recoveryDifficulty}.`;

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-cardDark p-1 rounded-2xl">
        <TabBtn active={activeTab === 'material'} onClick={() => setActiveTab('material')}>
          <Layers size={13} />
          <span>Material</span>
        </TabBtn>
        <TabBtn active={activeTab === 'waste'} onClick={() => setActiveTab('waste')}>
          <AlertTriangle size={13} />
          <span>Waste</span>
        </TabBtn>
        <TabBtn active={activeTab === 'recyclability'} onClick={() => setActiveTab('recyclability')}>
          <Recycle size={13} />
          <span>Recyclability</span>
        </TabBtn>
        <TabBtn active={activeTab === 'features'} onClick={() => setActiveTab('features')}>
          <Activity size={13} />
          <span>Features</span>
        </TabBtn>
      </div>

      {/* ─── Tab: Material ─────────────────────────────────────────────── */}
      {activeTab === 'material' && (
        <div className="space-y-5 animate-fade-in">
          {/* Header Card (1. Report Header) */}
          <div className="glass-card rounded-3xl p-5 border-l-4 border-primary-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[9px] uppercase tracking-wider font-bold text-primary-500">WeaveCycle AI Assessment</span>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">Textile Intelligence Technical Assessment</h3>
              <p className="text-[10px] text-slate-400 mt-1">ID: {id} • Created: {createdAt}</p>
            </div>
            <div className="text-right text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5">
              <p>👤 Operator: <span className="font-semibold text-slate-700 dark:text-slate-200">{userName}</span></p>
              <p>🏢 Corp: <span className="font-semibold text-slate-700 dark:text-slate-200">{organization}</span></p>
              <p>🤖 Model: <span className="font-semibold text-slate-700 dark:text-slate-200">WeaveAI-v2.1</span></p>
            </div>
          </div>

          {/* AI Prediction (3. AI Prediction) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="glass-card rounded-3xl p-5 space-y-4">
              <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">AI Classification</span>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-slate-400">Predicted Material</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-white">{materialName}</p>
                </div>
                <div className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20`}>
                  🟢 High Confidence
                </div>
              </div>
              <ProgressBar 
                label="AI Confidence Meter" 
                value={materialConfidence} 
                colorClass="bg-gradient-to-r from-primary-500 to-accent-cyan" 
              />
            </div>

            {/* Alternative Predictions */}
            <div className="glass-card rounded-3xl p-5 space-y-3">
              <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Alternative Predictions</span>
              <div className="space-y-3.5">
                {topAlternativePredictions.length > 0 ? (
                  topAlternativePredictions.map(([mat, prob]) => (
                    <ProgressBar 
                      key={mat} 
                      label={mat} 
                      value={prob} 
                      colorClass="bg-gradient-to-r from-blue-500 to-accent-cyan" 
                    />
                  ))
                ) : (
                  <ProgressBar 
                    label={materialName} 
                    value={materialConfidence} 
                    colorClass="bg-gradient-to-r from-blue-500 to-accent-cyan" 
                  />
                )}
              </div>
            </div>
          </div>

          {/* Material Intelligence (4. Material Intelligence) */}
          <div className="glass-card rounded-3xl p-5 space-y-4">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Material Intelligence Details</span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-bgDark/20 rounded-2xl">
                <span className="text-[9px] text-slate-400 block">Category</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{kbData.category || fabricCategory}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-bgDark/20 rounded-2xl">
                <span className="text-[9px] text-slate-400 block">Bio-Source</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{kbData.source || 'N/A'}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-bgDark/20 rounded-2xl">
                <span className="text-[9px] text-slate-400 block">Detected Color</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{detectedColor}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-bgDark/20 rounded-2xl">
                <span className="text-[9px] text-slate-400 block">Typical Composition</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {Object.entries(kbData.composition || fiberComp).map(([k, v]) => `${k} ${v}%`).join(', ')}
                </span>
              </div>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block font-bold mb-1">Description</span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {kbData.description}
              </p>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block font-bold mb-2">Typical Applications</span>
              <div className="flex flex-wrap gap-1.5">
                {(kbData.applications || []).map((app) => (
                  <span key={app} className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] text-slate-600 dark:text-slate-300 font-medium">
                    {app}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* AI Material Comparison (9. AI Material Comparison) */}
          <div className="glass-card rounded-3xl p-5 space-y-3">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">AI Material Comparison</span>
            <div className="border border-borderLight dark:border-borderDark rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800 dark:text-white">Compared with {kbData.comparison?.compare_with}</p>
                <p className="text-[10px] text-slate-400">Direct technical trade-off comparison</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 md:pl-10">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase text-emerald-500 font-bold block">Advantages</span>
                  <ul className="space-y-0.5">
                    {(kbData.comparison?.advantages || []).map((adv, i) => (
                      <li key={i} className="text-[10px] text-slate-600 dark:text-slate-300">{adv}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] uppercase text-red-500 font-bold block">Limitations</span>
                  <ul className="space-y-0.5">
                    {(kbData.comparison?.limitations || []).map((lim, i) => (
                      <li key={i} className="text-[10px] text-slate-600 dark:text-slate-300">{lim}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Tab: Waste ────────────────────────────────────────────────── */}
      {activeTab === 'waste' && (
        <div className="space-y-5 animate-fade-in">
          {/* Waste Intelligence (5. Waste Intelligence) */}
          <div className="glass-card rounded-3xl p-5 space-y-4">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Waste Intelligence Details</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3.5 bg-slate-50 dark:bg-bgDark/20 rounded-2xl space-y-1">
                <span className="text-[9px] text-slate-400 block">Waste Type</span>
                <span className="text-xs font-bold text-slate-800 dark:text-white">{kbData.waste_info?.type || 'Post-consumer'}</span>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-bgDark/20 rounded-2xl space-y-1">
                <span className="text-[9px] text-slate-400 block">Biodegradable</span>
                <span className="text-xs font-bold text-slate-800 dark:text-white">{kbData.waste_info?.biodegradable || 'No'}</span>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-bgDark/20 rounded-2xl space-y-1">
                <span className="text-[9px] text-slate-400 block">Decomposition Time</span>
                <span className="text-xs font-bold text-slate-800 dark:text-white">{kbData.waste_info?.decomposition_time || 'Variable'}</span>
              </div>
            </div>

            {/* Environmental Impact severity badges */}
            <div className="space-y-2">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Environmental Severity Indicators</span>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(kbData.environmental_impact || {}).map(([metric, severity]) => (
                  <div key={metric} className="p-3 border border-borderLight dark:border-borderDark rounded-2xl flex flex-col justify-between">
                    <span className="text-[8px] text-slate-400 uppercase capitalize">{metric.replace('_', ' ')}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold text-center border mt-2 ${IMPACT_COLORS[severity] || IMPACT_COLORS.Medium}`}>
                      {severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Disposal options */}
            <div className="space-y-2">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Recommended Disposal Hierarchy</span>
              <div className="flex flex-wrap gap-2">
                {['Reuse', 'Recycle', 'Compost', 'Upcycle', 'Avoid Landfill'].map((opt) => {
                  const isRecommended = kbData.recommendations?.best_disposal?.toLowerCase().includes(opt.toLowerCase());
                  return (
                    <div 
                      key={opt} 
                      className={`px-3 py-2 rounded-2xl border text-xs font-bold flex items-center space-x-1.5 ${
                        isRecommended 
                          ? 'border-primary-500 bg-primary-800/10 text-primary-600 dark:text-primary-neon shadow-neon' 
                          : 'border-borderLight dark:border-borderDark text-slate-400 bg-transparent'
                      }`}
                    >
                      {isRecommended && <CheckCircle size={10} />}
                      <span>{opt}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* AI Recommendations (10. AI Recommendations) */}
          <div className="glass-card rounded-3xl p-5 space-y-4">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">AI Disposal & Action Recommendations</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 border border-borderLight dark:border-borderDark rounded-2xl">
                <span className="text-[9px] text-slate-400 block uppercase font-bold">Best Disposal Method</span>
                <p className="text-xs font-semibold text-slate-800 dark:text-white mt-1">{kbData.recommendations?.best_disposal}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Preferred end-of-life path</p>
              </div>
              <div className="p-3.5 border border-borderLight dark:border-borderDark rounded-2xl">
                <span className="text-[9px] text-slate-400 block uppercase font-bold">Recycling Process</span>
                <p className="text-xs font-semibold text-slate-800 dark:text-white mt-1">{kbData.recommendations?.recycling_method}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Recommended industrial processing method</p>
              </div>
              <div className="p-3.5 border border-borderLight dark:border-borderDark rounded-2xl">
                <span className="text-[9px] text-slate-400 block uppercase font-bold">Reuse Feasibility</span>
                <p className="text-xs font-semibold text-slate-800 dark:text-white mt-1">{kbData.recommendations?.reuse_possibility}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Potential for second-hand garment loop</p>
              </div>
              <div className="p-3.5 border border-borderLight dark:border-borderDark rounded-2xl">
                <span className="text-[9px] text-slate-400 block uppercase font-bold">Suggested Secondary Applications</span>
                <p className="text-xs font-semibold text-slate-800 dark:text-white mt-1">
                  {(kbData.recommendations?.secondary_applications || []).join(', ')}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Repurposed industrial applications</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Tab: Recyclability ────────────────────────────────────────── */}
      {activeTab === 'recyclability' && (
        <div className="space-y-5 animate-fade-in">
          {/* Recyclability Assessment (6. Recyclability Assessment) */}
          <div className="glass-card rounded-3xl p-5 space-y-4">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Recyclability & Circular Economy</span>
            
            <div className="flex flex-col md:flex-row items-center justify-around gap-6 py-4">
              <CircularGauge 
                score={recyclabilityScore} 
                label="Recyclability Rating" 
                color="#00F5A0" 
              />
              <div className="text-center md:text-left space-y-2">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Circular Rating</p>
                <p className="text-lg font-bold text-slate-800 dark:text-white">{kbData.recycling_assessment?.status || 'Highly Recyclable'}</p>
                
                {/* Rating stars */}
                <div className="flex justify-center md:justify-start gap-0.5 text-yellow-500">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star 
                      key={idx} 
                      size={13} 
                      fill={idx < (kbData.recycling_assessment?.stars || 5) ? '#F59E0B' : 'none'} 
                      className={idx < (kbData.recycling_assessment?.stars || 5) ? 'text-yellow-500' : 'text-slate-300 dark:text-slate-600'} 
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block mb-2">Supported Industrial Methods</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {['Mechanical Recycling', 'Chemical Recycling', 'Fiber Recovery', 'Thermal Recovery', 'Industrial Composting'].map((m) => {
                    const isSupported = kbData.recycling_assessment?.methods?.includes(m);
                    return (
                      <div 
                        key={m} 
                        className={`p-2 border rounded-xl text-[10px] font-semibold flex items-center justify-between ${
                          isSupported 
                            ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' 
                            : 'border-borderLight dark:border-borderDark text-slate-400 bg-transparent'
                        }`}
                      >
                        <span>{m}</span>
                        {isSupported ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block mb-2">Upcycling Opportunities</span>
                <div className="flex flex-wrap gap-1.5">
                  {(kbData.recycling_assessment?.upcycling_opportunities || []).map((opp) => (
                    <span key={opp} className="px-2.5 py-1 bg-slate-50 dark:bg-bgDark/30 border border-borderLight dark:border-borderDark rounded-xl text-[10px] text-slate-600 dark:text-slate-300 font-medium">
                      {opp}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sustainability Metrics (8. Sustainability Metrics) */}
          <div className="glass-card rounded-3xl p-5 space-y-4">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Sustainability Performance Index</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(kbData.sustainability_metrics || {}).map(([metric, val]) => (
                <div key={metric} className="p-3.5 border border-borderLight dark:border-borderDark rounded-2xl space-y-2">
                  <span className="text-[9px] text-slate-400 uppercase font-semibold capitalize block truncate">{metric.replace(/_/g, ' ')}</span>
                  <div className="flex items-end justify-between">
                    <span className="text-lg font-bold text-slate-800 dark:text-white">{val}%</span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                      val >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' :
                      val >= 50 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400' :
                      'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                    }`}>
                      {val >= 80 ? 'OPTIMAL' : val >= 50 ? 'STABLE' : 'WARN'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1">
                    <div 
                      className={`h-full rounded-full ${
                        val >= 80 ? 'bg-green-500' :
                        val >= 50 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${val}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Tab: Features ─────────────────────────────────────────────── */}
      {activeTab === 'features' && (
        <div className="space-y-5 animate-fade-in">
          {/* Material Features (7. Material Features) */}
          <div className="glass-card rounded-3xl p-5 space-y-4">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Physical & Performance Features</span>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block mb-2">Physical Properties</span>
                <table className="w-full text-[10px]">
                  <tbody>
                    {Object.entries(kbData.features?.physical_properties || {}).map(([prop, val]) => (
                      <tr key={prop} className="border-b border-borderLight dark:border-borderDark last:border-0">
                        <td className="py-1 text-slate-400 font-medium">{prop}</td>
                        <td className="py-1 font-bold text-right text-slate-700 dark:text-slate-200">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block mb-2">Performance Standards</span>
                <table className="w-full text-[10px]">
                  <tbody>
                    {Object.entries(kbData.features?.performance || {}).map(([prop, val]) => (
                      <tr key={prop} className="border-b border-borderLight dark:border-borderDark last:border-0">
                        <td className="py-1 text-slate-400 font-medium">{prop}</td>
                        <td className="py-1 font-bold text-right text-slate-700 dark:text-slate-200">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block mb-2">Care Instructions</span>
                <table className="w-full text-[10px]">
                  <tbody>
                    {Object.entries(kbData.features?.care_instructions || {}).map(([prop, val]) => (
                      <tr key={prop} className="border-b border-borderLight dark:border-borderDark last:border-0">
                        <td className="py-1 text-slate-400 font-medium">{prop}</td>
                        <td className="py-1 font-bold text-right text-slate-700 dark:text-slate-200">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-borderLight dark:border-borderDark">
              <div className="space-y-1.5">
                <span className="text-[9px] uppercase text-emerald-500 font-bold block">Advantages</span>
                <div className="flex flex-wrap gap-1">
                  {(kbData.features?.advantages || []).map((adv) => (
                    <span key={adv} className="px-2 py-0.5 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-lg text-[9px] font-semibold">
                      {adv}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] uppercase text-red-500 font-bold block">Limitations</span>
                <div className="flex flex-wrap gap-1">
                  {(kbData.features?.limitations || []).map((lim) => (
                    <span key={lim} className="px-2 py-0.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg text-[9px] font-semibold">
                      {lim}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI Executive Summary (11. AI Summary) */}
          <div className="glass-card rounded-3xl p-5 border-l-4 border-indigo-500 bg-indigo-500/5 space-y-2">
            <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-400 flex items-center space-x-1.5">
              <Zap size={13} />
              <span>AI Generated Executive Summary</span>
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
              "{aiSummary}"
            </p>
          </div>

          {/* Report Metadata (12. Report Metadata) */}
          <div className="glass-card rounded-3xl p-5 space-y-3">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Technical Metadata Registry</span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px]">
              <div>
                <span className="text-slate-400 block">Report UUID</span>
                <span className="font-mono text-[9px] text-slate-600 dark:text-slate-300 font-semibold">{id}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Software Version</span>
                <span className="text-slate-600 dark:text-slate-300 font-semibold">WeaveCycle-Portal v1.2.0</span>
              </div>
              <div>
                <span className="text-slate-400 block">Execution Node</span>
                <span className="text-slate-600 dark:text-slate-300 font-semibold">LocalHost Engine</span>
              </div>
              <div>
                <span className="text-slate-400 block">Database Provider</span>
                <span className="text-slate-600 dark:text-slate-300 font-semibold">PostgreSQL v15</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
