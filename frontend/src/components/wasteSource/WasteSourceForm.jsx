import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

const schema = z.object({
  organization_name: z.string().min(2, "Organization name is required"),

  source_type: z.string().min(1, "Select source type"),

  industry: z.string().min(1, "Select industry"),

  organization_size: z.string().min(1, "Select organization size"),

  contact_person: z.string().min(2, "Contact person is required"),

  email: z.email("Invalid email address"),

  phone: z.string().min(10, "Invalid phone number"),

  address: z.string().min(5, "Address is required"),

  city: z.string().min(2, "City is required"),

  state: z.string().min(2, "State is required"),

  country: z.string().min(2, "Country is required"),

  postal_code: z.string().min(3, "Postal code is required"),

  collection_frequency: z.string().min(1),

  preferred_collection_day: z.string().optional(),

  average_monthly_waste: z.coerce.number().positive(),

  status: z.string(),

  notes: z.string().optional(),
});

function WasteSourceForm({
  defaultValues = {},
  onSubmit,
  loading = false,
}) {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),

    defaultValues: {
      organization_name: "",
      source_type: "",
      industry: "",
      organization_size: "",
      contact_person: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "India",
      postal_code: "",
      collection_frequency: "",
      preferred_collection_day: "",
      average_monthly_waste: "",
      status: "Active",
      notes: "",

      ...defaultValues,
    },
  });

  const handleCancel = () => {
    navigate("/waste-sources", {
      replace: true,
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 rounded-2xl bg-card p-8 shadow-sm"
    >
      {/* =====================================================
          Organization Information
      ====================================================== */}

      <div>
        <h2 className="mb-6 text-xl font-semibold text-heading">
          Organization Information
        </h2>

        <div className="grid gap-6 md:grid-cols-2">

          {/* Organization Name */}

          <div>
            <label className="mb-2 block font-medium">
              Organization Name
            </label>

            <input
              {...register("organization_name")}
              className="w-full rounded-xl border px-4 py-3"
            />

            {errors.organization_name?.message && (
              <p className="mt-1 text-sm text-red-500">
                {errors.organization_name.message}
              </p>
            )}
          </div>

          {/* Source Type */}

          <div>
            <label className="mb-2 block font-medium">
              Source Type
            </label>

            <select
              {...register("source_type")}
              className="w-full rounded-xl border px-4 py-3"
            >
              <option value="">
                Select Source
              </option>

              <option value="Manufacturer">
                Manufacturer
              </option>

              <option value="Retailer">
                Retailer
              </option>

              <option value="Factory">
                Factory
              </option>

              <option value="NGO">
                NGO
              </option>

              <option value="Recycler">
                Recycler
              </option>
            </select>

            {errors.source_type?.message && (
              <p className="mt-1 text-sm text-red-500">
                {errors.source_type.message}
              </p>
            )}
          </div>

          {/* Industry */}

          <div>
            <label className="mb-2 block font-medium">
              Industry
            </label>

            <input
              {...register("industry")}
              className="w-full rounded-xl border px-4 py-3"
            />

            {errors.industry?.message && (
              <p className="mt-1 text-sm text-red-500">
                {errors.industry.message}
              </p>
            )}
          </div>

          {/* Organization Size */}

          <div>
            <label className="mb-2 block font-medium">
              Organization Size
            </label>

            <select
              {...register("organization_size")}
              className="w-full rounded-xl border px-4 py-3"
            >
              <option value="">
                Select Size
              </option>

              <option value="1-50">
                1-50
              </option>

              <option value="51-250">
                51-250
              </option>

              <option value="251-1000">
                251-1000
              </option>

              <option value="1000+">
                1000+
              </option>
            </select>

            {errors.organization_size?.message && (
              <p className="mt-1 text-sm text-red-500">
                {errors.organization_size.message}
              </p>
            )}
          </div>

        </div>
      </div>

      {/* =====================================================
          Contact Information
      ====================================================== */}

      <div>
        <h2 className="mb-6 text-xl font-semibold text-heading">
          Contact Information
        </h2>

        <div className="grid gap-6 md:grid-cols-2">

          {/* Contact Person */}

          <div>
            <label className="mb-2 block font-medium">
              Contact Person
            </label>

            <input
              {...register("contact_person")}
              className="w-full rounded-xl border px-4 py-3"
            />

            {errors.contact_person?.message && (
              <p className="mt-1 text-sm text-red-500">
                {errors.contact_person.message}
              </p>
            )}
          </div>

          {/* Email */}

          <div>
            <label className="mb-2 block font-medium">
              Email Address
            </label>

            <input
              type="email"
              {...register("email")}
              className="w-full rounded-xl border px-4 py-3"
            />

            {errors.email?.message && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone */}

          <div>
            <label className="mb-2 block font-medium">
              Phone Number
            </label>

            <input
              {...register("phone")}
              className="w-full rounded-xl border px-4 py-3"
            />

            {errors.phone?.message && (
              <p className="mt-1 text-sm text-red-500">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Status */}

          <div>
            <label className="mb-2 block font-medium">
              Status
            </label>

            <select
              {...register("status")}
              className="w-full rounded-xl border px-4 py-3"
            >
              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>

              <option value="Pending">
                Pending
              </option>
            </select>
          </div>

        </div>
      </div>

      {/* =====================================================
          Location
      ====================================================== */}

      <div>
        <h2 className="mb-6 text-xl font-semibold text-heading">
          Location
        </h2>

        <div className="grid gap-6 md:grid-cols-2">

          {/* Address */}

          <div className="md:col-span-2">
            <label className="mb-2 block font-medium">
              Address
            </label>

            <textarea
              rows={3}
              {...register("address")}
              className="w-full rounded-xl border px-4 py-3"
            />

            {errors.address?.message && (
              <p className="mt-1 text-sm text-red-500">
                {errors.address.message}
              </p>
            )}
          </div>

          {/* City */}

          <div>
            <label className="mb-2 block font-medium">
              City
            </label>

            <input
              {...register("city")}
              className="w-full rounded-xl border px-4 py-3"
            />

            {errors.city?.message && (
              <p className="mt-1 text-sm text-red-500">
                {errors.city.message}
              </p>
            )}
          </div>

          {/* State */}

          <div>
            <label className="mb-2 block font-medium">
              State
            </label>

            <input
              {...register("state")}
              className="w-full rounded-xl border px-4 py-3"
            />

            {errors.state?.message && (
              <p className="mt-1 text-sm text-red-500">
                {errors.state.message}
              </p>
            )}
          </div>

          {/* Country */}

          <div>
            <label className="mb-2 block font-medium">
              Country
            </label>

            <input
              {...register("country")}
              className="w-full rounded-xl border px-4 py-3"
            />

            {errors.country?.message && (
              <p className="mt-1 text-sm text-red-500">
                {errors.country.message}
              </p>
            )}
          </div>

          {/* Postal Code */}

          <div>
            <label className="mb-2 block font-medium">
              Postal Code
            </label>

            <input
              {...register("postal_code")}
              className="w-full rounded-xl border px-4 py-3"
            />

            {errors.postal_code?.message && (
              <p className="mt-1 text-sm text-red-500">
                {errors.postal_code.message}
              </p>
            )}
          </div>

        </div>
      </div>

      {/* =====================================================
          Waste Information
      ====================================================== */}

      <div>
        <h2 className="mb-6 text-xl font-semibold text-heading">
          Waste Information
        </h2>

        <div className="grid gap-6 md:grid-cols-2">

          {/* Collection Frequency */}

          <div>
            <label className="mb-2 block font-medium">
              Collection Frequency
            </label>

            <select
              {...register("collection_frequency")}
              className="w-full rounded-xl border px-4 py-3"
            >
              <option value="">
                Select
              </option>

              <option value="Daily">
                Daily
              </option>

              <option value="Weekly">
                Weekly
              </option>

              <option value="Monthly">
                Monthly
              </option>
            </select>

            {errors.collection_frequency?.message && (
              <p className="mt-1 text-sm text-red-500">
                {errors.collection_frequency.message}
              </p>
            )}
          </div>

          {/* Preferred Collection Day */}

          <div>
            <label className="mb-2 block font-medium">
              Preferred Collection Day
            </label>

            <select
              {...register("preferred_collection_day")}
              className="w-full rounded-xl border px-4 py-3"
            >
              <option value="">
                Select
              </option>

              <option value="Monday">
                Monday
              </option>

              <option value="Tuesday">
                Tuesday
              </option>

              <option value="Wednesday">
                Wednesday
              </option>

              <option value="Thursday">
                Thursday
              </option>

              <option value="Friday">
                Friday
              </option>

              <option value="Saturday">
                Saturday
              </option>

              <option value="Sunday">
                Sunday
              </option>
            </select>
          </div>

          {/* Average Monthly Waste */}

          <div>
            <label className="mb-2 block font-medium">
              Average Monthly Waste (kg)
            </label>

            <input
              type="number"
              {...register("average_monthly_waste")}
              className="w-full rounded-xl border px-4 py-3"
            />

            {errors.average_monthly_waste?.message && (
              <p className="mt-1 text-sm text-red-500">
                {errors.average_monthly_waste.message}
              </p>
            )}
          </div>

        </div>
      </div>

      {/* =====================================================
          Additional Notes
      ====================================================== */}

      <div>
        <h2 className="mb-6 text-xl font-semibold text-heading">
          Additional Notes
        </h2>

        <textarea
          rows={4}
          {...register("notes")}
          className="w-full rounded-xl border px-4 py-3"
          placeholder="Additional information..."
        />
      </div>

      {/* =====================================================
          Actions
      ====================================================== */}

      <div className="flex justify-end gap-4 border-t border-slate-200 pt-6">

        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="rounded-xl border border-slate-300 px-6 py-3 font-medium transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-primary px-6 py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Waste Source"}
        </button>

      </div>
    </form>
  );
}

export default WasteSourceForm;