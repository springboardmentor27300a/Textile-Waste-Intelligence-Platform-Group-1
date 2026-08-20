import React, { useEffect, useState } from 'react';
import { Leaf, Award, Globe, Shield, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { wasteService } from '../services/wasteService';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const SustainabilityAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    wasteService
      .stats()
      .then((res) => {
        setStats(res.data);
      })
      .catch(() => {
        toast.error('Could not load sustainability metrics');
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingSpinner label="Compiling circular metrics…" />;

  const totalQty = stats?.totalQuantity || 0;
  const co2Saved = Math.round(totalQty * 2.5 * 10) / 10;
  const waterSaved = Math.round(totalQty * 15 * 10) / 10;
  const landfillSaved = Math.round(totalQty * 0.003 * 100) / 100;
  const score = stats?.sustainabilityScore || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Sustainability Analytics</h1>
        <p className="text-sm text-ink/60">Estimated environmental footprint avoidance based on circular recovery.</p>
      </div>

      {totalQty === 0 ? (
        <div className="card text-center py-16 text-ink/40">
          <Leaf className="h-10 w-10 mx-auto text-ink/20 mb-3 animate-spin" />
          <p className="text-sm font-semibold">Not enough data to run analytics</p>
          <p className="text-xs">Once manufacturers register textile waste, carbon offsets will be calculated here.</p>
        </div>
      ) : (
        <>
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card flex flex-col justify-between border-l-4 border-l-forest-500">
              <div>
                <p className="text-2xs font-bold text-ink/40 uppercase tracking-wider">CO2 Avoided</p>
                <p className="text-2xl font-bold text-forest-700 mt-1">{co2Saved.toLocaleString()} kg</p>
              </div>
              <p className="text-3xs text-ink/50 mt-4 flex items-center gap-1">
                <Globe size={11} /> Equivalent carbon offset
              </p>
            </div>
            <div className="card flex flex-col justify-between border-l-4 border-l-ledger-500">
              <div>
                <p className="text-2xs font-bold text-ink/40 uppercase tracking-wider">Water Conserved</p>
                <p className="text-2xl font-bold text-ledger-700 mt-1">{waterSaved.toLocaleString()} L</p>
              </div>
              <p className="text-3xs text-ink/50 mt-4 flex items-center gap-1">
                <Sparkles size={11} /> Fresh water consumption avoided
              </p>
            </div>
            <div className="card flex flex-col justify-between border-l-4 border-l-amber-500">
              <div>
                <p className="text-2xs font-bold text-ink/40 uppercase tracking-wider">Landfill Diverted</p>
                <p className="text-2xl font-bold text-amber-700 mt-1">{landfillSaved.toLocaleString()} m³</p>
              </div>
              <p className="text-3xs text-ink/50 mt-4 flex items-center gap-1">
                <Shield size={11} /> Land space saved from dumping
              </p>
            </div>
            <div className="card flex flex-col justify-between border-l-4 border-l-purple-500">
              <div>
                <p className="text-2xs font-bold text-ink/40 uppercase tracking-wider">Recovery Grade</p>
                <p className="text-2xl font-bold text-purple-700 mt-1">{score}%</p>
              </div>
              <p className="text-3xs text-ink/50 mt-4 flex items-center gap-1">
                <Award size={11} /> System efficiency score
              </p>
            </div>
          </div>

          {/* Description panels */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="card space-y-4">
              <h3 className="font-display font-bold text-ink text-base">Carbon Footprint Avoidance Formula</h3>
              <p className="text-xs text-ink/70 leading-relaxed">
                By recycling offcuts directly back into supply streams, we bypass the heavy agriculture and processing
                associated with raw material generation. Every kilogram of recovered fabric prevents approximately
                <b> 2.5 kg of CO2</b> emissions from being released into the atmosphere.
              </p>
              <div className="bg-forest-50 p-4 rounded-xl text-xs text-forest-800 font-mono">
                CO2 saved = {totalQty} kg * 2.5 = {co2Saved} kg
              </div>
            </div>

            <div className="card space-y-4">
              <h3 className="font-display font-bold text-ink text-base">Water Avoidance Formula</h3>
              <p className="text-xs text-ink/70 leading-relaxed">
                Raw cotton and crop processing is water-intensive. Mechanical carding and reprocessing of cutting scraps
                reclaims fibers directly without requiring cultivation cycles. Each kilogram of fabric reentered
                conserves approximately <b>15 liters of water</b>.
              </p>
              <div className="bg-ledger-50 p-4 rounded-xl text-xs text-ledger-800 font-mono">
                Water saved = {totalQty} kg * 15 = {waterSaved} L
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SustainabilityAnalytics;
