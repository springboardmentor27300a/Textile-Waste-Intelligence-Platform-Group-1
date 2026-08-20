import {
  Recycle,
  RefreshCw,
  Leaf,
  Factory,
  Target,
  Info,
  ShieldCheck,
  Gauge,
  Settings2,
} from "lucide-react";

/* ============================================================
   Helpers
============================================================ */

function safeNumber(value, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

function clamp(value) {
  return Math.max(
    0,
    Math.min(100, safeNumber(value))
  );
}

function formatScore(value) {
  return Number(clamp(value).toFixed(1));
}

function getScoreColor(score) {
  const value = clamp(score);

  if (value >= 85) {
    return "#16A34A";
  }

  if (value >= 70) {
    return "#2563EB";
  }

  if (value >= 55) {
    return "#F59E0B";
  }

  return "#DC2626";
}

function getScoreLabel(score) {
  const value = clamp(score);

  if (value >= 85) {
    return "Excellent";
  }

  if (value >= 70) {
    return "High";
  }

  if (value >= 55) {
    return "Moderate";
  }

  if (value >= 35) {
    return "Limited";
  }

  return "Disposal Recommended";
}

function getCircularityCategory(score) {
  const value = clamp(score);

  if (value >= 85) {
    return "Excellent Recovery Potential";
  }

  if (value >= 70) {
    return "High Recovery Potential";
  }

  if (value >= 55) {
    return "Moderate Recovery Potential";
  }

  if (value >= 35) {
    return "Limited Recovery Potential";
  }

  return "Disposal Recommended";
}

function getStatusClass(score) {
  const value = clamp(score);

  if (value >= 85) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (value >= 70) {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (value >= 55) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-red-200 bg-red-50 text-red-700";
}

function normalizeWeightedModel(model) {
  if (!model || typeof model !== "object") {
    return [];
  }

  return Object.entries(model)
    .map(([key, rawValue]) => {
      /*
       * Supported backend shapes:
       *
       * {
       *   material_recyclability: {
       *     value: 80,
       *     weight: 35
       *   }
       * }
       *
       * OR
       *
       * {
       *   material_recyclability: 80
       * }
       */

      if (
        rawValue !== null &&
        typeof rawValue === "object"
      ) {
        return {
          key,
          value: safeNumber(
            rawValue.value ??
              rawValue.score ??
              rawValue.percentage
          ),
          weight: safeNumber(
            rawValue.weight ??
              rawValue.weight_percentage
          ),
          contribution: safeNumber(
            rawValue.contribution
          ),
        };
      }

      return {
        key,
        value: safeNumber(rawValue),
        weight: 0,
        contribution: 0,
      };
    })
    .filter((item) => item.value >= 0);
}

function formatLabel(value) {
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

/* ============================================================
   Score Card
============================================================ */

function ScoreCard({
  title,
  score,
  color,
  bg,
  icon: Icon,
}) {
  const percentage = clamp(score);
  const status = getScoreLabel(percentage);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

      <div className="flex items-start justify-between gap-4">

        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <div className="mt-3 flex items-baseline gap-1">
            <h2 className="text-4xl font-extrabold text-heading">
              {formatScore(percentage)}
            </h2>

            <span className="text-sm font-semibold text-slate-500">
              %
            </span>
          </div>

          <span
            className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
              percentage
            )}`}
          >
            {status}
          </span>
        </div>

        <div
          className={`rounded-2xl p-4 ${bg}`}
        >
          <Icon
            size={28}
            className={color}
          />
        </div>

      </div>

      <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-slate-100">

        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${percentage}%`,
            backgroundColor:
              getScoreColor(percentage),
          }}
        />

      </div>

    </div>
  );
}

/* ============================================================
   Circularity Category
============================================================ */

