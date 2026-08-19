// Centralized API Client service connecting React to Express REST API

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('twip_auth_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('twip_auth_token', token);
}

export function removeAuthToken(): void {
  localStorage.removeItem('twip_auth_token');
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response;
}

export const api = {
  // Auth
  login: async (credentials: { email: string; password?: string; role?: string; name?: string }) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(err.error || 'Login failed');
    }
    const data = await res.json();
    setAuthToken(data.token);
    return data;
  },

  register: async (userData: { name: string; email: string; password: string; department?: string }) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Registration failed' }));
      throw new Error(err.error || 'Registration failed');
    }
    const data = await res.json();
    setAuthToken(data.token);
    return data;
  },

  sendOtp: async (email: string, name?: string) => {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to dispatch OTP' }));
      throw new Error(err.error || 'Failed to dispatch OTP');
    }
    return res.json();
  },

  verifyOtp: async (email: string, otp: string, name?: string) => {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, name })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'OTP verification failed' }));
      throw new Error(err.error || 'OTP verification failed');
    }
    const data = await res.json();
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  logout: async () => {
    removeAuthToken();
    return { success: true };
  },

  getCurrentUser: async () => {
    const res = await fetchWithAuth('/auth/me');
    return res.json();
  },

  updateProfile: async (updates: { name?: string; department?: string; avatar?: string; password?: string }) => {
    const res = await fetchWithAuth('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  switchRole: async (role: string) => {
    const res = await fetchWithAuth('/auth/switch-role', {
      method: 'POST',
      body: JSON.stringify({ role })
    });
    const data = await res.json();
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  // Dashboard
  getDashboardData: async () => {
    const res = await fetchWithAuth('/dashboard');
    return res.json();
  },

  // AI Analysis
  analyzeTextile: async (formData: FormData) => {
    const res = await fetchWithAuth('/analysis/analyze', {
      method: 'POST',
      body: formData
    });
    return res.json();
  },

  saveAnalysis: async (analysisData: any) => {
    const res = await fetchWithAuth('/analysis/save', {
      method: 'POST',
      body: JSON.stringify(analysisData)
    });
    return res.json();
  },

  getAnalysisHistory: async (params: { search?: string; category?: string } = {}) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetchWithAuth(`/analysis/history?${query}`);
    return res.json();
  },

  deleteAnalysis: async (id: string) => {
    const res = await fetchWithAuth(`/analysis/${id}`, { method: 'DELETE' });
    return res.json();
  },

  clearAnalysisHistory: async () => {
    const res = await fetchWithAuth('/analysis/clear-all', { method: 'DELETE' });
    return res.json();
  },

  // Inventory
  getInventory: async (params: { search?: string; category?: string; status?: string } = {}) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetchWithAuth(`/inventory?${query}`);
    return res.json();
  },

  addInventoryItem: async (item: any) => {
    const res = await fetchWithAuth('/inventory', {
      method: 'POST',
      body: JSON.stringify(item)
    });
    return res.json();
  },

  updateInventoryItem: async (id: string, updates: any) => {
    const res = await fetchWithAuth(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  deleteInventoryItem: async (id: string) => {
    const res = await fetchWithAuth(`/inventory/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Batches
  getBatches: async () => {
    const res = await fetchWithAuth('/batches');
    return res.json();
  },

  createBatch: async (batch: any) => {
    const res = await fetchWithAuth('/batches', {
      method: 'POST',
      body: JSON.stringify(batch)
    });
    return res.json();
  },

  updateBatchStatus: async (id: string, status: string) => {
    const res = await fetchWithAuth(`/batches/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  deleteBatch: async (id: string) => {
    const res = await fetchWithAuth(`/batches/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Recommendations & Sustainability
  getRecommendations: async () => {
    const res = await fetchWithAuth('/recommendations');
    return res.json();
  },

  getSustainability: async () => {
    const res = await fetchWithAuth('/sustainability');
    return res.json();
  },

  getEnvironmental: async () => {
    const res = await fetchWithAuth('/environmental');
    return res.json();
  },

  // Notifications (PDF Module 11)
  getNotifications: async () => {
    const res = await fetchWithAuth('/notifications');
    return res.json();
  },

  createNotification: async (notifData: { title: string; message: string; category?: string; severity?: string; link?: string }) => {
    const res = await fetchWithAuth('/notifications', {
      method: 'POST',
      body: JSON.stringify(notifData)
    });
    return res.json();
  },

  markNotificationRead: async (id: string) => {
    const res = await fetchWithAuth(`/notifications/${id}/read`, { method: 'PATCH' });
    return res.json();
  },

  deleteNotification: async (id: string) => {
    const res = await fetchWithAuth(`/notifications/${id}`, { method: 'DELETE' });
    return res.json();
  },

  markAllNotificationsRead: async () => {
    const res = await fetchWithAuth('/notifications/read-all', { method: 'POST' });
    return res.json();
  },

  clearAllNotifications: async () => {
    const res = await fetchWithAuth('/notifications/clear-all', { method: 'DELETE' });
    return res.json();
  },

  seedSampleNotifications: async () => {
    const res = await fetchWithAuth('/notifications/seed-sample', { method: 'POST' });
    return res.json();
  },

  // Reports & REAL Blob Downloads
  downloadPdfReport: async (type: string, title: string, analysisId?: string) => {
    const params: Record<string, string> = { type, title };
    if (analysisId) params.analysisId = analysisId;
    const query = new URLSearchParams(params).toString();
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/reports/download-pdf?${query}`, { headers });
    if (!res.ok) throw new Error('Failed to generate PDF report');

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = analysisId ? `textile_analysis_${analysisId}.pdf` : `${type}_sustainability_report.pdf`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
    }, 5000);
  },

  downloadExcelReport: async (type: string, title: string, analysisId?: string) => {
    const params: Record<string, string> = { type, title };
    if (analysisId) params.analysisId = analysisId;
    const query = new URLSearchParams(params).toString();
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/reports/download-excel?${query}`, { headers });
    if (!res.ok) throw new Error('Failed to generate Excel export');

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = analysisId ? `textile_analysis_${analysisId}.xlsx` : `${type}_waste_data.xlsx`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
    }, 5000);
  },

  downloadDatabaseBackup: async () => {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/admin/download-db`, { headers });
    if (!res.ok) throw new Error('Failed to download database backup');

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `textile_waste_db_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
    }, 5000);
  },

  // Admin
  getAdminStats: async () => {
    const res = await fetchWithAuth('/admin/stats');
    return res.json();
  },

  getUsers: async () => {
    const res = await fetchWithAuth('/admin/users');
    return res.json();
  },

  updateUserRole: async (id: string, role: string) => {
    const res = await fetchWithAuth(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    });
    return res.json();
  },

  updateUserStatus: async (id: string, status: string) => {
    const res = await fetchWithAuth(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    return res.json();
  }
};
