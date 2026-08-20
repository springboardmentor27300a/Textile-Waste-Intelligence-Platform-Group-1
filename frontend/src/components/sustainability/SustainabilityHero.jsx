import {
  Leaf,
  Award,
  Globe2,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

function HeroCard({
  icon: Icon,
  title,
  value,
  color,
  bg,
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-lg">
      <div>
        <p className="text-sm text-slate-500">
          {title}
        </p>

        <h2 className="mt-2 text-3xl font-extrabold text-slate-800">
          {value}
        </h2>
      </div>

      <div className={`rounded-2xl p-4 ${bg}`}>
        <Icon
          size={32}
          className={color}
        />
      </div>
    </div>
  );
}

function SustainabilityHero({
  dashboard,
}) {
  const sustainability = dashboard?.sustainability ?? {};

  const overallScore =
    sustainability.overall_score ??
    sustainability.sustainability_score ??
    0;

  const esgScore =
    sustainability.esg_score ?? 0;

  const circularityIndex =
    sustainability.circular_economy_index ?? 0;

  const sustainabilityStatus =
    sustainability.sustainability_status ||
    "No assessment available";

  const esgReadiness =
    sustainability.esg_readiness ||
    "Not assessed";

  const circularEconomyStatus =
    sustainability.circular_economy_status ||
    "Not assessed";

  const benchmarkLevel =
    sustainability.benchmark_level ||
    sustainability.company_level ||
    "Not assessed";

  const recommendation =
    sustainability.recommendation ||
    "Increase closed-loop recycling, improve material recovery efficiency and reduce landfill disposal to achieve higher sustainability performance.";

  return (
    <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 text-white shadow-2xl">

      {/* =====================================================
          Main Hero
      ===================================================== */}

      <div className="grid gap-10 p-8 lg:p-10 xl:grid-cols-[2fr_1fr]">

        {/* ===================================================
            Left Content
        =================================================== */}

        <div>

          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
            <Leaf size={18} />

            Sustainability Intelligence Engine
          </div>

          <h1 className="text-4xl font-extrabold leading-tight lg:text-5xl">
            ESG & Circular Economy Intelligence
          </h1>

          <p className="mt-6 max-w-3xl text-base leading-8 text-green-100 lg:text-lg">
            Monitor textile sustainability, environmental impact,
            circular economy performance, recycling targets,
            ESG readiness and intelligent recommendations from
            one unified sustainability platform.
          </p>

          {/* Status Summary */}

          <div className="mt-10 grid gap-4 sm:grid-cols-3">

            <div className="rounded-2xl bg-white/10 px-5 py-5 backdrop-blur">
              <p className="text-sm text-green-100">
                Sustainability Status
              </p>

              <h3 className="mt-2 text-xl font-bold">
                {sustainabilityStatus}
              </h3>
            </div>

            <div className="rounded-2xl bg-white/10 px-5 py-5 backdrop-blur">
              <p className="text-sm text-green-100">
                ESG Readiness
              </p>

              <h3 className="mt-2 text-xl font-bold">
                {esgReadiness}
              </h3>
            </div>

            <div className="rounded-2xl bg-white/10 px-5 py-5 backdrop-blur">
              <p className="text-sm text-green-100">
                Circular Economy
              </p>

              <h3 className="mt-2 text-xl font-bold">
                {circularEconomyStatus}
              </h3>
            </div>

          </div>

        </div>

        {/* ===================================================
            KPI Cards
        =================================================== */}

        <div className="flex flex-col gap-4">

          <HeroCard
            icon={Leaf}
            title="Overall Sustainability"
            value={`${overallScore}%`}
            color="text-green-600"
            bg="bg-green-100"
          />

          <HeroCard
            icon={Award}
            title="ESG Score"
            value={esgScore}
            color="text-purple-600"
            bg="bg-purple-100"
          />

          <HeroCard
            icon={Globe2}
            title="Circular Economy"
            value={`${circularityIndex}%`}
            color="text-blue-600"
            bg="bg-blue-100"
          />

          <HeroCard
            icon={ShieldCheck}
            title="Industry Benchmark"
            value={benchmarkLevel}
            color="text-orange-600"
            bg="bg-orange-100"
          />

        </div>

      </div>

      {/* =====================================================
          AI Recommendation
      ===================================================== */}

      <div className="border-t border-white/10 bg-black/10 px-8 py-6 lg:px-10">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

          <div className="flex shrink-0 items-center gap-3">
            <div className="rounded-xl bg-white/10 p-2">
              <TrendingUp size={22} />
            </div>

            <span className="text-lg font-semibold">
              AI Sustainability Recommendation
            </span>
          </div>

          <p className="max-w-4xl leading-7 text-green-100">
            {recommendation}
          </p>

        </div>

      </div>

    </section>
  );
}

export default SustainabilityHero;