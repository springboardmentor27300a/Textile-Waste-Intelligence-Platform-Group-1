import {
  Recycle,
  PackageCheck,
  Percent,
  IndianRupee,
} from "lucide-react";

function RecyclingStrategy({ analysis }) {
  const recovery =
    analysis?.recovery_percentage != null
      ? `${analysis.recovery_percentage}%`
      : "N/A";

  const cost =
    analysis?.estimated_cost != null
      ? `₹${analysis.estimated_cost}`
      : "N/A";

  return (
    <div className="rounded-2xl border border-border bg-white shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <Recycle size={22} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-heading">
            Recycling Strategy
          </h2>

          <p className="text-sm text-muted">
            Recommended recovery process for the analyzed textile waste
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-5 p-6 md:grid-cols-2">
        {/* Recycling Method */}
        <div className="rounded-xl border border-border p-5">
          <div className="mb-3 flex items-center gap-2">
            <Recycle
              size={18}
              className="text-primary"
            />

            <h3 className="font-semibold text-heading">
              Recycling Method
            </h3>
          </div>

          <p className="text-gray-700 leading-7">
            {analysis?.recycling_method ||
              "Not Available"}
          </p>
        </div>

        {/* Recovered Material */}
        <div className="rounded-xl border border-border p-5">
          <div className="mb-3 flex items-center gap-2">
            <PackageCheck
              size={18}
              className="text-primary"
            />

            <h3 className="font-semibold text-heading">
              Recovered Material
            </h3>
          </div>

          <p className="text-gray-700 leading-7">
            {analysis?.recovered_material ||
              "Not Available"}
          </p>
        </div>

        {/* Recovery Percentage */}
        <div className="rounded-xl border border-border p-5">
          <div className="mb-3 flex items-center gap-2">
            <Percent
              size={18}
              className="text-primary"
            />

            <h3 className="font-semibold text-heading">
              Recovery Percentage
            </h3>
          </div>

          <p className="text-2xl font-bold text-emerald-600">
            {recovery}
          </p>
        </div>

        {/* Estimated Cost */}
        <div className="rounded-xl border border-border p-5">
          <div className="mb-3 flex items-center gap-2">
            <IndianRupee
              size={18}
              className="text-primary"
            />

            <h3 className="font-semibold text-heading">
              Estimated Cost
            </h3>
          </div>

          <p className="text-black leading-7">
            {cost}
          </p>
        </div>
      </div>
    </div>
  );
}

export default RecyclingStrategy;