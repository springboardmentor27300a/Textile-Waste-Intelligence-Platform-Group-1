import api from './api';

export const userService = {
  list: (params) => api.get('/api/users', { params }),
  create: (payload) => api.post('/api/users', payload),
  update: (id, payload) => api.put(`/api/users/${id}`, payload),
  remove: (id) => api.delete(`/api/users/${id}`),
  updateStatus: (id, status) => api.patch(`/api/users/${id}/status`, { status }),
  updateRole: (id, role) => api.patch(`/api/users/${id}/role`, { role }),
  getById: (id) => api.get(`/api/users/${id}`),
};
