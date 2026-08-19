import { useEffect, useState } from "react";
import {
  Building2,
  Save,
} from "lucide-react";

import {
  createOrganization,
  getMyOrganization,
  updateMyOrganization,
} from "../services/organizationService";


const initialForm = {
  name: "",
  organization_type: "",
  email: "",
  phone: "",
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

  return "Unable to complete the request.";
}


export default function Organizations() {
  const [organization, setOrganization] =
    useState(null);

  const [form, setForm] =
    useState(initialForm);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  useEffect(() => {
    loadOrganization();
  }, []);


  async function loadOrganization() {
    setLoading(true);
    setError("");

    try {
      const data =
        await getMyOrganization();

      setOrganization(data);

      setForm({
        name: data.name ?? "",
        organization_type:
          data.organization_type ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        address: data.address ?? "",
        city: data.city ?? "",
        state: data.state ?? "",
        country: data.country ?? "India",
      });
    } catch (requestError) {
      if (
        requestError.response?.status !== 404
      ) {
        setError(
          getErrorMessage(requestError)
        );
      }
    } finally {
      setLoading(false);
    }
  }


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
    setMessage("");

    const payload = {
      name: form.name.trim(),
      organization_type:
        form.organization_type.trim() ||
        null,
      email:
        form.email.trim() || null,
      phone:
        form.phone.trim() || null,
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
      let saved;

      if (organization) {
        saved =
          await updateMyOrganization(
            payload
          );

        setMessage(
          "Organization updated successfully."
        );
      } else {
        saved =
          await createOrganization(
            payload
          );

        setMessage(
          "Organization created successfully."
        );
      }

      setOrganization(saved);
    } catch (requestError) {
      setError(
        getErrorMessage(requestError)
      );
    } finally {
      setSaving(false);
    }
  }


  if (loading) {
    return (
      <div className="page-container">
        <p>Loading organization...</p>
      </div>
    );
  }


  return (
    <div className="page-container">
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            ORGANIZATION MANAGEMENT
          </p>

          <h1>
            Organization
          </h1>

          <p className="page-description">
            Manage the organization associated
            with your textile waste operations.
          </p>
        </div>

        <Building2 size={34} />
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
              {organization
                ? "Organization Details"
                : "Create Organization"}
            </h2>

            <p>
              {organization
                ? `Organization ID: ${organization.id}`
                : "Create your organization before adding facilities and waste batches."}
            </p>
          </div>

          {organization && (
            <span className="status-badge">
              {organization.is_active
                ? "Active"
                : "Inactive"}
            </span>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="form-grid"
        >
          <label>
            Organization Name *
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              minLength={2}
              maxLength={150}
              required
            />
          </label>

          <label>
            Organization Type
            <input
              name="organization_type"
              value={
                form.organization_type
              }
              onChange={handleChange}
              maxLength={100}
              placeholder="Textile Manufacturer"
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
          </label>

          <label>
            Phone
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              maxLength={30}
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

          <div className="form-actions full-width">
            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              <Save size={17} />

              {saving
                ? "Saving..."
                : organization
                  ? "Update Organization"
                  : "Create Organization"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}