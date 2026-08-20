import axios from "axios";

const configuredBaseUrl =
  import.meta.env.VITE_API_BASE_URL;

const apiBaseUrl = configuredBaseUrl
  ? configuredBaseUrl.endsWith("/api")
    ? configuredBaseUrl
    : `${configuredBaseUrl}/api`
  : "http://127.0.0.1:8000/api";

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
