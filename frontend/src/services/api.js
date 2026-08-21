import axios from 'axios';

// Base URL points to the FastAPI Python backend
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({ baseURL });

// Interceptor to automatically attach the appropriate JWT token
api.interceptors.request.use((config) => {
  // Determine if this is an admin-specific endpoint
  const isAdminRequest = config.url.includes('/api/admin') || 
                         (config.url.includes('/api/waste') && 
                          !config.url.includes('/my-submissions') && 
                          localStorage.getItem('twip_admin_token'));
                          
  if (isAdminRequest) {
    const adminToken = localStorage.getItem('twip_admin_token');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
  } else {
    const userToken = localStorage.getItem('twip_token');
    if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }
  }
  
  return config;
});

// Centralized interceptor to handle token expiration/unauthorized errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      const isAdminRequest = error.config.url.includes('/api/admin');
      
      if (isAdminRequest) {
        localStorage.removeItem('twip_admin_token');
        localStorage.removeItem('twip_admin_user');
        if (window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        }
      } else {
        localStorage.removeItem('twip_token');
        localStorage.removeItem('twip_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
