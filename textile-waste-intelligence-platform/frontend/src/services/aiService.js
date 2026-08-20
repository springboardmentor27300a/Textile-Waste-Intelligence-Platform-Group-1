import api from './api';

export const aiService = {
  analyze: (payload) => api.post('/api/ai/analyze', payload),
  history: () => api.get('/api/ai/history'),
  getHistoryDetail: (id) => api.get(`/api/ai/history/${id}`),
  stats: () => api.get('/api/ai/stats'),
};