const BASE = import.meta.env.VITE_API_URL || "";
const TOKEN_KEY = "twip.token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function request(path, { method = "GET", body, form, raw } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers["Content-Type"] = "application/json";

  const response = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: form ?? (body ? JSON.stringify(body) : undefined),
  });

  if (response.status === 401) {
    clearToken();
    window.location.assign("/login");
    throw new Error("Sign in again — that session is no longer valid.");
  }
  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      detail = typeof data.detail === "string" ? data.detail : detail;
    } catch { /* body wasn't JSON */ }
    throw new Error(detail);
  }
  if (raw) return response.blob();
  return response.status === 204 ? null : response.json();
}

export const api = {
  login: async (email, password) => {
    const form = new URLSearchParams({ username: email, password });
    const response = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.detail || "Email or password doesn't match.");
    }
    return response.json();
  },
  register: (payload) => request("/api/auth/register", { method: "POST", body: payload }),
  me: () => request("/api/auth/me"),
  updateMe: (payload) => request("/api/users/me", { method: "PATCH", body: payload }),

  batches: (query = "") => request(`/api/batches${query}`),
  batch: (id) => request(`/api/batches/${id}`),
  createBatch: (payload) => request("/api/batches", { method: "POST", body: payload }),
  updateBatch: (id, payload) => request(`/api/batches/${id}`, { method: "PATCH", body: payload }),
  deleteBatch: (id) => request(`/api/batches/${id}`, { method: "DELETE" }),

  analyse: (batchId, file) => {
    const form = new FormData();
    form.append("image", file);
    return request(`/api/analysis/batches/${batchId}`, { method: "POST", form });
  },
  analyses: (batchId) => request(`/api/analysis/batches/${batchId}`),

  quickAnalyse: (file, condition = "good", quantityKg = 0) => {
    const form = new FormData();
    form.append("image", file);
    form.append("condition", condition);
    form.append("quantity_kg", String(quantityKg));
    return request("/api/analysis/quick", { method: "POST", form });
  },

  insightClassification: () => request("/api/insights/classification"),
  insightRecommendations: () => request("/api/insights/recommendations"),
  insightEnvironmental: () => request("/api/insights/environmental"),

  summary: () => request("/api/dashboard/summary"),
  composition: () => request("/api/dashboard/composition"),
  trend: () => request("/api/dashboard/trend"),
  opportunities: () => request("/api/dashboard/recycling-opportunities"),
  esg: () => request("/api/dashboard/esg"),
  adminMetrics: () => request("/api/dashboard/admin"),

  users: () => request("/api/users"),
  modelMetrics: () => request("/api/models/metrics"),
  datasetModels: () => request("/api/models/datasets"),
  materials: () => request("/api/models/materials"),

  notifications: () => request("/api/notifications"),
  markRead: (id) => request(`/api/notifications/${id}/read`, { method: "POST" }),

  reportBlob: (kind) => request(`/api/reports/${kind}`, { raw: true }),
  singleReportBlob: (slug) => request(`/api/reports/pdf/${slug}`, { raw: true }),
};

export const ROLE_LABEL = {
  recycling_facility_operator: "Recycling facility operator",
  sustainability_manager: "Sustainability manager",
  textile_manufacturer: "Textile manufacturer",
  administrator: "Administrator",
};

export const BAND_TONE = {
  "Excellent Recovery Potential": "text-brand",
  "High Recovery Potential": "text-brand",
  "Moderate Recovery Potential": "text-mint",
  "Limited Recovery Potential": "text-warn",
  "Disposal Recommended": "text-danger",
};

