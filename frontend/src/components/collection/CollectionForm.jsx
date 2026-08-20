import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

import useWasteSources from "../../hooks/useWasteSources";

function CollectionForm({
  defaultValues = {},
  onSubmit,
  loading = false,
}) {
  const navigate = useNavigate();

  const { wasteSources = [] } = useWasteSources();

  const {
    register,
    handleSubmit,
  } = useForm({
    defaultValues: {
      waste_source_id: "",
      collection_date: "",
      collected_by: "",
      vehicle_number: "",
      collection_method: "",
      total_weight: "",
      collection_status: "Scheduled",
      remarks: "",
      ...defaultValues,
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8"
    >
      {/* ================= Collection Information ================= */}

      <div>

        <h2 className="mb-6 text-xl font-semibold">

          Collection Information

        </h2>

        <div className="grid gap-6 md:grid-cols-2">

          <div>

            <label className="mb-2 block font-medium">

              Waste Source

            </label>

            <select
              {...register("waste_source_id")}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-primary focus:outline-none"
            >
              <option value="">
                Select Waste Source
              </option>

              {wasteSources.map((source) => (
                <option
                  key={source.id}
                  value={source.id}
                >
                  {source.organization_name}
                </option>
              ))}

            </select>

          </div>

          <div>

            <label className="mb-2 block font-medium">

              Collection Date

            </label>

            <input
              type="date"
              {...register("collection_date")}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-primary focus:outline-none"
            />

          </div>

          <div>

            <label className="mb-2 block font-medium">

              Collected By

            </label>

            <input
              {...register("collected_by")}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-primary focus:outline-none"
            />

          </div>

          <div>

            <label className="mb-2 block font-medium">

              Vehicle Number

            </label>

            <input
              {...register("vehicle_number")}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-primary focus:outline-none"
            />

          </div>

        </div>

      </div>

      {/* ================= Collection Details ================= */}

      <div>

        <h2 className="mb-6 text-xl font-semibold">

          Collection Details

        </h2>

        <div className="grid gap-6 md:grid-cols-2">

          <div>

            <label className="mb-2 block font-medium">

              Collection Method

            </label>

            <select
              {...register("collection_method")}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-primary focus:outline-none"
            >
              <option value="">
                Select
              </option>

              <option value="Pickup">
                Pickup
              </option>

              <option value="Drop-off">
                Drop-off
              </option>

            </select>

          </div>

          <div>

            <label className="mb-2 block font-medium">

              Total Weight (kg)

            </label>

            <input
              type="number"
              step="0.01"
              {...register("total_weight")}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-primary focus:outline-none"
            />

          </div>

          <div>

            <label className="mb-2 block font-medium">

              Status

            </label>

            <select
              {...register("collection_status")}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-primary focus:outline-none"
            >
              <option value="Scheduled">
                Scheduled
              </option>

              <option value="Completed">
                Completed
              </option>

              <option value="Cancelled">
                Cancelled
              </option>

            </select>

          </div>

        </div>

      </div>

      {/* ================= Remarks ================= */}

      <div>

        <h2 className="mb-6 text-xl font-semibold">

          Remarks

        </h2>

        <textarea
          rows={4}
          {...register("remarks")}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-primary focus:outline-none"
        />

      </div>

      {/* ================= Buttons ================= */}

      <div className="flex justify-end gap-4 border-t border-slate-200 pt-6">

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate("/collections", {
              replace: true,
            });
          }}
          disabled={loading}
          className="rounded-xl border border-slate-300 px-6 py-3 transition hover:bg-slate-100"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-primary px-6 py-3 text-white"
        >
          {loading ? "Saving..." : "Save Collection"}
        </button>

      </div>

    </form>
  );
}

export default CollectionForm;