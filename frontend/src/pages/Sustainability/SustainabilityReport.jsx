import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Printer, Download, Leaf, Award, 
  Activity, AlertCircle, RefreshCw, Compass, Layers, Building 
} from 'lucide-react';

import SustainabilityService from '../../services/sustainabilityService';

export default function SustainabilityReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE = 'http://localhost:8000';

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await SustainabilityService.getDetail(id);
      setReport(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch sustainability report details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <Activity size={24} className="animate-spin text-primary-500 mb-2" />
        <span>Compiling corporate sustainability audit sheet...</span>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="glass-card rounded-3xl p-8 text-center space-y-3">
        <AlertCircle size={32} className="mx-auto text-red-500" />
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        <button onClick={() => navigate(-1)} className="text-xs text-slate-500 hover:text-primary-500">
          ← Go Back
        </button>
      </div>
    );
  }

  const imageUrl = report.image_path ? `${API_BASE}/uploads/${report.image_path}` : null;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto print:max-w-full print:p-0">
      
      {/* Header and Print Actions (Hidden in Print Mode) */}
      <div className="flex justify-between items-center print:hidden">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-cardDark transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Sustainability Report</h1>
            <p className="text-[10px] text-slate-400 font-mono">Prediction ID: {report.prediction_id}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-500 border border-borderLight dark:border-borderDark rounded-xl hover:bg-slate-50 dark:hover:bg-cardDark transition-all"
          >
            <Printer size={13} />
            <span>Print Report</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-primary-700 hover:bg-primary-600 rounded-xl transition-all shadow-neon"
          >
            <Download size={13} />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Main Printable Sheet */}
      <div className="glass-card rounded-3xl p-8 space-y-8 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark print:border-0 print:shadow-none print:p-4 print:text-black">
        
        {/* Document Title header */}
        <div className="border-b border-borderLight dark:border-borderDark pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-primary-800 dark:text-white">
              <Leaf className="w-5 h-5 text-emerald-500" />
              <span className="text-lg font-black tracking-tight uppercase">WeaveCycle Audit Summary</span>
            </div>
            <p className="text-[10px] text-slate-400">{report.report_title}</p>
          </div>
          <div className="text-left sm:text-right text-[10px] text-slate-400 space-y-0.5">
            <p>Date: <span className="font-semibold text-slate-700 dark:text-white">{new Date(report.created_at).toLocaleString()}</span></p>
            <p>Auditor: <span className="font-semibold text-slate-700 dark:text-white">{report.user_name}</span></p>
            <p>Organization: <span className="font-semibold text-primary-600 dark:text-primary-neon">{report.organization_name}</span></p>
          </div>
        </div>

        {/* Overview Row: Image + Main indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Image */}
          <div className="md:col-span-1">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt="Analyzed batch" 
                className="w-full aspect-square object-cover rounded-2xl border border-borderLight dark:border-borderDark" 
              />
            ) : (
              <div className="w-full aspect-square rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xs">
                No image preview available
              </div>
            )}
          </div>

          {/* Key Indicators details */}
          <div className="md:col-span-2 space-y-4 flex flex-col justify-between">
            <div className="grid grid-cols-2 gap-4">
              
              <div className="p-4 bg-slate-50 dark:bg-cardDark/50 border border-borderLight dark:border-borderDark rounded-2xl">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Material identified</p>
                <p className="text-xl font-black text-slate-800 dark:text-white mt-1">{report.material}</p>
                <p className="text-[9px] text-slate-400 mt-1">Confidence: {report.confidence.toFixed(1)}%</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-cardDark/50 border border-borderLight dark:border-borderDark rounded-2xl">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Waste classification</p>
                <p className="text-xl font-black text-slate-800 dark:text-white mt-1">{report.waste_category}</p>
                <p className="text-[9px] text-slate-400 mt-1">Recyclability Score: {report.circularity?.circularity_score}%</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-cardDark/50 border border-borderLight dark:border-borderDark rounded-2xl">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Sustainability Score</p>
                <p className="text-2xl font-black text-emerald-500 mt-1">
                  {report.sustainability_metrics?.sustainability_score}/100
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-cardDark/50 border border-borderLight dark:border-borderDark rounded-2xl">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Circularity Index</p>
                <p className="text-2xl font-black text-accent-cyan mt-1">
                  {report.circularity?.circularity_score}/100
                </p>
              </div>

            </div>

            <div className="p-4 bg-primary-50/20 dark:bg-emerald-950/10 border border-primary-200/50 dark:border-emerald-800/40 rounded-2xl text-[10px] text-slate-500 dark:text-slate-300">
              <span className="font-bold block text-primary-700 dark:text-primary-neon mb-1 uppercase tracking-wider text-[8px]">Primary Recovery Strategy</span>
              <p className="font-medium">
                WeaveCycle recommends <span className="font-bold text-slate-800 dark:text-white">{report.recommendations[0]?.recovery_method || 'Mechanical Recycling'}</span> with a Priority level of <span className="font-bold">{report.recommendations[0]?.recovery_priority || 'High'}</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Executive summary block */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider border-b border-borderLight dark:border-borderDark pb-2">
            Executive Summary
          </h3>
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-medium whitespace-pre-line">
            {report.executive_summary}
          </p>
        </div>

        {/* Environmental impact offset parameters */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider border-b border-borderLight dark:border-borderDark pb-2">
            Quantified Ecological Offsets (Standard batch)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            
            <div className="p-3 bg-slate-50 dark:bg-cardDark/50 border border-borderLight dark:border-borderDark rounded-2xl">
              <p className="text-[9px] text-slate-400 font-bold">CO₂ Saved</p>
              <p className="text-md font-black text-slate-800 dark:text-white mt-1">
                {report.environmental_impact?.co2_saved?.toFixed(1)} kg
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-cardDark/50 border border-borderLight dark:border-borderDark rounded-2xl">
              <p className="text-[9px] text-slate-400 font-bold">Water Saved</p>
              <p className="text-md font-black text-slate-800 dark:text-white mt-1">
                {report.environmental_impact?.water_saved?.toLocaleString()} L
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-cardDark/50 border border-borderLight dark:border-borderDark rounded-2xl">
              <p className="text-[9px] text-slate-400 font-bold">Energy Saved</p>
              <p className="text-md font-black text-slate-800 dark:text-white mt-1">
                {report.environmental_impact?.energy_saved?.toFixed(1)} kWh
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-cardDark/50 border border-borderLight dark:border-borderDark rounded-2xl">
              <p className="text-[9px] text-slate-400 font-bold">Landfill Diversion</p>
              <p className="text-md font-black text-slate-800 dark:text-white mt-1">
                {report.environmental_impact?.landfill_diversion?.toFixed(0)} kg
              </p>
            </div>

          </div>
        </div>

        {/* Detailed Recommendations grid */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider border-b border-borderLight dark:border-borderDark pb-2">
            Circular Recovery Action Plan
          </h3>
          <div className="space-y-3">
            {report.recommendations?.map((rec, index) => (
              <div 
                key={index} 
                className="p-4 bg-slate-50 dark:bg-cardDark/20 border border-borderLight dark:border-borderDark rounded-2xl space-y-2 text-xs"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 dark:text-white">{rec.recovery_method}</span>
                  <div className="space-x-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-primary-100 dark:bg-emerald-950 text-primary-800 dark:text-primary-neon">
                      {rec.recovery_priority} Priority
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {rec.difficulty_level} Difficulty
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-borderDark">
                  <p><span className="font-bold text-slate-600 dark:text-slate-300">Processing:</span> {rec.required_processing}</p>
                  <p><span className="font-bold text-slate-600 dark:text-slate-300">Output:</span> {rec.expected_output}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Signatures / Compliance block */}
        <div className="pt-8 border-t border-borderLight dark:border-borderDark flex justify-between items-end text-[10px] text-slate-400 print:pt-16">
          <div className="space-y-1">
            <p className="font-bold text-slate-600 dark:text-slate-300">WeaveCycle Compliance Verification</p>
            <p>Circular Economy Audit standards ISO 14040/44 compliant</p>
          </div>
          <div className="text-right space-y-4">
            <div className="w-36 border-b border-slate-300 dark:border-slate-700 h-8" />
            <p className="font-bold text-slate-600 dark:text-slate-300">Auditor Signature</p>
          </div>
        </div>

      </div>

    </div>
  );
}
