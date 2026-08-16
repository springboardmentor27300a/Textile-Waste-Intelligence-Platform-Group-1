import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Compass, Activity, AlertCircle, RefreshCw, Layers, Brain,
  Sparkles, Award, ShieldAlert, BadgeAlert 
} from 'lucide-react';

import SustainabilityService from '../../services/sustainabilityService';
import AIService from '../../services/aiService';
import CircularityGauge from '../../components/CircularityGauge/CircularityGauge';

const CLASSIFICATION_INFO = {
  'Excellent Circular Material': {
    color: 'text-green-500',
    bg: 'bg-green-500/10 border-green-500/20',
    desc: 'This material shows maximum circular loop characteristics. It is highly recyclable, holds high secondary retention values, and is suitable for closed-loop fiber recovery without quality degradation.',
    icon: <Award className="w-5 h-5" />
  },
  'High Circular Potential': {
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    desc: 'This material exhibits high secondary retention. It is suitable for mechanical tearing or upcycling into high-value secondary goods, avoiding landfills completely.',
    icon: <Award className="w-5 h-5" />
  },
  'Moderate Circular Potential': {
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
    desc: 'This material holds average loop parameters. Minor contamination, zipper insertions, or blend characteristics make recovery slightly complex, requiring industrial pre-sorting.',
    icon: <Activity className="w-5 h-5" />
  },
  'Limited Circular Potential': {
    color: 'text-orange-500',
    bg: 'bg-orange-500/10 border-orange-500/20',
    desc: 'The material contains mixed fiber polymers or visible degradation. Recovery is economically complex; utility shredded felt or secondary insulation padding is the most viable loop.',
    icon: <ShieldAlert className="w-5 h-5" />
  },
  'Disposal Recommended': {
    color: 'text-red-500',
    bg: 'bg-red-500/10 border-red-500/20',
    desc: 'Severe degradation or hazardous chemical contamination detected. Disposal through safe biological/thermal incineration is advised to prevent recycling contamination.',
    icon: <BadgeAlert className="w-5 h-5" />
  }
};

