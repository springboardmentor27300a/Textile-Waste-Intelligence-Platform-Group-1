const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (!window.location.pathname.includes("/login")) {
      window.location.href = "/login";
    }
  }

  if (!response.ok) {
    let errMessage = "An error occurred";
    try {
      const errorData = await response.json();
      errMessage = errorData.detail || errorData.message || JSON.stringify(errorData);
    } catch {
      errMessage = response.statusText;
    }
    throw new Error(errMessage);
  }

  if (response.headers.get("content-type")?.includes("application/json")) {
    return await response.json();
  }
  return response;
}

export const api = {
  // Auth
  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);
    const data = await request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data;
  },
  register: (userData) => request("/api/auth/register", { method: "POST", body: JSON.stringify(userData) }),
  getMe: () => request("/api/users/me"),

  // Users
  listUsers: () => request("/api/users"),
  toggleUserStatus: (userId, isActive) =>
    request(`/api/users/${userId}/status?is_active=${isActive}`, { method: "PATCH" }),
  deleteUser: (userId) => request(`/api/users/${userId}`, { method: "DELETE" }),

  // Inventory & Waste Batches
  listBatches: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/inventory${query ? `?${query}` : ""}`);
  },
  getBatch: (batchId) => request(`/api/inventory/${batchId}`),
  createBatch: (batchData) => request("/api/inventory", { method: "POST", body: JSON.stringify(batchData) }),
  updateBatch: (batchId, batchData) =>
    request(`/api/inventory/${batchId}`, { method: "PATCH", body: JSON.stringify(batchData) }),
  deleteBatch: (batchId) => request(`/api/inventory/${batchId}`, { method: "DELETE" }),
  getInventorySummary: () => request("/api/inventory/summary"),

  // Image Analysis & Classification
  analyzeBatchPhoto: (batchId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return request(`/api/inventory/${batchId}/analyze`, {
      method: "POST",
      body: formData,
    });
  },
  listBatchAnalyses: (batchId) => request(`/api/inventory/${batchId}/analyses`),
  getClassificationSummary: () => request("/api/inventory/reports/classification-summary"),
  getClassificationReportPdfUrl: () => `${API_BASE}/api/inventory/reports/classification-report.pdf?token=${localStorage.getItem("token") || ""}`,
  getSingleAnalysisPdfUrl: (batchId, analysisId) =>
    `${API_BASE}/api/inventory/${batchId}/analyses/${analysisId}/report.pdf?token=${localStorage.getItem("token") || ""}`,

  // Sustainability Intelligence
  getBatchSustainability: (batchId) => request(`/api/sustainability/batches/${batchId}`),
  getCircularEconomySummary: () => request("/api/sustainability/circular-economy-summary"),
  getCircularEconomyReportPdfUrl: () => `${API_BASE}/api/sustainability/circular-economy-report.pdf?token=${localStorage.getItem("token") || ""}`,

  // Datasets & Insights
  listDatasets: () => request("/api/datasets"),
  listMaterialInsights: () => request("/api/material-insights"),

  // Exports
  getExcelClassificationExportUrl: () => `${API_BASE}/api/exports/classification-report.xlsx?token=${localStorage.getItem("token") || ""}`,
  getExcelSustainabilityExportUrl: () => `${API_BASE}/api/exports/sustainability-report.xlsx?token=${localStorage.getItem("token") || ""}`,

  // Notifications
  listNotifications: () => request("/api/notifications"),
  markNotificationRead: (id) => request(`/api/notifications/${id}/read`, { method: "PATCH" }),
  markAllNotificationsRead: () => request("/api/notifications/read-all", { method: "POST" }),
};
