import { useEffect, useState } from "react";
import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
} from "lucide-react";

import {
  getWasteBatches,
  updateWasteBatchStatus,
} from "../services/wasteBatchService";


const STATUS_OPTIONS = [
  "",
  "REGISTERED",
  "IMAGE_UPLOADED",
  "ANALYSIS_PENDING",
];


function getErrorMessage(error) {
  const detail = error.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item.msg)
      .join(", ");
  }

  return "Unable to load waste inventory.";
}


export default function WasteInventory() {
  const [items, setItems] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 10,
    total_items: 0,
    total_pages: 1,
  });

  const [filters, setFilters] = useState({
    search: "",
    status: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");


  async function loadBatches(page = 1) {
    setLoading(true);
    setError("");

    try {
      const params = {
        page,
        page_size: 10,
      };

      if (filters.search.trim()) {
        params.search = filters.search.trim();
      }

      if (filters.status) {
        params.status = filters.status;
      }

      const data = await getWasteBatches(params);

      setItems(data.items ?? []);
      setPagination(data.pagination);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadBatches(1);
    // Initial inventory loading.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  function handleFilterChange(event) {
    const { name, value } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }


  function handleSearch(event) {
    event.preventDefault();
    loadBatches(1);
  }


  async function moveToNextStage(batch) {
    let nextStatus = null;

    if (batch.processing_status === "REGISTERED") {
      nextStatus = "IMAGE_UPLOADED";
    } else if (
      batch.processing_status === "IMAGE_UPLOADED"
    ) {
      nextStatus = "ANALYSIS_PENDING";
    }

    if (!nextStatus) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await updateWasteBatchStatus(
        batch.id,
        nextStatus,
        "Status updated from waste inventory."
      );

      setMessage(
        `${batch.batch_code} moved to ${nextStatus}.`
      );

      await loadBatches(pagination.page);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }


  return (
    <div className="page-container">
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            WASTE INVENTORY
          </p>

          <h1>Waste Inventory</h1>

          <p className="page-description">
            Track registered textile waste batches,
            quantities and processing status.
          </p>
        </div>

        <Boxes size={34} />
      </div>

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="content-card">
        <form
          className="form-grid"
          onSubmit={handleSearch}
        >
          <label>
            Search Inventory
            <input
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Batch code or material"
            />
          </label>

          <label>
            Processing Status
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              {STATUS_OPTIONS.map((status) => (
                <option
                  key={status || "ALL"}
                  value={status}
                >
                  {status
                    ? status.replaceAll("_", " ")
                    : "All statuses"}
                </option>
              ))}
            </select>
          </label>

          <div className="form-actions full-width">
            <button
              type="submit"
              className="primary-button"
            >
              <Search size={17} />
              Apply Filters
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                loadBatches(pagination.page)
              }
            >
              <RefreshCw size={17} />
              Refresh
            </button>
          </div>
        </form>
      </div>

      <div className="content-card">
        <div className="card-heading">
          <div>
            <h2>Registered Waste Batches</h2>

            <p>
              Total records:{" "}
              {pagination?.total_items ?? 0}
            </p>
          </div>
        </div>

        {loading ? (
          <p>Loading inventory...</p>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <Boxes size={36} />
            <h3>No waste batches found</h3>
            <p>
              Register a waste batch or change the
              current filters.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Source</th>
                  <th>Material</th>
                  <th>Quantity</th>
                  <th>Collection Date</th>
                  <th>Status</th>
                  <th>Workflow</th>
                </tr>
              </thead>

              <tbody>
                {items.map((batch) => (
                  <tr key={batch.id}>
                    <td>
                      <strong>
                        {batch.batch_code}
                      </strong>
                    </td>

                    <td>
                      {batch.source?.replaceAll(
                        "_",
                        " "
                      )}
                    </td>

                    <td>
                      {batch.declared_material ||
                        "Not declared"}
                    </td>

                    <td>
                      {Number(
                        batch.quantity_kg
                      ).toFixed(2)}{" "}
                      kg
                    </td>

                    <td>
                      {batch.collection_date}
                    </td>

                    <td>
                      <span className="status-badge">
                        {batch.processing_status.replaceAll(
                          "_",
                          " "
                        )}
                      </span>
                    </td>

                    <td>
                      {batch.processing_status ===
                        "REGISTERED" ||
                      batch.processing_status ===
                        "IMAGE_UPLOADED" ? (
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() =>
                            moveToNextStage(batch)
                          }
                        >
                          Next Stage
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination &&
          pagination.total_pages > 1 && (
            <div className="pagination">
              <button
                type="button"
                className="secondary-button"
                disabled={pagination.page <= 1}
                onClick={() =>
                  loadBatches(
                    pagination.page - 1
                  )
                }
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <span>
                Page {pagination.page} of{" "}
                {pagination.total_pages}
              </span>

              <button
                type="button"
                className="secondary-button"
                disabled={
                  pagination.page >=
                  pagination.total_pages
                }
                onClick={() =>
                  loadBatches(
                    pagination.page + 1
                  )
                }
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}
      </div>
    </div>
  );
}