export default function CircularEconomy() {
  const [searchParams] = useSearchParams();
  const predictionIdParam = searchParams.get('prediction_id');

  const [predictions, setPredictions] = useState([]);
  const [selectedPredId, setSelectedPredId] = useState('');
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [circularityData, setCircularityData] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [circLoading, setCircLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Fetch prediction logs
  useEffect(() => {
    const fetchPredictions = async () => {
      setLoading(true);
      try {
        const res = await AIService.getPredictions({ per_page: 20 });
        setPredictions(res.data.items || []);
        
        if (predictionIdParam) {
          setSelectedPredId(predictionIdParam);
        } else if (res.data.items?.length > 0) {
          setSelectedPredId(res.data.items[0].id);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch prediction logs.');
      } finally {
        setLoading(false);
      }
    };
    fetchPredictions();
  }, [predictionIdParam]);

  // 2. Fetch circularity details
  const loadCircularity = async () => {
    if (!selectedPredId) return;
    setCircLoading(true);
    setError('');
    try {
      const res = await SustainabilityService.calculateCircularity(selectedPredId);
      setCircularityData(res.data);
      
      const predRes = await AIService.getPrediction(selectedPredId);
      setSelectedPrediction(predRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to calculate circularity metrics.');
    } finally {
      setCircLoading(false);
    }
  };

  useEffect(() => {
    loadCircularity();
  }, [selectedPredId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <Activity size={24} className="animate-spin text-primary-500 mb-2" />
        <span>Loading circular database indicators...</span>
      </div>
    );
  }

  const activeClassInfo = circularityData 
    ? CLASSIFICATION_INFO[circularityData.classification] || CLASSIFICATION_INFO['Moderate Circular Potential']
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <div className="flex items-center space-x-2.5 mb-1">
          <div className="p-2 bg-primary-800 dark:bg-emerald-950/40 text-primary-neon rounded-2xl shadow-neon">
            <Compass size={18} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Circular Economy Analytics</h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 ml-11">
          Monitor resource preservation loops, material retention scores, and circular economy classification index levels.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left selector sidebar */}
        <div className="space-y-4">
          <div className="glass-card rounded-3xl p-5 space-y-4">
            <div className="flex items-center space-x-2 text-slate-800 dark:text-white font-bold text-xs uppercase tracking-wider">
              <Layers size={14} className="text-primary-500" />
              <span>Select Textile Batch</span>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 font-bold block">ACTIVE BATCH</label>
              <select
                value={selectedPredId}
                onChange={(e) => setSelectedPredId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-xl text-xs outline-none text-slate-700 dark:text-white focus:ring-2 focus:ring-primary-100"
              >
                {predictions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.material} ({p.waste_category}) — {new Date(p.created_at).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            {selectedPrediction && (
              <div className="pt-4 border-t border-borderLight dark:border-borderDark space-y-3">
                <p className="text-[10px] text-slate-400 font-bold font-mono">Loop parameters</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Material</span>
                    <span className="font-semibold text-slate-700 dark:text-white">{selectedPrediction.material}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Category</span>
                    <span className="font-semibold text-slate-700 dark:text-white">{selectedPrediction.waste_category}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Classification description panel */}
          {circularityData && activeClassInfo && (
            <div className={`glass-card border rounded-3xl p-5 space-y-3 transition-all duration-500 ${activeClassInfo.bg}`}>
              <div className={`flex items-center space-x-2 font-bold text-xs ${activeClassInfo.color}`}>
                {activeClassInfo.icon}
                <span>{circularityData.classification}</span>
              </div>
              <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-300">
                {activeClassInfo.desc}
              </p>
            </div>
          )}
        </div>

        {/* Right Section - Radial and Radar Analytics */}
        <div className="lg:col-span-2 space-y-6">
          {circLoading ? (
            <div className="glass-card rounded-3xl p-16 text-center text-slate-500">
              <RefreshCw size={24} className="animate-spin text-primary-500 mx-auto mb-2" />
              <p className="text-xs">Computing loop indicators...</p>
            </div>
          ) : error ? (
            <div className="glass-card rounded-3xl p-6 flex items-center space-x-2 text-red-500 text-xs">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          ) : circularityData ? (
            <div className="space-y-6">
              
              {/* Dial + Radar Grid */}
              <div className="glass-card rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                    Circularity Dial & Performance Radar
                  </h3>
                </div>
                <CircularityGauge circularity={circularityData} />
              </div>

              {/* Loop Indexes Details */}
              <div className="glass-card rounded-3xl p-6 space-y-4">
                <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                  Loop Indicator Breakdown
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  
                  <div className="p-4 bg-slate-50 dark:bg-cardDark/50 rounded-2xl">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Reuse Potential</p>
                    <p className="text-lg font-black text-slate-800 dark:text-white mt-1">{circularityData.reuse_potential}%</p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-cardDark/50 rounded-2xl">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Recovery Eff.</p>
                    <p className="text-lg font-black text-slate-800 dark:text-white mt-1">{circularityData.recovery_efficiency}%</p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-cardDark/50 rounded-2xl">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Retention Rate</p>
                    <p className="text-lg font-black text-slate-800 dark:text-white mt-1">{circularityData.material_retention}%</p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-cardDark/50 rounded-2xl">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Longevity Score</p>
                    <p className="text-lg font-black text-slate-800 dark:text-white mt-1">{circularityData.lifecycle_extension}%</p>
                  </div>

                </div>
              </div>

            </div>
          ) : (
            <div className="glass-card rounded-3xl p-16 text-center text-slate-400">
              <Brain size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-700" />
              <p className="text-xs">Please select a textile batch to calculate circular economy metrics.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
