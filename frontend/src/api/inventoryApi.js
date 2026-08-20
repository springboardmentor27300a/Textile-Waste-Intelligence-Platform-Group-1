import axios from "./axios";

const INVENTORY_ENDPOINT = "/inventory/";

export const getInventory = () => axios.get(INVENTORY_ENDPOINT);
export const getInventoryById = (id) => axios.get(`${INVENTORY_ENDPOINT}${id}`);
export const getInventoryStatistics = () => axios.get(`${INVENTORY_ENDPOINT}statistics`);
export const createInventory = (data) => axios.post(INVENTORY_ENDPOINT, data);
export const updateInventory = (id, data) => axios.put(`${INVENTORY_ENDPOINT}${id}`, data);
export const deleteInventory = (id) => axios.delete(`${INVENTORY_ENDPOINT}${id}`);

export const inventoryApi = {
  getAll: async () => (await getInventory()).data,
  getById: async (id) => (await getInventoryById(id)).data,
  getStatistics: async () => (await getInventoryStatistics()).data,
  create: async (data) => (await createInventory(data)).data,
  update: async (id, data) => (await updateInventory(id, data)).data,
  delete: async (id) => (await deleteInventory(id)).data,
};

export default inventoryApi;
