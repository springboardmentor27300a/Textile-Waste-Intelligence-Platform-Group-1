import React, { useState } from 'react';
import { Leaf, RefreshCw, Calculator, Globe, Droplet, Scale, Award, FileText, CheckCircle2 } from 'lucide-react';

const SustainabilityCalculatorPage = () => {
  // Input Form States
  const [fabricType, setFabricType] = useState('Cotton');
  const [quantity, setQuantity] = useState('100');
  const [strategy, setStrategy] = useState('Mechanical Recycling');
  const [condition, setCondition] = useState('Clean');
  const [hasContaminants, setHasContaminants] = useState(false);

  // Result States
  const [results, setResults] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // LCA Factors matching app.services.sustainability
  const fabricFactors = {
    cotton: { co2: 8.5, water: 2500, value: 2.20 },
    polyester: { co2: 12.0, water: 350, value: 1.50 },
    wool: { co2: 16.5, water: 1800, value: 6.80 },
    nylon: { co2: 15.0, water: 450, value: 2.10 },
    silk: { co2: 22.0, water: 3200, value: 25.00 },
    linen: { co2: 6.0, water: 800, value: 4.50 },
    acrylic: { co2: 13.5, water: 400, value: 1.80 },
    denim: { co2: 9.5, water: 2200, value: 3.00 },
    blend: { co2: 10.5, water: 1400, value: 2.00 }
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    setCalculating(true);
    setSuccessMsg('');

    setTimeout(() => {
      const qty = parseFloat(quantity) || 0;
      const fabKey = fabricType.toLowerCase();
      const factors = fabricFactors[fabKey] || fabricFactors.blend;

      // 1. Reprocessing Strategy Multipliers
      let mult = 0.20; // default mechanical (80% savings)
      let efficiency = 0.85;

      if (strategy.includes('Donation') || strategy.includes('Reuse') || strategy.includes('Upcycling')) {
        mult = 0.05; // 95% savings
      } else if (strategy.includes('Chemical')) {
        mult = 0.40; // 60% savings
      } else if (strategy.includes('Disposal') || strategy.includes('Landfill')) {
        mult = 1.00; // 0% savings
        efficiency = 0.00;
      }

      // 2. Calculations
      const co2Saved = (factors.co2 - (factors.co2 * mult)) * qty * efficiency;
      const waterSaved = (factors.water - (factors.water * mult)) * qty * efficiency;
      const valueSaved = factors.value * qty * efficiency;
      const landfillDiverted = strategy.includes('Disposal') ? 0 : qty;

      // 3. Circularity Score Weighted Model
      let recyclability = 70; // baseline
      if (fabKey === 'cotton') recyclability = 85;
      else if (fabKey === 'wool') recyclability = 80;
      else if (fabKey === 'polyester') recyclability = 75;

      if (hasContaminants) {
        recyclability = Math.max(0, recyclability - 25);
      }

      const condLower = condition.toLowerCase();
      let conditionScore = 50;
      if (condLower === 'clean' || condLower === 'recyclable') {
        conditionScore = 90;
      } else if (condLower === 'damaged') {
        conditionScore = 60;
      } else if (condLower === 'wet') {
        conditionScore = 40;
      } else if (condLower === 'contaminated') {
        conditionScore = 20;
      }

      let reusePotential = 40;
      if (hasContaminants) {
        reusePotential = 20;
      } else if (condLower === 'clean') {
        reusePotential = 85;
      } else if (condLower === 'damaged') {
        reusePotential = 50;
      }

      let envBenefit = 70;
      if (hasContaminants) {
        envBenefit = 30;
      } else if (condLower === 'clean') {
        envBenefit = 95;
      }

      let processFeasibility = 60;
      if (hasContaminants) {
        processFeasibility = 30;
      } else if (condLower === 'clean') {
        processFeasibility = 90;
      }

      const circularityScore = Math.round(
        0.35 * recyclability +
        0.20 * conditionScore +
        0.20 * reusePotential +
        0.15 * envBenefit +
        0.10 * processFeasibility
      );

      const score = Math.min(100, Math.max(0, circularityScore));

      // Map score to qualitative category
      let category = 'Disposal Recommended';
      if (score >= 85) category = 'Excellent Recovery Potential';
      else if (score >= 70) category = 'High Recovery Potential';
      else if (score >= 55) category = 'Moderate Recovery Potential';
      else if (score >= 35) category = 'Limited Recovery Potential';

      setResults({
        co2: Math.round(co2Saved * 100) / 100,
        water: Math.round(waterSaved * 100) / 100,
        value: Math.round(valueSaved * 100) / 100,
        landfill: Math.round(landfillDiverted * 100) / 100,
        circularity: score,
        category: category,
        metrics: {
          recyclability,
          condition: conditionScore,
          reuse: reusePotential,
          benefit: envBenefit,
          feasibility: processFeasibility
        }
      });
      setCalculating(false);
      setSuccessMsg('Simulation calculations completed successfully!');
    }, 800);
  };

  const handlePrintSimulationReport = () => {
    if (!results) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Sustainability_Simulator_Report</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              color: #1e293b;
              padding: 20mm;
            }
            .header {
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 15px;
              margin-bottom: 25px;
            }
            .header-title {
              font-size: 24px;
              font-weight: 800;
              color: #0f172a;
            }
            .grid {
              display: grid;
              grid-template-cols: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            .card {
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 15px;
              background-color: #f8fafc;
            }
            .title {
              font-size: 11px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              margin-bottom: 6px;
            }
            .val {
              font-size: 15px;
              font-weight: bold;
              color: #0f172a;
            }
            .section-title {
              font-size: 14px;
              font-weight: 800;
              text-transform: uppercase;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 6px;
              margin-bottom: 15px;
              margin-top: 25px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-title">Sustainability Simulation Report</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Textile Waste Intelligence Platform (TWIP) Utility</div>
          </div>
          
          <div class="section-title">Input Parameters</div>
          <div class="grid">
            <div class="card">
              <div class="title">Fabric / Weight</div>
              <div class="val">${fabricType} (${quantity} kg)</div>
            </div>
            <div class="card">
              <div class="title">Strategy / Condition</div>
              <div class="val">${strategy} (${condition})</div>
            </div>
          </div>

          <div class="section-title">Simulated Environmental Impact</div>
          <div class="grid">
            <div class="card" style="border-left: 4px solid #10b981;">
              <div class="title">CO₂ Averted</div>
              <div class="val">+${results.co2.toLocaleString()} kg CO₂</div>
            </div>
            <div class="card" style="border-left: 4px solid #3b82f6;">
              <div class="title">Water Conserved</div>
              <div class="val">+${results.water.toLocaleString()} L</div>
            </div>
            <div class="card" style="border-left: 4px solid #f59e0b;">
              <div class="title">Material Value Preserved</div>
              <div class="val">$${results.value.toLocaleString()}</div>
            </div>
            <div class="card" style="border-left: 4px solid #6366f1;">
              <div class="title">Landfill Diverted</div>
              <div class="val">${results.landfill.toLocaleString()} kg</div>
            </div>
          </div>

          <div class="section-title">Circular Index Breakdown</div>
          <div class="card" style="margin-bottom: 30px;">
            <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 10px;">
              <span>Circularity Score:</span>
              <span>${results.circularity}/100</span>
            </div>
            <div style="font-size: 13px; color: #475569;">
              Category: <strong>${results.category}</strong>
            </div>
          </div>

          <div style="font-size: 10px; color: #94a3b8; margin-top: 50px;">
            Report compiled automatically using standard platform Life Cycle Assessment coefficients.
          </div>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'text-teal-600 bg-teal-50 border-teal-200';
    if (score >= 55) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div className="space-y-6 font-sans text-left">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center space-x-2">
          <Calculator className="h-8 w-8 text-primary-600" />
          <span>Sustainability Simulator</span>
        </h1>
        <p className="text-sm text-slate-400 font-semibold mt-1">
          Simulate environmental impacts and circularity indexes for fabrics and recovery scenarios outside the inventory.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Input Form Panel */}
        <form onSubmit={handleCalculate} className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="text-base font-extrabold text-slate-800">Scenarios parameters</h3>

          {/* Fabric Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Fabric Type</label>
            <select
              value={fabricType}
              onChange={(e) => setFabricType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-white cursor-pointer focus:outline-none"
            >
              <option value="Cotton">Cotton</option>
              <option value="Polyester">Polyester</option>
              <option value="Wool">Wool</option>
              <option value="Nylon">Nylon</option>
              <option value="Silk">Silk</option>
              <option value="Linen">Linen</option>
              <option value="Acrylic">Acrylic</option>
              <option value="Denim">Denim</option>
              <option value="Blend">Blend</option>
            </select>
          </div>

          {/* Weight */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Quantity (kg)</label>
            <input
              type="number"
              required
              min="0.1"
              step="0.1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 250"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>

          {/* Strategy */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Reprocessing Strategy</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-white cursor-pointer focus:outline-none"
            >
              <option value="Upcycling & Fabric Reuse">Upcycling & Fabric Reuse</option>
              <option value="Mechanical Recycling">Mechanical Recycling</option>
              <option value="Chemical Depolymerization">Chemical Depolymerization</option>
              <option value="Direct Donation">Direct Donation</option>
              <option value="Landfill Disposal">Landfill Disposal</option>
            </select>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-white cursor-pointer focus:outline-none"
            >
              <option value="Clean">Clean</option>
              <option value="Damaged">Damaged</option>
              <option value="Wet">Wet</option>
              <option value="Contaminated">Contaminated</option>
            </select>
          </div>

          {/* Contaminants flag */}
          <div className="flex items-center space-x-2.5 pt-2">
            <input
              type="checkbox"
              id="contaminants-flag"
              checked={hasContaminants}
              onChange={(e) => setHasContaminants(e.target.checked)}
              className="h-5 w-5 accent-primary-600 rounded cursor-pointer"
            />
            <label htmlFor="contaminants-flag" className="text-xs font-bold text-slate-600 select-none cursor-pointer">
              Contains Heavy Contaminants
            </label>
          </div>

          {/* Action Trigger */}
          <button
            type="submit"
            disabled={calculating}
            className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow-md shadow-primary-200 transition-all flex items-center justify-center space-x-2"
          >
            {calculating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Calculator className="h-4.5 w-4.5" />
                <span>Calculate Simulator Impact</span>
              </>
            )}
          </button>
        </form>

        {/* Right: Results Panel */}
        <div className="lg:col-span-7 space-y-6">
          {results ? (
            <div className="space-y-6 animate-fade-in">
              
              {/* Circularity Score Summary */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex items-center space-x-6">
                <div className={`h-16 w-16 rounded-full border-2 flex items-center justify-center font-mono font-black text-lg ${getScoreColor(results.circularity)}`}>
                  {results.circularity}
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Circularity Score Index</span>
                  <h4 className="text-sm font-extrabold text-slate-800">{results.category}</h4>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                    Composite circular metrics score computed across recyclability profiles and processing feasibility factors.
                  </p>
                </div>
              </div>

              {/* Environmental Savings Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* CO2 Saved */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-5 flex items-center space-x-4 shadow-sm">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CO₂ Averted</span>
                    <span className="text-base font-extrabold text-slate-800">+{results.co2.toLocaleString()} kg CO₂</span>
                  </div>
                </div>

                {/* Water Conserved */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-5 flex items-center space-x-4 shadow-sm">
                  <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Droplet className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Water Conserved</span>
                    <span className="text-base font-extrabold text-slate-800">+{results.water.toLocaleString()} L</span>
                  </div>
                </div>

                {/* Landfill Diverted */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-5 flex items-center space-x-4 shadow-sm">
                  <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Landfill Diverted</span>
                    <span className="text-base font-extrabold text-slate-800">{results.landfill.toLocaleString()} kg</span>
                  </div>
                </div>

                {/* Economic Value Preserved */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-5 flex items-center space-x-4 shadow-sm">
                  <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Scale className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Value Preserved</span>
                    <span className="text-base font-extrabold text-slate-800">${results.value.toLocaleString()}</span>
                  </div>
                </div>

              </div>

              {/* Metric Breakdown Table */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detailed circular components</h4>
                <div className="space-y-3 font-semibold text-slate-700 text-xs">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400">Recyclability Rating:</span>
                    <span>{results.metrics.recyclability}/100</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400">Physical Condition Grade:</span>
                    <span>{results.metrics.condition}/100</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400">Reuse Potential Score:</span>
                    <span>{results.metrics.reuse}/100</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400">Environmental Benefit Index:</span>
                    <span>{results.metrics.benefit}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Processing Feasibility Index:</span>
                    <span>{results.metrics.feasibility}/100</span>
                  </div>
                </div>
              </div>

              {/* Export Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handlePrintSimulationReport}
                  className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center space-x-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Download Simulator PDF Report</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center shadow-sm h-full flex flex-col justify-center items-center">
              <Calculator className="h-10 w-10 text-slate-300 mb-3" />
              <h4 className="text-sm font-extrabold text-slate-700">Awaiting Simulator Calculations</h4>
              <p className="text-xs text-slate-400 font-semibold max-w-sm mt-1">
                Enter your fabric specifications, quantity weights, and recovery strategy parameters, then run the calculator simulation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SustainabilityCalculatorPage;
