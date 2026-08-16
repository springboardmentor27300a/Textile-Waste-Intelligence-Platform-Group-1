import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Wrench, Activity, AlertCircle, RefreshCw, Layers, Brain, 
  HelpCircle, ChevronRight, CheckCircle2 
} from 'lucide-react';

import SustainabilityService from '../../services/sustainabilityService';
import AIService from '../../services/aiService';
import RecommendationCard from '../../components/RecommendationCard/RecommendationCard';

export default function RecyclingRecommendations() {
  const [searchParams] = useSearchParams();
  const predictionIdParam = searchParams.get('prediction_id');

  const [predictions, setPredictions] = useState([]);
  const [selectedPredId, setSelectedPredId] = useState('');
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [recsLoading, setRecsLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Fetch prediction list to populate selector
  useEffect(() => {
    const fetchPredictions = async () => {
      setLoading(true);
      try {
        const res = await AIService.getPredictions({ per_page: 20 });
        setPredictions(res.data.items || []);
        
        // Auto-select prediction ID from URL param, or fallback to first one in the list
        if (predictionIdParam) {
          setSelectedPredId(predictionIdParam);
        } else if (res.data.items?.length > 0) {
          setSelectedPredId(res.data.items[0].id);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch textile predictions.');
      } finally {
        setLoading(false);
      }
    };
    fetchPredictions();
  }, [predictionIdParam]);

  // 2. Fetch recommendations and detail when selected ID changes
  useEffect(() => {
    if (!selectedPredId) return;

    const loadRecommendations = async () => {
      setRecsLoading(true);
      setError('');
      try {
        // Fetch recommendations
        const recsRes = await SustainabilityService.getRecommendations(selectedPredId);
        let recsList = recsRes.data || [];
        
        if (recsList.length === 0) {
          console.log(`No stored recommendations found for prediction ${selectedPredId}. Triggering dynamic analysis...`);
          const runRes = await SustainabilityService.analyze(selectedPredId);
          recsList = runRes.data.recommendations || [];
        }
        
        setRecommendations(recsList);
        
        // Fetch prediction details to show material and waste category
        const predRes = await AIService.getPrediction(selectedPredId);
        setSelectedPrediction(predRes.data);
      } catch (err) {
        console.error('Error fetching recommendations, trying fallback analyze...', err);
        try {
          const runRes = await SustainabilityService.analyze(selectedPredId);
          setRecommendations(runRes.data.recommendations || []);
          const predRes = await AIService.getPrediction(selectedPredId);
          setSelectedPrediction(predRes.data);
        } catch (innerErr) {
          console.error(innerErr);
          setError('Failed to load recovery strategies for this batch.');
        }
      } finally {
        setRecsLoading(false);
      }
    };

    loadRecommendations();
  }, [selectedPredId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <Activity size={24} className="animate-spin text-primary-500 mb-2" />
        <span>Loading prediction logs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <div className="flex items-center space-x-2.5 mb-1">
          <div className="p-2 bg-primary-800 dark:bg-emerald-950/40 text-primary-neon rounded-2xl shadow-neon">
            <Wrench size={18} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Recycling Recommendations</h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 ml-11">
          Assess material composition, waste stream, and condition to view circular recovery procedures.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Prediction Picker */}
        <div className="space-y-4">
          <div className="glass-card rounded-3xl p-5 space-y-4">
            <div className="flex items-center space-x-2 text-slate-800 dark:text-white font-bold text-xs uppercase tracking-wider">
              <Layers size={14} className="text-primary-500" />
              <span>Select Textile Batch</span>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 font-bold block">ACTIVE ANALYSIS</label>
              {predictions.length > 0 ? (
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
              ) : (
                <div className="text-xs text-slate-400 py-3">
                  No textile predictions found. Go to <Link to="/analysis" className="text-primary-600 underline">AI Analysis</Link> to upload an image.
                </div>
              )}
            </div>

            {selectedPrediction && (
              <div className="pt-4 border-t border-borderLight dark:border-borderDark space-y-3">
                <p className="text-[10px] text-slate-400 font-bold">ANALYZED PARAMETERS</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Material Composition</span>
                    <span className="font-bold text-slate-700 dark:text-white">{selectedPrediction.material}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Waste Category</span>
                    <span className="font-bold text-slate-700 dark:text-white">{selectedPrediction.waste_category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recyclability Score</span>
                    <span className="font-bold text-green-500">{selectedPrediction.confidence || selectedPrediction.recyclability_score || 85}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recovery Difficulty</span>
                    <span className="font-bold text-blue-500">{selectedPrediction.recovery_difficulty || 'Easy'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Help Card */}
          <div className="glass-card rounded-3xl p-5 space-y-2.5">
            <p className="text-xs font-bold text-slate-700 dark:text-white flex items-center space-x-1.5">
              <HelpCircle size={13} className="text-primary-500" />
              <span>Recovery Guidelines</span>
            </p>
            <ul className="space-y-2 text-[10px] leading-relaxed text-slate-400">
              <li className="flex items-start space-x-2">
                <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Priority levels dictate which processing path preserves the highest economic and chemical value.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Mechanical recycling is preferred for natural fibres, while chemical recycling is ideal for synthetic polymers.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Section - Recommendations List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-5">
              Recommended Recovery Strategies
            </h3>

            {recsLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500 space-y-2">
                <RefreshCw size={20} className="animate-spin text-primary-500" />
                <span className="text-xs">Generating recovery pathways...</span>
              </div>
            ) : error ? (
              <div className="flex items-center space-x-2 text-red-500 text-xs py-4">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <RecommendationCard 
                    key={rec.id || index} 
                    recommendation={rec} 
                    index={index} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-xs text-slate-400 space-y-3">
                <Brain size={28} className="mx-auto text-slate-300 dark:text-slate-700" />
                <p>No recovery recommendations are currently available for this textile.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
