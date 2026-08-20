import {
  Trash2,
  AlertTriangle,
  RefreshCcw,
  Recycle,
  RotateCw,
} from "lucide-react";

function WasteCard({ waste }) {
  const cards = [
    {
      title: "Waste Category",
      value: waste?.waste_category || "N/A",
      icon: Trash2,
      color: "text-slate-700",
      bg: "bg-slate-100",
      description: "Detected waste type",
    },
    {
      title: "Waste Score",
      value:
        waste?.waste_score !== null &&
        waste?.waste_score !== undefined
          ? `${waste.waste_score}%`
          : "N/A",
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-100",
      description: "Overall waste severity",
    },
    {
      title: "Reuse Score",
      value:
        waste?.reuse_score !== null &&
        waste?.reuse_score !== undefined
          ? `${waste.reuse_score}%`
          : "N/A",
      icon: RefreshCcw,
      color: "text-blue-600",
      bg: "bg-blue-100",
      description: "Potential for reuse",
    },
    {
      title: "Recyclability Score",
      value:
        waste?.recyclability_score !== null &&
        waste?.recyclability_score !== undefined
          ? `${waste.recyclability_score}%`
          : "N/A",
      icon: Recycle,
      color: "text-green-600",
      bg: "bg-green-100",
      description: "Estimated recyclability",
    },
    {
      title: "Circularity Score",
      value:
        waste?.circularity_score !== null &&
        waste?.circularity_score !== undefined
          ? `${waste.circularity_score}%`
          : "N/A",
      icon: RotateCw,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      description: "Circular economy impact",
    },
  ];

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-heading">
          Waste Classification Summary
        </h2>

        <p className="mt-1 text-sm text-muted">
          AI-generated waste assessment and sustainability metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg}`}
                >
                  <Icon size={22} className={card.color} />
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-medium text-muted">
                  {card.title}
                </p>

                <h3 className={`mt-2 text-3xl font-bold ${card.color}`}>
                  {card.value}
                </h3>

                <p className="mt-2 text-xs text-gray-500">
                  {card.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default WasteCard;