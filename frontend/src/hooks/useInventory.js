import { useCallback, useEffect, useMemo, useState } from "react";
import inventoryService from "../services/inventoryService";

const useInventory = () => {
    const [inventory, setInventory] = useState([]);
    const [statistics, setStatistics] = useState({});

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchInventory = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await inventoryService.getAll();

            setInventory(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err);
            setInventory([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStatistics = useCallback(async () => {
        try {
            const data = await inventoryService.getStatistics();
            setStatistics(data || {});
        } catch (err) {
            console.error(err);
            setStatistics({});
        }
    }, []);

    const getInventoryById = async (id) => {
        try {
            return await inventoryService.getById(id);
        } catch (err) {
            setError(err);
            throw err;
        }
    };

    const createInventory = async (payload) => {
        try {
            setLoading(true);

            const response = await inventoryService.create(payload);

            await Promise.all([
                fetchInventory(),
                fetchStatistics(),
            ]);

            return response;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateInventory = async (id, payload) => {
        try {
            setLoading(true);

            const response = await inventoryService.update(id, payload);

            await Promise.all([
                fetchInventory(),
                fetchStatistics(),
            ]);

            return response;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteInventory = async (id) => {
        try {
            setLoading(true);

            await inventoryService.delete(id);

            await Promise.all([
                fetchInventory(),
                fetchStatistics(),
            ]);
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
        fetchStatistics();
    }, [fetchInventory, fetchStatistics]);

    // Total textile waste
    const totalWaste = useMemo(() => {
        return inventory.reduce(
            (sum, item) => sum + Number(item.quantity || 0),
            0
        );
    }, [inventory]);

    // Recyclable waste
    const recyclableWaste = useMemo(() => {
        return inventory
            .filter((item) =>
                ["Excellent", "Good", "Fair"].includes(item.condition)
            )
            .reduce(
                (sum, item) => sum + Number(item.quantity || 0),
                0
            );
    }, [inventory]);

    // Estimated CO₂ savings
    const carbonSavings = useMemo(() => {
        return Number((totalWaste * 0.012).toFixed(2));
    }, [totalWaste]);

    // Recovery percentage
    const recoveryRate = useMemo(() => {
        if (totalWaste === 0) return 0;

        return Math.round(
            (recyclableWaste / totalWaste) * 100
        );
    }, [recyclableWaste, totalWaste]);

    return {
        inventory,
        statistics,

        totalWaste,
        recyclableWaste,
        carbonSavings,
        recoveryRate,

        loading,
        error,

        fetchInventory,
        fetchStatistics,

        getInventoryById,
        createInventory,
        updateInventory,
        deleteInventory,
    };
};

export default useInventory;