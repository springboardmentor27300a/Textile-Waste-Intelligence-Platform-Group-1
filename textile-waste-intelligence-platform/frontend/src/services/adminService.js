import api from './api';

export const adminService = {
  login: (payload) => api.post('/api/admin/login', payload),
  getStats: () => api.get('/api/admin/dashboard-stats'),
  getLogs: () => api.get('/api/admin/logs'),
};
