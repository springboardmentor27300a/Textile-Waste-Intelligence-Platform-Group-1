import axios from "axios";

const getApiUrl = () => {
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:8000/api`;
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
};

const api = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach dynamic baseURL and JWT token automatically
api.interceptors.request.use((config) => {
  config.baseURL = getApiUrl();
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("twip_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("twip_token");
      localStorage.removeItem("twip_user");
      if (!window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/register")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
