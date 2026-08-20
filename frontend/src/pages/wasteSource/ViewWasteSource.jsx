import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import useWasteSources from "../../hooks/useWasteSources";

function ViewWasteSource() {
  const { id } = useParams();

  const { getById } = useWasteSources();

  const [source, setSource] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await getById(id);
      setSource(data);
    }

    load();
  }, [id]);

  if (!source) {
    return <p>Loading...</p>;
  }

  return (
    <div className="rounded-2xl bg-card p-8 shadow-sm">

      <h1 className="mb-8 text-3xl font-bold">
        Waste Source Details
      </h1>

      <div className="grid gap-6 md:grid-cols-2">

        <div>
            <strong>Source Code</strong>
            <p>{source.source_code}</p>
        </div>

        <div>
            <strong>Organization Name</strong>
            <p>{source.organization_name}</p>
        </div>

        <div>
            <strong>Source Type</strong>
            <p>{source.source_type}</p>
        </div>

        <div>
            <strong>Industry</strong>
            <p>{source.industry}</p>
        </div>

        <div>
            <strong>Organization Size</strong>
            <p>{source.organization_size}</p>
        </div>

        <div>
            <strong>Contact Person</strong>
            <p>{source.contact_person}</p>
        </div>

        <div>
            <strong>Email</strong>
            <p>{source.email}</p>
        </div>

        <div>
            <strong>Phone</strong>
            <p>{source.phone}</p>
        </div>

        <div className="md:col-span-2">
            <strong>Address</strong>
            <p>{source.address}</p>
        </div>

        <div>
            <strong>City</strong>
            <p>{source.city}</p>
        </div>

        <div>
            <strong>State</strong>
            <p>{source.state}</p>
        </div>

        <div>
            <strong>Country</strong>
            <p>{source.country}</p>
        </div>

        <div>
            <strong>Postal Code</strong>
            <p>{source.postal_code}</p>
        </div>

        <div>
            <strong>Collection Frequency</strong>
            <p>{source.collection_frequency}</p>
        </div>

        <div>
            <strong>Preferred Collection Day</strong>
            <p>{source.preferred_collection_day || "-"}</p>
        </div>

        <div>
            <strong>Average Monthly Waste</strong>
            <p>{source.average_monthly_waste} kg</p>
        </div>

        <div>
            <strong>Status</strong>
            <p>{source.status}</p>
        </div>

        <div className="md:col-span-2">
            <strong>Notes</strong>
            <p>{source.notes || "No notes available."}</p>
        </div>

        <div>
            <strong>Created At</strong>
            <p>{new Date(source.created_at).toLocaleString()}</p>
        </div>

        <div>
            <strong>Updated At</strong>
            <p>{new Date(source.updated_at).toLocaleString()}</p>
        </div>

        </div>

    </div>
  );
}

export default ViewWasteSource;