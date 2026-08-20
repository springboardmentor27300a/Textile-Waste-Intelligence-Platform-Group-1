import {
  Brain,
  Sparkles,
  Lightbulb,
} from "lucide-react";

function AIRecommendation({ analysis }) {
  return (
    <div className="rounded-2xl bg-white shadow-card border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Brain size={22} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-heading">
            AI Recommendation
          </h2>

          <p className="text-sm text-muted">
            Intelligent recycling insights generated from textile analysis
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6 p-6 lg:grid-cols-2">
        {/* Recommendation */}
        <div className="rounded-xl border border-border bg-slate-50 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles
              size={18}
              className="text-primary"
            />

            <h3 className="font-semibold text-heading">
              AI Recommendation
            </h3>
          </div>

          <p className="leading-7 text-gray-700">
            {analysis?.recommendation ||
              "No recommendation available."}
          </p>
        </div>

        {/* Waste Reduction Strategy */}
        <div className="rounded-xl border border-border bg-green-50 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Lightbulb
              size={18}
              className="text-emerald-600"
            />

            <h3 className="font-semibold text-heading">
              Waste Reduction Strategy
            </h3>
          </div>

          <p className="leading-7 text-gray-700">
            {analysis?.waste_reduction_strategy ||
              "No waste reduction strategy available."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AIRecommendation;