import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import CollectionTable from "../../components/collection/CollectionTable";
import useCollections from "../../hooks/useCollections";

function Collections() {
  const navigate = useNavigate();

  const {
    collections,
    loading,
    deleteCollection,
  } = useCollections();

  const [search, setSearch] = useState("");

  const filteredCollections = collections.filter((collection) => {
    const query = search.toLowerCase();

    return (
      collection.collection_code?.toLowerCase().includes(query) ||
      collection.collected_by?.toLowerCase().includes(query)
    );
  });

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Delete this collection?"
    );

    if (!confirmed) return;

    await deleteCollection(id);
  };

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">

        <div>

          <h1 className="text-3xl font-bold">
            Collections
          </h1>

          <p className="text-muted">
            Manage textile waste collections.
          </p>

        </div>

        <button
          onClick={() => navigate("/collections/add")}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-white"
        >
          <Plus size={18} />
          Add Collection
        </button>

      </div>

      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        className="w-full rounded-xl border px-4 py-3"
      />

      <CollectionTable
        collections={filteredCollections}
        loading={loading}
        onView={(collection) =>
          navigate(`/collections/${collection.id}`)
        }
        onEdit={(collection) =>
          navigate(`/collections/edit/${collection.id}`)
        }
        onDelete={(collection) =>
          handleDelete(collection.id)
        }
      />

    </div>
  );
}

export default Collections;