import { useNavigate } from "react-router-dom";

import CollectionForm from "../../components/collection/CollectionForm";
import useCollections from "../../hooks/useCollections";

function AddCollection() {
  const navigate = useNavigate();

  const {
    createCollection,
    creating,
  } = useCollections();

  const handleSubmit = async (data) => {
    try {
      await createCollection(data);

      navigate("/collections", {
        replace: true,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">

      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          Add Collection
        </h1>

        <p className="mt-2 text-muted">
          Record a new textile waste collection.
        </p>

      </div>

      <CollectionForm
        onSubmit={handleSubmit}
        loading={creating}
      />

    </div>
  );
}

export default AddCollection;