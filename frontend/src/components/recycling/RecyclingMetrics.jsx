import {
  Gauge,
  Timer,
  Factory,
} from "lucide-react";

function RecyclingMetrics({ analysis }) {
  const recyclability =
    analysis?.recyclability_score != null
      ? `${analysis.recyclability_score}%`
      : "N/A";

  const processingTime =
    analysis?.processing_time || "Not Available";

  const expectedOutput =
    analysis?.expected_output || "Not Available";

  const metrics = [
    {
      title: "Recyclability Score",
      value: recyclability,
      icon: Gauge,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Processing Time",
      value: processingTime,
      icon: Timer,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      title: "Expected Output",
      value: expectedOutput,
      icon: Factory,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-white shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Gauge size={22} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-heading">
            Recycling Metrics
          </h2>

          <p className="text-sm text-muted">
            Key performance indicators for the recommended recycling process
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-5 p-6 md:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.title}
              className="rounded-xl border border-border p-5 transition-all duration-300 hover:shadow-md"
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${metric.bg}`}
              >
                <Icon
                  size={22}
                  className={metric.color}
                />
              </div>

              <p className="text-sm text-muted">
                {metric.title}
              </p>

              <h3 className="mt-2 text-2xl font-bold text-heading break-words">
                {metric.value}
              </h3>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RecyclingMetrics;