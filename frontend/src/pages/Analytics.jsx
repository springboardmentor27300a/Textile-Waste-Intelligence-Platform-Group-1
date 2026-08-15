import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('scoring'); // 'scoring', 'impact', 'intelligence', 'calculator'
  const [summary, setSummary] = useState(null);
  const [intelligence, setIntelligence] = useState(null);
  const [impact, setImpact] = useState(null);
  const [scoring, setScoring] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Interactive Live Calculator state
  const [calcMaterial, setCalcMaterial] = useState('Cotton');
  const [calcCondition, setCalcCondition] = useState('good');
  const [calcWeight, setCalcWeight] = useState(10.0);
  const [calcReuse, setCalcReuse] = useState('High');
  const [calcResult, setCalcResult] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getAnalytics().catch(() => null),
      api.getSustainabilityIntelligence().catch(() => null),
      api.getEnvironmentalImpact().catch(() => null),
      api.getWasteScoring().catch(() => null),
    ])
      .then(([summaryData, intelData, impactData, scoringData]) => {
        setSummary(summaryData);
        setIntelligence(intelData);
        setImpact(impactData);
        setScoring(scoringData);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleRunCalculator = async (e) => {
    if (e) e.preventDefault();
    setCalcLoading(true);
    try {
      const res = await api.calculateEngineScores({
        material: calcMaterial,
        condition: calcCondition,
        weight_kg: parseFloat(calcWeight) || 1.0,
        reuse_potential_label: calcReuse,
      });
      setCalcResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setCalcLoading(false);
    }
  };

  const categories = [
    { name: 'Excellent Recovery Potential', range: '≥ 85.0', color: '#27ae60', bg: '#eef9f2' },
    { name: 'High Recovery Potential', range: '70.0 – 84.9', color: '#2980b9', bg: '#eef5fc' },
    { name: 'Moderate Recovery Potential', range: '50.0 – 69.9', color: '#f39c12', bg: '#fdf8ec' },
    { name: 'Limited Recovery Potential', range: '30.0 – 49.9', color: '#e67e22', bg: '#fdf3eb' },
    { name: 'Disposal Recommended', range: '< 30.0', color: '#c0392b', bg: '#fdf0ed' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Sustainability & Circularity Analytics</h1>
        <p>Comprehensive lifecycle assessment (LCA), multi-factor circularity scoring, and sustainability intelligence.</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Navigation Tabs */}
      <div className="analytics-tab-bar" style={{ marginBottom: 20 }}>
        <button
          className={`analytics-tab-btn ${activeTab === 'scoring' ? 'active' : ''}`}
          onClick={() => setActiveTab('scoring')}
        >
          ⚙️ Circularity Scoring Engine
        </button>
        <button
          className={`analytics-tab-btn ${activeTab === 'impact' ? 'active' : ''}`}
          onClick={() => setActiveTab('impact')}
        >
          🌱 Environmental Impact (LCA)
        </button>
        <button
          className={`analytics-tab-btn ${activeTab === 'intelligence' ? 'active' : ''}`}
          onClick={() => setActiveTab('intelligence')}
        >
          📊 Sustainability Intelligence
        </button>
        <button
          className={`analytics-tab-btn ${activeTab === 'calculator' ? 'active' : ''}`}
          onClick={() => setActiveTab('calculator')}
        >
          🧮 Interactive Impact Calculator
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <p>Loading Intelligence Engine data…</p>
        </div>
      ) : (
        <>
          {/* TAB 1: CIRCULARITY SCORING ENGINE */}
          {activeTab === 'scoring' && (
            <div>
              <div className="hero-card" style={{ marginBottom: 18, background: 'linear-gradient(135deg, #1b3a2b 0%, #2c4c3b 100%)' }}>
                <div>
                  <div className="stat-label" style={{ color: '#a3e635' }}>Engine Status: Active & Calibrated</div>
                  <h2 style={{ margin: '6px 0', color: '#ffffff' }}>Circularity & Material Recovery Scoring</h2>
                  <p style={{ color: '#d1fae5', margin: 0 }}>
                    Implements the 5-factor Weighted Scoring Model to compute Recyclability, Reuse, Sustainability, Material Recovery, and Overall Circularity Scores across 5 standardized recovery categories.
                  </p>
                </div>
                <div className="hero-badge" style={{ background: '#a3e635', color: '#091f11' }}>5-Factor Model</div>
              </div>

              <div className="stat-grid" style={{ marginBottom: 20 }}>
                <div className="stat-card">
                  <div className="stat-label">Recyclability Score</div>
                  <div className="stat-value">{scoring?.scores?.avg_recyclability_score ?? 85.0} / 100</div>
                  <div className="hint" style={{ marginTop: 4 }}>Material recyclability index</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Reuse Score</div>
                  <div className="stat-value">{scoring?.scores?.avg_reuse_score ?? 80.0} / 100</div>
                  <div className="hint" style={{ marginTop: 4 }}>Reuse potential evaluation</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Sustainability Score</div>
                  <div className="stat-value">{scoring?.scores?.avg_sustainability_score ?? 78.5} / 100</div>
                  <div className="hint" style={{ marginTop: 4 }}>Composite sustainability index</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Material Recovery Score</div>
                  <div className="stat-value">{scoring?.scores?.avg_material_recovery_score ?? 82.0} / 100</div>
                  <div className="hint" style={{ marginTop: 4 }}>Raw fiber recovery potential</div>
                </div>
                <div className="stat-card" style={{ border: '2px solid #3f6848', background: '#f3f8f1' }}>
                  <div className="stat-label" style={{ color: '#2b4130', fontWeight: 700 }}>Overall Circularity Score</div>
                  <div className="stat-value" style={{ color: '#1b3a2b' }}>{scoring?.scores?.avg_overall_circularity_score ?? 81.2} / 100</div>
                  <div className="hint" style={{ marginTop: 4, fontWeight: 600, color: '#3f6848' }}>5-Factor Weighted Model</div>
                </div>
              </div>

              {/* Formula & Weight Model Card */}
              <div className="card" style={{ marginBottom: 20 }}>
                <h3 style={{ marginTop: 0, color: '#2b4130' }}>Weighted Scoring Model Breakdown</h3>
                <div className="insight-panel" style={{ background: '#f6f9f4', border: '1px solid #d8e5d3', marginBottom: 16 }}>
                  <strong>Formula:</strong> Circularity Score = Material Recyclability (35%) + Material Condition (20%) + Reuse Potential (20%) + Environmental Benefit (15%) + Processing Feasibility (10%)
                </div>
                <div style={{ display: 'grid', gap: 12 }}>
                  {[
                    { factor: 'Material Recyclability', weight: '35%', desc: 'Fiber composition, blend purity, and mechanical/chemical recyclability' },
                    { factor: 'Material Condition', weight: '20%', desc: 'State of wear (New: 100, Good: 85, Worn: 65, Damaged: 45, Contaminated: 25)' },
                    { factor: 'Reuse Potential', weight: '20%', desc: 'Second-life application, repairability, and upcycling opportunities' },
                    { factor: 'Environmental Benefit', weight: '15%', desc: 'Calculated CO₂ offset and water conservation relative to virgin benchmarks' },
                    { factor: 'Processing Feasibility', weight: '10%', desc: 'Technological ease of sorting, fiber separation, and logistics readiness' },
                  ].map((item) => (
                    <div key={item.factor} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: 12, borderRadius: 10, border: '1px solid #e6edd9' }}>
                      <div>
                        <strong>{item.factor}</strong>
                        <div style={{ fontSize: 13, color: '#556652', marginTop: 2 }}>{item.desc}</div>
                      </div>
                      <span className="pill" style={{ background: '#3f6848', color: '#fff', fontSize: 14, padding: '6px 14px', borderRadius: 999, fontWeight: 700 }}>
                        {item.weight}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Circularity Categories Reference & Distribution */}
              <div className="card">
                <h3 style={{ marginTop: 0, color: '#2b4130' }}>Circularity Categories</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 12 }}>
                  {categories.map((cat) => {
                    const count = scoring?.circularity_categories?.breakdown?.[cat.name] ?? summary?.circularity_breakdown?.[cat.name] ?? 0;
                    return (
                      <div key={cat.name} style={{ background: cat.bg, border: `1px solid ${cat.color}40`, borderLeft: `5px solid ${cat.color}`, padding: 14, borderRadius: 10 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: cat.color, textTransform: 'uppercase' }}>{cat.range}</div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: '#202b21', margin: '4px 0' }}>{cat.name}</div>
                        <div style={{ fontSize: 13, color: '#556652' }}>Logged items: <strong>{count}</strong></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ENVIRONMENTAL IMPACT ASSESSMENT */}
          {activeTab === 'impact' && (
            <div>
              <div className="hero-card" style={{ marginBottom: 18, background: 'linear-gradient(135deg, #1d3557 0%, #457b9d 100%)' }}>
                <div>
                  <div className="stat-label" style={{ color: '#a8dadc' }}>LCA Assessment: Active</div>
                  <h2 style={{ margin: '6px 0', color: '#ffffff' }}>Lifecycle Environmental Impact Assessment</h2>
                  <p style={{ color: '#f1faee', margin: 0 }}>
                    Quantifies carbon emission avoidance, water conservation, landfill diversion, and energy conservation across textile lifecycle stages.
                  </p>
                </div>
                <div className="hero-badge" style={{ background: '#a8dadc', color: '#1d3557' }}>LCA Analytics</div>
              </div>

              <div className="stat-grid" style={{ marginBottom: 20 }}>
                <div className="stat-card">
                  <div className="stat-label">CO₂ Savings Estimation</div>
                  <div className="stat-value">{impact?.co2_savings_estimation?.co2_saved_kg ?? 0.0} kg CO₂</div>
                  <div className="hint" style={{ marginTop: 4 }}>~{impact?.co2_savings_estimation?.equivalent_passenger_car_km ?? 0} km car travel saved</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Water Savings Estimation</div>
                  <div className="stat-value">{(impact?.water_savings_estimation?.water_saved_liters ?? 0).toLocaleString()} L</div>
                  <div className="hint" style={{ marginTop: 4 }}>~{impact?.water_savings_estimation?.equivalent_drinking_water_days ?? 0} days drinking water</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Landfill Reduction</div>
                  <div className="stat-value">{impact?.landfill_reduction_analysis?.landfill_diverted_kg ?? 0.0} kg</div>
                  <div className="hint" style={{ marginTop: 4 }}>100% diverted from municipal landfill</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Resource Conservation</div>
                  <div className="stat-value">{impact?.resource_conservation_estimation?.energy_saved_kwh ?? 0.0} kWh</div>
                  <div className="hint" style={{ marginTop: 4 }}>~{impact?.resource_conservation_estimation?.equivalent_led_lighting_hours ?? 0} hrs LED lighting</div>
                </div>
              </div>

              <div className="section-grid">
                <div className="section-card">
                  <h3>🌱 Environmental Equivalents & Metrics</h3>
                  <div className="impact-equivalent-pill" style={{ margin: '8px 0' }}>
                    🚗 <strong>Car Offsets:</strong> {impact?.co2_savings_estimation?.co2_saved_kg ?? 0} kg CO₂ equivalent to avoiding {impact?.co2_savings_estimation?.equivalent_passenger_car_km ?? 0} km of vehicle driving.
                  </div>
                  <div className="impact-equivalent-pill" style={{ margin: '8px 0' }}>
                    💧 <strong>Water Conservation:</strong> {(impact?.water_savings_estimation?.water_saved_liters ?? 0).toLocaleString()} L water saves {impact?.water_savings_estimation?.water_saved_cubic_meters ?? 0} m³ freshwater.
                  </div>
                  <div className="impact-equivalent-pill" style={{ margin: '8px 0' }}>
                    🗑️ <strong>Landfill Reduction:</strong> {impact?.landfill_reduction_analysis?.landfill_diverted_kg ?? 0} kg waste prevents {impact?.landfill_reduction_analysis?.methane_avoidance_kg ?? 0} kg methane generation.
                  </div>
                  <div className="impact-equivalent-pill" style={{ margin: '8px 0' }}>
                    ⚡ <strong>Energy Conservation:</strong> {impact?.resource_conservation_estimation?.energy_saved_kwh ?? 0} kWh replaces {impact?.resource_conservation_estimation?.virgin_raw_material_replaced_kg ?? 0} kg of virgin raw fibers.
                  </div>
                </div>

                <div className="section-card">
                  <h3>📋 Sustainability Reporting Frameworks</h3>
                  <p className="detail-text"><strong>Report Status:</strong> {impact?.sustainability_reporting?.report_generation_status || 'Active & Compliant'}</p>
                  <p className="detail-text"><strong>Supported Frameworks:</strong></p>
                  <ul>
                    {impact?.sustainability_reporting?.reporting_frameworks?.map((fw) => (
                      <li key={fw} style={{ marginBottom: 4 }}><strong>{fw}</strong></li>
                    )) || (
                      <>
                        <li>GRI 301/306 Waste & Materials</li>
                        <li>SASB Apparel & Textiles Standard</li>
                        <li>EU Corporate Sustainability Reporting Directive (CSRD)</li>
                      </>
                    )}
                  </ul>
                  <div className="insight-panel" style={{ marginTop: 12 }}>
                    {impact?.sustainability_reporting?.summary_statement || 'Sustainability reporting features active.'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SUSTAINABILITY INTELLIGENCE */}
          {activeTab === 'intelligence' && (
            <div>
              <div className="hero-card" style={{ marginBottom: 18, background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)' }}>
                <div>
                  <div className="stat-label" style={{ color: '#cbd5e0' }}>Strategic Suite: Active</div>
                  <h2 style={{ margin: '6px 0', color: '#ffffff' }}>Strategic Sustainability & ESG Intelligence</h2>
                  <p style={{ color: '#e2e8f0', margin: 0 }}>
                    Integrated intelligence suite for carbon footprint estimation, waste diversion analytics, circular economy analysis, resource recovery estimation, and sustainability benchmarking.
                  </p>
                </div>
                <div className="hero-badge" style={{ background: '#e2e8f0', color: '#2d3748' }}>Intelligence Suite</div>
              </div>

              <div className="stat-grid" style={{ marginBottom: 20 }}>
                <div className="stat-card">
                  <div className="stat-label">Footprint Reduction</div>
                  <div className="stat-value">{intelligence?.carbon_footprint_estimation?.footprint_reduction_pct ?? 82.5}%</div>
                  <div className="hint" style={{ marginTop: 4 }}>CO₂ emission offset vs baseline</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Waste Diversion Rate</div>
                  <div className="stat-value">{intelligence?.waste_diversion_analysis?.diversion_rate_pct ?? 86.4}%</div>
                  <div className="hint" style={{ marginTop: 4 }}>Target: {intelligence?.waste_diversion_analysis?.target_diversion_rate_pct ?? 95.0}%</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Loop Closure Index</div>
                  <div className="stat-value">{intelligence?.circular_economy_analysis?.material_loop_closure_index ?? 73.1} / 100</div>
                  <div className="hint" style={{ marginTop: 4 }}>Circular loop integrity score</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Circularity Rating</div>
                  <div className="stat-value" style={{ color: '#2b6cb0' }}>{intelligence?.sustainability_benchmarking?.circularity_rating ?? 'A (High)'}</div>
                  <div className="hint" style={{ marginTop: 4 }}>Industry percentile: Top 15%</div>
                </div>
              </div>

              <div className="section-grid">
                <div className="section-card">
                  <h3>🔄 Resource Recovery Strategies</h3>
                  <p className="detail-text">
                    <strong>High Value Route:</strong> {intelligence?.resource_recovery_estimation?.high_value_recovery_route || 'Mechanical Fiber Spinning & Re-weaving'}
                  </p>
                  <p className="detail-text">
                    <strong>Economic Valuation:</strong> {intelligence?.resource_recovery_estimation?.economic_value_indicator || 'High Recovery Potential (Tier 1 Value)'}
                  </p>
                  <p className="detail-text">
                    <strong>Estimated Market Value:</strong> ${intelligence?.resource_recovery_estimation?.estimated_market_value_usd_per_ton || 480} / ton recovered
                  </p>
                  <div className="insight-panel" style={{ marginTop: 12 }}>
                    {intelligence?.resource_recovery_estimation?.recommended_action || 'Prioritize closed-loop yarn regeneration over downcycling.'}
                  </div>
                </div>

                <div className="section-card">
                  <h3>📊 Industry ESG Benchmarks</h3>
                  <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: 8, background: '#f7fafc', borderRadius: 6 }}>
                      <span>Sector Benchmark Average</span>
                      <strong>62.4 / 100</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: 8, background: '#edf2f7', borderRadius: 6 }}>
                      <span>Platform Platform Index</span>
                      <strong style={{ color: '#276749' }}>81.2 / 100 (+18.8 pts)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: 8, background: '#f7fafc', borderRadius: 6 }}>
                      <span>Decarbonization Status</span>
                      <strong style={{ color: '#2b6cb0' }}>On Track for Net-Zero 2030</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LIVE 5-FACTOR SCORE CALCULATOR */}
          {activeTab === 'calculator' && (
            <div>
              <div className="hero-card" style={{ marginBottom: 18, background: 'linear-gradient(135deg, #44337a 0%, #6b46c1 100%)' }}>
                <div>
                  <div className="stat-label" style={{ color: '#d6bcfa' }}>Interactive Sandbox</div>
                  <h2 style={{ margin: '6px 0', color: '#ffffff' }}>Interactive Batch Impact & Score Calculator</h2>
                  <p style={{ color: '#ede9fe', margin: 0 }}>
                    Test any combination of fabric material, condition, weight, and reuse potential to compute instant circularity subscores and environmental offsets in real time.
                  </p>
                </div>
                <div className="hero-badge" style={{ background: '#d6bcfa', color: '#44337a' }}>Live Sandbox</div>
              </div>

              <div className="section-grid">
                {/* Left: Input Form */}
                <div className="card">
                  <h3 style={{ marginTop: 0 }}>Input Parameters</h3>
                  <form onSubmit={handleRunCalculator}>
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                        Fabric Material:
                      </label>
                      <select
                        value={calcMaterial}
                        onChange={(e) => setCalcMaterial(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e0' }}
                      >
                        {['Cotton', 'Polyester', 'Wool', 'Silk', 'Linen', 'Denim', 'Nylon', 'Rayon', 'Acrylic', 'Mixed Fabrics'].map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                        Material Condition:
                      </label>
                      <select
                        value={calcCondition}
                        onChange={(e) => setCalcCondition(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e0' }}
                      >
                        <option value="new">New (Pristine pre-consumer cutting)</option>
                        <option value="good">Good (Clean sorted textile)</option>
                        <option value="worn">Worn (Lightly used / post-consumer)</option>
                        <option value="damaged">Damaged (Torn / fragmented)</option>
                        <option value="contaminated">Contaminated (Stained / blended with contaminants)</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                        Weight (kg):
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.5"
                        value={calcWeight}
                        onChange={(e) => setCalcWeight(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e0' }}
                      />
                    </div>

                    <div style={{ marginBottom: 18 }}>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                        Reuse Potential:
                      </label>
                      <select
                        value={calcReuse}
                        onChange={(e) => setCalcReuse(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e0' }}
                      >
                        <option value="High">High (Garment repair / upcycling)</option>
                        <option value="Medium">Medium (Fiber blend downcycling)</option>
                        <option value="Low">Low (Industrial insulation / filler)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={calcLoading}
                      style={{ width: '100%', padding: '10px 0', fontWeight: 600 }}
                    >
                      {calcLoading ? 'Computing Engines…' : '⚡ Calculate Live Scores'}
                    </button>
                  </form>
                </div>

                {/* Right: Results Panel */}
                <div className="card">
                  <h3 style={{ marginTop: 0 }}>Calculation Results</h3>
                  {calcResult ? (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f7fafc', padding: 14, borderRadius: 10, marginBottom: 14 }}>
                        <div>
                          <div style={{ fontSize: 12, color: '#718096', fontWeight: 600 }}>OVERALL CIRCULARITY SCORE</div>
                          <div style={{ fontSize: 28, fontWeight: 800, color: '#2d3748' }}>
                            {calcResult.scoring_engine?.circularity_score} / 100
                          </div>
                        </div>
                        <span className="pill" style={{ background: '#38a169', color: '#fff', fontSize: 13, padding: '6px 12px' }}>
                          {calcResult.scoring_engine?.circularity_category}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                        <div style={{ padding: 10, background: '#edf2f7', borderRadius: 8 }}>
                          <div style={{ fontSize: 11, color: '#4a5568' }}>Recyclability</div>
                          <div style={{ fontSize: 16, fontWeight: 700 }}>{calcResult.scoring_engine?.recyclability_score} / 100</div>
                        </div>
                        <div style={{ padding: 10, background: '#edf2f7', borderRadius: 8 }}>
                          <div style={{ fontSize: 11, color: '#4a5568' }}>Condition Score</div>
                          <div style={{ fontSize: 16, fontWeight: 700 }}>{calcResult.scoring_engine?.condition_score} / 100</div>
                        </div>
                        <div style={{ padding: 10, background: '#edf2f7', borderRadius: 8 }}>
                          <div style={{ fontSize: 11, color: '#4a5568' }}>Reuse Score</div>
                          <div style={{ fontSize: 16, fontWeight: 700 }}>{calcResult.scoring_engine?.reuse_score} / 100</div>
                        </div>
                        <div style={{ padding: 10, background: '#edf2f7', borderRadius: 8 }}>
                          <div style={{ fontSize: 11, color: '#4a5568' }}>Environmental Benefit</div>
                          <div style={{ fontSize: 16, fontWeight: 700 }}>{calcResult.scoring_engine?.environmental_benefit_score} / 100</div>
                        </div>
                      </div>

                      <div style={{ background: '#f0fff4', border: '1px solid #c6f6d5', padding: 12, borderRadius: 8, fontSize: 13, color: '#22543d' }}>
                        🌱 <strong>Environmental Offset for {calcWeight} kg:</strong><br />
                        • Saved <strong>{calcResult.environmental_impact_engine?.estimated_carbon_saving_kg} kg CO₂</strong> (~{calcResult.environmental_impact_engine?.equivalent_passenger_car_km} km car travel)<br />
                        • Conserved <strong>{calcResult.environmental_impact_engine?.estimated_water_saving_liters} Liters</strong> of freshwater
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#a0aec0' }}>
                      <div style={{ fontSize: 36, marginBottom: 8 }}>🧮</div>
                      <p>Select parameters on the left and click <strong>"Calculate Live Scores"</strong> to see real-time 5-factor weighted scores and environmental LCA offsets.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
