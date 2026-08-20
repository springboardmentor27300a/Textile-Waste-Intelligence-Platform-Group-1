/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import {
  getInventory,
  createInventory,
  updateInventory,
  deleteInventory,
} from "../api/inventoryApi";

export const InventoryContext = createContext(null);

export function InventoryProvider({ children }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  // ============================
  // Fetch Inventory
  // ============================

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);

      console.log("Before API");

      const response = await getInventory();

      console.log("After API", response);

      // Handles both:
      // response.data = [...]
      // response = [...]
      const data = response?.data ?? response ?? [];

      setInventory(Array.isArray(data) ? data : []);
    } catch (error) {
        console.log("Inventory Error:", error);
        console.log("Response:", error.response);
        console.log("Request:", error.request);
        console.log("Message:", error.message);

        setInventory([]);
      } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // ============================
  // Add
  // ============================

  const addWaste = async (waste) => {
    try {
      await createInventory(waste);
      await fetchInventory();
      return true;
    } catch (error) {
      console.error("Failed to add inventory:", error);
      return false;
    }
  };

  // ============================
  // Update
  // ============================

  const updateWaste = async (id, updatedWaste) => {
    try {
      await updateInventory(id, updatedWaste);
      await fetchInventory();
      return true;
    } catch (error) {
      console.error("Failed to update inventory:", error);
      return false;
    }
  };

  // ============================
  // Delete
  // ============================

  const deleteWaste = async (id) => {
    try {
      await deleteInventory(id);
      await fetchInventory();
      return true;
    } catch (error) {
      console.error("Failed to delete inventory:", error);
      return false;
    }
  };

  // ============================
  // Statistics
  // ============================

  const totalWaste = inventory.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        loading,
        totalWaste,
        fetchInventory,
        addWaste,
        updateWaste,
        deleteWaste,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}