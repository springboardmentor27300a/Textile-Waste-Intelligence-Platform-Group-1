import api from "./axios";

/**
 * Get all waste sources
 */
export const getWasteSources = async (params = {}) => {
  const response = await api.get("/waste-sources", {
    params,
  });

  return response.data;
};

/**
 * Get waste source by ID
 */
export const getWasteSourceById = async (id) => {
  const response = await api.get(`/waste-sources/${id}`);

  return response.data;
};

/**
 * Create a new waste source
 */
export const createWasteSource = async (data) => {
  const response = await api.post("/waste-sources", data);

  return response.data;
};

/**
 * Update waste source
 */
export const updateWasteSource = async (id, data) => {
  const response = await api.put(
    `/waste-sources/${id}`,
    data
  );

  return response.data;
};

/**
 * Delete waste source
 */
export const deleteWasteSource = async (id) => {
  const response = await api.delete(
    `/waste-sources/${id}`
  );

  return response.data;
};

/**
 * Dashboard statistics
 * (We'll implement this endpoint later.)
 */
export const getWasteSourceStats = async () => {
  const response = await api.get(
    "/waste-sources/dashboard"
  );

  return response.data;
};