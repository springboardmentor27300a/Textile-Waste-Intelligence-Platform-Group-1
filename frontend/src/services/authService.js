import api from './api';

const authService = {
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data; // Returns { access_token, token_type, user }
  },

  register: async (fullName, email, password, role, phoneNumber = null) => {
    const response = await api.post('/api/auth/register', {
      full_name: fullName,
      email,
      password,
      role,
      phone_number: phoneNumber
    });
    return response.data; // Returns user info
  },

  getProfile: async () => {
    const response = await api.get('/api/auth/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/api/auth/profile', profileData);
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get('/api/auth/users');
    return response.data;
  }
};

export default authService;
