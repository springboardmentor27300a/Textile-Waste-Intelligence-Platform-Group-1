import api from './api';

export const authService = {
  register: (payload) => api.post('/api/auth/register', payload),
  login: (payload) => api.post('/api/auth/login', payload),
  getProfile: () => api.get('/api/auth/profile'),
  updateProfile: (payload) => api.put('/api/auth/profile', payload),
};
