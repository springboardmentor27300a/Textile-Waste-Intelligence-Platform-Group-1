import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

function Dataset() {
  const [datasets, setDatasets] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [uploadedList, recommendedList] = await Promise.all([
        api.getDatasets().catch(() => []),
        api.getRecommendedDatasets().catch(() => []),
      ]);
      setDatasets(uploadedList || []);
      setRecommended(recommendedList || []);
    } catch (err) {
      console.error(err);
      setError("Could not load datasets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredDatasets = datasets.filter((item) =>
    (item.file_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1>Textile Waste Datasets & AI Baseline Models</h1>
        <p>Explore standard benchmark textile classification datasets and custom training data repositories.</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="hero-card" style={{ marginBottom: 20 }}>
        <div>
          <div className="stat-label">Dataset Integration Repository</div>
          <h3>5 Standard Textile Image & Classification Datasets</h3>
          <p>
            Supports fabric classification, garment recognition, texture mapping, and sustainable waste categorization workflows.
          </p>
        </div>
        <div className="hero-badge">5 Datasets Active</div>
      </div>

      <h2 style={{ fontSize: 18, marginBottom: 12, color: "var(--moss-dark)" }}>
        Standard Benchmark Datasets
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {recommended.map((item) => (
          <div key={item.id} className="section-card" style={{ background: "#ffffff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <strong style={{ fontSize: 16, color: "#2b4130" }}>{item.name}</strong>
              <span className="pill" style={{ background: "#e9efe4", color: "#2b4130", fontSize: 11 }}>
                {item.accuracy_baseline} Baseline
              </span>
            </div>
            <p style={{ fontSize: 13, color: "#52604f", margin: "8px 0 12px 0", lineHeight: 1.5 }}>
              {item.description}
            </p>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7768", textTransform: "uppercase", marginBottom: 4 }}>
                Key Purposes
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {item.purpose.map((p) => (
                  <span key={p} style={{ background: "rgba(55,88,110,0.08)", color: "var(--denim)", padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600 }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7768", paddingTop: 8, borderTop: "1px dashed var(--line)" }}>
              <span>Sample count: <strong>{item.sample_count.toLocaleString()}</strong></span>
              <span>Categories: <strong>{item.categories.length}</strong></span>
            </div>
          </div>
        ))}
      </div>

      <div className="toolbar">
        <h2 style={{ fontSize: 18, margin: 0, color: "var(--moss-dark)" }}>Uploaded Project Datasets</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            placeholder="Search uploaded datasets…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ borderRadius: 8, border: "1px solid var(--line)", padding: "6px 12px", fontSize: 13 }}
          />
          <Link className="btn btn-primary" to="/datasets/upload">
            + Upload Custom Dataset
          </Link>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        {loading ? (
          <p className="empty-state">Loading datasets…</p>
        ) : filteredDatasets.length === 0 ? (
          <p className="empty-state">No custom datasets uploaded yet. Click "+ Upload Custom Dataset" to add one.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>File name</th>
                <th>Uploaded by</th>
                <th>Upload date</th>
              </tr>
            </thead>
            <tbody>
              {filteredDatasets.map((item) => (
                <tr key={item.id}>
                  <td className="mono">{item.id}</td>
                  <td><strong>{item.file_name}</strong></td>
                  <td>User #{item.uploaded_by || "System"}</td>
                  <td>{new Date(item.uploaded_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dataset;
