import {
  Package,
  Recycle,
  Clock,
  Weight,
} from "lucide-react";

import useInventory from "../../hooks/useInventory";
import StatCard from "../dashboard/StatCard";

function InventoryStats() {

  const {

    statistics,

    loading,

  } = useInventory();

  if (loading) {

    return (

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        {Array.from({ length: 4 }).map((_, index) => (

          <div
            key={index}
            className="h-36 animate-pulse rounded-3xl bg-slate-100"
          />

        ))}

      </div>

    );

  }

  return (

    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      <StatCard
        title="Total Batches"
        value={statistics?.total_batches ?? 0}
        icon={Package}
        color="text-blue-600"
      />

      <StatCard
        title="Total Quantity"
        value={`${statistics?.total_quantity ?? 0} kg`}
        icon={Weight}
        color="text-violet-600"
      />

      <StatCard
        title="Recyclable"
        value={`${statistics?.recyclable_quantity ?? 0} kg`}
        icon={Recycle}
        color="text-green-600"
      />

      <StatCard
        title="Pending Review"
        value={statistics?.pending_review ?? 0}
        icon={Clock}
        color="text-orange-600"
      />

    </div>

  );

}

export default InventoryStats;