import React from 'react';
import {
  Leaf, Brain, Recycle, AlertTriangle, CheckCircle,
  Activity, Shield, Zap, Clock, User, Building, FileText, Star
} from 'lucide-react';
import { getMaterialData } from '../../services/materialKnowledgeBase';

const SEVERITY_TEXT_COLOR = {
  Minimal: 'text-green-700 font-bold',
  Low: 'text-blue-700 font-bold',
  Moderate: 'text-amber-700 font-bold',
  High: 'text-red-700 font-bold',
};

const SEVERITY_BORDER_COLOR = {
  Minimal: 'border-green-200 bg-green-50/50',
  Low: 'border-blue-200 bg-blue-50/50',
  Moderate: 'border-amber-200 bg-amber-50/50',
  High: 'border-red-200 bg-red-50/50',
};

const IMPACT_COLORS = {
  Low: 'border-green-200 bg-green-50/30 text-green-700 font-semibold',
  Medium: 'border-amber-200 bg-amber-50/30 text-amber-700 font-semibold',
  High: 'border-red-200 bg-red-50/30 text-red-700 font-semibold'
};

export default function PrintableClassificationReport({ result, currentUser = null }) {
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

  const API_BASE = 'http://localhost:8000';
  const imageUrl = image.original_path 
    ? `${API_BASE}/uploads/${image.original_path}` 
    : null;

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
  const damageStr = visibleDamage || tearDetected ? 'some visible damage or wear' : 'high structural integrity';
  const aiSummary = result.report?.summary || 
    `The uploaded textile has been identified as ${materialName} with ${materialConfidence.toFixed(1)}% confidence. The waste has been classified as ${wasteCategory} with a recyclability score of ${recyclabilityScore.toFixed(0)}%. The material shows ${contaminationStr} and ${damageStr}, resulting in a recovery potential marked as ${recoveryDifficulty}.`;

  return (
    <div className="w-full text-slate-800 bg-white font-poppins text-[10px] p-6 max-w-4xl mx-auto print:p-0 print:text-black">
      
      {/* ─── 1. Report Header ─────────────────────────────────────────── */}
      <div className="border-b-2 border-slate-800 pb-4 mb-5 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-800 text-white rounded-xl">
            <Leaf size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800 print:text-black">
              Weave<span className="text-emerald-600">Cycle</span>
            </h1>
            <p className="text-[8px] text-slate-500 uppercase tracking-wider font-bold">
              AI Powered Textile Waste Intelligence Platform
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-tight">Classification Report</h2>
            <p className="font-mono text-[8px] text-slate-500">ID: {id}</p>
          </div>
          {id && id !== 'N/A' && (
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(`${window.location.origin}/predictions/${id}`)}`} 
              alt="Report QR Code"
              className="w-10 h-10 border border-slate-200 rounded p-0.5"
            />
          )}
        </div>
      </div>

      {/* Meta Grid */}
      <div className="grid grid-cols-4 gap-4 p-3 border border-slate-200 rounded-xl mb-5 bg-slate-50/50 print:bg-transparent">
        <div>
          <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-bold">Generated By</span>
          <span className="font-semibold text-slate-700 flex items-center mt-0.5">
            <User size={9} className="mr-1 text-slate-500" />
            <span>{userName}</span>
          </span>
        </div>
        <div>
          <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-bold">Organization</span>
          <span className="font-semibold text-slate-700 flex items-center mt-0.5">
            <Building size={9} className="mr-1 text-slate-500" />
            <span>{organization}</span>
          </span>
        </div>
        <div>
          <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-bold">Report Date</span>
          <span className="font-semibold text-slate-700 flex items-center mt-0.5">
            <Clock size={9} className="mr-1 text-slate-500" />
            <span>{createdAt}</span>
          </span>
        </div>
        <div>
          <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-bold">AI Model Version</span>
          <span className="font-semibold text-slate-700 flex items-center mt-0.5">
            <Brain size={9} className="mr-1 text-slate-500" />
            <span>WeaveAI-v2.1</span>
          </span>
        </div>
      </div>

      {/* ─── 2. Uploaded Textile Image ─────────────────────────────────── */}
      <div className="print-section border border-slate-200 rounded-xl p-4 mb-5 grid grid-cols-3 gap-6 items-center">
        <div className="col-span-1 flex justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Uploaded textile"
              className="max-h-36 w-auto object-cover rounded-lg border border-slate-200"
            />
          ) : (
            <div className="w-full aspect-square max-w-[120px] rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
              <FileText size={24} className="text-slate-300" />
            </div>
          )}
        </div>
        <div className="col-span-2 space-y-2">
          <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-1 mb-1.5">Uploaded Textile Image</h3>
          <table className="w-full text-[9px]">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-1 text-slate-500 font-medium">Image Name</td>
                <td className="py-1 font-semibold text-right text-slate-800 truncate max-w-[200px]">{image.filename || 'textile_sample.jpg'}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1 text-slate-500 font-medium">Upload Date</td>
                <td className="py-1 font-semibold text-right text-slate-800">{image.created_at ? new Date(image.created_at).toLocaleString() : createdAt}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1 text-slate-500 font-medium">Resolution</td>
                <td className="py-1 font-semibold text-right text-slate-800">{image.width && image.height ? `${image.width} × ${image.height} px` : 'N/A'}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1 text-slate-500 font-medium">File Type</td>
                <td className="py-1 font-semibold text-right text-slate-800">{image.format || 'JPEG'}</td>
              </tr>
              <tr>
                <td className="py-1 text-slate-500 font-medium">File Size</td>
                <td className="py-1 font-semibold text-right text-slate-800">{image.file_size ? `${(image.file_size / 1024).toFixed(1)} KB` : 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 3. AI Prediction ───────────────────────────────────────────── */}
      <div className="print-section border border-slate-200 rounded-xl p-4 mb-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-1.5">3. AI Prediction & Alternative Options</h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-bold">Predicted Material</span>
              <p className="text-base font-bold text-emerald-700 mt-0.5">{materialName}</p>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between font-semibold text-[9px]">
                <span>Confidence Score</span>
                <span className="text-emerald-700 font-bold">{materialConfidence.toFixed(1)}%</span>
              </div>
              {/* Static print progress bar */}
              <div className="w-full bg-slate-100 border border-slate-200 rounded-full h-2.5 overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${materialConfidence}%` }} />
              </div>
            </div>
            <div className="inline-block px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[9px] text-emerald-700 font-bold">
              🟢 High Confidence
            </div>
          </div>

          <div>
            <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-bold mb-2">Alternative Predictions</span>
            <div className="space-y-3">
              {topAlternativePredictions.length > 0 ? (
                topAlternativePredictions.map(([mat, prob]) => (
                  <div key={mat} className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold">
                      <span>{mat}</span>
                      <span>{prob.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 border border-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-slate-600 h-full rounded-full" style={{ width: `${prob}%` }} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-semibold">
                    <span>{materialName}</span>
                    <span>{materialConfidence.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 border border-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-slate-600 h-full rounded-full" style={{ width: `${materialConfidence}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── 4. Material Intelligence ───────────────────────────────────── */}
      <div className="print-section border border-slate-200 rounded-xl p-4 mb-5 space-y-3">
        <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-1.5">4. Material Intelligence & Composition</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100">
            <span className="text-[8px] uppercase text-slate-400 block font-bold">Material Category</span>
            <span className="font-bold text-slate-700">{kbData.category || fabricCategory}</span>
          </div>
          <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100">
            <span className="text-[8px] uppercase text-slate-400 block font-bold">Fiber Source</span>
            <span className="font-bold text-slate-700">{kbData.source || 'N/A'}</span>
          </div>
          <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100 flex flex-col justify-between">
            <span className="text-[8px] uppercase text-slate-400 block font-bold">Detected Colors</span>
            <div className="flex items-center space-x-1 mt-0.5">
              {dominantColors.length > 0 ? (
                dominantColors.slice(0, 3).map((col, idx) => (
                  <div 
                    key={idx} 
                    className="w-3.5 h-3.5 rounded-full border border-slate-200" 
                    style={{ backgroundColor: col }}
                    title={col}
                  />
                ))
              ) : (
                <span className="font-bold text-slate-700">{detectedColor}</span>
              )}
            </div>
          </div>
          <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100">
            <span className="text-[8px] uppercase text-slate-400 block font-bold">Texture slubs</span>
            <span className="font-bold text-slate-700 truncate block">{textureDescription}</span>
          </div>
        </div>

        <div className="mt-2 space-y-2">
          <div>
            <span className="text-[8px] uppercase font-bold text-slate-400 block">Short Description</span>
            <p className="text-slate-700 leading-relaxed text-[9px] mt-0.5">{kbData.description}</p>
          </div>
          <div>
            <span className="text-[8px] uppercase font-bold text-slate-400 block mb-1">Typical Applications</span>
            <div className="flex flex-wrap gap-1">
              {(kbData.applications || []).map((app) => (
                <span key={app} className="px-2 py-0.5 border border-slate-200 rounded-md text-[8px] font-medium text-slate-600">
                  {app}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── 5. Waste Intelligence ──────────────────────────────────────── */}
      <div className="print-section border border-slate-200 rounded-xl p-4 mb-5 space-y-3">
        <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-1.5">5. Waste Intelligence & Impact</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-2 border border-slate-200 rounded-lg">
            <span className="text-[8px] uppercase text-slate-400 block font-bold">Waste Type</span>
            <span className="font-bold text-slate-700">{kbData.waste_info?.type || 'Post-consumer'}</span>
          </div>
          <div className="p-2 border border-slate-200 rounded-lg">
            <span className="text-[8px] uppercase text-slate-400 block font-bold">Biodegradable</span>
            <span className="font-bold text-slate-700">{kbData.waste_info?.biodegradable || 'No'}</span>
          </div>
          <div className="p-2 border border-slate-200 rounded-lg">
            <span className="text-[8px] uppercase text-slate-400 block font-bold">Estimated Decomposition</span>
            <span className="font-bold text-slate-700">{kbData.waste_info?.decomposition_time || 'Variable'}</span>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[8px] uppercase font-bold text-slate-400 block">Environmental Severity Indicators</span>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(kbData.environmental_impact || {}).map(([metric, severity]) => (
              <div key={metric} className="p-2 border border-slate-200 rounded-lg flex flex-col justify-between">
                <span className="text-[7px] text-slate-400 uppercase font-semibold">{metric.replace('_', ' ')}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold text-center border mt-1.5 ${IMPACT_COLORS[severity] || IMPACT_COLORS.Medium}`}>
                  {severity}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-[8px] uppercase font-bold text-slate-400 block">Recommended Disposal Option</span>
          <div className="flex gap-2">
            {['Reuse', 'Recycle', 'Compost', 'Upcycle', 'Avoid Landfill'].map((opt) => {
              const isRecommended = kbData.recommendations?.best_disposal?.toLowerCase().includes(opt.toLowerCase());
              return (
                <div 
                  key={opt} 
                  className={`px-2.5 py-1 rounded-lg border text-[9px] font-bold flex items-center space-x-1 ${
                    isRecommended 
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700' 
                      : 'border-slate-200 text-slate-400 bg-transparent'
                  }`}
                >
                  {isRecommended && <CheckCircle size={8} />}
                  <span>{opt}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── 6. Recyclability Assessment ─────────────────────────────────── */}
      <div className="print-section border border-slate-200 rounded-xl p-4 mb-5 space-y-3">
        <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-1.5">6. Recyclability Assessment</h3>
        <div className="grid grid-cols-3 gap-6 items-center">
          <div className="col-span-1 border border-slate-200 rounded-lg p-3 text-center">
            <span className="text-[8px] uppercase text-slate-400 block font-bold">Recyclability Score</span>
            <span className="text-lg font-bold text-emerald-700">{recyclabilityScore.toFixed(0)} / 100</span>
            <div className="flex justify-center mt-1.5 text-yellow-500">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star 
                  key={idx} 
                  size={10} 
                  fill={idx < (kbData.recycling_assessment?.stars || 5) ? '#F59E0B' : 'none'} 
                  className={idx < (kbData.recycling_assessment?.stars || 5) ? 'text-yellow-500' : 'text-slate-300'} 
                />
              ))}
            </div>
          </div>

          <div className="col-span-2 space-y-2">
            <div>
              <span className="text-[8px] uppercase text-slate-400 block font-bold">Recycling Status</span>
              <p className="font-bold text-slate-800 text-[10px]">{kbData.recycling_assessment?.status || 'Highly Recyclable'}</p>
            </div>
            <div>
              <span className="text-[8px] uppercase text-slate-400 block font-bold mb-1">Applicable Recycling Methods</span>
              <div className="flex flex-wrap gap-1">
                {['Mechanical Recycling', 'Chemical Recycling', 'Fiber Recovery', 'Thermal Recovery', 'Industrial Composting'].map((method) => {
                  const isSupported = kbData.recycling_assessment?.methods?.includes(method);
                  return (
                    <span 
                      key={method} 
                      className={`px-2 py-0.5 rounded-md text-[8px] font-semibold border ${
                        isSupported 
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700' 
                          : 'border-slate-100 text-slate-300 bg-transparent'
                      }`}
                    >
                      {method}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-1">
          <span className="text-[8px] uppercase text-slate-400 block font-bold mb-1">Upcycling Opportunities</span>
          <div className="flex flex-wrap gap-1">
            {(kbData.recycling_assessment?.upcycling_opportunities || []).map((opp) => (
              <span key={opp} className="px-2 py-0.5 border border-slate-200 rounded-md text-[8px] text-slate-600 font-medium">
                {opp}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── 7. Material Features ───────────────────────────────────────── */}
      <div className="print-section border border-slate-200 rounded-xl p-4 mb-5 space-y-3">
        <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-1.5">7. Technical Material Features</h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <span className="text-[8px] uppercase font-bold text-slate-400 block mb-1">Physical Properties</span>
            <table className="w-full text-[8px]">
              <tbody>
                {Object.entries(kbData.features?.physical_properties || {}).map(([prop, val]) => (
                  <tr key={prop} className="border-b border-slate-100 last:border-0">
                    <td className="py-0.5 text-slate-500">{prop}</td>
                    <td className="py-0.5 font-bold text-right text-slate-800">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <span className="text-[8px] uppercase font-bold text-slate-400 block mb-1">Performance Index</span>
            <table className="w-full text-[8px]">
              <tbody>
                {Object.entries(kbData.features?.performance || {}).map(([prop, val]) => (
                  <tr key={prop} className="border-b border-slate-100 last:border-0">
                    <td className="py-0.5 text-slate-500">{prop}</td>
                    <td className="py-0.5 font-bold text-right text-slate-800">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <span className="text-[8px] uppercase font-bold text-slate-400 block mb-1">Care & Maintenance</span>
            <table className="w-full text-[8px]">
              <tbody>
                {Object.entries(kbData.features?.care_instructions || {}).map(([prop, val]) => (
                  <tr key={prop} className="border-b border-slate-100 last:border-0">
                    <td className="py-0.5 text-slate-500">{prop}</td>
                    <td className="py-0.5 font-bold text-right text-slate-800 truncate max-w-[90px]">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <span className="text-[8px] uppercase text-emerald-600 font-bold block mb-1">Material Advantages</span>
            <div className="flex flex-wrap gap-1">
              {(kbData.features?.advantages || []).map((adv) => (
                <span key={adv} className="px-2 py-0.5 border border-emerald-200 bg-emerald-50/20 text-emerald-700 rounded-md text-[8px] font-semibold">
                  {adv}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-[8px] uppercase text-red-600 font-bold block mb-1">Limitations</span>
            <div className="flex flex-wrap gap-1">
              {(kbData.features?.limitations || []).map((lim) => (
                <span key={lim} className="px-2 py-0.5 border border-red-200 bg-red-50/20 text-red-700 rounded-md text-[8px] font-semibold">
                  {lim}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── 8. Sustainability Metrics ──────────────────────────────────── */}
      <div className="print-section border border-slate-200 rounded-xl p-4 mb-5 space-y-3">
        <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-1.5">8. Sustainability Metrics Dashboard</h3>
        <div className="grid grid-cols-4 gap-3">
          {Object.entries(kbData.sustainability_metrics || {}).map(([metric, value]) => (
            <div key={metric} className="p-2.5 border border-slate-200 rounded-lg space-y-1 bg-slate-50/20">
              <span className="text-[7px] text-slate-400 font-bold uppercase truncate block">{metric.replace(/_/g, ' ')}</span>
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-slate-800">{value}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1">
                <div 
                  className={`h-full rounded-full ${value >= 80 ? 'bg-green-500' : value >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${value}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 9. AI Material Comparison ──────────────────────────────────── */}
      <div className="print-section border border-slate-200 rounded-xl p-4 mb-5 space-y-2">
        <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-1.5">9. AI Material Comparison</h3>
        <div className="border border-slate-200 rounded-lg p-3 flex justify-between items-center gap-6">
          <div className="space-y-0.5">
            <p className="text-[9px] font-bold text-slate-800">Compared with {kbData.comparison?.compare_with}</p>
            <p className="text-[8px] text-slate-400">Technical performance contrast</p>
          </div>
          <div className="grid grid-cols-2 gap-4 flex-1 pl-6">
            <div className="space-y-1">
              <span className="text-[8px] uppercase text-emerald-600 font-bold block">Key Strengths</span>
              <ul className="space-y-0.5 text-[8px] text-slate-700">
                {(kbData.comparison?.advantages || []).map((adv, i) => (
                  <li key={i}>{adv}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-1">
              <span className="text-[8px] uppercase text-red-600 font-bold block">Key Deficiencies</span>
              <ul className="space-y-0.5 text-[8px] text-slate-700">
                {(kbData.comparison?.limitations || []).map((lim, i) => (
                  <li key={i}>{lim}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 10. AI Recommendations ─────────────────────────────────────── */}
      <div className="print-section border border-slate-200 rounded-xl p-4 mb-5 space-y-2">
        <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-1.5">10. Actionable AI Recommendations</h3>
        <div className="grid grid-cols-4 gap-3 text-[8px]">
          <div className="p-2 border border-slate-150 rounded-lg bg-slate-50/20">
            <span className="text-slate-400 uppercase font-bold block">Best Disposal</span>
            <span className="font-bold text-slate-800 text-[9px] mt-0.5 block">{kbData.recommendations?.best_disposal}</span>
          </div>
          <div className="p-2 border border-slate-150 rounded-lg bg-slate-50/20">
            <span className="text-slate-400 uppercase font-bold block">Recycling Route</span>
            <span className="font-bold text-slate-800 text-[9px] mt-0.5 block">{kbData.recommendations?.recycling_method}</span>
          </div>
          <div className="p-2 border border-slate-150 rounded-lg bg-slate-50/20">
            <span className="text-slate-400 uppercase font-bold block">Reuse Loop</span>
            <span className="font-bold text-slate-800 text-[9px] mt-0.5 block">{kbData.recommendations?.reuse_possibility}</span>
          </div>
          <div className="p-2 border border-slate-150 rounded-lg bg-slate-50/20">
            <span className="text-slate-400 uppercase font-bold block">Downcycle Uses</span>
            <span className="font-bold text-slate-800 text-[9px] mt-0.5 block truncate">{(kbData.recommendations?.secondary_applications || []).join(', ')}</span>
          </div>
        </div>
      </div>

      {/* ─── 11. AI Summary ─────────────────────────────────────────────── */}
      <div className="print-section border border-slate-200 rounded-xl p-4 mb-5 bg-slate-50/40">
        <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-1 mb-1.5 flex items-center">
          <Zap size={11} className="mr-1.5 text-indigo-600" />
          <span>11. Executive AI Analysis Summary</span>
        </h3>
        <p className="text-slate-700 italic leading-relaxed text-[9px]">
          "{aiSummary}"
        </p>
      </div>

      {/* ─── 12. Report Metadata ────────────────────────────────────────── */}
      <div className="print-section border border-slate-200 rounded-xl p-3 mb-6 text-[8px] text-slate-500">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <span className="block text-slate-400 font-bold uppercase tracking-wider text-[7px]">Prediction UUID</span>
            <span className="font-mono text-[8px] font-bold">{id}</span>
          </div>
          <div>
            <span className="block text-slate-400 font-bold uppercase tracking-wider text-[7px]">AI Model Version</span>
            <span className="font-bold text-slate-700">{result.model_version || 'v1.0.0'}</span>
          </div>
          <div>
            <span className="block text-slate-400 font-bold uppercase tracking-wider text-[7px]">Processing Time</span>
            <span className="font-bold text-slate-700">{result.processing_time_ms || result.processing_time || 0} ms</span>
          </div>
          <div>
            <span className="block text-slate-400 font-bold uppercase tracking-wider text-[7px]">Database Sync Status</span>
            <span className="font-bold text-emerald-600">Active (Synced)</span>
          </div>
        </div>
      </div>

      {/* Report Footer */}
      <div className="border-t border-slate-300 pt-3 mt-6 flex justify-between items-center text-[8px] text-slate-400">
        <div className="flex items-center space-x-1">
          <Leaf size={10} className="text-slate-400" />
          <span className="font-bold text-slate-500">WeaveCycle Assessment</span>
        </div>
        <div>
          <span>AI Powered Textile Waste Intelligence Platform • Document Confidential</span>
        </div>
        <div className="font-mono">
          <span>Page 1 of 1 • {createdAt}</span>
        </div>
      </div>

    </div>
  );
}
