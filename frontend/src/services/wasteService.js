import api from './api';

export const wasteService = {
  submit: (payload) => api.post('/api/textile', payload),
  create: (payload) => api.post('/api/textile', payload),
  listMySubmissions: () => api.get('/api/textile'),
  listAll: (search) => api.get('/api/textile', { params: search ? { search } : {} }),
  list: (params) => api.get('/api/textile', { params }),
  get: (id) => api.get(`/api/textile/${id}`),
  update: (id, payload) => api.put(`/api/textile/${id}`, payload),
  delete: (id) => api.delete(`/api/textile/${id}`),
  remove: (id) => api.delete(`/api/textile/${id}`),
  stats: () => api.get('/api/textile/stats'),
};
