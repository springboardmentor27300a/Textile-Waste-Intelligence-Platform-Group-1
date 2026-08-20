import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import CollectionForm from "../../components/collection/CollectionForm";
import useCollections from "../../hooks/useCollections";

function EditCollection() {
  const { id } = useParams();

  const navigate = useNavigate();

  const {
    getById,
    updateCollection,
    updating,
  } = useCollections();

  const [collection, setCollection] =
    useState(null);

  useEffect(() => {
    async function load() {
      const data = await getById(id);
      setCollection(data);
    }

    load();
  }, [id]);

  const handleSubmit = async (formData) => {
    await updateCollection({
      id,
      data: formData,
    });

    navigate("/collections");
  };

  if (!collection)
    return <p>Loading...</p>;

  return (
    <div className="mx-auto max-w-7xl">

      <h1 className="mb-8 text-3xl font-bold">
        Edit Collection
      </h1>

      <CollectionForm
        defaultValues={collection}
        onSubmit={handleSubmit}
        loading={updating}
      />

    </div>
  );
}

export default EditCollection;