import {
  ArrowRight,
  CheckCircle2,
  ScanSearch,
  Trash2,
  Scissors,
  Recycle,
} from "lucide-react";

const steps = [
  {
    title: "Material Identification",
    description:
      "AI identifies the textile material and its composition.",
    icon: ScanSearch,
  },
  {
    title: "Waste Assessment",
    description:
      "Quality, contamination, and recyclability are evaluated.",
    icon: Trash2,
  },
  {
    title: "Processing",
    description:
      "Sorting, cleaning, and shredding prepare the textile for recycling.",
    icon: Scissors,
  },
  {
    title: "Material Recovery",
    description:
      "Recover usable fibers and raw materials for further processing.",
    icon: Recycle,
  },
  {
    title: "Sustainable Output",
    description:
      "Recovered materials are reused in new textile or industrial products.",
    icon: CheckCircle2,
  },
];

function RecyclingProcess() {
  return (
    <div className="rounded-2xl border border-border bg-white shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Recycle size={22} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-heading">
            Recycling Process
          </h2>

          <p className="text-sm text-muted">
            AI-recommended textile recycling workflow
          </p>
        </div>
      </div>

      {/* Workflow */}
      <div className="flex flex-wrap items-center justify-center gap-4 p-8">
        {steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <div
              key={step.title}
              className="flex items-center"
            >
              <div className="w-56 rounded-xl border border-border bg-slate-50 p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Icon
                    size={26}
                    className="text-primary"
                  />
                </div>

                <h3 className="mb-2 font-semibold text-heading">
                  {step.title}
                </h3>

                <p className="text-sm leading-6 text-muted">
                  {step.description}
                </p>
              </div>

              {index !== steps.length - 1 && (
                <ArrowRight
                  size={28}
                  className="mx-4 hidden text-primary lg:block"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RecyclingProcess;