import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import useInventory from "../../hooks/useInventory";

import InventoryStats from "../../Components/inventory/InventoryStats";
import InventoryToolbar from "../../Components/inventory/InventoryToolbar";
import InventoryTable from "../../Components/inventory/InventoryTable";
import InventoryAnalytics from "../../components/inventory/InventoryAnalytics";

function Inventory() {
    const navigate = useNavigate();

    const {
        inventory,
        loading,
        error,
        deleteInventory,
    } = useInventory();

    /* --------------------------------- */
    /* Filters                           */
    /* --------------------------------- */

    const [search, setSearch] = useState("");
    const [fabricFilter, setFabricFilter] = useState("");
    const [conditionFilter, setConditionFilter] =
        useState("");
    const [statusFilter, setStatusFilter] =
        useState("");
    const [sortBy, setSortBy] =
        useState("newest");

    /* --------------------------------- */
    /* Filter Inventory                  */
    /* --------------------------------- */

    const filteredInventory = useMemo(() => {
        let data = [...inventory];

        // Search
        if (search.trim()) {
            const keyword = search.toLowerCase();

            data = data.filter((item) =>
                [
                    item.batch_id,
                    item.fabric,
                    item.source,
                    item.color,
                    item.storage_location,
                    item.rack_number,
                    item.notes,
                ]
                    .join(" ")
                    .toLowerCase()
                    .includes(keyword)
            );
        }

        // Fabric
        if (fabricFilter) {
            data = data.filter(
                (item) =>
                    item.fabric === fabricFilter
            );
        }

        // Condition
        if (conditionFilter) {
            data = data.filter(
                (item) =>
                    item.condition ===
                    conditionFilter
            );
        }

        // Status
        if (statusFilter) {
            data = data.filter(
                (item) =>
                    item.status === statusFilter
            );
        }

        // Sorting
        switch (sortBy) {
            case "oldest":
                data.sort(
                    (a, b) =>
                        new Date(a.collection_date) -
                        new Date(b.collection_date)
                );
                break;

            case "quantityHigh":
                data.sort(
                    (a, b) =>
                        b.quantity - a.quantity
                );
                break;

            case "quantityLow":
                data.sort(
                    (a, b) =>
                        a.quantity - b.quantity
                );
                break;

            case "fabricAZ":
                data.sort((a, b) =>
                    a.fabric.localeCompare(
                        b.fabric
                    )
                );
                break;

            case "fabricZA":
                data.sort((a, b) =>
                    b.fabric.localeCompare(
                        a.fabric
                    )
                );
                break;

            default:
                data.sort(
                    (a, b) =>
                        new Date(b.collection_date) -
                        new Date(a.collection_date)
                );
        }

        return data;
    }, [
        inventory,
        search,
        fabricFilter,
        conditionFilter,
        statusFilter,
        sortBy,
    ]);

    /* --------------------------------- */
    /* Statistics                        */
    /* --------------------------------- */

    const statistics = useMemo(() => {
        const total_batches =
            filteredInventory.length;

        const total_quantity =
            filteredInventory.reduce(
                (sum, item) =>
                    sum +
                    Number(item.quantity || 0),
                0
            );

        const recyclable_quantity =
            filteredInventory
                .filter(
                    (item) =>
                        item.status !==
                        "Processed"
                )
                .reduce(
                    (sum, item) =>
                        sum +
                        Number(
                            item.quantity || 0
                        ),
                    0
                );

        const pending_review =
            filteredInventory.filter(
                (item) =>
                    item.status ===
                    "Reserved"
            ).length;

        return {
            total_batches,
            total_quantity,
            recyclable_quantity,
            pending_review,
        };
    }, [filteredInventory]);

    /* --------------------------------- */

    const clearFilters = () => {
        setSearch("");
        setFabricFilter("");
        setConditionFilter("");
        setStatusFilter("");
        setSortBy("newest");
    };

    const handleDelete = async (item) => {
        try {
            await deleteInventory(item.id);
        } catch (err) {
            console.error(err);

            alert(
                err?.response?.data?.detail ||
                    "Failed to delete inventory."
            );
        }
    };

    /* --------------------------------- */

    if (loading && inventory.length === 0) {
        return (
            <div className="flex items-center justify-center py-20">
                Loading Inventory...
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
                {error?.response?.data?.detail ||
                    "Failed to load inventory."}
            </div>
        );
    }

    return (
        <div className="space-y-8">

            {/* Header */}

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                <div>

                    <h1 className="text-4xl font-bold text-slate-900">
                        Textile Inventory
                    </h1>

                    <p className="mt-3 max-w-3xl text-slate-500">
                        Manage textile waste batches,
                        monitor storage locations,
                        inventory status and recycling
                        workflow from a single place.
                    </p>

                </div>

            </div>

            {/* Statistics */}

            <InventoryStats
                statistics={statistics}
            />

            <InventoryAnalytics />

            {/* Toolbar */}

            <InventoryToolbar
                search={search}
                onSearchChange={setSearch}
                fabricFilter={fabricFilter}
                onFabricChange={
                    setFabricFilter
                }
                conditionFilter={
                    conditionFilter
                }
                onConditionChange={
                    setConditionFilter
                }
                statusFilter={statusFilter}
                onStatusChange={
                    setStatusFilter
                }
                sortBy={sortBy}
                onSortChange={setSortBy}
                onClearFilters={
                    clearFilters
                }
                onAdd={() =>
                    navigate(
                        "/inventory/add"
                    )
                }
            />

            {/* Table */}

            <InventoryTable
                inventory={
                    filteredInventory
                }
                onDelete={handleDelete}
            />

        </div>
    );
}

export default Inventory;