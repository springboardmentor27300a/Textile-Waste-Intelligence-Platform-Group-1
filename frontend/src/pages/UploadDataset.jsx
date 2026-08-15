import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadDataset } from "../services/datasetService";

function UploadDataset() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a CSV file to upload.");
      return;
    }

    setError("");
    try {
      setLoading(true);
      await uploadDataset(file);
      navigate("/datasets");
    } catch (err) {
      console.error(err);
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Upload Dataset</h1>
        <p>Add a new dataset file to the platform.</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="card" style={{ maxWidth: 480 }}>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Choose CSV file</label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>

          {file && (
            <div className="hint">
              Selected file: <strong>{file.name}</strong>
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/datasets")}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Uploading…" : "Upload dataset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadDataset;
