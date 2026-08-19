import apiClient from "../api/apiClient";


export async function getMyOrganization() {
  const response = await apiClient.get("/organizations/me");
  return response.data;
}


export async function createOrganization(data) {
  const response = await apiClient.post("/organizations", data);
  return response.data;
}


export async function updateMyOrganization(data) {
  const response = await apiClient.patch("/organizations/me", data);
  return response.data;
}