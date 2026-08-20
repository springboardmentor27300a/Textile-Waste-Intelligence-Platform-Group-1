import apiClient from "../api/apiClient";

export async function getAnalysis(batchId) {
  const response = await apiClient.get(
    `/analysis/${batchId}`
  );

  return response.data;
}