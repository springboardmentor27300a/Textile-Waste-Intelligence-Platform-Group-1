import {
  FileText,
  Leaf,
  Recycle,
  Factory,
  Award,
} from "lucide-react";

import SustainabilityHero from "../../components/sustainability/SustainabilityHero";
import WasteScoringSection from "../../components/sustainability/WasteScoringSection";
import EnvironmentalImpactSection from "../../components/sustainability/EnvironmentalImpactSection";
import SustainabilitySection from "../../components/sustainability/SustainabilitySection";

import useSustainability from "../../hooks/useSustainability";

function SustainabilityDashboard() {
  const {
    loading,
    dashboard,
    error,
  } = useSustainability();

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />

          <h2 className="text-2xl font-bold text-heading">
            Loading Sustainability Intelligence...
          </h2>

          <p className="mt-2 text-muted">
            Calculating environmental and circular economy indicators.
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-lg rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
          <h2 className="text-2xl font-bold text-red-700">
            Failed to load Sustainability Dashboard
          </h2>

          <p className="mt-3 text-red-600">
            The sustainability analytics service could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  const data = dashboard || {};

  const sustainability = data.sustainability || {};
  const environmental = data.environmental || {};
  const wasteScoring = data.waste_scoring || {};

  // --------------------------------------------------
  // Safe report generation
  // --------------------------------------------------

  const generateSevenDayReport = () => {
    window.open(
      "http://localhost:8000/reports/generate?duration=7days",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="space-y-10">

      {/* ==================================================
          1. EXECUTIVE HERO
      ================================================== */}

      <SustainabilityHero
        dashboard={dashboard}
      />

      {/* ==================================================
          2. SUSTAINABILITY REPORT
      ================================================== */}

      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-emerald-100 p-3">
              <FileText
                size={22}
                className="text-emerald-700"
              />
            </div>

            <div>
              <h2 className="font-bold text-emerald-800">
                Sustainability Report
              </h2>

              <p className="mt-1 text-sm text-emerald-700">
                Generate a concise sustainability report for the
                last 7 days.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={generateSevenDayReport}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
          >
            <FileText size={18} />
            Generate 7-Day Report
          </button>

        </div>
      </section>

      {/* ==================================================
          3. QUICK ENVIRONMENTAL KPIs
          Only values NOT already prominently shown in Hero
      ================================================== */}

      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-heading">
            Environmental Highlights
          </h2>

          <p className="mt-2 text-muted">
            Key environmental outcomes from textile recovery.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-3xl bg-white p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  CO2 Savings
                </p>

                <p className="mt-3 text-3xl font-extrabold text-heading">
                  {environmental.carbon_savings ?? 0}
                  <span className="ml-2 text-sm font-semibold text-slate-500">
                    kg
                  </span>
                </p>
              </div>

              <div className="rounded-2xl bg-green-100 p-4">
                <Leaf
                  size={26}
                  className="text-green-600"
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Water Saved
                </p>

                <p className="mt-3 text-3xl font-extrabold text-heading">
                  {environmental.water_savings ?? 0}
                  <span className="ml-2 text-sm font-semibold text-slate-500">
                    L
                  </span>
                </p>
              </div>

              <div className="rounded-2xl bg-cyan-100 p-4">
                <Recycle
                  size={26}
                  className="text-cyan-600"
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Landfill Diversion
                </p>

                <p className="mt-3 text-3xl font-extrabold text-heading">
                  {environmental.landfill_diversion ?? 0}
                  <span className="ml-2 text-sm font-semibold text-slate-500">
                    kg
                  </span>
                </p>
              </div>

              <div className="rounded-2xl bg-amber-100 p-4">
                <Factory
                  size={26}
                  className="text-amber-600"
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Resource Conservation
                </p>

                <p className="mt-3 text-3xl font-extrabold text-heading">
                  {environmental.resource_conservation ?? 0}
                  <span className="ml-2 text-sm font-semibold text-slate-500">
                    %
                  </span>
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-100 p-4">
                <Award
                  size={26}
                  className="text-emerald-600"
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ==================================================
          4. WASTE SCORING ENGINE
      ================================================== */}

      <WasteScoringSection
        data={wasteScoring}
      />

      {/* ==================================================
          5. ENVIRONMENTAL IMPACT ASSESSMENT ENGINE
      ================================================== */}

      <EnvironmentalImpactSection
        data={environmental}
      />

      {/* ==================================================
          6. SUSTAINABILITY INTELLIGENCE ENGINE
          Includes:
          - Sustainability score
          - ESG
          - Circular economy
          - Recycling targets
          - Benchmarking
          - Recommendations
      ================================================== */}

      <SustainabilitySection
        data={sustainability}
      />

    </div>
  );
}

export default SustainabilityDashboard;