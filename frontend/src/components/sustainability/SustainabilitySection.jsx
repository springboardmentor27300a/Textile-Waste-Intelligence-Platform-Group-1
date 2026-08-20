import {
  Leaf,
  Globe2,
  Award,
  Building2,
  Target,
  BadgeCheck,
  TrendingUp,
  Recycle,
  Factory,
  Droplets,
//  Trees,
  BarChart3,
  ShieldCheck,
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

function clampPercentage(value) {
  return Math.max(
    0,
    Math.min(100, safeNumber(value))
  );
}

function formatNumber(value, decimals = 1) {
  const number = safeNumber(value);

  return Number(
    number.toFixed(decimals)
  ).toLocaleString();
}

function formatPercentage(value) {
  return `${formatNumber(
    clampPercentage(value)
  )}%`;
}

function getPerformanceLabel(value) {
  const score = clampPercentage(value);

  if (score >= 85) {
    return "Excellent";
  }

  if (score >= 70) {
    return "High";
  }

  if (score >= 55) {
    return "Moderate";
  }

  if (score >= 35) {
    return "Limited";
  }

  return "Low";
}

function getTargetStatus(progress, target) {
  const current = safeNumber(progress);
  const targetValue = safeNumber(target);

  if (targetValue <= 0) {
    return "Not Available";
  }

  if (current >= targetValue) {
    return "Target Achieved";
  }

  const achievement =
    (current / targetValue) * 100;

  if (achievement >= 80) {
    return "Near Target";
  }

  if (achievement >= 50) {
    return "In Progress";
  }

  return "Needs Improvement";
}

function getStatusClass(status) {
  const normalized =
    String(status || "")
      .toLowerCase();

  if (
    normalized.includes("achieved") ||
    normalized.includes("excellent") ||
    normalized.includes("high")
  ) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (
    normalized.includes("near") ||
    normalized.includes("progress") ||
    normalized.includes("moderate")
  ) {
    return "bg-blue-100 text-blue-700";
  }

  if (
    normalized.includes("limited") ||
    normalized.includes("improvement")
  ) {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-red-100 text-red-700";
}

/* ============================================================
   Intelligence Card
============================================================ */

function IntelligenceCard({
  title,
  value,
  icon: Icon,
  color,
  bg,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

      <div className="flex items-start justify-between gap-4">

        <div>

          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h2 className="mt-3 text-3xl font-extrabold text-heading md:text-4xl">
            {value}
          </h2>

          {description && (
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {description}
            </p>
          )}

        </div>

        <div
          className={`shrink-0 rounded-2xl p-4 ${bg}`}
        >
          <Icon
            size={28}
            className={color}
          />
        </div>

      </div>

    </div>
  );
}

/* ============================================================
   Progress Bar
============================================================ */

function ProgressBar({
  value,
  color = "bg-primary",
}) {
  const percentage =
    clampPercentage(value);

  return (
    <div className="h-3 overflow-hidden rounded-full bg-slate-200">

      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{
          width: `${percentage}%`,
        }}
      />

    </div>
  );
}

/* ============================================================
   Sustainability Intelligence Engine
============================================================ */

function SustainabilitySection({
  data,
}) {
  if (!data) {
    return null;
  }

  /* ==========================================================
     Core Sustainability Metrics
  ========================================================== */

  const sustainabilityScore =
    data.sustainability_score ??
    data.overall_score ??
    0;

  const esgScore =
    data.esg_score ??
    0;

  const circularEconomyIndex =
    data.circular_economy_index ??
    0;

  const companyLevel =
    data.company_level ||
    getPerformanceLabel(
      sustainabilityScore
    );

  /* ==========================================================
     Status
  ========================================================== */

  const sustainabilityRating =
    data.sustainability_rating ||
    getPerformanceLabel(
      sustainabilityScore
    );

  const sustainabilityStatus =
    data.sustainability_status ||
    (
      safeNumber(
        sustainabilityScore
      ) >= 70
        ? "Sustainable performance"
        : "Performance requires improvement"
    );

  const esgReadiness =
    data.esg_readiness ||
    getPerformanceLabel(
      esgScore
    );

  const circularEconomyStatus =
    data.circular_economy_status ||
    getPerformanceLabel(
      circularEconomyIndex
    );

  /* ==========================================================
     Recycling Target
  ========================================================== */

  const recyclingTarget =
    data.recycling_target ??
    90;

  const recyclingProgress =
    data.recycling_progress ??
    0;

  const calculatedTargetAchievement =
    data.target_achievement ??
    (
      safeNumber(recyclingTarget) > 0
        ? (
            safeNumber(
              recyclingProgress
            ) /
            safeNumber(
              recyclingTarget
            )
          ) * 100
        : 0
    );

  const targetAchievement =
    clampPercentage(
      calculatedTargetAchievement
    );

  const targetStatus =
    data.target_status ||
    getTargetStatus(
      recyclingProgress,
      recyclingTarget
    );

  /* ==========================================================
     Benchmark
  ========================================================== */

  const companyScore =
    data.company_score ??
    sustainabilityScore;

  const benchmark =
    data.benchmark ||
    companyLevel;

  /* ==========================================================
     Recommendations
  ========================================================== */

  const recommendation =
    data.recommendation ||
    "Prioritize textile recovery pathways with high recyclability and reuse potential. Increasing recycling progress, reducing virgin material demand and improving resource recovery will strengthen sustainability and ESG performance.";

  const summary =
    data.summary ||
    "The sustainability assessment combines circularity, environmental performance, ESG readiness and recycling target progress to provide an overall view of textile recovery performance.";

  /* ==========================================================
     Optional resource metrics
  ========================================================== */

  const carbonSavings =
    data.carbon_savings ??
    0;

  const waterSavings =
    data.water_savings ??
    0;

  const landfillDiversion =
    data.landfill_diversion ??
    0;

  const resourceRecovery =
    data.resource_recovery ??
    data.resource_conservation ??
    0;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

      {/* ======================================================
          Header
      ====================================================== */}

      <div className="mb-8">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

          <div className="flex items-start gap-3">

            <div className="rounded-xl bg-green-100 p-3">
              <Leaf
                size={24}
                className="text-green-700"
              />
            </div>

            <div>

              <h2 className="text-2xl font-bold text-heading md:text-3xl">
                Sustainability Intelligence Engine
              </h2>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-muted">
                Executive sustainability intelligence combining
                ESG performance, circular economy analytics,
                environmental savings, recycling progress,
                sustainability benchmarking and strategic
                recommendations.
              </p>

            </div>

          </div>

          <div
            className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${getStatusClass(
              sustainabilityRating
            )}`}
          >

            <ShieldCheck size={16} />

            {sustainabilityRating}

          </div>

        </div>

      </div>

      {/* ======================================================
          KPI Cards
      ====================================================== */}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        <IntelligenceCard
          title="Sustainability Score"
          value={formatPercentage(
            sustainabilityScore
          )}
          icon={Leaf}
          color="text-green-600"
          bg="bg-green-100"
          description="Overall sustainability performance."
        />

        <IntelligenceCard
          title="ESG Score"
          value={formatNumber(esgScore)}
          icon={Award}
          color="text-purple-600"
          bg="bg-purple-100"
          description="Environmental, social and governance readiness."
        />

        <IntelligenceCard
          title="Circular Economy"
          value={formatPercentage(
            circularEconomyIndex
          )}
          icon={Globe2}
          color="text-blue-600"
          bg="bg-blue-100"
          description="Closed-loop material recovery performance."
        />

        <IntelligenceCard
          title="Company Benchmark"
          value={companyLevel}
          icon={Building2}
          color="text-orange-600"
          bg="bg-orange-100"
          description="Relative sustainability performance."
        />

      </div>

      {/* ======================================================
          Environmental / Circular Economy Snapshot
      ====================================================== */}

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-green-100 p-3">
              <Leaf
                size={20}
                className="text-green-600"
              />
            </div>

            <div>
              <p className="text-xs text-slate-500">
                CO2 Savings
              </p>

              <p className="text-xl font-bold text-heading">
                {formatNumber(carbonSavings)}
                <span className="ml-1 text-xs text-slate-500">
                  kg
                </span>
              </p>
            </div>

          </div>

        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-cyan-100 p-3">
              <Droplets
                size={20}
                className="text-cyan-600"
              />
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Water Savings
              </p>

              <p className="text-xl font-bold text-heading">
                {formatNumber(waterSavings)}
                <span className="ml-1 text-xs text-slate-500">
                  L
                </span>
              </p>
            </div>

          </div>

        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-amber-100 p-3">
              <Recycle
                size={20}
                className="text-amber-600"
              />
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Landfill Diversion
              </p>

              <p className="text-xl font-bold text-heading">
                {formatNumber(
                  landfillDiversion
                )}
                <span className="ml-1 text-xs text-slate-500">
                  kg
                </span>
              </p>
            </div>

          </div>

        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-purple-100 p-3">
              <Factory
                size={20}
                className="text-purple-600"
              />
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Resource Recovery
              </p>

              <p className="text-xl font-bold text-heading">
                {formatPercentage(
                  resourceRecovery
                )}
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* ======================================================
          Status Cards
      ====================================================== */}

      <div className="mt-8 grid gap-5 lg:grid-cols-3">

        <div className="rounded-2xl border border-green-200 bg-green-50 p-6">

          <div className="flex items-center gap-3">

            <Leaf
              size={22}
              className="text-green-700"
            />

            <p className="text-sm font-semibold text-green-700">
              Sustainability Rating
            </p>

          </div>

          <h2 className="mt-4 text-3xl font-bold text-green-700">
            {sustainabilityRating}
          </h2>

          <p className="mt-3 leading-6 text-slate-600">
            {sustainabilityStatus}
          </p>

        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">

          <div className="flex items-center gap-3">

            <Award
              size={22}
              className="text-blue-700"
            />

            <p className="text-sm font-semibold text-blue-700">
              ESG Readiness
            </p>

          </div>

          <h2 className="mt-4 text-3xl font-bold text-blue-700">
            {esgReadiness}
          </h2>

          <p className="mt-3 leading-6 text-slate-600">
            Environmental, Social & Governance performance.
          </p>

        </div>

        <div className="rounded-2xl border border-purple-200 bg-purple-50 p-6">

          <div className="flex items-center gap-3">

            <Recycle
              size={22}
              className="text-purple-700"
            />

            <p className="text-sm font-semibold text-purple-700">
              Circular Economy Status
            </p>

          </div>

          <h2 className="mt-4 text-3xl font-bold text-purple-700">
            {circularEconomyStatus}
          </h2>

          <p className="mt-3 leading-6 text-slate-600">
            Closed-loop material recovery performance.
          </p>

        </div>

      </div>

      {/* ======================================================
          Recycling Target
      ====================================================== */}

      <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-6 md:p-8">

        <div className="mb-8 flex items-start gap-3">

          <div className="rounded-xl bg-primary/10 p-3">
            <Target
              className="text-primary"
              size={22}
            />
          </div>

          <div>

            <h3 className="text-2xl font-bold text-heading">
              Recycling Target Performance
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted">
              Track progress towards organizational recycling
              and sustainability objectives.
            </p>

          </div>

        </div>

        {/* Achievement Bar */}

        <div>

          <div className="mb-3 flex items-center justify-between gap-4">

            <div>
              <p className="font-semibold text-heading">
                Target Achievement
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Current progress relative to the defined target.
              </p>
            </div>

            <span className="font-bold text-primary">
              {formatPercentage(
                targetAchievement
              )}
            </span>

          </div>

          <ProgressBar
            value={targetAchievement}
            color="bg-primary"
          />

        </div>

        {/* Target Cards */}

        <div className="mt-8 grid gap-5 md:grid-cols-3">

          <div className="rounded-2xl bg-white p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              Recycling Target
            </p>

            <h3 className="mt-2 text-3xl font-bold text-heading">
              {formatPercentage(
                recyclingTarget
              )}
            </h3>

          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              Current Progress
            </p>

            <h3 className="mt-2 text-3xl font-bold text-green-600">
              {formatPercentage(
                recyclingProgress
              )}
            </h3>

          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              Target Status
            </p>

            <div className="mt-3">

              <span
                className={`inline-flex rounded-full px-4 py-2 text-sm font-bold ${getStatusClass(
                  targetStatus
                )}`}
              >
                {targetStatus}
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* ======================================================
          Sustainability Benchmark
      ====================================================== */}

      <div className="mt-10">

        <div className="mb-6 flex items-center gap-3">

          <div className="rounded-xl bg-blue-100 p-3">

            <BarChart3
              size={22}
              className="text-blue-700"
            />

          </div>

          <div>

            <h3 className="text-2xl font-bold text-heading">
              Sustainability Benchmarking
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Compare organizational sustainability performance
              against benchmark indicators.
            </p>

          </div>

        </div>

        <div className="grid gap-6 lg:grid-cols-2">

          <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-7 text-white">

            <div className="flex items-center gap-3">

              <Building2 size={28} />

              <h3 className="text-xl font-bold">
                Industry Benchmark
              </h3>

            </div>

            <h2 className="mt-8 text-5xl font-extrabold md:text-6xl">
              {companyLevel}
            </h2>

            <p className="mt-4 text-blue-100">
              Benchmark Score:{" "}
              <span className="font-bold text-white">
                {formatNumber(companyScore)}
              </span>
            </p>

          </div>

          <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-green-700 p-7 text-white">

            <div className="flex items-center gap-3">

              <BadgeCheck size={28} />

              <h3 className="text-xl font-bold">
                Sustainability Benchmark
              </h3>

            </div>

            <h2 className="mt-8 text-5xl font-extrabold md:text-6xl">
              {benchmark}
            </h2>

            <p className="mt-4 text-green-100">
              Organization performance classification.
            </p>

          </div>

        </div>

      </div>

      {/* ======================================================
          Circular Economy Analysis
      ====================================================== */}

      <div className="mt-10 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 md:p-8">

        <div className="flex items-start gap-3">

          <div className="rounded-xl bg-white p-3">
            <Recycle
              size={22}
              className="text-emerald-600"
            />
          </div>

          <div>

            <h3 className="text-2xl font-bold text-heading">
              Circular Economy Analysis
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Measures how effectively textile materials are
              kept in productive use through recycling, reuse
              and resource recovery.
            </p>

          </div>

        </div>

        <div className="mt-7">

          <div className="mb-3 flex items-center justify-between">

            <span className="font-semibold text-heading">
              Circular Economy Index
            </span>

            <span className="font-bold text-emerald-600">
              {formatPercentage(
                circularEconomyIndex
              )}
            </span>

          </div>

          <ProgressBar
            value={circularEconomyIndex}
            color="bg-emerald-600"
          />

        </div>

      </div>

      {/* ======================================================
          AI Recommendation
      ====================================================== */}

      <div className="mt-10 rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 p-6 md:p-8">

        <div className="flex items-start gap-3">

          <div className="rounded-xl bg-white p-3 shadow-sm">

            <TrendingUp
              size={22}
              className="text-emerald-600"
            />

          </div>

          <div>

            <h3 className="text-2xl font-bold text-emerald-700">
              AI Sustainability Recommendation
            </h3>

            <p className="mt-5 text-base leading-7 text-slate-700">
              {recommendation}
            </p>

          </div>

        </div>

      </div>

      {/* ======================================================
          Executive Summary
      ====================================================== */}

      <div className="mt-10 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white md:p-8">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-white/10 p-3">

            <ShieldCheck size={24} />

          </div>

          <h2 className="text-2xl font-bold md:text-3xl">
            Executive Sustainability Summary
          </h2>

        </div>

        <p className="mt-6 max-w-5xl leading-8 text-slate-300">
          {summary}
        </p>

      </div>

    </section>
  );
}

export default SustainabilitySection;