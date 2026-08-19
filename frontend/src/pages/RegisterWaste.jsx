import { useEffect, useState } from "react";
import {
  PackagePlus,
  Save,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getFacilities,
} from "../services/facilityService";

import {
  createWasteBatch,
} from "../services/wasteBatchService";


const SOURCES = [
  "PRODUCTION_SCRAP",
  "CUTTING_WASTE",
  "QUALITY_REJECT",
  "DEAD_STOCK",
  "RETURNED_PRODUCT",
  "POST_CONSUMER",
  "SAMPLE_WASTE",
  "OTHER",
];


const CONDITIONS = [
  "CLEAN",
  "LIGHTLY_USED",
  "DAMAGED",
  "CONTAMINATED",
  "MIXED",
  "UNKNOWN",
];


const initialForm = {
  facility_id: "",
  source: "CUTTING_WASTE",
  quantity_kg: "",
  declared_material: "",
  color: "",
  condition: "CLEAN",
  collection_date:
    new Date().toISOString().split("T")[0],
  notes: "",
};


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

  return "Unable to register waste batch.";
}


export default function RegisterWaste() {
  const navigate = useNavigate();

  const [facilities, setFacilities] =
    useState([]);

  const [form, setForm] =
    useState(initialForm);

  const [loadingFacilities, setLoadingFacilities] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [createdBatch, setCreatedBatch] =
    useState(null);


  useEffect(() => {
    async function loadFacilities() {
      try {
        const data =
          await getFacilities();

        setFacilities(
          data.filter(
            (facility) =>
              facility.is_active
          )
        );
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError
          )
        );
      } finally {
        setLoadingFacilities(false);
      }
    }

    loadFacilities();
  }, []);


  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }


  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setCreatedBatch(null);

    const payload = {
      facility_id:
        form.facility_id
          ? Number(form.facility_id)
          : null,

      source: form.source,

      quantity_kg:
        Number(form.quantity_kg),

      declared_material:
        form.declared_material.trim() ||
        null,

      color:
        form.color.trim() || null,

      condition:
        form.condition || null,

      collection_date:
        form.collection_date,

      notes:
        form.notes.trim() || null,
    };

    try {
      const batch =
        await createWasteBatch(
          payload
        );

      setCreatedBatch(batch);

      setForm({
        ...initialForm,
        facility_id:
          form.facility_id,
        collection_date:
          new Date()
            .toISOString()
            .split("T")[0],
      });
    } catch (requestError) {
      setError(
        getErrorMessage(requestError)
      );
    } finally {
      setSaving(false);
    }
  }


  return (
    <div className="page-container">
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            WASTE INVENTORY
          </p>

          <h1>
            Register Waste Batch
          </h1>

          <p className="page-description">
            Record a new textile waste batch
            for tracking, image analysis and
            classification.
          </p>
        </div>

        <PackagePlus size={34} />
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {createdBatch && (
        <div className="success-message">
          <strong>
            Waste batch registered successfully.
          </strong>

          {" "}Batch code:{" "}
          {createdBatch.batch_code}

          {" "}— Status:{" "}
          {createdBatch.processing_status}
        </div>
      )}

      <div className="content-card">
        <div className="card-heading">
          <div>
            <h2>
              Waste Batch Information
            </h2>

            <p>
              Fields marked * are required.
            </p>
          </div>
        </div>

        <form
          className="form-grid"
          onSubmit={handleSubmit}
        >
          <label>
            Facility
            <select
              name="facility_id"
              value={form.facility_id}
              onChange={handleChange}
              disabled={
                loadingFacilities
              }
            >
              <option value="">
                No facility selected
              </option>

              {facilities.map(
                (facility) => (
                  <option
                    key={facility.id}
                    value={facility.id}
                  >
                    {facility.name} (
                    {facility.facility_code})
                  </option>
                )
              )}
            </select>
          </label>

          <label>
            Waste Source *
            <select
              name="source"
              value={form.source}
              onChange={handleChange}
              required
            >
              {SOURCES.map(
                (source) => (
                  <option
                    key={source}
                    value={source}
                  >
                    {source.replaceAll(
                      "_",
                      " "
                    )}
                  </option>
                )
              )}
            </select>
          </label>

          <label>
            Quantity (kg) *
            <input
              type="number"
              name="quantity_kg"
              value={form.quantity_kg}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              required
              placeholder="125.50"
            />
          </label>

          <label>
            Collection Date *
            <input
              type="date"
              name="collection_date"
              value={
                form.collection_date
              }
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Declared Material
            <input
              name="declared_material"
              value={
                form.declared_material
              }
              onChange={handleChange}
              maxLength={100}
              placeholder="Cotton"
            />
          </label>

          <label>
            Color
            <input
              name="color"
              value={form.color}
              onChange={handleChange}
              maxLength={50}
              placeholder="Blue"
            />
          </label>

          <label>
            Condition
            <select
              name="condition"
              value={form.condition}
              onChange={handleChange}
            >
              {CONDITIONS.map(
                (condition) => (
                  <option
                    key={condition}
                    value={condition}
                  >
                    {condition.replaceAll(
                      "_",
                      " "
                    )}
                  </option>
                )
              )}
            </select>
          </label>

          <label className="full-width">
            Notes
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Optional observations about this batch..."
            />
          </label>

          <div className="form-actions full-width">
            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              <Save size={17} />

              {saving
                ? "Registering..."
                : "Register Waste Batch"}
            </button>

            {createdBatch && (
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  navigate(
                    "/waste/inventory"
                  )
                }
              >
                View Inventory
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="content-card">
        <h3>Workflow</h3>

        <p>
          After registration, the batch enters
          the <strong>REGISTERED</strong> state.
          You can then upload textile images,
          perform image analysis and continue
          classification in the following
          project stages.
        </p>
      </div>
    </div>
  );
}