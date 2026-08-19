import apiClient from "../api/apiClient";


export async function getFacilities() {
  const response = await apiClient.get("/facilities");
  return response.data;
}


export async function getFacility(facilityId) {
  const response = await apiClient.get(
    `/facilities/${facilityId}`
  );

  return response.data;
}


export async function createFacility(data) {
  const response = await apiClient.post(
    "/facilities",
    data
  );

  return response.data;
}


export async function updateFacility(
  facilityId,
  data
) {
  const response = await apiClient.patch(
    `/facilities/${facilityId}`,
    data
  );

  return response.data;
}