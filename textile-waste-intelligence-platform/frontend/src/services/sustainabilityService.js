import api from './api';

export const sustainabilityService = {
  dashboard: (params) => api.get('/api/sustainability/dashboard', { params }),
  carbon: (params) => api.get('/api/sustainability/carbon', { params }),
  diversion: (params) => api.get('/api/sustainability/diversion', { params }),
};
