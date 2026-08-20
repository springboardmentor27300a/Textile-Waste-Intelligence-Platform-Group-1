import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import useCollections from "../../hooks/useCollections";

function ViewCollection() {
  const { id } = useParams();

  const { getById } = useCollections();

  const [collection, setCollection] =
    useState(null);

  useEffect(() => {
    async function load() {
      const data = await getById(id);
      setCollection(data);
    }

    load();
  }, [id]);

  if (!collection)
    return <p>Loading...</p>;

  return (
    <div className="rounded-2xl bg-card p-8 shadow-sm">

      <h1 className="mb-8 text-3xl font-bold">
        Collection Details
      </h1>

      <div className="grid gap-6 md:grid-cols-2">

        <div>
          <strong>Collection Code</strong>
          <p>{collection.collection_code}</p>
        </div>

        <div>
          <strong>Waste Source ID</strong>
          <p>{collection.waste_source_id}</p>
        </div>

        <div>
          <strong>Collection Date</strong>
          <p>{collection.collection_date}</p>
        </div>

        <div>
          <strong>Collected By</strong>
          <p>{collection.collected_by}</p>
        </div>

        <div>
          <strong>Vehicle Number</strong>
          <p>{collection.vehicle_number || "-"}</p>
        </div>

        <div>
          <strong>Method</strong>
          <p>{collection.collection_method}</p>
        </div>

        <div>
          <strong>Total Weight</strong>
          <p>{collection.total_weight} kg</p>
        </div>

        <div>
          <strong>Status</strong>
          <p>{collection.collection_status}</p>
        </div>

        <div className="md:col-span-2">
          <strong>Remarks</strong>
          <p>{collection.remarks || "No remarks."}</p>
        </div>

      </div>

    </div>
  );
}

export default ViewCollection;