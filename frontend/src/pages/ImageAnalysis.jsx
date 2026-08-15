import { useEffect, useState } from 'react';
import { api } from '../api';

export default function ImageAnalysis() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getAnalytics()
      .then(setSummary)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Image Analysis</h1>
        <p>Overview of textile inventory and AI prediction activity.</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {summary && (
        <div className="card">
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Batches tracked</div>
              <div className="stat-value">{summary.total_batches}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total quantity</div>
              <div className="stat-value">{summary.total_quantity_kg} kg</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Recyclable batches</div>
              <div className="stat-value">{summary.recyclable_batches}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Predictions</div>
              <div className="stat-value">{summary.prediction_count}</div>
            </div>
          </div>

          <div className="insight-panel">
            <h3>Sustainability & Circularity Insights</h3>
            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-label">Avg circularity</div>
                <div className="stat-value">{summary.avg_circularity_score?.toFixed?.(1) ?? '0.0'}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">CO₂ saved</div>
                <div className="stat-value">{summary.total_carbon_saving_kg?.toFixed?.(1) ?? '0.0'} kg</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Water saved</div>
                <div className="stat-value">{summary.total_water_saving_liters?.toFixed?.(0) ?? '0'} L</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Most common material</div>
                <div className="stat-value">{summary.most_common_material || '—'}</div>
              </div>
            </div>
          </div>

          <div className="insight-panel">
            <h3>Material distribution</h3>
            <p>{Object.entries(summary.materials || {}).map(([name, count]) => `${name} (${count})`).join(', ') || 'None yet'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
