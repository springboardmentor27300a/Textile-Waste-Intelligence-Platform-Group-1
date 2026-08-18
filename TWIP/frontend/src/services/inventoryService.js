import api from './api';

const inventoryService = {
  getInventory: async (params = {}) => {
    const response = await api.get('/api/inventory', { params });
    return response.data; // Returns { total, page, size, pages, items }
  },

  getWasteBatch: async (id) => {
    const response = await api.get(`/api/inventory/${id}`);
    return response.data;
  },

  createWasteBatch: async (batchData) => {
    const response = await api.post('/api/inventory', batchData);
    return response.data;
  },

  updateWasteBatch: async (id, batchData) => {
    const response = await api.put(`/api/inventory/${id}`, batchData);
    return response.data;
  },

  deleteWasteBatch: async (id) => {
    const response = await api.delete(`/api/inventory/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/api/inventory/stats');
    return response.data; // Returns { total_records, total_quantity, recent_entries, status_distribution, fabric_distribution }
  },

  getDatasets: async () => {
    const response = await api.get('/api/datasets');
    return response.data;
  },

  analyzeImage: async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);
    const response = await api.post('/api/classification/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getSustainabilityStats: async () => {
    const response = await api.get('/api/sustainability/stats');
    return response.data;
  },

  getSustainabilityBenchmarks: async () => {
    const response = await api.get('/api/sustainability/benchmarks');
    return response.data;
  },

  getBatchRecommendations: async (id) => {
    const response = await api.get(`/api/sustainability/recommendations/${id}`);
    return response.data;
  },

  getSustainabilityDashboard: async (entityId) => {
    const response = await api.get(`/api/dashboard/sustainability/${entityId}`);
    return response.data;
  },

  getDashboardSummary: async () => {
    const response = await api.get('/api/dashboard/summary');
    return response.data;
  },

  saveRecommendations: async (batchId) => {
    const response = await api.post('/api/recommendations', { batch_id: batchId });
    return response.data;
  },

  saveSustainabilityMetrics: async (batchId) => {
    const response = await api.post('/api/sustainability/calculate', { batch_id: batchId });
    return response.data;
  }
};

export default inventoryService;
