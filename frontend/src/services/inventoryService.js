import inventoryApi from "../api/inventoryApi";

class InventoryService {
    async getAll() {
        try {
            return await inventoryApi.getAll();
        } catch (error) {
            console.error("Failed to fetch inventory:", error);
            throw error;
        }
    }

    async getById(id) {
        try {
            return await inventoryApi.getById(id);
        } catch (error) {
            console.error("Failed to fetch inventory item:", error);
            throw error;
        }
    }

    async getStatistics() {
        try {
            return await inventoryApi.getStatistics();
        } catch (error) {
            console.error("Failed to fetch inventory statistics:", error);
            throw error;
        }
    }

    async create(data) {
        try {
            return await inventoryApi.create(data);
        } catch (error) {
            console.error("Failed to create inventory item:", error);
            throw error;
        }
    }

    async update(id, data) {
        try {
            return await inventoryApi.update(id, data);
        } catch (error) {
            console.error("Failed to update inventory item:", error);
            throw error;
        }
    }

    async delete(id) {
        try {
            return await inventoryApi.delete(id);
        } catch (error) {
            console.error("Failed to delete inventory item:", error);
            throw error;
        }
    }
}

const inventoryService = new InventoryService();

export default inventoryService;