function CircularityCategory({
  minimum,
  maximum,
  title,
  description,
  active,
}) {
  return (
    <div
      className={`rounded-xl border p-4 transition ${
        active
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-3">

        <div className="flex items-center gap-3">

          <div
            className={`h-3 w-3 rounded-full ${
              active
                ? "bg-primary"
                : "bg-slate-300"
            }`}
          />

          <div>
            <p
              className={`font-semibold ${
                active
                  ? "text-primary"
                  : "text-heading"
              }`}
            >
              {title}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {description}
            </p>
          </div>

        </div>

        <span className="whitespace-nowrap text-xs font-semibold text-slate-500">
          {minimum}–{maximum}
        </span>

      </div>
    </div>
  );
}

/* ============================================================
   Main Component
============================================================ */

function WasteScoringSection({
  data,
}) {
  if (!data) {
    return null;
  }

  const recyclabilityScore =
    clamp(data.recyclability_score);

  const reuseScore =
    clamp(data.reuse_score);

  const sustainabilityScore =
    clamp(data.sustainability_score);

  const materialRecoveryScore =
    clamp(data.material_recovery_score);

  const circularityScore =
    clamp(data.circularity_score);

  const overallScore =
    clamp(
      data.overall_score ??
        data.sustainability_score ??
        circularityScore
    );

  const weightedModel =
    normalizeWeightedModel(
      data.weighted_model
    );

  const circularityCategory =
    data.circularity_category ||
    getCircularityCategory(
      circularityScore
    );

  const overallRating =
    data.overall_rating ||
    getScoreLabel(overallScore);

  const overallGrade =
    data.overall_grade ||
    (
      overallScore >= 90
        ? "A+"
        : overallScore >= 80
          ? "A"
          : overallScore >= 70
            ? "B"
            : overallScore >= 60
              ? "C"
              : "D"
    );

  const recoveryLevel =
    data.recovery_level ||
    getScoreLabel(
      materialRecoveryScore
    );

  const reuseLevel =
    data.reuse_level ||
    getScoreLabel(reuseScore);

  const environmentalRating =
    data.environmental_rating ||
    getScoreLabel(
      data.environmental_score ?? 0
    );

  const processingDifficulty =
    data.processing_difficulty ||
    "Not available";

  const recoveryPercentage =
    data.recovery_percentage ??
    materialRecoveryScore;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

      {/* ======================================================
          Header
      ====================================================== */}

      <div className="mb-8">

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

          <div className="flex items-start gap-3">

            <div className="rounded-xl bg-emerald-100 p-3">
              <Recycle
                className="text-emerald-700"
                size={24}
              />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-heading md:text-3xl">
                Waste Scoring Engine
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                Intelligent evaluation of textile waste
                recovery potential using recyclability,
                reuse potential, environmental benefit,
                material recovery and circularity metrics.
              </p>
            </div>

          </div>

          <div
            className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${getStatusClass(
              circularityScore
            )}`}
          >
            <Gauge size={16} />

            {circularityCategory}
          </div>

        </div>

      </div>

      {/* ======================================================
          Score Cards
      ====================================================== */}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">

        <ScoreCard
          title="Recyclability"
          score={recyclabilityScore}
          icon={Recycle}
          color="text-blue-600"
          bg="bg-blue-100"
        />

        <ScoreCard
          title="Reuse"
          score={reuseScore}
          icon={RefreshCw}
          color="text-emerald-600"
          bg="bg-emerald-100"
        />

        <ScoreCard
          title="Material Recovery"
          score={materialRecoveryScore}
          icon={Factory}
          color="text-orange-600"
          bg="bg-orange-100"
        />

        <ScoreCard
          title="Sustainability"
          score={sustainabilityScore}
          icon={Leaf}
          color="text-green-600"
          bg="bg-green-100"
        />

        <ScoreCard
          title="Circularity"
          score={circularityScore}
          icon={Target}
          color="text-purple-600"
          bg="bg-purple-100"
        />

      </div>

      {/* ======================================================
          Weighted Scoring Model
      ====================================================== */}

      <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-6 md:p-8">

        <div className="mb-8 flex items-start gap-3">

          <div className="rounded-xl bg-primary/10 p-3">
            <Settings2
              className="text-primary"
              size={22}
            />
          </div>

          <div>
            <h3 className="text-xl font-bold text-heading md:text-2xl">
              Weighted Circularity Scoring Model
            </h3>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              The overall circularity score combines five
              recovery dimensions using the Milestone 3
              weighted model.
            </p>
          </div>

        </div>

        {/* Required Milestone 3 weights */}

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Material Recyclability
            </p>

            <p className="mt-2 text-2xl font-extrabold text-blue-600">
              35%
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Material Condition
            </p>

            <p className="mt-2 text-2xl font-extrabold text-emerald-600">
              20%
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Reuse Potential
            </p>

            <p className="mt-2 text-2xl font-extrabold text-purple-600">
              20%
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Environmental Benefit
            </p>

            <p className="mt-2 text-2xl font-extrabold text-cyan-600">
              15%
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Processing Feasibility
            </p>

            <p className="mt-2 text-2xl font-extrabold text-orange-600">
              10%
            </p>
          </div>

        </div>

        {weightedModel.length > 0 ? (
          <div className="space-y-5">

            {weightedModel.map(
              ({
                key,
                value,
                weight,
                contribution,
              }) => {
                const score =
                  clamp(value);

                const calculatedContribution =
                  contribution > 0
                    ? contribution
                    : weight > 0
                      ? (score * weight) /
                        100
                      : 0;

                return (
                  <div
                    key={key}
                    className="rounded-xl border border-slate-200 bg-white p-5"
                  >

                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                      <div>
                        <p className="font-semibold text-heading">
                          {formatLabel(key)}
                        </p>

                        <p className="text-xs text-slate-500">
                          Weighted contribution:{" "}
                          {calculatedContribution.toFixed(
                            1
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          Weight {weight}%
                        </span>

                        <span className="font-bold text-primary">
                          {formatScore(score)}%
                        </span>

                      </div>

                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">

                      <div
                        className="h-full rounded-full bg-primary transition-all duration-700"
                        style={{
                          width: `${score}%`,
                        }}
                      />

                    </div>

                  </div>
                );
              }
            )}

          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">

            <Info className="mx-auto text-slate-400" />

            <p className="mt-3 text-sm font-medium text-slate-600">
              Weighted component values are not available
              from the analytics response.
            </p>

            <p className="mt-1 text-xs text-slate-500">
              The defined Milestone 3 weighting is shown above.
            </p>

          </div>
        )}

        {/* Formula */}

        <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-5">

          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Circularity Formula
          </p>

          <p className="mt-3 text-sm font-semibold leading-7 text-slate-700">
            Circularity Score =
            Material Recyclability × 35% +
            Material Condition × 20% +
            Reuse Potential × 20% +
            Environmental Benefit × 15% +
            Processing Feasibility × 10%
          </p>

        </div>

      </div>

      {/* ======================================================
          Circularity Categories
      ====================================================== */}

      <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-6 md:p-8">

        <div className="mb-6 flex items-start gap-3">

          <div className="rounded-xl bg-purple-100 p-3">
            <Target
              className="text-purple-700"
              size={22}
            />
          </div>

          <div>
            <h3 className="text-xl font-bold text-heading">
              Circularity Categories
            </h3>

            <p className="mt-1 text-sm text-muted">
              Recovery category determined from the overall
              circularity score.
            </p>
          </div>

        </div>

        <div className="grid gap-3 lg:grid-cols-2">

          <CircularityCategory
            minimum="85%"
            maximum="100%"
            title="Excellent Recovery Potential"
            description="Strong recycling and reuse opportunity."
            active={
              circularityScore >= 85
            }
          />

          <CircularityCategory
            minimum="70%"
            maximum="84%"
            title="High Recovery Potential"
            description="Good recovery opportunity with suitable processing."
            active={
              circularityScore >= 70 &&
              circularityScore < 85
            }
          />

          <CircularityCategory
            minimum="55%"
            maximum="69%"
            title="Moderate Recovery Potential"
            description="Recovery is feasible with additional processing."
            active={
              circularityScore >= 55 &&
              circularityScore < 70
            }
          />

          <CircularityCategory
            minimum="35%"
            maximum="54%"
            title="Limited Recovery Potential"
            description="Recovery options are constrained."
            active={
              circularityScore >= 35 &&
              circularityScore < 55
            }
          />

          <CircularityCategory
            minimum="0%"
            maximum="34%"
            title="Disposal Recommended"
            description="Recovery potential is currently very limited."
            active={
              circularityScore < 35
            }
          />

        </div>

      </div>

      {/* ======================================================
          Summary Scores
      ====================================================== */}

      <div className="mt-10 grid gap-5 lg:grid-cols-3">

        <div className="rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-700 p-7 text-white shadow-sm">

          <p className="text-sm font-medium uppercase tracking-wider text-purple-100">
            Circularity Score
          </p>

          <h2 className="mt-3 text-5xl font-extrabold">
            {formatScore(circularityScore)}%
          </h2>

          <p className="mt-4 text-sm text-purple-100">
            {circularityCategory}
          </p>

        </div>

        <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-green-700 p-7 text-white shadow-sm">

          <p className="text-sm font-medium uppercase tracking-wider text-emerald-100">
            Overall Score
          </p>

          <h2 className="mt-3 text-5xl font-extrabold">
            {formatScore(overallScore)}%
          </h2>

          <p className="mt-4 text-sm text-emerald-100">
            {overallRating}
          </p>

        </div>

        <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-700 p-7 text-white shadow-sm">

          <p className="text-sm font-medium uppercase tracking-wider text-blue-100">
            Overall Grade
          </p>

          <h2 className="mt-3 text-5xl font-extrabold">
            {overallGrade}
          </h2>

          <p className="mt-4 text-sm text-blue-100">
            Textile Waste Intelligence Assessment
          </p>

        </div>

      </div>

      {/* ======================================================
          Intelligence Summary
      ====================================================== */}

      <div className="mt-10">

        <h3 className="mb-5 text-xl font-bold text-heading">
          Recovery Intelligence
        </h3>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-2">
              <Factory
                size={18}
                className="text-emerald-600"
              />

              <p className="text-sm text-slate-500">
                Recovery Level
              </p>
            </div>

            <h3 className="mt-3 text-2xl font-bold text-emerald-600">
              {recoveryLevel}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Recovery efficiency{" "}
              <span className="font-semibold text-slate-700">
                {formatScore(
                  recoveryPercentage
                )}
                %
              </span>
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-2">
              <RefreshCw
                size={18}
                className="text-blue-600"
              />

              <p className="text-sm text-slate-500">
                Reuse Level
              </p>
            </div>

            <h3 className="mt-3 text-2xl font-bold text-blue-600">
              {reuseLevel}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Estimated reuse potential:
              {" "}
              <span className="font-semibold text-slate-700">
                {formatScore(reuseScore)}%
              </span>
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-2">
              <Leaf
                size={18}
                className="text-purple-600"
              />

              <p className="text-sm text-slate-500">
                Environmental Rating
              </p>
            </div>

            <h3 className="mt-3 text-2xl font-bold text-purple-600">
              {environmentalRating}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Environmental benefit of the selected
              recovery pathway.
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-2">
              <ShieldCheck
                size={18}
                className="text-orange-600"
              />

              <p className="text-sm text-slate-500">
                Processing Difficulty
              </p>
            </div>

            <h3 className="mt-3 text-2xl font-bold text-orange-600">
              {processingDifficulty}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Processing feasibility affects the final
              circularity assessment.
            </p>

          </div>

        </div>

      </div>

      {/* ======================================================
          AI Summary
      ====================================================== */}

      <div className="mt-10 rounded-3xl bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 p-7 text-white md:p-8">

        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

          <div className="max-w-3xl">

            <div className="flex items-center gap-2">

              <ShieldCheck size={22} />

              <p className="text-sm font-semibold uppercase tracking-wider text-green-100">
                Waste Intelligence
              </p>

            </div>

            <h2 className="mt-3 text-2xl font-bold md:text-3xl">
              Recovery Assessment Summary
            </h2>

            <p className="mt-4 leading-7 text-green-100">
              The textile waste has been evaluated using the
              Milestone 3 weighted scoring model. The assessment
              considers recyclability, material condition, reuse
              potential, environmental benefit and processing
              feasibility to determine the material's recovery
              potential and circular economy performance.
            </p>

          </div>

          <div className="shrink-0 rounded-3xl bg-white/10 px-8 py-7 backdrop-blur">

            <p className="text-sm text-green-100">
              Circularity
            </p>

            <h2 className="mt-2 text-5xl font-extrabold">
              {formatScore(circularityScore)}%
            </h2>

            <span className="mt-4 inline-block rounded-full bg-white/20 px-4 py-2 text-xs font-semibold">
              {circularityCategory}
            </span>

          </div>

        </div>

      </div>

    </section>
  );
}

export default WasteScoringSection;