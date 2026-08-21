/**
 * api.js — Centralized fetch wrapper for the Textile Waste API
 */
const API_BASE = "http://127.0.0.1:8000"; // Changed for local testing

function getToken() {
  return localStorage.getItem("twi_token");
}

async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("twi_token");
    localStorage.removeItem("twi_user");
    
    // Instead of silent redirect, show a toast and throw a clear error
    if (typeof showToast === 'function') {
      showToast("Session expired — please log in again", "error");
    }
    
    // Throw error so the pipeline stops and shows it in the UI instead of navigating away
    throw new Error("Session expired — please log in again");
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail || `HTTP ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

const api = {
  // Auth
  login:    (data) => apiFetch("/api/auth/login",    { method: "POST", body: JSON.stringify(data) }),
  register: (data) => apiFetch("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),
  me:       ()     => apiFetch("/api/auth/me"),

  // Inventory
  getInventory:    (params = "") => apiFetch(`/api/inventory${params}`),
  getInventorySummary: ()        => apiFetch("/api/inventory/summary"),
  createInventory: (data)        => apiFetch("/api/inventory",        { method: "POST",   body: JSON.stringify(data) }),
  updateInventory: (id, data)    => apiFetch(`/api/inventory/${id}`,  { method: "PUT",    body: JSON.stringify(data) }),
  deleteInventory: (id)          => apiFetch(`/api/inventory/${id}`,  { method: "DELETE" }),

  // Waste
  getWasteRecords: (params = "") => apiFetch(`/api/waste/records${params}`),
  createWaste:     (data)        => apiFetch("/api/waste/records",    { method: "POST",   body: JSON.stringify(data) }),
  getAnalytics:    (year)        => apiFetch(`/api/waste/analytics${year ? "?year=" + year : ""}`),
  getDashboardStats: ()          => apiFetch("/api/waste/dashboard-stats"),

  // Suppliers
  getSuppliers:    ()     => apiFetch("/api/suppliers"),
  createSupplier:  (data) => apiFetch("/api/suppliers", { method: "POST", body: JSON.stringify(data) }),
  deleteSupplier:  (id)   => apiFetch(`/api/suppliers/${id}`, { method: "DELETE" }),

  // ── Milestone 2: Image Upload ────────────────────────────────────────────
  // Note: uploadImage uses raw fetch (FormData) — not apiFetch (JSON-only)
  uploadImage: async (file) => {
    console.log("Creating FormData in api.js");
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem("twi_token");
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    
    console.log(`Sending POST request to ${API_BASE}/image/upload`, formData, headers);
    const res = await fetch(`${API_BASE}/image/upload`, {
      method: "POST",
      body: formData,
      headers: headers
    });
    console.log("Fetch request completed with status:", res.status);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Upload failed" }));
      console.error("Backend response error in api.js:", err);
      throw new Error(err.detail || `HTTP ${res.status}`);
    }
    const data = await res.json();
    console.log("Backend response received in api.js (success):", data);
    return data;
  },
  listImages:   ()    => apiFetch("/image"),
  getImage:     (id)  => apiFetch(`/image/${id}`),
  linkInventory: (id, invId) => apiFetch(`/image/${id}/link-inventory?inventory_id=${invId}`, { method: "POST" }),
  deleteImage:  (id)  => apiFetch(`/image/${id}`, { method: "DELETE" }),
  analyzeImage: (id)  => apiFetch(`/image/analyze/${id}`, { method: "POST" }),

  // ── Milestone 2: Classification ──────────────────────────────────────────
  classifyMaterial: (image_id)  => apiFetch("/classification/material", {
    method: "POST", body: JSON.stringify({ image_id }),
  }),
  classifyWaste:    (material)  => apiFetch("/classification/waste", {
    method: "POST", body: JSON.stringify({ material }),
  }),
  getRecommendations: (material, category, image_id = null) => apiFetch("/classification/recommendations", {
    method: "POST", body: JSON.stringify({ material, category, image_id }),
  }),

  // ── Milestone 2: Recyclability Assessment ───────────────────────────────
  assessRecyclability: (data)  => apiFetch("/assessment/recyclability", {
    method: "POST", body: JSON.stringify(data),
  }),

  // ── Milestone 2: Report ──────────────────────────────────────────────────
  getReport: (image_id) => apiFetch(`/report/${image_id}`),

  // ── Milestone 2: AI Dashboard Stats ─────────────────────────────────────
  getAIStats: () => apiFetch("/report/stats/summary"),

  // ── Milestone 3: Sustainability Dashboard ──────────────────────────────
  fetchAllSustainabilityMetrics: () => apiFetch("/api/sustainability"),
  fetchSustainabilityMetric:     (id) => apiFetch(`/api/sustainability/${id}`),
  fetchBenchmark:                (id) => apiFetch(`/api/sustainability/benchmark/${id}`),
  fetchRecommendations:          (id) => apiFetch(`/api/recommendation/${id}`),
  fetchEnvironmentalReport:      (id) => apiFetch(`/api/environmental/${id}`),
  generateCircularAnalytics:     () => apiFetch("/api/circular-analytics/generate", { method: "POST" }),
  fetchCircularAnalytics:        () => apiFetch("/api/circular-analytics/latest"),

  // ── Milestone 4: Dashboards ──────────────────────────────────────────────
  listRecommendations:           () => apiFetch("/api/recommendation"),
  listEnvironmentalReports:      () => apiFetch("/api/environmental"),
  getCurrentUser:                () => apiFetch("/api/auth/me"),

  // ── Generate endpoints (POST to create data before GET can retrieve it) ──
  // These MUST be called before their corresponding GET/fetch endpoints.
  calculateSustainability:    (inventory_id) => apiFetch("/api/sustainability/calculate", {
    method: "POST", body: JSON.stringify({ inventory_id }),
  }),
  generateRecommendationsForInventory: (inventory_id, condition = null) => apiFetch("/api/recommendation/generate", {
    method: "POST", body: JSON.stringify({ inventory_id, ...(condition ? { condition } : {}) }),
  }),
  generateEnvironmentalReport: (inventory_id) => apiFetch("/api/environmental/generate", {
    method: "POST", body: JSON.stringify({ inventory_id }),
  }),
};

window.api = api;
