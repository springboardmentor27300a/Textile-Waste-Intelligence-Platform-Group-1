import {
  Recycle,
  Gauge,
  DollarSign,
  Clock,
} from "lucide-react";

function MethodCard({
  icon: Icon,
  title,
  value,
  color,
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 transition hover:shadow-card">

      <div className="flex items-center gap-3">

        <div className={`rounded-xl p-3 ${color}`}>
          <Icon size={22} />
        </div>

        <div>

          <p className="text-sm text-muted">
            {title}
          </p>

          <h3 className="mt-1 font-semibold text-heading">
            {value}
          </h3>

        </div>

      </div>

    </div>
  );
}

function RecyclingMethods({ material }) {
  const methods = {
    "Mechanical Recycling": {
      difficulty: "Easy",
      efficiency: "95%",
      cost: "Low",
      time: "2 Days",
    },
    "Chemical Recycling": {
      difficulty: "Medium",
      efficiency: "90%",
      cost: "Medium",
      time: "3 Days",
    },
    "Fiber Recovery": {
      difficulty: "Medium",
      efficiency: "88%",
      cost: "Medium",
      time: "4 Days",
    },
    "Luxury Fabric Reuse": {
      difficulty: "Hard",
      efficiency: "80%",
      cost: "High",
      time: "5 Days",
    },
  };

  const method =
    methods[material.recommendation] ||
    methods["Mechanical Recycling"];

  return (
    <div className="rounded-2xl bg-white p-8 shadow-card">

      <div className="mb-6 flex items-center gap-3">

        <Recycle
          size={28}
          className="text-green-600"
        />

        <div>

          <h2 className="text-2xl font-bold text-heading">
            Recycling Method
          </h2>

          <p className="text-muted">
            Recommended recycling process based on AI analysis.
          </p>

        </div>

      </div>

      <div className="mb-8 rounded-2xl bg-green-50 p-6">

        <h3 className="text-2xl font-bold text-green-700">
          {material.recommendation}
        </h3>

      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        <MethodCard
          title="Difficulty"
          value={method.difficulty}
          icon={Gauge}
          color="bg-orange-100 text-orange-600"
        />

        <MethodCard
          title="Efficiency"
          value={method.efficiency}
          icon={Recycle}
          color="bg-green-100 text-green-600"
        />

        <MethodCard
          title="Estimated Cost"
          value={method.cost}
          icon={DollarSign}
          color="bg-blue-100 text-blue-600"
        />

        <MethodCard
          title="Processing Time"
          value={method.time}
          icon={Clock}
          color="bg-purple-100 text-purple-600"
        />

      </div>

    </div>
  );
}

export default RecyclingMethods;