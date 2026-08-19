import apiClient from "../api/apiClient";

export const registerUser = async (payload) => {
  const response = await apiClient.post("/auth/register", payload);
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await apiClient.post("/auth/login", {
    email,
    password,
  });

  return response.data;
};

export const getCurrentUser = async () => {
  const response = await apiClient.get("/auth/me");
  return response.data;
};