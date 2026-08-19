import { useEffect, useState } from "react";
import {
  Building,
  Plus,
  Save,
  X,
} from "lucide-react";

import {
  createFacility,
  getFacilities,
  updateFacility,
} from "../services/facilityService";


const FACILITY_TYPES = [
  "MANUFACTURING",
  "PROCESSING",
  "WAREHOUSE",
  "COLLECTION_CENTER",
  "RECYCLING_UNIT",
];


const emptyForm = {
  name: "",
  facility_code: "",
  facility_type: "",
  address: "",
  city: "",
  state: "",
  country: "India",
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

  return "Unable to complete the request.";
}


export default function Facilities() {
  const [facilities, setFacilities] =
    useState([]);

  const [form, setForm] =
    useState(emptyForm);

  const [editingId, setEditingId] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");


  useEffect(() => {
    loadFacilities();
  }, []);


  async function loadFacilities() {
    setLoading(true);
    setError("");

    try {
      const data = await getFacilities();
      setFacilities(data);
    } catch (requestError) {
      setError(
        getErrorMessage(requestError)
      );
    } finally {
      setLoading(false);
    }
  }


  function handleChange(event) {
    const { name, value } =
      event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }


  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }


  function startEdit(facility) {
    setEditingId(facility.id);

    setForm({
      name: facility.name ?? "",
      facility_code:
        facility.facility_code ?? "",
      facility_type:
        facility.facility_type ?? "",
      address: facility.address ?? "",
      city: facility.city ?? "",
      state: facility.state ?? "",
      country:
        facility.country ?? "India",
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      name: form.name.trim(),
      facility_code:
        form.facility_code
          .trim()
          .toUpperCase(),
      facility_type:
        form.facility_type || null,
      address:
        form.address.trim() || null,
      city:
        form.city.trim() || null,
      state:
        form.state.trim() || null,
      country:
        form.country.trim() || "India",
    };

    try {
      if (editingId) {
        await updateFacility(
          editingId,
          payload
        );

        setMessage(
          "Facility updated successfully."
        );
      } else {
        await createFacility(payload);

        setMessage(
          "Facility created successfully."
        );
      }

      resetForm();
      await loadFacilities();
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
            FACILITY MANAGEMENT
          </p>

          <h1>Facilities</h1>

          <p className="page-description">
            Manage textile manufacturing,
            processing, storage and recycling
            facilities associated with your
            organization.
          </p>
        </div>

        <Building size={34} />
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
        <div className="card-heading">
          <div>
            <h2>
              {editingId
                ? "Edit Facility"
                : "Add Facility"}
            </h2>

            <p>
              Register an operational facility
              under your organization.
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              className="secondary-button"
              onClick={resetForm}
            >
              <X size={16} />
              Cancel Edit
            </button>
          )}
        </div>

        <form
          className="form-grid"
          onSubmit={handleSubmit}
        >
          <label>
            Facility Name *
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              minLength={2}
              maxLength={150}
            />
          </label>

          <label>
            Facility Code *
            <input
              name="facility_code"
              value={form.facility_code}
              onChange={handleChange}
              required
              minLength={2}
              maxLength={50}
              placeholder="PUNE-PLANT-01"
            />
          </label>

          <label>
            Facility Type
            <select
              name="facility_type"
              value={form.facility_type}
              onChange={handleChange}
            >
              <option value="">
                Select type
              </option>

              {FACILITY_TYPES.map(
                (type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {type.replaceAll(
                      "_",
                      " "
                    )}
                  </option>
                )
              )}
            </select>
          </label>

          <label>
            Country *
            <input
              name="country"
              value={form.country}
              onChange={handleChange}
              required
              minLength={2}
              maxLength={100}
            />
          </label>

          <label className="full-width">
            Address
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              maxLength={255}
            />
          </label>

          <label>
            City
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              maxLength={100}
            />
          </label>

          <label>
            State
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              maxLength={100}
            />
          </label>

          <div className="form-actions full-width">
            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {editingId ? (
                <Save size={17} />
              ) : (
                <Plus size={17} />
              )}

              {saving
                ? "Saving..."
                : editingId
                  ? "Update Facility"
                  : "Create Facility"}
            </button>
          </div>
        </form>
      </div>

      <div className="content-card">
        <div className="card-heading">
          <div>
            <h2>
              Registered Facilities
            </h2>

            <p>
              {facilities.length} facility
              {facilities.length === 1
                ? ""
                : "ies"}{" "}
              available.
            </p>
          </div>
        </div>

        {loading ? (
          <p>Loading facilities...</p>
        ) : facilities.length === 0 ? (
          <div className="empty-state">
            <Building size={36} />

            <h3>No facilities found</h3>

            <p>
              Create your first facility using
              the form above.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {facilities.map(
                  (facility) => (
                    <tr key={facility.id}>
                      <td>
                        {facility.facility_code}
                      </td>

                      <td>
                        {facility.name}
                      </td>

                      <td>
                        {facility.facility_type
                          ?.replaceAll(
                            "_",
                            " "
                          ) || "—"}
                      </td>

                      <td>
                        {[
                          facility.city,
                          facility.state,
                        ]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </td>

                      <td>
                        <span className="status-badge">
                          {facility.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() =>
                            startEdit(
                              facility
                            )
                          }
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}