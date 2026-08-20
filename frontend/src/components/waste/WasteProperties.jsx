import {
  Layers3,
  Package,
  ShieldCheck,
  AlertCircle,
  ShieldAlert,
  Recycle,
  Droplets,
  Wrench,
  ClipboardList,
  CircleDot,
} from "lucide-react";

function WasteProperties({ waste }) {
  const properties = [
    {
      title: "Material",
      value: waste?.material,
      icon: Layers3,
    },
    {
      title: "Primary Material",
      value: waste?.primary_material,
      icon: Package,
    },
    {
      title: "Secondary Material",
      value: waste?.secondary_material,
      icon: Package,
    },
    {
      title: "Composition",
      value: waste?.composition,
      icon: ClipboardList,
    },
    {
      title: "Material Quality",
      value: waste?.material_quality,
      icon: ShieldCheck,
    },
    {
      title: "Defects",
      value: waste?.defects,
      icon: AlertCircle,
    },
    {
      title: "Damage Level",
      value: waste?.damage_level,
      icon: ShieldAlert,
    },
    {
      title: "Contamination",
      value: waste?.contamination,
      icon: Droplets,
    },
    {
      title: "Contamination Level",
      value: waste?.contamination_level,
      icon: CircleDot,
    },
    {
      title: "Recycling Difficulty",
      value: waste?.recycling_difficulty,
      icon: Recycle,
    },
    {
      title: "Durability",
      value: waste?.durability,
      icon: Wrench,
    },
    {
      title: "Stretchability",
      value: waste?.stretchability,
      icon: Wrench,
    },
    {
      title: "Breathability",
      value: waste?.breathability,
      icon: Wrench,
    },
    {
      title: "Moisture Absorption",
      value: waste?.moisture_absorption,
      icon: Droplets,
    },
    {
      title: "Thermal Property",
      value: waste?.thermal_property,
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-heading">
          Waste Properties
        </h2>

        <p className="mt-1 text-sm text-muted">
          Material characteristics and physical condition detected by the AI
          analysis engine.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {properties.map((property) => {
          const Icon = property.icon;

          return (
            <div
              key={property.title}
              className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="text-primary" size={20} />
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium text-muted">
                  {property.title}
                </p>

                <p className="mt-1 text-base font-semibold text-heading break-words">
                  {property.value ?? "N/A"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default WasteProperties;