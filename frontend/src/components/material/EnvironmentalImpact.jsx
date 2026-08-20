import {
  Leaf,
  Droplets,
  Zap,
  Trash2,
} from "lucide-react";

function ImpactCard({
  icon: Icon,
  title,
  value,
  color,
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 transition hover:shadow-card">

      <div className="flex items-center gap-4">

        <div className={`rounded-xl p-3 ${color}`}>
          <Icon size={24} />
        </div>

        <div>

          <p className="text-sm text-muted">
            {title}
          </p>

          <h3 className="mt-1 text-2xl font-bold text-heading">
            {value || "Not Available"}
          </h3>

        </div>

      </div>

    </div>
  );
}

function EnvironmentalImpact({ material }) {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-card">

      <div className="mb-6">

        <h2 className="text-2xl font-bold text-heading">
          Environmental Impact
        </h2>

        <p className="mt-1 text-muted">
          Estimated sustainability benefits from recycling this material.
        </p>

      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <ImpactCard
          title="CO2 Saved"
          value={
            material.co2Saving
              ? `${material.co2Saving}`
              : "Not Available"
          }
          icon={Leaf}
          color="bg-green-100 text-green-700"
        />

        <ImpactCard
          title="Water Saved"
          value={
            material.waterSaving
              ? `${material.waterSaving}`
              : "Not Available"
          }
          icon={Droplets}
          color="bg-blue-100 text-blue-700"
        />

        <ImpactCard
          title="Energy Saved"
          value="85 kWh"
          icon={Zap}
          color="bg-yellow-100 text-yellow-700"
        />

        <ImpactCard
          title="Landfill Reduction"
          value={
            material.landfillReduction
              ? `${material.landfillReduction}`
              : "Not Available"
          }
          icon={Trash2}
          color="bg-red-100 text-red-700"
        />

      </div>

    </div>
  );
}

export default EnvironmentalImpact;