import api from './api';

export const getAllRecyclers = async () => {
  const response = await api.get('/api/recyclers');
  return response.data;
};

export const getRecyclerById = async (id) => {
  const response = await api.get(`/api/recyclers/${id}`);
  return response.data;
};

export const createRecycler = async (data) => {
  const response = await api.post('/api/recyclers', data);
  return response.data;
};

export const updateRecycler = async (id, data) => {
  const response = await api.put(`/api/recyclers/${id}`, data);
  return response.data;
};

export const deleteRecycler = async (id) => {
  const response = await api.delete(`/api/recyclers/${id}`);
  return response.data;
};

export const getBatchRecyclerMatches = async (batchId) => {
  const response = await api.get(`/api/batches/${batchId}/matches`);
  return response.data;
};

export default {
  getAllRecyclers,
  getRecyclerById,
  createRecycler,
  updateRecycler,
  deleteRecycler,
  getBatchRecyclerMatches
};
