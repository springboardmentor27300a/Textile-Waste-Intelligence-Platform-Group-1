import {
  TrendingUp,
  AlertTriangle,
  Recycle,
  Leaf,
  Building2,
  Sparkles,
} from "lucide-react";

import { Card } from "../ui";
import useDashboard from "../../hooks/useDashboard";


function safeDisplay(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "--";
  }

  if (
    typeof value === "object"
  ) {
    return (
      value.display_name ??
      value.organization_name ??
      value.company_name ??
      value.name ??
      "--"
    );
  }

  return String(value);
}


function InsightCard({
  icon: Icon,
  title,
  value,
  color,
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-slate-200 p-5 transition-all duration-300 hover:border-blue-300 hover:shadow-md">

      <div
        className={`rounded-xl p-3 ${color}`}
      >
        <Icon size={22} />
      </div>

      <div className="flex-1">

        <p className="text-sm text-muted">
          {safeDisplay(title)}
        </p>

        <h3 className="mt-1 break-words text-lg font-semibold text-heading">
          {safeDisplay(value)}
        </h3>

      </div>

    </div>
  );
}


function AIInsights() {

  const {
    analytics = {},
    summary = {},
    materialDistribution = [],
    wasteDistribution = [],
    isLoading = false,
  } = useDashboard();


  if (isLoading) {

    return (
      <Card
        title="AI Insights"
        subtitle="Loading..."
      >

        <div className="space-y-4">

          {Array.from({
            length: 4,
          }).map((_, index) => (

            <div
              key={index}
              className="h-24 animate-pulse rounded-2xl bg-slate-100"
            />

          ))}

        </div>

      </Card>
    );
  }


  const topMaterial =
    materialDistribution?.length > 0
      ? safeDisplay(
          materialDistribution[0]?.material ??
          materialDistribution[0]?.material_name
        )
      : "--";


  const topWaste =
    wasteDistribution?.length > 0
      ? safeDisplay(
          wasteDistribution[0]?.category ??
          wasteDistribution[0]?.waste_category
        )
      : "--";


  const bestCompany =
    safeDisplay(
      summary?.best_company
    );


  const averageCompanyScore =
    safeDisplay(
      summary?.average_company_score
    );


  return (

    <Card
      title="AI Insights"
      subtitle="AI generated intelligence from textile waste analytics."
    >

      <div className="space-y-5">

        <InsightCard
          icon={TrendingUp}
          title="Most Common Material"
          value={topMaterial}
          color="bg-blue-100 text-blue-600"
        />

        <InsightCard
          icon={Recycle}
          title="Most Common Waste Category"
          value={topWaste}
          color="bg-green-100 text-green-600"
        />

        <InsightCard
          icon={AlertTriangle}
          title="Manual Review Required"
          value={`${safeDisplay(
            analytics?.manual_review_count
          )} Batches`}
          color="bg-amber-100 text-amber-600"
        />

        <InsightCard
          icon={Building2}
          title="Best Performing Company"
          value={bestCompany}
          color="bg-violet-100 text-violet-600"
        />

      </div>


      <div className="mt-8 rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6">

        <div className="flex gap-4">

          <div className="rounded-xl bg-white p-3 shadow">

            <Sparkles
              size={22}
              className="text-blue-600"
            />

          </div>

          <div>

            <h3 className="text-xl font-bold">
              AI Recommendation
            </h3>

            <p className="mt-3 leading-7 text-slate-600">
              Prioritize recycling for the most common
              textile materials while increasing manual
              inspection for low-confidence analyses.
              Focus on improving sustainability scores
              across lower-performing companies.
            </p>

          </div>

        </div>

      </div>


      <div className="mt-8 rounded-3xl bg-gradient-to-r from-emerald-500 to-green-600 p-8 text-white">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-emerald-100">
              Overall Company Score
            </p>

            <h2 className="mt-3 text-5xl font-bold">
              {averageCompanyScore}
            </h2>

            <p className="mt-2">
              Average Across All Companies
            </p>

          </div>

          <Leaf size={64} />

        </div>

      </div>

    </Card>
  );
}


export default AIInsights;