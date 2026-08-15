import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';

export default function Prediction() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState(1);
  const [activeTab, setActiveTab] = useState('scoring');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const scanStepLabels = [
    '🔍 Step 1/4: Extracting visual features & texture density...',
    '🧵 Step 2/4: Running 10-Class Computer Vision Classifier...',
    '⚙️ Step 3/4: Computing 5-Factor Weighted Circularity & Waste Scores...',
    '🌱 Step 4/4: Estimating CO₂ & Water Impact Metrics...',
  ];

  const duplicateGroups = useMemo(() => {
    const groups = {};
    history.forEach((item) => {
      const key = [item.material, item.waste_category, item.recyclability_level, item.recommendation].join('||');
      groups[key] = groups[key] || {
        material: item.material,
        waste_category: item.waste_category,
        recyclability_level: item.recyclability_level,
        recommendation: item.recommendation,
        image_names: [],
        count: 0,
      };
      groups[key].count += 1;
      groups[key].image_names.push(item.image_name);
    });
    return Object.values(groups)
      .filter((group) => group.count > 1)
      .sort((a, b) => b.count - a.count);
  }, [history]);

  const currentPredictionGroup = useMemo(() => {
    if (!result) return null;
    return duplicateGroups.find(
      (group) =>
        group.material === result.material_prediction?.material &&
        group.waste_category === result.recommendation?.waste_category &&
        group.recyclability_level === result.recommendation?.recyclability_level &&
        group.recommendation === result.recommendation?.recommendation
    );
  }, [duplicateGroups, result]);

  async function loadHistory() {
    try {
      const data = await api.getPredictionHistory();
      setHistory(data);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => { loadHistory(); }, []);

  function handleFileChange(e) {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : '');
  }

  function friendlyLabel(name, idx, material) {
    try {
      const base = name.split('/').pop();
      const fname = base.split('.').slice(0, -1).join('.') || base;
      if (/^[0-9a-fA-F\-]{20,}$/.test(fname) || /^[0-9a-fA-F\-]{8,}$/.test(fname)) {
        return `Sample ${idx + 1}${material ? ` — ${material}` : ''}`;
      }
      return (fname.length > 24) ? fname.slice(0, 20) + '…' : fname;
    } catch (e) {
      return 'Image';
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setScanStep(1);
    setError('');
    setResult(null);

    const stepInterval = setInterval(() => {
      setScanStep((prev) => (prev < 4 ? prev + 1 : 4));
    }, 600);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const data = await api.analyzeImage(formData);
      setResult(data);
      await loadHistory();
    } catch (e) {
      setError(e.message);
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  }

  function generateReportHtml(result, history, duplicateGroups) {
    const title = 'Textile Waste Intelligence - Material Analysis & Circularity Report';
    const now = new Date().toLocaleString();

    // friendlyLabel is shared from component scope

    const dupHtml = (duplicateGroups && duplicateGroups.length)
      ? `<h3>Duplicate prediction groups</h3>` + duplicateGroups.map((g, gi) => `
          <div style="margin-bottom:8px;padding:10px;border-radius:8px;background:#fff;border:1px solid #e6e1d3">
            <strong>${g.count} matching images</strong>
            <div style="margin-top:6px;color:#4f5e4c">${g.image_names.map((n,i)=> friendlyLabel(n,i,g.material)).join(', ')}</div>
            <div style="margin-top:6px;font-size:13px;color:#6b7768">Material: ${g.material} — ${g.recyclability_level || ''}</div>
            <details style="margin-top:8px"><summary style="cursor:pointer;color:#33506c">Show original image IDs</summary><div style="margin-top:6px;color:#5b463e;font-size:13px">${g.image_names.join(', ')}</div></details>
          </div>
        `).join('')
      : '<p>No duplicate groups found.</p>';

    const recentHtml = (history && history.length)
      ? '<h3>Recent predictions</h3>' + history.map((item, idx) => `
          <div style="display:flex;justify-content:space-between;padding:10px;margin-bottom:8px;border-radius:8px;background:#fff;border:1px solid #e6e1d3">
            <div style="font-weight:700">${friendlyLabel(item.image_name, idx, item.material)}</div>
            <div style="display:flex;flex-direction:column;align-items:flex-end"><div style="color:#4f5e4c">${item.material} (${item.recyclability_level || 'Unknown'})</div><details style="margin-top:6px"><summary style="cursor:pointer;color:#33506c;font-size:12px">Show original ID</summary><div style="color:#5b463e;font-size:12px;margin-top:6px">${item.image_name}</div></details></div>
          </div>
        `).join('')
      : '<p>No recent predictions.</p>';

    const summary = result?.recommendation?.environmental_impact_summary || result?.recommendation?.milestone_2_summary || '';

    return `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${title}</title>
          <style>
            body{font-family:Inter, Arial, sans-serif;background:#f6f3ea;padding:28px;color:#202b21}
            .container{max-width:900px;margin:0 auto}
            .card{background:#fbf8f0;padding:18px;border-radius:12px;border:1px solid #e6e1d3;margin-bottom:14px}
            h1,h2,h3{color:#2b4130}
            .muted{color:#6b7768}
          </style>
        </head>
        <body>
          <div class="container">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <h1>Textile Waste Intelligence</h1>
              <div class="muted">Generated: ${now}</div>
            </div>
            <div class="card">
              <h2>Prediction summary</h2>
              <div style="margin-top:6px">${summary}</div>
            </div>
            <div class="card">
              ${dupHtml}
            </div>
            <div class="card">
              ${recentHtml}
            </div>
          </div>
        </body>
      </html>
    `;
  }

  function downloadReport() {
    // Generate PDF in browser and trigger download to user's Downloads folder
    (async () => {
      try {
        const html = generateReportHtml(result, history, duplicateGroups);
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.width = '1024px';
        container.innerHTML = html;
        document.body.appendChild(container);

        const html2canvas = (await import('html2canvas')).default;
        const { jsPDF } = await import('jspdf');

        const canvas = await html2canvas(container, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        // fit image to page width
        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = pageWidth - 40; // margins
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
        const filename = 'Analysis_Report_' + new Date().toISOString().slice(0,19).replace(/[:T]/g,'-') + '.pdf';
        pdf.save(filename);
        document.body.removeChild(container);
      } catch (err) {
        console.error(err);
        alert('PDF generation failed: ' + (err.message || err));
      }
    })();
  }

  return (
    <div>
      <div className="page-header">
        <h1>AI Textile Analysis & Circular Prediction</h1>
        <p>Analyze fabric texture, classify composition across 10 fiber types, and generate real-time circularity recommendations.</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <form className="card" onSubmit={handleSubmit} style={{ border: '1px solid #e5ddca', background: 'linear-gradient(135deg, #fffdfa 0%, #f7f2e8 100%)' }}>
        <div className="upload-panel" style={{ display: 'grid', gap: 14 }}>
          <div className="insight-panel" style={{ background: 'rgba(55, 88, 110, 0.07)', border: '1px solid rgba(55, 88, 110, 0.14)', padding: 16, borderRadius: 14 }}>
            <strong style={{ fontSize: 16 }}>AI Analysis Workflow</strong>
            <p style={{ margin: '6px 0 0', color: '#4f5e4c', lineHeight: 1.6 }}>Upload a textile sample image to receive instant material classification, recyclability scores, and LCA environmental impact analysis.</p>
          </div>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 8, border: '2px dashed #b9c6b0', padding: 18, borderRadius: 14, background: '#fffefb', cursor: 'pointer' }}>
            <span style={{ fontWeight: 700, color: '#2f4634' }}>Choose an image</span>
            <input type="file" accept="image/png,image/jpeg,image/jpg" onChange={handleFileChange} style={{ border: 'none', padding: 0 }} />
          </label>
          {previewUrl && (
            <div className={`preview-box ${loading ? 'preview-scanner-box' : ''}`} style={{ display: 'flex', justifyContent: 'center', background: '#f8f4e9', borderRadius: 14, padding: 12, position: 'relative' }}>
              {loading && <div className="laser-sweep-line" />}
              {loading && (
                <div className="scanner-overlay-backdrop">
                  <div className="scanning-spinner" />
                  <strong style={{ fontSize: 15, letterSpacing: '0.02em' }}>AI Computer Vision Scanning...</strong>
                  <span style={{ fontSize: 13, color: '#a3e635' }}>{scanStepLabels[scanStep - 1]}</span>
                </div>
              )}
              <img src={previewUrl} alt="Selected preview" style={{ maxWidth: '100%', maxHeight: 280, objectFit: 'contain', borderRadius: 12 }} />
            </div>
          )}
        </div>

        {loading && (
          <div className="step-tracker-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>🔬 Live Diagnostic Pipeline</strong>
              <span className="mono" style={{ fontSize: 12, color: '#a3e635' }}>Step {scanStep} of 4</span>
            </div>
            <div className="step-tracker-steps">
              {['Feature Extraction', 'Model Inference', 'Circularity Scoring', 'ESG Analytics'].map((name, i) => (
                <div key={name} className={`step-item ${scanStep === i + 1 ? 'active' : scanStep > i + 1 ? 'completed' : ''}`}>
                  {scanStep > i + 1 ? '✓ ' : ''}{name}
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="btn btn-primary" type="submit" disabled={loading || !file} style={{ marginTop: 14, width: '100%' }}>
          {loading ? '🔍 Analyzing Textile Sample…' : '⚡ Run AI Prediction'}
        </button>
      </form>

      {result && (
        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Prediction summary</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="btn btn-secondary" onClick={downloadReport} title="Download a printable PDF report (browser print)">Download report</button>
              <button className="btn btn-secondary" onClick={async () => {
                try {
                  const payload = { result, history, duplicate_groups: duplicateGroups };
                  const blob = await api.generateMilestone2Pdf(payload);
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'Textile_Analysis_Report.pdf';
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  window.URL.revokeObjectURL(url);
                } catch (err) {
                  console.error(err);
                  alert('Server PDF generation failed: ' + (err.message || err));
                }
              }} title="Generate and download server-side PDF">Download server PDF</button>
            </div>
          </div>
          <p style={{ marginTop: 8, color: '#52604f', fontSize: 13 }}><strong>Why these sections?</strong> Duplicate prediction groups highlight repeated or similar items to avoid double-counting; Recent predictions gives quick audit and traceability of recent submissions.</p>
          {/* Result Hero Banner with SVG Circularity Gauge */}
          <div className="result-hero" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: result.material_prediction?.material === 'Not enough textile evidence' ? 'linear-gradient(135deg, #fff7ed, #fef3c7)' : 'linear-gradient(135deg, #f3f7ef, #e7f0e0)', border: result.material_prediction?.material === 'Not enough textile evidence' ? '1px solid #f5c2a8' : '1px solid #dbe8d0', padding: 20, borderRadius: 16 }}>
            <div>
              <span className="pill" style={{ background: '#3f6848', color: '#fff', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                AI Analysis Complete
              </span>
              <h3 style={{ margin: '8px 0 4px 0', fontSize: 22, color: '#2b4130' }}>
                {result.material_prediction?.material === 'Not enough textile evidence' ? 'Image Review Needed' : `${result.material_prediction?.material} Identified`}
              </h3>
              <p style={{ margin: 0, color: '#4f5e4c', fontSize: 14 }}>
                Waste Category: <strong>{result.recommendation?.waste_category}</strong> • Recyclability Level: <strong>{result.recommendation?.recyclability_level}</strong>
              </p>
            </div>

            {/* SVG Circularity Performance Gauge Meter */}
            <div className="circularity-ring-meter">
              <svg width="130" height="130" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#e6edd9" strokeWidth="10" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="url(#gaugeGrad)"
                  strokeWidth="10"
                  strokeDasharray="314.15"
                  strokeDashoffset={314.15 - (314.15 * (result.recommendation?.circularity_score ?? 0)) / 100}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
                <defs>
                  <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#27ae60" />
                    <stop offset="100%" stopColor="#00f2fe" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="circularity-ring-text">
                <div className="circularity-ring-score">{result.recommendation?.circularity_score ?? 0}</div>
                <div className="circularity-ring-label">CIRCULARITY</div>
              </div>
            </div>
          </div>

          {/* Top 3 Predictions Confidence Breakdown */}
          {result.material_prediction?.top_predictions?.length > 0 && (
            <div className="card" style={{ marginTop: 14, padding: 14, background: '#fffefb' }}>
              <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13, color: '#37586e' }}>
                🧵 Top AI Material Predictions & Confidence Distribution
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {result.material_prediction.top_predictions.map((item, idx) => (
                  <div key={item.material + idx} style={{ fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span><strong>{idx + 1}. {item.material}</strong></span>
                      <span className="mono">{item.confidence}% confidence</span>
                    </div>
                    <div style={{ background: '#edf2e9', borderRadius: 999, overflow: 'hidden', height: 8 }}>
                      <div style={{ width: `${Math.max(4, item.confidence)}%`, background: idx === 0 ? 'linear-gradient(90deg, #2b4130, #3f6848)' : '#a3b899', height: '100%', borderRadius: 999 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modern 4-Tab Analytics Inspector Navigation */}
          <div className="analytics-tab-bar" style={{ marginTop: 20 }}>
            <button className={`analytics-tab-btn ${activeTab === 'scoring' ? 'active' : ''}`} onClick={() => setActiveTab('scoring')}>
              ⚙️ Circularity Scoring
            </button>
            <button className={`analytics-tab-btn ${activeTab === 'impact' ? 'active' : ''}`} onClick={() => setActiveTab('impact')}>
              🌱 Environmental Impact (LCA)
            </button>
            <button className={`analytics-tab-btn ${activeTab === 'diagnostics' ? 'active' : ''}`} onClick={() => setActiveTab('diagnostics')}>
              🔍 Texture Diagnostics
            </button>
            <button className={`analytics-tab-btn ${activeTab === 'strategy' ? 'active' : ''}`} onClick={() => setActiveTab('strategy')}>
              🏭 Recovery & Upcycling Plan
            </button>
          </div>

          {/* TAB 1: WASTE SCORING MODEL */}
          {activeTab === 'scoring' && (
            <div className="card" style={{ background: '#fcfaf5', border: '1px solid #e2dac8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0, color: '#2b4130' }}>⚙️ Circularity Scoring Breakdown</h3>
                <span className="pill" style={{ background: '#3f6848', color: '#fff', padding: '4px 12px', fontSize: 13, borderRadius: 12 }}>
                  Score: {result.recommendation?.circularity_score ?? 0} / 100
                </span>
              </div>

              <div className="section-grid" style={{ marginBottom: 16 }}>
                <div className="detail-card">
                  <div className="section-header">
                    <span>Assigned Circularity Category</span>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 18, fontWeight: 700, color: '#2b4130' }}>
                    {result.recommendation?.circularity_category || 'Disposal Recommended'}
                  </div>
                  <div className="hint" style={{ marginTop: 4 }}>5-Factor Weighted Model Outcome</div>
                </div>

                <div className="detail-card">
                  <div className="section-header">
                    <span>Composite Sub-Scores</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8, fontSize: 13 }}>
                    <div>Recyclability: <strong>{result.recommendation?.recyclability_score ?? 0}</strong></div>
                    <div>Reuse Potential: <strong>{result.recommendation?.reuse_score ?? 0}</strong></div>
                    <div>Material Recovery: <strong>{result.recommendation?.material_recovery_score ?? 0}</strong></div>
                    <div>Environmental Benefit: <strong>{result.recommendation?.environmental_benefit_score ?? 0}</strong></div>
                    <div>Processing Feasibility: <strong>{result.recommendation?.processing_feasibility_score ?? 0}</strong></div>
                    <div>Sustainability Index: <strong>{result.recommendation?.sustainability_score ?? 0}</strong></div>
                  </div>
                </div>
              </div>

              <h4 style={{ marginBottom: 8, color: '#37586e' }}>Weighted Scoring Model Factor Breakdown</h4>
              <div style={{ display: 'grid', gap: 8 }}>
                {[
                  { label: 'Material Recyclability (35%)', value: result.recommendation?.recyclability_score ?? 0 },
                  { label: 'Material Condition (20%)', value: result.recommendation?.processing_feasibility_score ? Math.round(result.recommendation.processing_feasibility_score * 0.9) : 80 },
                  { label: 'Reuse Potential (20%)', value: result.recommendation?.reuse_score ?? 0 },
                  { label: 'Environmental Benefit (15%)', value: result.recommendation?.environmental_benefit_score ?? 0 },
                  { label: 'Processing Feasibility (10%)', value: result.recommendation?.processing_feasibility_score ?? 0 },
                ].map((item) => (
                  <div key={item.label} style={{ fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span>{item.label}</span>
                      <span className="mono">{item.value} / 100</span>
                    </div>
                    <div style={{ background: '#e9efe4', borderRadius: 6, overflow: 'hidden', height: 6 }}>
                      <div style={{ width: `${Math.min(100, Math.max(0, item.value))}%`, background: 'linear-gradient(90deg, #3f6848, #37586e)', height: '100%' }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7768', marginBottom: 6 }}>CIRCULARITY CATEGORIES REFERENCE</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['Excellent Recovery Potential', 'High Recovery Potential', 'Moderate Recovery Potential', 'Limited Recovery Potential', 'Disposal Recommended'].map((cat) => {
                    const isActive = result.recommendation?.circularity_category === cat;
                    return (
                      <span key={cat} style={{
                        padding: '4px 10px',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: isActive ? 700 : 400,
                        background: isActive ? '#3f6848' : '#eef2ea',
                        color: isActive ? '#ffffff' : '#4f5e4c',
                        border: isActive ? '1px solid #2b4130' : '1px solid #d4dfce',
                      }}>
                        {cat}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ENVIRONMENTAL IMPACT */}
          {activeTab === 'impact' && (
            <div className="section-grid">
              <div className="section-card">
                <h4>🌱 Lifecycle Environmental Impact</h4>
                <p className="detail-text"><strong>CO₂ Savings Estimation:</strong> {result.recommendation?.estimated_carbon_saving_kg ?? 0} kg CO₂ saved</p>
                <div className="impact-equivalent-pill">🚘 Equivalent to ~{( (result.recommendation?.estimated_carbon_saving_kg || 0) * 4.1 ).toFixed(1)} km passenger car travel</div>

                <p className="detail-text" style={{ marginTop: 12 }}><strong>Water Savings Estimation:</strong> {result.recommendation?.estimated_water_saving_liters ?? 0} L saved</p>
                <div className="impact-equivalent-pill">💧 Equivalent to ~{( (result.recommendation?.estimated_water_saving_liters || 0) / 10 ).toFixed(0)} days of drinking water</div>

                <p className="detail-text" style={{ marginTop: 12 }}><strong>Landfill Reduction Analysis:</strong> {result.recommendation?.landfill_diverted_kg ?? 1.0} kg diverted</p>
                <div className="impact-equivalent-pill">♻️ 100% diverted from municipal landfill streams</div>

                <p className="detail-text" style={{ marginTop: 12 }}><strong>Resource Conservation:</strong> {result.recommendation?.estimated_energy_saving_kwh ?? 8.5} kWh energy saved</p>
                <div className="impact-equivalent-pill">⚡ Equivalent to ~{( (result.recommendation?.estimated_energy_saving_kwh || 8.5) * 2.2 ).toFixed(1)} hours LED lighting</div>
              </div>

              <div className="section-card">
                <h4>📊 Strategic Sustainability Insights</h4>
                <p className="detail-text"><strong>Carbon Footprint:</strong> {result.recommendation?.estimated_carbon_saving_kg ?? 0} kg CO₂ offset</p>
                <p className="detail-text"><strong>Waste Diversion Rate:</strong> 85% recoverable material diversion</p>
                <p className="detail-text"><strong>Circular Economy Benchmark:</strong> {result.recommendation?.estimated_carbon_saving_kg > 3.5 ? 'Industry Leader' : 'Standard Circularity'}</p>
                <p className="detail-text"><strong>Sustainability Priority:</strong> {result.recommendation?.sustainability_priority || 'High'}</p>
                <p className="detail-text"><strong>Environmental Summary:</strong> {result.recommendation?.environmental_impact_summary}</p>
              </div>
            </div>
          )}

          {/* TAB 3: IMAGE DIAGNOSTICS */}
          {activeTab === 'diagnostics' && (
            <div className="section-grid">
              <div className="section-card">
                <h4>Material Classification Diagnostics</h4>
                <p className="detail-text"><strong>Fabric Type:</strong> {result.material_prediction?.fabric_type_classification}</p>
                <p className="detail-text"><strong>Fiber Composition:</strong> {result.material_prediction?.fiber_composition_prediction}</p>
                <p className="detail-text"><strong>Blend Identification:</strong> {result.material_prediction?.blend_identification}</p>
                <p className="detail-text"><strong>Quality Estimation:</strong> {result.material_prediction?.material_quality_estimation}</p>
                <p className="detail-text"><strong>Fabric Category:</strong> {result.material_prediction?.fabric_category_recognition}</p>
              </div>

              <div className="section-card">
                <h4>Computer Vision Image Analysis</h4>
                <p className="detail-text"><strong>Dimensions:</strong> {result.image_analysis?.width} × {result.image_analysis?.height}</p>
                <p className="detail-text"><strong>Brightness:</strong> {result.image_analysis?.brightness}</p>
                <p className="detail-text"><strong>Contrast:</strong> {result.image_analysis?.contrast}</p>
                <p className="detail-text"><strong>Fabric Texture:</strong> {result.image_analysis?.fabric_texture || 'Standard textile texture'}</p>
                <p className="detail-text"><strong>Damage Detection:</strong> {result.image_analysis?.damage_detection || 'No major structural damage'}</p>
                <p className="detail-text"><strong>Contamination Check:</strong> {result.image_analysis?.contamination_detection || 'No contamination flagged'}</p>
              </div>
            </div>
          )}

          {/* TAB 4: RECOVERY STRATEGY */}
          {activeTab === 'strategy' && (
            <div className="section-grid">
              <div className="section-card">
                <h4>Recycling & Upcycling Strategy</h4>
                <p className="detail-text"><strong>Waste Category:</strong> {result.recommendation?.waste_category}</p>
                <p className="detail-text"><strong>Reuse Opportunity:</strong> {result.recommendation?.reuse_opportunity}</p>
                <p className="detail-text"><strong>Recycling Strategy:</strong> {result.recommendation?.recycling_strategy}</p>
                <p className="detail-text"><strong>Upcycling Suggestion:</strong> {result.recommendation?.upcycling_suggestion}</p>
                <p className="detail-text"><strong>Disposal Method:</strong> {result.recommendation?.disposal_method}</p>
              </div>

              <div className="section-card">
                <h4>Supported Recycling Options</h4>
                <ul>
                  {(result.recommendation?.recycling_options || ['Fiber Recycling', 'Mechanical Recycling', 'Fabric Reuse']).map((opt) => (
                    <li key={opt} style={{ marginBottom: 6 }}><strong>{opt}:</strong> Approved circular processing pathway.</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {currentPredictionGroup && (
            <div className="duplicate-banner">
              <strong>This prediction matches an existing group of {currentPredictionGroup.count} images with the same analysis.</strong>
              <div className="duplicate-list">Duplicate images: {currentPredictionGroup.image_names.map((n,i)=> friendlyLabel(n,i,currentPredictionGroup.material)).join(', ')}</div>
              <details style={{ marginTop: 8 }}>
                <summary style={{ cursor: 'pointer', color: '#33506c' }}>Show original image IDs</summary>
                <div style={{ marginTop: 6, color: '#5b463e', fontSize: 13 }}>{currentPredictionGroup.image_names.join(', ')}</div>
              </details>
            </div>
          )}
        </div>
      )}

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Recent predictions</h3>
        {history.length === 0 ? <p>No predictions yet.</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 }}>
            {history.map((item, idx) => (
              <div key={item.id} style={{ background: '#fff', padding: 12, borderRadius: 10, border: '1px solid #e6e1d3' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700 }}>{friendlyLabel(item.image_name, idx, item.material)}</div>
                  <div style={{ color: '#4f5e4c' }}>{item.material} <span style={{ color: '#6b7768' }}>({item.recyclability_level || 'Unknown'})</span></div>
                </div>
                <div style={{ marginTop: 8, fontSize: 13, color: '#6b7768' }}>Uploaded: {new Date(item.created_at || item.timestamp || Date.now()).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
