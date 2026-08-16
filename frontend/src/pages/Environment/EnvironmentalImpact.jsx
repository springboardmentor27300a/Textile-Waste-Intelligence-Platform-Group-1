import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Leaf, Activity, AlertCircle, RefreshCw, Layers, Brain,
  TrendingDown, Droplet, Zap, Trash2, Globe, TreePine
} from 'lucide-react';

import SustainabilityService from '../../services/sustainabilityService';
import AIService from '../../services/aiService';
import ImpactChart from '../../components/ImpactChart/ImpactChart';

export default function EnvironmentalImpact() {
  const [searchParams] = useSearchParams();
  const predictionIdParam = searchParams.get('prediction_id');

  const [predictions, setPredictions] = useState([]);
  const [selectedPredId, setSelectedPredId] = useState('');
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  
  const [weightKg, setWeightKg] = useState(100);
  const [impactData, setImpactData] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [impactLoading, setImpactLoading] = useState(false);
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

  // 2. Fetch environmental impact when selected ID or weight changes
  const loadImpact = async () => {
    if (!selectedPredId) return;
    setImpactLoading(true);
    setError('');
    try {
      // POST to assess impact
      const res = await SustainabilityService.assessEnvironment(selectedPredId, weightKg);
      setImpactData(res.data);
      
      // Fetch details of prediction
      const predRes = await AIService.getPrediction(selectedPredId);
      setSelectedPrediction(predRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to calculate environmental metrics for this configuration.');
    } finally {
      setImpactLoading(false);
    }
  };

  useEffect(() => {
    loadImpact();
  }, [selectedPredId]);

  const handleRecalculate = (e) => {
    e.preventDefault();
    loadImpact();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <Activity size={24} className="animate-spin text-primary-500 mb-2" />
        <span>Loading operational parameters...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <div className="flex items-center space-x-2.5 mb-1">
          <div className="p-2 bg-primary-800 dark:bg-emerald-950/40 text-primary-neon rounded-2xl shadow-neon">
            <Leaf size={18} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Environmental Impact Assessment</h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 ml-11">
          Quantify Greenhouse Gas offsets, water preservation liters, energy savings, and equivalent ecological units.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Control Panel */}
        <div className="space-y-4">
          <form onSubmit={handleRecalculate} className="glass-card rounded-3xl p-5 space-y-4">
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

            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 font-bold block">BATCH WEIGHT (KG)</label>
              <input
                type="number"
                min="1"
                max="50000"
                value={weightKg}
                onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-xl text-xs outline-none text-slate-700 dark:text-white focus:ring-2 focus:ring-primary-100"
              />
            </div>

            <button
              type="submit"
              disabled={impactLoading}
              className="w-full py-2.5 bg-gradient-to-r from-primary-700 to-primary-500 text-white rounded-xl text-xs font-bold hover:shadow-neon transition-all"
            >
              {impactLoading ? 'Calculating...' : 'Recalculate Impact'}
            </button>
          </form>

          {/* Quick Metrics Details */}
          {selectedPrediction && (
            <div className="glass-card rounded-3xl p-5 space-y-3">
              <p className="text-[10px] text-slate-400 font-bold">BATCH DETAIL</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Composition</span>
                  <span className="font-semibold text-slate-700 dark:text-white">{selectedPrediction.material}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Waste category</span>
                  <span className="font-semibold text-slate-700 dark:text-white">{selectedPrediction.waste_category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Recyclability rate</span>
                  <span className="font-bold text-green-500">{selectedPrediction.recyclability_score || 85}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Section - Charts & Infographics */}
        <div className="lg:col-span-2 space-y-6">
          {impactLoading ? (
            <div className="glass-card rounded-3xl p-16 text-center text-slate-500">
              <RefreshCw size={24} className="animate-spin text-primary-500 mx-auto mb-2" />
              <p className="text-xs">Computing environmental impact offsets...</p>
            </div>
          ) : error ? (
            <div className="glass-card rounded-3xl p-6 flex items-center space-x-2 text-red-500 text-xs">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          ) : impactData ? (
            <div className="space-y-6">
              
              {/* Savings Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                
                {/* Card 1 */}
                <div className="p-4 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-2xl flex items-center space-x-3.5">
                  <div className="p-2.5 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-xl">
                    <TrendingDown size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">CO₂ Saved</p>
                    <p className="text-sm font-black text-slate-800 dark:text-white">{impactData.co2_saved.toFixed(1)} kg</p>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="p-4 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-2xl flex items-center space-x-3.5">
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-950/20 text-blue-500 rounded-xl">
                    <Droplet size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Water Saved</p>
                    <p className="text-sm font-black text-slate-800 dark:text-white">{impactData.water_saved.toLocaleString()} L</p>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="p-4 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-2xl flex items-center space-x-3.5">
                  <div className="p-2.5 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-500 rounded-xl">
                    <Zap size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Energy Saved</p>
                    <p className="text-sm font-black text-slate-800 dark:text-white">{impactData.energy_saved.toFixed(1)} kWh</p>
                  </div>
                </div>

                {/* Card 4 */}
                <div className="p-4 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-2xl flex items-center space-x-3.5">
                  <div className="p-2.5 bg-green-50 dark:bg-green-950/20 text-green-500 rounded-xl">
                    <Trash2 size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Landfill Div.</p>
                    <p className="text-sm font-black text-slate-800 dark:text-white">{impactData.landfill_diversion.toFixed(0)} kg</p>
                  </div>
                </div>

                {/* Card 5 */}
                <div className="p-4 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-2xl flex items-center space-x-3.5 col-span-2 sm:col-span-1">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-xl">
                    <Globe size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Raw Conserved</p>
                    <p className="text-sm font-black text-slate-800 dark:text-white">{impactData.resource_conservation.toFixed(1)} kg</p>
                  </div>
                </div>

              </div>

              {/* Chart Comparison */}
              <div className="glass-card rounded-3xl p-6">
                <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-5">
                  Environmental Savings Comparison
                </h3>
                <ImpactChart 
                  co2Saved={impactData.co2_saved} 
                  waterSaved={impactData.water_saved} 
                  energySaved={impactData.energy_saved} 
                />
              </div>

              {/* Ecological Equivalents (Infographic) */}
              <div className="glass-card rounded-3xl p-6">
                <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-5">
                  Ecological Equivalencies
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Equivalent 1 */}
                  <div className="flex items-start space-x-3.5">
                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                      <TreePine size={22} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                        {impactData.equivalent_trees.toFixed(1)} Trees Saved
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Equivalent to carbon absorbed annually by mature trees.
                      </p>
                    </div>
                  </div>

                  {/* Equivalent 2 */}
                  <div className="flex items-start space-x-3.5">
                    <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-2xl">
                      <Zap size={22} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                        {impactData.equivalent_electricity.toFixed(1)} Household Days
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Equivalent to a standard household's complete electricity usage in days.
                      </p>
                    </div>
                  </div>

                  {/* Equivalent 3 */}
                  <div className="flex items-start space-x-3.5">
                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                      <Droplet size={22} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                        {impactData.equivalent_water_bottles.toLocaleString()} Water Bottles
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Equivalent to saving 500ml single-use water bottles.
                      </p>
                    </div>
                  </div>

                  {/* Equivalent 4 */}
                  <div className="flex items-start space-x-3.5">
                    <div className="p-3 bg-primary-500/10 text-primary-neon rounded-2xl">
                      <Globe size={22} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                        {impactData.equivalent_household_energy.toLocaleString()} LED Bulb Hours
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Equivalent to running a standard 10W energy-saving bulb.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          ) : (
            <div className="glass-card rounded-3xl p-16 text-center text-slate-400">
              <Brain size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-700" />
              <p className="text-xs">Please select a textile batch to calculate ecological indicators.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
