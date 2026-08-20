import apiClient from "../api/apiClient";

export async function getDashboardAnalytics() {
  const response = await apiClient.get(
    "/dashboard/analytics"
  );

  return response.data;
}