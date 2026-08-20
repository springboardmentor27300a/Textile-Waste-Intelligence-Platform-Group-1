import { Link } from "react-router-dom";
import {
    Plus,
    Search,
    Filter,
    RotateCcw,
    ArrowUpDown,
} from "lucide-react";

import { Button } from "../ui";

function InventoryToolbar({
    search,
    onSearchChange,

    fabricFilter,
    onFabricChange,

    conditionFilter,
    onConditionChange,

    statusFilter,
    onStatusChange,

    sortBy,
    onSortChange,

    onClearFilters,
}) {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-lg">

            {/* Header */}

            <div className="border-b border-slate-200 px-8 py-6">

                <h2 className="text-2xl font-bold text-slate-800">
                    Inventory Management
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                    Search, filter and manage textile waste inventory.
                </p>

            </div>

            <div className="space-y-6 p-8">

                {/* Search */}

                <div className="relative">

                    <Search
                        size={20}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        value={search}
                        onChange={(e) =>
                            onSearchChange(e.target.value)
                        }
                        placeholder="Search by Batch ID, Fabric, Source, Color, Storage Location, Rack..."
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-3 pl-12 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />

                </div>

                {/* Filters */}

                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                    <div className="flex flex-wrap items-center gap-3">

                        {/* Fabric */}

                        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">

                            <Filter
                                size={16}
                                className="text-slate-500"
                            />

                            <select
                                value={fabricFilter}
                                onChange={(e) =>
                                    onFabricChange(e.target.value)
                                }
                                className="bg-transparent py-3 outline-none"
                            >
                                <option value="">
                                    All Fabrics
                                </option>

                                <option>Cotton</option>
                                <option>Polyester</option>
                                <option>Denim</option>
                                <option>Wool</option>
                                <option>Silk</option>
                                <option>Linen</option>
                                <option>Nylon</option>
                                <option>Rayon</option>
                                <option>Acrylic</option>
                                <option>Mixed Fabric</option>

                            </select>

                        </div>

                        {/* Condition */}

                        <select
                            value={conditionFilter}
                            onChange={(e) =>
                                onConditionChange(e.target.value)
                            }
                            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        >
                            <option value="">
                                All Conditions
                            </option>

                            <option>Excellent</option>
                            <option>Good</option>
                            <option>Fair</option>
                            <option>Poor</option>

                        </select>

                        {/* Status */}

                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                onStatusChange(e.target.value)
                            }
                            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        >
                            <option value="">
                                All Status
                            </option>

                            <option>Available</option>
                            <option>Reserved</option>
                            <option>Processed</option>

                        </select>

                        {/* Sort */}

                        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">

                            <ArrowUpDown
                                size={16}
                                className="text-slate-500"
                            />

                            <select
                                value={sortBy}
                                onChange={(e) =>
                                    onSortChange(e.target.value)
                                }
                                className="bg-transparent py-3 outline-none"
                            >
                                <option value="newest">
                                    Newest First
                                </option>

                                <option value="oldest">
                                    Oldest First
                                </option>

                                <option value="quantityHigh">
                                    Highest Quantity
                                </option>

                                <option value="quantityLow">
                                    Lowest Quantity
                                </option>

                                <option value="fabricAZ">
                                    Fabric A → Z
                                </option>

                                <option value="fabricZA">
                                    Fabric Z → A
                                </option>

                            </select>

                        </div>

                        {/* Clear */}

                        <Button
                            variant="secondary"
                            onClick={onClearFilters}
                        >
                            <div className="flex items-center gap-2">

                                <RotateCcw size={16} />

                                Clear Filters

                            </div>

                        </Button>

                    </div>

                    {/* Register */}

                    <Link to="/inventory/add">

                        <Button>

                            <div className="flex items-center gap-2">

                                <Plus size={18} />

                                Register Waste

                            </div>

                        </Button>

                    </Link>

                </div>

            </div>

        </div>
    );
}

export default InventoryToolbar;