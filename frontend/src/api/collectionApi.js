import api from "./axios";

const COLLECTION_ENDPOINT = "/collections/";

export const getCollections = async (params = {}) => {
  const response = await api.get(COLLECTION_ENDPOINT, { params });
  return response.data;
};

export const getCollectionById = async (id) => {
  const response = await api.get(`${COLLECTION_ENDPOINT}${id}`);
  return response.data;
};

export const createCollection = async (data) => {
  const response = await api.post(COLLECTION_ENDPOINT, data);
  return response.data;
};

export const updateCollection = async (id, data) => {
  const response = await api.put(`${COLLECTION_ENDPOINT}${id}`, data);
  return response.data;
};

export const deleteCollection = async (id) => {
  const response = await api.delete(`${COLLECTION_ENDPOINT}${id}`);
  return response.data;
};

export const getCollectionStats = async () => {
  const response = await api.get(`${COLLECTION_ENDPOINT}dashboard`);
  return response.data;
};
