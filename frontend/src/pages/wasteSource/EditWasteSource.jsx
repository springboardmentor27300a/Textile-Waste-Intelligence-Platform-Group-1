import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import WasteSourceForm from "../../components/wasteSource/WasteSourceForm";
import useWasteSources from "../../hooks/useWasteSources";

function EditWasteSource() {
  const { id } = useParams();

  const navigate = useNavigate();

  const {
    getById,
    updateSource,
    updating,
  } = useWasteSources();

  const [source, setSource] = useState(null);

  useEffect(() => {
    async function loadSource() {
      const data = await getById(id);
      setSource(data);
    }

    loadSource();
  }, [id]);

  const handleSubmit = async (formData) => {
    await updateSource({
        id,
        data: formData,
    });

    navigate("/waste-sources");
  };

  if (!source) {
    return <p>Loading...</p>;
  }

  return (
    <div className="mx-auto max-w-7xl">

      <h1 className="mb-8 text-3xl font-bold">
        Edit Waste Source
      </h1>

      <WasteSourceForm
        defaultValues={source}
        onSubmit={handleSubmit}
        loading={updating}
      />

    </div>
  );
}

export default EditWasteSource;