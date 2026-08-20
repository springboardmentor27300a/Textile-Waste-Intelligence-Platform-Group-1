import {
  Brain,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";

function ConfidenceBar({ value = 0 }) {
  const getStatus = () => {
    if (value >= 95)
      return {
        label: "Excellent",
        color: "bg-green-500",
        bg: "bg-green-100",
        text: "text-green-700",
        icon: CheckCircle2,
      };

    if (value >= 85)
      return {
        label: "High",
        color: "bg-blue-500",
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: Brain,
      };

    if (value >= 70)
      return {
        label: "Moderate",
        color: "bg-yellow-500",
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: AlertTriangle,
      };

    return {
      label: "Low",
      color: "bg-red-500",
      bg: "bg-red-100",
      text: "text-red-700",
      icon: XCircle,
    };
  };

  const status = getStatus();
  const Icon = status.icon;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">

      <div className="mb-6 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className={`rounded-xl p-3 ${status.bg}`}>
            <Icon
              className={status.text}
              size={22}
            />
          </div>

          <div>

            <h3 className="text-xl font-bold text-heading">
              AI Confidence
            </h3>

            <p className="text-muted">
              Prediction reliability
            </p>

          </div>

        </div>

        <div className="text-right">

          <h2 className="text-3xl font-bold text-heading">
            {value}%
          </h2>

          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${status.bg} ${status.text}`}
          >
            {status.label}
          </span>

        </div>

      </div>

      <div className="h-4 overflow-hidden rounded-full bg-slate-200">

        <div
          className={`h-full rounded-full transition-all duration-1000 ${status.color}`}
          style={{
            width: `${value}%`,
          }}
        />

      </div>

      <div className="mt-4 flex justify-between text-xs text-muted">

        <span>0%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>

      </div>

    </div>
  );
}

export default ConfidenceBar;