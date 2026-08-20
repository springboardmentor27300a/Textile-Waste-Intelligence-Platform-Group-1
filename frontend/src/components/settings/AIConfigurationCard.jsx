import {
  BrainCircuit,
  Sparkles,
  BarChart3,
  FileText,
} from "lucide-react";

function AIConfigurationCard({ data, onChange }) {
  const handleInput = (field, value) => {
    onChange("ai", field, value);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

      {/* Header */}

      <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5">

        <div className="rounded-xl bg-cyan-100 p-3 text-cyan-600">
          <BrainCircuit size={22} />
        </div>

        <div>

          <h2 className="text-lg font-semibold text-heading">
            AI Configuration
          </h2>

          <p className="text-sm text-muted">
            Configure intelligent textile waste analysis and automation.
          </p>

        </div>

      </div>

      {/* Body */}

      <div className="grid gap-6 p-6 md:grid-cols-2">

        {/* AI Model */}

        <div>

          <label className="mb-2 block text-sm font-medium text-gray-700">
            Classification Model
          </label>

          <select
            value={data.model}
            onChange={(e) =>
              handleInput("model", e.target.value)
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-primary"
          >
            <option value="EfficientNetB0">
              EfficientNetB0
            </option>

            <option value="EfficientNetV2">
              EfficientNetV2
            </option>

            <option value="ResNet50">
              ResNet50
            </option>

          </select>

        </div>

        {/* Confidence */}

        <div>

          <label className="mb-2 flex justify-between text-sm font-medium text-gray-700">

            <span>Confidence Threshold</span>

            <span className="font-semibold text-primary">
              {data.confidence}%
            </span>

          </label>

          <input
            type="range"
            min="50"
            max="100"
            value={data.confidence}
            onChange={(e) =>
              handleInput(
                "confidence",
                Number(e.target.value)
              )
            }
            className="w-full accent-primary"
          />

        </div>

        {/* Auto Analyze */}

        <div className="rounded-xl border border-gray-200 p-5">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <Sparkles
                size={22}
                className="text-primary"
              />

              <div>

                <h3 className="font-semibold text-heading">
                  Auto Analyze Images
                </h3>

                <p className="text-sm text-muted">
                  Automatically analyze uploaded textile images.
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                handleInput(
                  "auto_analyze",
                  !data.auto_analyze
                )
              }
              className={`relative h-7 w-14 rounded-full transition ${
                data.auto_analyze
                  ? "bg-primary"
                  : "bg-gray-300"
              }`}
            >

              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                  data.auto_analyze
                    ? "left-8"
                    : "left-1"
                }`}
              />

            </button>

          </div>

        </div>

        {/* Auto Reports */}

        <div className="rounded-xl border border-gray-200 p-5">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <FileText
                size={22}
                className="text-green-600"
              />

              <div>

                <h3 className="font-semibold text-heading">
                  Auto Generate Reports
                </h3>

                <p className="text-sm text-muted">
                  Generate analytical reports after completed analysis.
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                handleInput(
                  "auto_reports",
                  !data.auto_reports
                )
              }
              className={`relative h-7 w-14 rounded-full transition ${
                data.auto_reports
                  ? "bg-primary"
                  : "bg-gray-300"
              }`}
            >

              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                  data.auto_reports
                    ? "left-8"
                    : "left-1"
                }`}
              />

            </button>

          </div>

        </div>

        {/* Dashboard Analytics */}

        <div className="rounded-xl border border-gray-200 p-5 md:col-span-2">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <BarChart3
                size={22}
                className="text-indigo-600"
              />

              <div>

                <h3 className="font-semibold text-heading">
                  Intelligent Dashboard Insights
                </h3>

                <p className="text-sm text-muted">
                  Enable AI-generated insights and recommendations throughout the dashboard.
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                handleInput(
                  "dashboard_ai",
                  !data.dashboard_ai
                )
              }
              className={`relative h-7 w-14 rounded-full transition ${
                data.dashboard_ai
                  ? "bg-primary"
                  : "bg-gray-300"
              }`}
            >

              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                  data.dashboard_ai
                    ? "left-8"
                    : "left-1"
                }`}
              />

            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default AIConfigurationCard;