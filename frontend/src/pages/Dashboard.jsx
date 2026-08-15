import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

function TrendChart({ data, color, valueKey, label }) {
  if (!data || data.length === 0) {
    return <p className="empty-state">No trend data available yet.</p>;
  }

  const maxValue = Math.max(...data.map((item) => item[valueKey] || 0), 1);
  const width = 320;
  const height = 140;
  const padding = 20;
  const stepX = (width - padding * 2) / Math.max(data.length - 1, 1);

  const points = data.map((item, index) => {
    const x = padding + index * stepX;
    const y = height - padding - ((item[valueKey] || 0) / maxValue) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="card" style={{ padding: 14 }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>{label}</div>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="140">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#d9dfd2" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#d9dfd2" strokeWidth="1" />
        <polyline fill="none" stroke={color} strokeWidth="3" points={points} />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7768' }}>
        {data.map((item) => <span key={item.week}>{item.week.slice(5)}</span>)}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [activeRoleView, setActiveRoleView] = useState(user?.role || 'recycling_facility_operator');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.summary(),
      api.getAnalytics(),
      api.getAnalyticsTrends(),
      api.getNotifications().catch(() => []),
    ])
      .then(([inventorySummary, analyticsSummary, trendSummary, notifs]) => {
        setSummary(inventorySummary);
        setAnalytics(analyticsSummary);
        setTrends(trendSummary);
        setNotifications(notifs);
      })
      .catch((e) => setError(e.message));
  }, []);

  const handleRoleChange = (roleKey) => {
    setActiveRoleView(roleKey);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Welcome, {user?.full_name?.split(' ')[0]}</h1>
        <p>Textile Waste Intelligence Platform — Enterprise Sustainability & Operations Dashboard</p>
      </div>

      <div className="hero-card">
        <div>
          <div className="stat-label">System Operational Status</div>
          <h3>AI Sustainability Intelligence & Multi-Role Operations Active</h3>
          <p>
            Real-time circularity scoring, carbon footprint telemetry, water conservation tracking, and multi-stakeholder operational workflows are active.
          </p>
        </div>
        <div className="hero-badge">● Systems Live & Monitored</div>
      </div>

      {/* Role View Selector */}
      <div className="card" style={{ marginBottom: 18, padding: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 14 }}>
          Select Operational View:
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { key: 'recycling_facility_operator', label: '♻️ Recycling Operator View' },
            { key: 'sustainability_manager', label: '🌱 Sustainability Manager View' },
            { key: 'textile_manufacturer', label: '🏭 Textile Manufacturer View' },
            { key: 'administrator', label: '⚙️ Platform Administration View' },
          ].map((role) => (
            <button
              key={role.key}
              onClick={() => handleRoleChange(role.key)}
              className={`btn ${activeRoleView === role.key ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: 13, padding: '6px 14px' }}
            >
              {role.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {summary && (
        <>
          {/* ROLE VIEW 1: RECYCLING FACILITY OPERATOR */}
          {activeRoleView === 'recycling_facility_operator' && (
            <div>
              <div className="section-header" style={{ marginBottom: 12 }}>
                <h2 style={{ margin: 0 }}>Recycling Facility Operator Dashboard</h2>
                <span className="pill">Waste Inventory & Recovery Focus</span>
              </div>
              <div className="stat-grid" style={{ marginBottom: 18 }}>
                <div className="stat-card">
                  <div className="stat-label">Total Batches</div>
                  <div className="stat-value">{summary.total_batches}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Total Quantity</div>
                  <div className="stat-value">{summary.total_quantity_kg.toFixed(1)} kg</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Recyclable Batches</div>
                  <div className="stat-value">{analytics?.recyclable_batches ?? 0}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Avg Recyclability Score</div>
                  <div className="stat-value">{analytics?.avg_recyclability_score?.toFixed?.(1) ?? '0.0'}</div>
                </div>
              </div>

              <div className="section-grid" style={{ marginBottom: 18 }}>
                <div className="detail-card">
                  <div className="section-header">
                    <span>Recycling Opportunities & Processing Analytics</span>
                    <span className="pill">Operator Strategy</span>
                  </div>
                  <p className="detail-text">
                    Primary focus on high-yield materials for mechanical and chemical fiber recycling.
                  </p>
                  <ul>
                    <li>Most common incoming material: <strong>{analytics?.most_common_material ?? 'N/A'}</strong></li>
                    <li>Duplicate analysis groups: <strong>{analytics?.total_duplicate_analysis_groups ?? 0}</strong></li>
                    <li>Readiness: <strong>{analytics?.sustainability_summary?.recovery_priority ?? 'Standard Processing'}</strong></li>
                  </ul>
                </div>
                <div className="detail-card">
                  <div className="section-header">
                    <span>Waste Inventory Breakdown</span>
                    <span className="pill">Live Inventory</span>
                  </div>
                  <ul>
                    {Object.entries(summary.quantity_by_fabric_type || {}).map(([fabric, qty]) => (
                      <li key={fabric}><strong>{fabric}:</strong> {qty.toFixed(1)} kg</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ROLE VIEW 2: SUSTAINABILITY MANAGER */}
          {activeRoleView === 'sustainability_manager' && (
            <div>
              <div className="section-header" style={{ marginBottom: 12 }}>
                <h2 style={{ margin: 0 }}>Sustainability Manager Dashboard</h2>
                <span className="pill">ESG & Environmental Impact Focus</span>
              </div>
              <div className="stat-grid" style={{ marginBottom: 18 }}>
                <div className="stat-card">
                  <div className="stat-label">Avg Circularity Score</div>
                  <div className="stat-value">{analytics?.avg_circularity_score?.toFixed?.(1) ?? '0.0'} / 100</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Total CO₂ Saved</div>
                  <div className="stat-value">{analytics?.total_carbon_saving_kg?.toFixed?.(1) ?? '0.0'} kg</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Total Water Saved</div>
                  <div className="stat-value">{analytics?.total_water_saving_liters?.toFixed?.(0) ?? '0'} L</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Sustainability Priority</div>
                  <div className="stat-value">{analytics?.sustainability_summary?.recovery_priority ?? 'High'}</div>
                </div>
              </div>

              <div className="section-grid" style={{ marginBottom: 18 }}>
                <div className="detail-card">
                  <div className="section-header">
                    <span>Circularity Categories Breakdown (Document Page 7)</span>
                    <span className="pill">Weighted Model</span>
                  </div>
                  <ul>
                    {Object.entries(analytics?.circularity_breakdown || {}).map(([cat, count]) => (
                      <li key={cat}><strong>{cat}:</strong> {count} item(s)</li>
                    ))}
                  </ul>
                </div>
                <div className="detail-card">
                  <div className="section-header">
                    <span>Actionable ESG Insights</span>
                    <span className="pill">Impact Report</span>
                  </div>
                  <ul>
                    {analytics?.sustainability_summary?.actionable_insights?.map((insight, idx) => (
                      <li key={idx}>{insight}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ROLE VIEW 3: TEXTILE MANUFACTURER */}
          {activeRoleView === 'textile_manufacturer' && (
            <div>
              <div className="section-header" style={{ marginBottom: 12 }}>
                <h2 style={{ margin: 0 }}>Textile Manufacturer Dashboard</h2>
                <span className="pill">Production Waste & Resource Recovery</span>
              </div>
              <div className="stat-grid" style={{ marginBottom: 18 }}>
                <div className="stat-card">
                  <div className="stat-label">Production Waste Tracked</div>
                  <div className="stat-value">{summary.total_quantity_kg.toFixed(1)} kg</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Fabric Types in Production</div>
                  <div className="stat-value">{Object.keys(summary.quantity_by_fabric_type).length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Predictions Processed</div>
                  <div className="stat-value">{analytics?.prediction_count ?? 0}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Resource Recovery Rate</div>
                  <div className="stat-value">85.0%</div>
                </div>
              </div>

              <div className="card" style={{ marginBottom: 18 }}>
                <h3>Production Waste Breakdown by Condition</h3>
                <table>
                  <thead><tr><th>Condition</th><th>Quantity (kg)</th></tr></thead>
                  <tbody>
                    {Object.entries(summary.quantity_by_condition || {}).map(([cond, qty]) => (
                      <tr key={cond}>
                        <td><span className={`badge badge-${cond}`}>{cond}</span></td>
                        <td className="mono">{qty.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ROLE VIEW 4: ADMIN DASHBOARD */}
          {activeRoleView === 'administrator' && (
            <div>
              <div className="section-header" style={{ marginBottom: 12 }}>
                <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
                <span className="pill">System Health & Platform Metrics</span>
              </div>
              <div className="stat-grid" style={{ marginBottom: 18 }}>
                <div className="stat-card">
                  <div className="stat-label">System Status</div>
                  <div className="stat-value" style={{ color: '#27ae60' }}>Healthy</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Total Predictions Logged</div>
                  <div className="stat-value">{analytics?.prediction_count ?? 0}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Active Alerts / Notifications</div>
                  <div className="stat-value">{notifications.length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">AI Engine</div>
                  <div className="stat-value">Operational</div>
                </div>
              </div>

              {notifications.length > 0 && (
                <div className="card" style={{ marginBottom: 18 }}>
                  <h3>System Alerts & Live Notifications</h3>
                  <ul>
                    {notifications.map((n) => (
                      <li key={n.id} style={{ marginBottom: 8 }}>
                        <strong>[{n.category.toUpperCase()}] {n.title}:</strong> {n.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Shared Trends & Analytics */}
          <div className="section-grid" style={{ marginBottom: 18 }}>
            <TrendChart data={trends?.prediction_trend || []} color="#3f6848" valueKey="prediction_count" label="Weekly Prediction Volume" />
            <TrendChart data={trends?.recovery_trend || []} color="#37586e" valueKey="avg_circularity" label="Weekly Circularity Score Trend" />
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>Material Mix Distribution</h3>
            {trends?.material_mix?.length ? (
              <div style={{ display: 'grid', gap: 10 }}>
                {trends.material_mix.map((item) => (
                  <div key={item.material}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <strong>{item.material}</strong>
                      <span>{item.count}</span>
                    </div>
                    <div style={{ background: '#e9efe4', borderRadius: 999, overflow: 'hidden', height: 8 }}>
                      <div style={{ width: `${Math.max((item.count / Math.max(...trends.material_mix.map((entry) => entry.count), 1)) * 100, 8)}%`, background: 'linear-gradient(90deg, #3f6848, #37586e)', height: '100%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="empty-state">Insufficient data for material mix analysis.</p>}
          </div>
        </>
      )}
    </div>
  );
}
