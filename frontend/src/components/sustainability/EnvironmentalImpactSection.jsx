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
  unit,
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
            {value}
            {unit && (
              <span className="ml-1 text-lg font-semibold">
                {unit}
              </span>
            )}
          </h3>
        </div>
      </div>
    </div>
  );
}

function formatNumber(value) {
  if (value === null || value === undefined || value === "") {
    return "0";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}

function EnvironmentalImpact({ material, analysis }) {
  /*
   * Canonical backend fields:
   *
   * carbon_savings
   * water_savings
   * energy_savings
   * landfill_diversion
   *
   * Older frontend names are kept only as fallback so
   * previously stored responses do not break the UI.
   */

  const data = analysis || material || {};

  const carbonSavings =
    data.carbon_savings ??
    data.carbon_saving ??
    data.co2_saving ??
    data.co2Saving ??
    0;

  const waterSavings =
    data.water_savings ??
    data.water_saving ??
    data.waterSaving ??
    0;

  const energySavings =
    data.energy_savings ??
    data.energy_saving ??
    data.energySaving ??
    0;

  const landfillReduction =
    data.landfill_diversion ??
    data.landfill_reduction ??
    data.landfillReduction ??
    0;

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
          value={formatNumber(carbonSavings)}
          unit="kg"
          icon={Leaf}
          color="bg-green-100 text-green-700"
        />

        <ImpactCard
          title="Water Saved"
          value={formatNumber(waterSavings)}
          unit="L"
          icon={Droplets}
          color="bg-blue-100 text-blue-700"
        />

        <ImpactCard
          title="Energy Saved"
          value={formatNumber(energySavings)}
          unit="kWh"
          icon={Zap}
          color="bg-yellow-100 text-yellow-700"
        />

        <ImpactCard
          title="Landfill Reduction"
          value={formatNumber(landfillReduction)}
          unit="kg"
          icon={Trash2}
          color="bg-red-100 text-red-700"
        />
      </div>
    </div>
  );
}

export default EnvironmentalImpact;