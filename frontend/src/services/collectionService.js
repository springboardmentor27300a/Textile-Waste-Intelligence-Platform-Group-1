import toast from "react-hot-toast";

import {
  getCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
  getCollectionStats,
} from "../api/collectionApi";

class CollectionService {
  async getAll(params = {}) {
    try {
      return await getCollections(params);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getById(id) {
    try {
      return await getCollectionById(id);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async create(data) {
    try {
      const response = await createCollection(data);
      toast.success("Collection created successfully.");
      return response;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const response = await updateCollection(id, data);
      toast.success("Collection updated successfully.");
      return response;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const response = await deleteCollection(id);
      toast.success("Collection deleted successfully.");
      return response;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getStats() {
    try {
      return await getCollectionStats();
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

export default new CollectionService();