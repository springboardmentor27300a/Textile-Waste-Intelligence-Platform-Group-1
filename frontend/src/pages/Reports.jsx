import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";

export default function Reports() {
  const [batchId, setBatchId] = useState("4");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadReports = async () => {
    try {
      const response = await apiClient.get("/reports");
      setReports(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const generateReport = async (format) => {
    if (!batchId) {
      setError("Enter a batch ID.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await apiClient.post(
        `/reports/generate/${batchId}/${format}`
      );

      setMessage(
        `${format === "pdf" ? "PDF" : "Excel"} report generated successfully.`
      );

      await loadReports();

      // Automatically download generated report
      const reportId = response.data.report_id;

      const fileResponse = await apiClient.get(
        `/reports/download/${reportId}`,
        {
          responseType: "blob",
        }
      );

      const blobUrl = window.URL.createObjectURL(
        new Blob([fileResponse.data])
      );

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = response.data.file_name;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          "Unable to generate report."
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (report) => {
    try {
      const response = await apiClient.get(
        `/reports/download/${report.id}`,
        {
          responseType: "blob",
        }
      );

      const blobUrl = window.URL.createObjectURL(
        new Blob([response.data])
      );

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = report.file_name;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(err);
      setError("Unable to download report.");
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">
            REPORTING
          </div>

          <h1>Reports</h1>

          <p>
            Generate operational and sustainability
            intelligence reports.
          </p>
        </div>
      </div>

      {message && (
        <div
          style={{
            marginBottom: "20px",
            padding: "14px 18px",
            borderRadius: "8px",
            background: "#eaf7ef",
            color: "#176b43",
          }}
        >
          {message}
        </div>
      )}

      {error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "14px 18px",
            borderRadius: "8px",
            background: "#fdecec",
            color: "#a32626",
          }}
        >
          {error}
        </div>
      )}

      <div className="card">
        <h2>Generate Report</h2>

        <p>
          Generate a detailed report from an analyzed
          textile waste batch.
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "end",
            marginTop: "20px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
              }}
            >
              Batch ID
            </label>

            <input
              type="number"
              min="1"
              value={batchId}
              onChange={(e) =>
                setBatchId(e.target.value)
              }
              style={{
                padding: "10px 12px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                width: "150px",
              }}
            />
          </div>

          <button
            onClick={() => generateReport("pdf")}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "Generating..." : "Generate PDF"}
          </button>

          <button
            onClick={() => generateReport("excel")}
            disabled={loading}
            className="btn-secondary"
          >
            {loading ? "Generating..." : "Generate Excel"}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: "24px" }}>
        <h2>Generated Reports</h2>

        {reports.length === 0 ? (
          <p>No reports generated yet.</p>
        ) : (
          <div
            style={{
              overflowX: "auto",
              marginTop: "16px",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th style={cellStyle}>Report</th>
                  <th style={cellStyle}>Format</th>
                  <th style={cellStyle}>Created</th>
                  <th style={cellStyle}>Action</th>
                </tr>
              </thead>

              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td style={cellStyle}>
                      {report.title}
                    </td>

                    <td style={cellStyle}>
                      {report.file_format}
                    </td>

                    <td style={cellStyle}>
                      {report.created_at
                        ? new Date(
                            report.created_at
                          ).toLocaleString()
                        : "-"}
                    </td>

                    <td style={cellStyle}>
                      <button
                        onClick={() =>
                          downloadReport(report)
                        }
                        className="btn-primary"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const cellStyle = {
  padding: "12px",
  borderBottom: "1px solid #e5e5e5",
  textAlign: "left",
};