import { useNavigate } from "react-router-dom";

import WasteSourceForm from "../../components/wasteSource/WasteSourceForm";
import useWasteSources from "../../hooks/useWasteSources";

function AddWasteSource() {
  const navigate = useNavigate();

  const {
    createSource,
    creating,
  } = useWasteSources();

  const handleSubmit = async (data) => {
    try {
      await createSource(data);

      navigate("/waste-sources");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-heading">
          Add Waste Source
        </h1>

        <p className="mt-2 text-muted">
          Register a new textile waste source.
        </p>

      </div>

      <WasteSourceForm
        onSubmit={handleSubmit}
        loading={creating}
      />

    </div>
  );
}

export default AddWasteSource;