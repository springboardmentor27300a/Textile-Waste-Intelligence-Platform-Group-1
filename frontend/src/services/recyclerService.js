import api from './api';

export const getAllRecyclers = async () => {
  const response = await api.get('/recyclers');
  return response.data;
};

export const getRecyclerById = async (id) => {
  const response = await api.get(`/recyclers/${id}`);
  return response.data;
};

export const createRecycler = async (data) => {
  const response = await api.post('/recyclers', data);
  return response.data;
};

export const updateRecycler = async (id, data) => {
  const response = await api.put(`/recyclers/${id}`, data);
  return response.data;
};

export const deleteRecycler = async (id) => {
  const response = await api.delete(`/recyclers/${id}`);
  return response.data;
};

export const getBatchRecyclerMatches = async (batchId) => {
  try {
    const response = await api.get(`/batches/${batchId}/matches`);
    return response.data;
  } catch (err) {
    const fallbackResponse = await api.get(`/inventory/batches/${batchId}/matches`);
    return fallbackResponse.data;
  }
};

export default {
  getAllRecyclers,
  getRecyclerById,
  createRecycler,
  updateRecycler,
  deleteRecycler,
  getBatchRecyclerMatches
};
