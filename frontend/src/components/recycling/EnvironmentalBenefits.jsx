import {
  Leaf,
  Droplets,
  TreePine,
  Factory,
  ShieldCheck,
} from "lucide-react";

function EnvironmentalBenefits({ analysis }) {
  const benefits = [
    {
      title: "Carbon Saving",
      value:
        analysis?.carbon_saving != null
          ? `${analysis.carbon_saving}%`
          : "N/A",
      icon: Leaf,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      title: "Water Saving",
      value:
        analysis?.water_saving != null
          ? `${analysis.water_saving}%`
          : "N/A",
      icon: Droplets,
      color: "text-sky-600",
      bg: "bg-sky-100",
    },
    {
      title: "Landfill Reduction",
      value:
        analysis?.landfill_reduction != null
          ? `${analysis.landfill_reduction}%`
          : "N/A",
      icon: Factory,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      title: "Resource Conservation",
      value:
        analysis?.resource_conservation != null
          ? `${analysis.resource_conservation}%`
          : "N/A",
      icon: TreePine,
      color: "text-green-700",
      bg: "bg-green-100",
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-white shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ShieldCheck size={22} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-heading">
            Environmental Benefits
          </h2>

          <p className="text-sm text-muted">
            Estimated environmental impact of the recommended recycling process
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-5 p-6 md:grid-cols-2 lg:grid-cols-4">
        {benefits.map((benefit) => {
          const Icon = benefit.icon;

          return (
            <div
              key={benefit.title}
              className="rounded-xl border border-border p-5 transition-all duration-300 hover:shadow-md"
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${benefit.bg}`}
              >
                <Icon
                  size={22}
                  className={benefit.color}
                />
              </div>

              <p className="text-sm text-muted">
                {benefit.title}
              </p>

              <h3 className="mt-2 text-2xl font-bold text-heading">
                {benefit.value}
              </h3>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default EnvironmentalBenefits;