import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import WasteSourceTable from "../../components/wasteSource/WasteSourceTable";
import useWasteSources from "../../hooks/useWasteSources";

function WasteSources() {
  const navigate = useNavigate();

  const {
    wasteSources,
    loading,
    deleteSource,
  } = useWasteSources();

  const [search, setSearch] = useState("");

  const filteredSources = wasteSources.filter((source) => {
    const query = search.toLowerCase();

    return (
      source.organization_name?.toLowerCase().includes(query) ||
      source.contact_person?.toLowerCase().includes(query) ||
      source.city?.toLowerCase().includes(query)
    );
  });

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this waste source?"
    );

    if (!confirmed) return;

    await deleteSource(id);
  };

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>

          <h1 className="text-3xl font-bold text-heading">
            Waste Sources
          </h1>

          <p className="text-muted">
            Manage textile waste source organizations.
          </p>

        </div>

        <button
          onClick={() => navigate("/waste-sources/add")}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-white"
        >
          <Plus size={18} />

          Add Waste Source
        </button>

      </div>

      {/* Search */}

      <div className="rounded-xl bg-card p-4 shadow-sm">

        <input
          type="text"
          placeholder="Search organization..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border px-4 py-3"
        />

      </div>

      {/* Table */}

      <WasteSourceTable
        wasteSources={filteredSources}
        loading={loading}
        onView={(source) =>
          navigate(`/waste-sources/${source.id}`)
        }
        onEdit={(source) =>
          navigate(`/waste-sources/edit/${source.id}`)
        }
        onDelete={(source) =>
          handleDelete(source.id)
        }
      />

    </div>
  );
}

export default WasteSources;