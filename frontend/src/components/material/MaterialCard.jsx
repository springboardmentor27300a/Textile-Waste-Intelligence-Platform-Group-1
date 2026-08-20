import {
  Shirt,
  BadgeCheck,
  Layers,
} from "lucide-react";

function MaterialCard({ material }) {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-card">

      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

        {/* Left */}

        <div className="flex items-center gap-5">

          <div className="rounded-2xl bg-blue-100 p-5">

            <Shirt
              size={42}
              className="text-accent"
            />

          </div>

          <div>

            <p className="text-sm text-muted">
              Detected Material
            </p>

            <h2 className="mt-1 text-3xl font-bold text-heading">
              {material.name}
            </h2>

            <p className="mt-2 text-muted">
              AI classified this textile as
              {" "}
              <span className="font-semibold text-heading">
                {material.category}
              </span>
            </p>

          </div>

        </div>

        {/* Right */}

        <div className="grid gap-4 sm:grid-cols-2">

          <div className="rounded-xl bg-green-50 p-5">

            <div className="mb-3 flex items-center gap-2">

              <BadgeCheck
                size={20}
                className="text-green-600"
              />

              <p className="text-sm text-muted">
                Confidence
              </p>

            </div>

            <h3 className="text-3xl font-bold text-green-700">
              {material.confidence}%
            </h3>

          </div>

          <div className="rounded-xl bg-blue-50 p-5">

            <div className="mb-3 flex items-center gap-2">

              <Layers
                size={20}
                className="text-blue-600"
              />

              <p className="text-sm text-muted">
                Category
              </p>

            </div>

            <h3 className="text-xl font-semibold text-blue-700">
              {material.category}
            </h3>

          </div>

        </div>

      </div>

    </div>
  );
}

export default MaterialCard;