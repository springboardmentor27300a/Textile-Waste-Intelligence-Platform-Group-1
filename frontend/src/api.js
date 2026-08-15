const BASE_URL = '/api';

function getToken() {
  return localStorage.getItem('twip_token');
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data.detail || 'Something went wrong. Please try again.';
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }
  return data;
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload, auth: false }),
  oauth2Login: (payload) => request('/auth/oauth2/login', { method: 'POST', body: payload, auth: false }),
  me: () => request('/auth/me'),

  listBatches: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/inventory/${qs ? `?${qs}` : ''}`);
  },
  createBatch: (payload) => request('/inventory/', { method: 'POST', body: payload }),
  updateBatch: (id, payload) => request(`/inventory/${id}`, { method: 'PATCH', body: payload }),
  deleteBatch: (id) => request(`/inventory/${id}`, { method: 'DELETE' }),
  summary: () => request('/inventory/stats/summary'),

  getRecommendedDatasets: () => request('/dataset/recommended'),
  getDatasets: () => request('/dataset/'),

  analyzeImage: (formData) => {
    const token = localStorage.getItem('twip_token');
    return fetch('/api/predictions/', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || 'Prediction failed');
      return data;
    });
  },
  getPredictionHistory: () => request('/predictions/history'),
  getAnalytics: () => request('/analytics/summary'),
  getAnalyticsTrends: () => request('/analytics/trends'),
  getSustainabilityIntelligence: () => request('/analytics/sustainability-intelligence'),
  getEnvironmentalImpact: () => request('/analytics/environmental-impact'),
  getWasteScoring: () => request('/analytics/waste-scoring'),
  calculateEngineScores: (payload) => request('/analytics/calculate-engine-scores', { method: 'POST', body: payload }),
  getReports: () => request('/reports/'),
  getNotifications: () => request('/notifications/'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'POST' }),
  getCsvExportUrl: (reportType = 'all') => {
    const token = localStorage.getItem('twip_token');
    return `/api/reports/export/csv?report_type=${reportType}${token ? `&token=${encodeURIComponent(token)}` : ''}`;
  },
  getPdfExportUrl: (reportType = 'all') => {
    const token = localStorage.getItem('twip_token');
    return `/api/reports/pdf?report_type=${reportType}${token ? `&token=${encodeURIComponent(token)}` : ''}`;
  },
  downloadReportPdf: async (reportType = 'all') => {
    const token = localStorage.getItem('twip_token');
    const url = `/api/reports/pdf?report_type=${reportType}${token ? `&token=${encodeURIComponent(token)}` : ''}`;
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || 'Failed to download PDF report');
    }
    return res.blob();
  },
  downloadReportCsv: async (reportType = 'all') => {
    const token = localStorage.getItem('twip_token');
    const url = `/api/reports/export/csv?report_type=${reportType}${token ? `&token=${encodeURIComponent(token)}` : ''}`;
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || 'Failed to export CSV');
    }
    return res.blob();
  },
  generateMilestone2Pdf: (payload) => {
    const token = localStorage.getItem('twip_token');
    return fetch('/api/reports/milestone2/pdf', {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { Authorization: `Bearer ${token}` } : {}),
      body: JSON.stringify(payload),
    }).then(async (res) => {
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to generate PDF');
      }
      return res.blob();
    });
  },
};

