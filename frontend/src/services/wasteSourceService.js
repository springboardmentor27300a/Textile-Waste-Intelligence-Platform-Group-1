import toast from "react-hot-toast";

import {
  getWasteSources,
  getWasteSourceById,
  createWasteSource,
  updateWasteSource,
  deleteWasteSource,
  getWasteSourceStats,
} from "../api/wasteSourceApi";

class WasteSourceService {
  async getAll(params = {}) {
    try {
      return await getWasteSources(params);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getById(id) {
    try {
      return await getWasteSourceById(id);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async create(data) {
    try {
      const response = await createWasteSource(data);

      toast.success("Waste source created successfully.");

      return response;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const response = await updateWasteSource(id, data);

      toast.success("Waste source updated successfully.");

      return response;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const response = await deleteWasteSource(id);

      toast.success("Waste source deleted successfully.");

      return response;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getStats() {
    try {
      return await getWasteSourceStats();
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  handleError(error) {
    const message =
      error?.response?.data?.detail ||
      error?.message ||
      "Something went wrong.";

    toast.error(message);

    console.error(error);
  }
}

export default new WasteSourceService();