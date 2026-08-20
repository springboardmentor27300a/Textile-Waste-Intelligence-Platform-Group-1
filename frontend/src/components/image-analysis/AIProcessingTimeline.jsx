import {
  Brain,
  Palette,
  ScanSearch,
  Layers,
  AlertTriangle,
  ShieldAlert,
  Recycle,
  Leaf,
  CheckCircle2,
} from "lucide-react";

const steps = [
  {
    title: "Material Detection",
    description: "Identifying textile fiber using AI model.",
    icon: Brain,
  },
  {
    title: "Color Analysis",
    description: "Extracting dominant textile colors.",
    icon: Palette,
  },
  {
    title: "Texture Analysis",
    description: "Evaluating textile surface texture.",
    icon: ScanSearch,
  },
  {
    title: "Pattern Recognition",
    description: "Detecting fabric pattern and structure.",
    icon: Layers,
  },
  {
    title: "Defect Detection",
    description: "Searching for visible defects.",
    icon: AlertTriangle,
  },
  {
    title: "Contamination Inspection",
    description: "Checking contamination level.",
    icon: ShieldAlert,
  },
  {
    title: "Waste Classification",
    description: "Predicting textile waste category.",
    icon: Recycle,
  },
  {
    title: "Sustainability Assessment",
    description: "Estimating environmental impact.",
    icon: Leaf,
  },
];

function AIProcessingTimeline() {
  return (
    <div className="rounded-3xl border border-blue-100 bg-white p-8 shadow-card">

      <div className="mb-8">

        <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">

          <Brain size={18} />

          Artificial Intelligence Processing

        </div>

        <h2 className="mt-4 text-3xl font-bold text-heading">
          AI Analysis Pipeline
        </h2>

        <p className="mt-2 text-muted">
          Your textile image is being processed through multiple AI
          models. This usually takes a few seconds.
        </p>

      </div>

      <div className="space-y-5">

        {steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <div
              key={step.title}
              className="group flex items-center gap-5 rounded-2xl border border-slate-100 bg-slate-50 p-5 transition-all duration-300 hover:border-blue-200 hover:bg-blue-50"
            >

              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white animate-pulse"
                style={{
                  animationDelay: `${index * 0.25}s`,
                }}
              >
                <Icon size={26} />
              </div>

              <div className="flex-1">

                <div className="flex items-center justify-between">

                  <h3 className="text-lg font-semibold text-heading">
                    {step.title}
                  </h3>

                  <CheckCircle2
                    size={22}
                    className="text-green-500"
                  />

                </div>

                <p className="mt-1 text-sm text-muted">
                  {step.description}
                </p>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">

                  <div
                    className="h-full animate-pulse rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500"
                    style={{
                      width: "100%",
                    }}
                  />

                </div>

              </div>

            </div>
          );
        })}

      </div>

      <div className="mt-8 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">

        <h3 className="text-xl font-bold">
          AI Engine Working...
        </h3>

        <p className="mt-2 text-blue-100">
          Material classification, defect detection, recyclability
          prediction and sustainability assessment are being generated.
        </p>

      </div>

    </div>
  );
}

export default AIProcessingTimeline;