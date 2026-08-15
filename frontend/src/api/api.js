import axios from "axios";

// Use the same relative "/api" base as the rest of the app so requests go
// through Vite's dev-server proxy (see vite.config.js) instead of a
// hardcoded host/port that breaks outside of local, non-Docker dev.
const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  // Use the same localStorage key that AuthContext writes on login, so
  // requests made through this client are actually authenticated.
  const token = localStorage.getItem("twip_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
