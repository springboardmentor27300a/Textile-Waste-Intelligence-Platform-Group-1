import api from './api';

export const recyclingService = {
  dashboard: (params) => api.get('/api/recycling/dashboard', { params }),
  opportunities: (params) => api.get('/api/recycling/opportunities', { params }),
};
